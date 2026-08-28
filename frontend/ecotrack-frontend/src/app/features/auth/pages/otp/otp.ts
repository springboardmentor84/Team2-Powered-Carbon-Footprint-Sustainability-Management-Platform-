import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './otp.html',
  styleUrl: './otp.css',
})
export class Otp {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  otp = '';

  loading = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.email =
      sessionStorage.getItem('password-reset-email') || '';

    if (!this.email) {
      this.router.navigate(['/forgot-password']);
    }
  }

  verifyOtp(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.otp.trim()) {
      this.errorMessage = 'Please enter the OTP.';
      return;
    }

    if (!/^\d{6}$/.test(this.otp.trim())) {
      this.errorMessage = 'OTP must be 6 digits.';
      return;
    }

    this.loading = true;

    this.authService.verifyOtp({
      email: this.email,
      otp: this.otp.trim()
    }).subscribe({
      next: (response) => {
        this.loading = false;

        this.successMessage =
          response?.message || 'OTP verified successfully.';

        sessionStorage.setItem(
          'password-reset-otp',
          this.otp.trim()
        );

        setTimeout(() => {
          this.router.navigate(['/reset-password']);
        }, 500);
      },

      error: (error) => {
        this.loading = false;

        this.errorMessage =
          error?.error?.message ||
          'Invalid or expired OTP. Please try again.';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/forgot-password']);
  }
}
