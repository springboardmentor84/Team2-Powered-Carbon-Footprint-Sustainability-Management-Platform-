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
    private snackBar: MatSnackBar
  ) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  get canSubmit(): boolean {
    return this.email.trim().length > 0 && this.password.trim().length > 0;
  }

  onSubmit(): void {

    if (!this.canSubmit) {
      this.snackBar.open('Please fill in all fields.', 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
      return;
    }

    this.isLoading = true;

    // Backend API ready — replace with AuthService.login() call
    setTimeout(() => {
      this.isLoading = false;
      this.snackBar.open('Login Successful! Welcome back.', 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['snack-success']
      });
      this.router.navigate(['/dashboard']);
    }, 1000);

  }

}
