import { Component, ChangeDetectorRef } from '@angular/core';
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
  submitted = false;

  get nameError(): string {
    if (!this.submitted) return '';
    if (!this.name.trim()) return 'Full name is required.';
    if (this.name.trim().length < 2) return 'Name must be at least 2 characters.';
    return '';
  }

  get emailError(): string {
    if (!this.submitted) return '';
    if (!this.email.trim()) return 'Email is required.';
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.email.trim())) return 'Please enter a valid email address.';
    return '';
  }

  get phoneError(): string {
    if (!this.submitted) return '';
    if (!this.phone.trim()) return 'Phone number is required.';
    if (!/^\d{10}$/.test(this.phone.trim())) return 'Phone must be exactly 10 digits (numbers only).';
    return '';
  }

  get passwordError(): string {
    if (!this.submitted) return '';
    if (!this.password) return 'Password is required.';
    if (this.password.length < 8 || this.password.length > 20) return 'Password must be between 8 and 20 characters.';
    return '';
  }

  get confirmPasswordError(): string {
    if (!this.submitted) return '';
    if (!this.confirmPassword) return 'Please confirm your password.';
    if (this.password !== this.confirmPassword) return 'Passwords do not match.';
    return '';
  }

  constructor(
    private authService: AuthService,
    private patientService: PatientService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.submitted = true;

    if (this.nameError || this.emailError || this.phoneError || this.passwordError || this.confirmPasswordError) {
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
                this.cdr.markForCheck();
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
                    this.cdr.markForCheck();
                    setTimeout(() => this.router.navigate(['/login']), 1800);
                  },
                  error: () => {
                    this.authService.logout();
                    this.isLoading = false;
                    this.successMessage = 'Account created successfully! Redirecting to login...';
                    this.cdr.markForCheck();
                    setTimeout(() => this.router.navigate(['/login']), 1800);
                  }
                });
              }
            });
          },
          error: () => {
            this.isLoading = false;
            this.successMessage = 'Account created successfully! Redirecting to login...';
            this.cdr.markForCheck();
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
        this.cdr.markForCheck();
      }
    });
  }
}
