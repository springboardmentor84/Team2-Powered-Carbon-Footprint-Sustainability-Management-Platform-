import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  otp = '';

  newPassword = '';
  confirmPassword = '';

  loading = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.email =
      sessionStorage.getItem('password-reset-email') || '';

    this.otp =
      sessionStorage.getItem('password-reset-otp') || '';

    if (!this.email || !this.otp) {
      this.router.navigate(['/forgot-password']);
    }
  }

  resetPassword(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.newPassword || !this.confirmPassword) {
      this.errorMessage =
        'Please enter and confirm your new password.';
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage =
        'Password must be at least 6 characters long.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage =
        'Passwords do not match.';
      return;
    }

    this.loading = true;

    this.authService.resetPassword({
      email: this.email,
      otp: this.otp,
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword
    }).subscribe({

      next: (response) => {
        this.loading = false;

        this.successMessage =
          response?.message ||
          'Password reset successfully.';

        // Remove temporary password-reset data.
        sessionStorage.removeItem(
          'password-reset-email'
        );

        sessionStorage.removeItem(
          'password-reset-otp'
        );

        // Give the user a moment to see success message.
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1000);
      },

      error: (error) => {
        this.loading = false;

        this.errorMessage =
          error?.error?.message ||
          'Unable to reset password. Please try again.';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/otp']);
  }
}
