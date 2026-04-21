import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  name = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private patientService: PatientService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.name || !this.email || !this.phone || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    if (this.password.length < 8 || this.password.length > 20) {
      this.errorMessage = 'Password must be between 8 and 20 characters.';
      return;
    }

    this.isLoading = true;

    this.authService.register({
      name: this.name,
      email: this.email,
      phone: this.phone,
      password: this.password,
      roleIds: [1]
    }).subscribe({
      next: (res: any) => {
        const userId: number = res?.data?.userId ?? res?.data?.UserId;

        this.authService.login({ email: this.email, password: this.password }).subscribe({
          next: () => {
            this.patientService.upsertPatient({
              isCreate: true,
              patientId: null,
              userId: userId,
              name: this.name,
              dob: '0001-01-01',
              gender: 'U',
              contactInfo: this.phone,
              address: null,
              isActive: true,
              primaryPhysicianName: null
            }).subscribe({
              next: (patientRes: any) => {
                const pid = patientRes?.data?.patientId ?? patientRes?.data?.PatientId;
                if (pid) localStorage.setItem('patientId', pid.toString());
                this.authService.logout();
                this.isLoading = false;
                this.successMessage = 'Account created successfully! Redirecting to login...';
                setTimeout(() => this.router.navigate(['/login']), 1800);
              },
              error: () => {
                this.patientService.searchPatients(this.name, this.phone).subscribe({
                  next: (searchRes: any) => {
                    const existing = searchRes?.data?.find(
                      (p: any) => p.userId === userId || p.UserId === userId
                    ) ?? searchRes?.data?.[0];
                    if (existing) {
                      const pid = existing.patientId ?? existing.PatientId;
                      if (pid) localStorage.setItem('patientId', pid.toString());
                    }
                    this.authService.logout();
                    this.isLoading = false;
                    this.successMessage = 'Account created successfully! Redirecting to login...';
                    setTimeout(() => this.router.navigate(['/login']), 1800);
                  },
                  error: () => {
                    this.authService.logout();
                    this.isLoading = false;
                    this.successMessage = 'Account created successfully! Redirecting to login...';
                    setTimeout(() => this.router.navigate(['/login']), 1800);
                  }
                });
              }
            });
          },
          error: () => {
            this.isLoading = false;
            this.successMessage = 'Account created successfully! Redirecting to login...';
            setTimeout(() => this.router.navigate(['/login']), 1800);
          }
        });
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 409) {
          this.errorMessage = 'An account with this email already exists.';
        } else if (err.status === 400) {
          this.errorMessage = err.error?.message || 'Invalid input. Please check your details.';
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
      }
    });
  }
}
