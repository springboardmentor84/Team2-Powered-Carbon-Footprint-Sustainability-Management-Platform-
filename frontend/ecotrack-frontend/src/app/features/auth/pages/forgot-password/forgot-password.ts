import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../../core/services/auth';


@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);


  email = '';

  loading = false;

  errorMessage = '';
  successMessage = '';


  submit(): void {

    this.errorMessage = '';
    this.successMessage = '';


    if (!this.email.trim()) {

      this.errorMessage =
        'Please enter your email address.';

      return;
    }


    if (!this.isValidEmail(this.email)) {

      this.errorMessage =
        'Please enter a valid email address.';

      return;
    }


    this.loading = true;


    this.authService
      .forgotPassword({
        email: this.email.trim()
      })
      .subscribe({

        next: (response) => {

          this.loading = false;

          this.successMessage =
            response?.message ||
            'OTP sent successfully.';


          /*
           * Keep the email so the OTP page knows
           * which account is being verified.
           */
          sessionStorage.setItem(
            'password-reset-email',
            this.email.trim()
          );


          setTimeout(() => {
  this.router.navigate(['/otp']);
}, 500);
        },


        error: (error) => {

          this.loading = false;

          this.errorMessage =
            error?.error?.message ||
            'Unable to send OTP. Please try again.';
        }

      });
  }


  goToLogin(): void {

    this.router.navigate(
      ['/auth/login']
    );
  }


  private isValidEmail(email: string): boolean {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email
    );
  }
}
