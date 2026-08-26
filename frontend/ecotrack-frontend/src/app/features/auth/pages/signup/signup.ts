import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth';
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatSnackBarModule
  ],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup {

  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  agreeTerms = false;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private auth: AuthService
  ) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  openGoogleAuth(): void {
    // Backend ready — replace with proper OAuth flow using AuthService
    window.open('https://accounts.google.com/signin/v2/identifier', '_blank');
  }

  get passwordMismatch(): boolean {
    return this.confirmPassword.length > 0 && this.password !== this.confirmPassword;
  }

  get canSubmit(): boolean {
    return (
      this.name.trim().length > 0 &&
      this.email.trim().length > 0 &&
      this.password.length >= 8 &&
      this.confirmPassword.length >= 8 &&
      this.password === this.confirmPassword &&
      this.agreeTerms
    );
  }

 onSubmit(): void {

  if (!this.name.trim() || !this.email.trim() || !this.password || !this.confirmPassword) {
    this.snackBar.open('Please fill in all fields.', 'Close', {
      duration: 3000
    });
    return;
  }

  if (this.password !== this.confirmPassword) {
    this.snackBar.open('Passwords do not match.', 'Close', {
      duration: 3000
    });
    return;
  }

  if (!this.agreeTerms) {
    this.snackBar.open('Please accept the Terms.', 'Close', {
      duration: 3000
    });
    return;
  }

  this.isLoading = true;

  this.auth.register({
    fullName: this.name,
    email: this.email,
    password: this.password
  }).subscribe({

    next: (response: any) => {

      this.isLoading = false;

      this.snackBar.open(
        response.message || 'Registration Successful!',
        'Close',
        {
          duration: 3000
        }
      );

      this.router.navigate(['/login']);

    },

    error: (error: any) => {

      this.isLoading = false;

      console.error(error);

      if (error.status === 409) {

        this.snackBar.open(
          'Email already exists.',
          'Close',
          { duration: 3000 }
        );

      } else {

        this.snackBar.open(
          error.error?.message || 'Registration Failed.',
          'Close',
          { duration: 3000 }
        );

      }

    }

  });

}

}
