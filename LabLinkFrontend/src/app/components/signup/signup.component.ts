import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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

  constructor(private authService: AuthService, private router: Router) {}

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
      roleIds: [1]   // default role: Patient
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Account created successfully! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 1800);
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
