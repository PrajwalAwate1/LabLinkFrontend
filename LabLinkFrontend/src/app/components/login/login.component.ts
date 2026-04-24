import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';

  emailError = '';
  passwordError = '';
  generalError = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private patientService: PatientService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onEmailChange(): void {
    this.emailError = '';
    this.generalError = '';
  }

  onPasswordChange(): void {
    this.passwordError = '';
    this.generalError = '';
  }

  private isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  onSubmit(): void {
    this.emailError = '';
    this.passwordError = '';
    this.generalError = '';

    if (!this.email.trim()) {
      this.emailError = 'Email is required.';
      this.cdr.markForCheck();
      return;
    }
    if (!this.isValidEmail(this.email.trim())) {
      this.emailError = 'Please enter a valid email address.';
      this.cdr.markForCheck();
      return;
    }
    if (!this.password) {
      this.passwordError = 'Password is required.';
      this.cdr.markForCheck();
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

    this.authService.login({ email: this.email.trim(), password: this.password }).subscribe({
      next: (response) => {
        localStorage.setItem('userName', response.name);
        
        this.isLoading = false;
        this.cdr.markForCheck();
        if (response.roles.includes('Admin')) {
          this.router.navigate(['/admin']);
        } else if (response.roles.includes('Reception')) {
          this.router.navigate(['/reception']);
        } else if (response.roles.includes('Lab Technologist')) {
          this.router.navigate(['/lab-technologist']);
        } else if (response.roles.includes('Phlebotomist')) {
          this.router.navigate(['/phlebotomist']);
        } else if (response.roles.includes('Pathologist')) {
          this.router.navigate(['/pathologist']);
        } else if (response.roles.includes('Patient')) {
          // Fetch and store patientId for Patient role
          const userId = response.userId;
          this.patientService.searchPatients('', '').subscribe({
            next: (res) => {
              const match = res.data?.find((p) => p.userId === userId || (p as any).UserId === userId);
              if (match) {
                localStorage.setItem('patientId', String(match.patientId));
              }
              this.router.navigate(['/patient']);
            },
            error: () => {
              this.router.navigate(['/patient']);
            }
          });
        } else {
          this.patientService.searchPatients('', '').subscribe({
            next: (res) => {
              const userId = response.userId;
              const match = res.data?.find((p) => p.userId === userId || (p as any).UserId === userId);
              if (match) {
                localStorage.setItem('patientId', String(match.patientId));
              }
              this.router.navigate(['/patient']);
            },
            error: () => {
              this.router.navigate(['/patient']);
            }
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        const message: string = err.error?.message || '';

        if (err.status === 401) {
          const lower = message.toLowerCase();
          if (lower.includes('email')) {
            this.emailError = message || 'Invalid email address.';
          } else if (lower.includes('password')) {
            this.passwordError = message || 'Invalid password.';
          } else {
            this.generalError = message || 'Invalid credentials.';
          }
        } else if (err.status === 400) {
          this.generalError = 'Invalid request. Please check your input.';
        } else {
          this.generalError = 'Something went wrong. Please try again.';
        }
        this.cdr.markForCheck();
      }
    });
  }
}
