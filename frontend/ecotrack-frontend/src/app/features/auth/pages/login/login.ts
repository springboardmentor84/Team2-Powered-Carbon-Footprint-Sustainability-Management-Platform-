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

import {
  AuthService,
  LoginResponse
} from '../../../../core/services/auth';

@Component({
  selector: 'app-login',
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
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  email = '';
  password = '';
  rememberMe = false;
  showPassword = false;
  isLoading = false;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  openGoogleAuth(): void {
    window.open(
      'https://accounts.google.com/signin/v2/identifier',
      '_blank'
    );
  }

  get canSubmit(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this.email.trim().length > 0 &&
           emailRegex.test(this.email.trim()) &&
           this.password.trim().length > 0;
  }

  onSubmit(): void {

    if (!this.canSubmit) {
      this.snackBar.open(
        'Please fill in all fields.',
        'Close',
        { duration: 3000 }
      );
      return;
    }

    this.isLoading = true;

    this.authService.login({
      email: this.email,
      password: this.password
    }).subscribe({

     next: (response: LoginResponse) => {

  this.isLoading = false;

  console.log(
    '[LOGIN] Backend response:',
    response
  );

  if (!response.token) {

    this.snackBar.open(
      'Login succeeded but no JWT token was received.',
      'Close',
      {
        duration: 4000,
        panelClass: ['snack-error']
      }
    );

    return;
  }

  // Clear any old invalid token first
  this.authService.logout();

  // Save fresh JWT
  this.authService.saveToken(
    response.token
  );

  this.authService.saveUser(
    response
  );

  console.log(
    '[LOGIN] Fresh JWT saved. Token exists:',
    !!this.authService.getToken()
  );

  this.snackBar.open(
    'Login Successful!',
    'Close',
    {
      duration: 3000,
      panelClass: ['snack-success']
    }
  );

  if (response.role === 'ADMIN') {
    this.router.navigate(['/admin/dashboard']);
  } else {
    this.router.navigate(['/dashboard']);
  }
},

      error: (err: any) => {

        this.isLoading = false;

        this.snackBar.open(
          err?.error?.message || 'Invalid email or password',
          'Close',
          {
            duration: 3000,
            panelClass: ['snack-error']
          }
        );

      }

    });

  }

}
