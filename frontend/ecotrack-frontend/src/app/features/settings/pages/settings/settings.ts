import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  ThemeMode,
  ThemeService
} from '../../../../core/services/theme.service';

import {
  AuthService,
  ChangePasswordRequest,
  DeactivateAccountRequest
} from '../../../../core/services/auth';


interface NotificationPreferences {
  weeklySummary: boolean;
  challengeReminders: boolean;
  recommendationAlerts: boolean;
  systemNotifications: boolean;
}


interface PrivacyPreferences {
  showOnLeaderboard: boolean;
  showCarbonStatistics: boolean;
  showActivityHistory: boolean;
}


@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit {

  private readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);


  // =========================================================
  // GENERAL SETTINGS
  // =========================================================

  saving = false;

  successMessage = '';
  errorMessage = '';


  selectedTheme: ThemeMode = 'light';


  notifications: NotificationPreferences = {
    weeklySummary: true,
    challengeReminders: true,
    recommendationAlerts: true,
    systemNotifications: true,
  };


  privacy: PrivacyPreferences = {
    showOnLeaderboard: true,
    showCarbonStatistics: true,
    showActivityHistory: true,
  };


  // =========================================================
  // CHANGE PASSWORD
  // =========================================================

  showChangePassword = false;

  changingPassword = false;

  changePasswordError = '';
  changePasswordSuccess = '';

  currentPassword = '';
  newPassword = '';
  confirmNewPassword = '';


  // =========================================================
  // DEACTIVATE ACCOUNT
  // =========================================================

  showDeactivateAccount = false;

  deactivatingAccount = false;

  deactivateError = '';

  deactivatePassword = '';


  // =========================================================
  // INITIALIZATION
  // =========================================================

  ngOnInit(): void {

    this.selectedTheme =
      this.themeService.themeMode();

    this.loadLocalSettings();
  }


  // =========================================================
  // THEME
  // =========================================================

  setTheme(theme: ThemeMode): void {

    this.selectedTheme = theme;

    this.themeService.setTheme(theme);
  }


  // =========================================================
  // SAVE SETTINGS
  // =========================================================

  saveSettings(): void {

    this.saving = true;

    this.successMessage = '';
    this.errorMessage = '';

    const settings = {
      notifications: this.notifications,
      privacy: this.privacy,
    };

    localStorage.setItem(
      'ecotrack-settings',
      JSON.stringify(settings)
    );

    setTimeout(() => {

      this.saving = false;

      this.successMessage =
        'Settings saved successfully.';

    }, 400);
  }


  // =========================================================
  // CHANGE PASSWORD MODAL
  // =========================================================

  openChangePassword(): void {

    this.showChangePassword = true;

    this.changePasswordError = '';
    this.changePasswordSuccess = '';

    this.currentPassword = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
  }


  closeChangePassword(): void {

    if (this.changingPassword) {
      return;
    }

    this.showChangePassword = false;

    this.changePasswordError = '';
    this.changePasswordSuccess = '';

    this.currentPassword = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
  }


  // =========================================================
  // CHANGE PASSWORD
  // =========================================================

  submitChangePassword(): void {

    this.changePasswordError = '';
    this.changePasswordSuccess = '';


    if (!this.currentPassword ||
        !this.newPassword ||
        !this.confirmNewPassword) {

      this.changePasswordError =
        'Please fill in all password fields.';

      return;
    }


    if (this.newPassword.length < 8) {

      this.changePasswordError =
        'New password must be at least 8 characters long.';

      return;
    }


    if (this.newPassword !== this.confirmNewPassword) {

      this.changePasswordError =
        'New password and confirmation password do not match.';

      return;
    }


    if (this.currentPassword === this.newPassword) {

      this.changePasswordError =
        'New password must be different from your current password.';

      return;
    }


    const request: ChangePasswordRequest = {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
      confirmPassword: this.confirmNewPassword
    };


    this.changingPassword = true;


    this.authService
      .changePassword(request)
      .subscribe({

        next: (response) => {

          this.changingPassword = false;

          this.changePasswordSuccess =
            response.message ||
            'Password changed successfully.';

          this.currentPassword = '';
          this.newPassword = '';
          this.confirmNewPassword = '';
        },


        error: (error) => {

          this.changingPassword = false;

          this.changePasswordError =
            this.getErrorMessage(
              error,
              'Unable to change password.'
            );
        }

      });
  }


  // =========================================================
  // DEACTIVATE ACCOUNT MODAL
  // =========================================================

  openDeactivateAccount(): void {

    this.showDeactivateAccount = true;

    this.deactivateError = '';
    this.deactivatePassword = '';
  }


  closeDeactivateAccount(): void {

    if (this.deactivatingAccount) {
      return;
    }

    this.showDeactivateAccount = false;

    this.deactivateError = '';
    this.deactivatePassword = '';
  }


  // =========================================================
  // DEACTIVATE ACCOUNT
  // =========================================================

  submitDeactivateAccount(): void {

    this.deactivateError = '';


    if (!this.deactivatePassword) {

      this.deactivateError =
        'Please enter your current password.';

      return;
    }


    const request: DeactivateAccountRequest = {
      password: this.deactivatePassword
    };


    this.deactivatingAccount = true;


    this.authService
      .deactivateAccount(request)
      .subscribe({

        next: () => {

          this.deactivatingAccount = false;

          /*
           * Remove authentication data after successful
           * account deactivation.
           */
          this.authService.logout();

          this.showDeactivateAccount = false;

          this.router.navigate(
            ['/auth/login']
          );
        },


        error: (error) => {

          this.deactivatingAccount = false;

          this.deactivateError =
            this.getErrorMessage(
              error,
              'Unable to deactivate your account.'
            );
        }

      });
  }


  // =========================================================
  // ERROR HANDLING
  // =========================================================

  private getErrorMessage(
    error: any,
    fallback: string
  ): string {

    if (error?.error?.message) {
      return error.error.message;
    }

    if (error?.error?.error) {
      return error.error.error;
    }

    if (typeof error?.error === 'string') {
      return error.error;
    }

    if (error?.message) {
      return error.message;
    }

    return fallback;
  }


  // =========================================================
  // LOCAL SETTINGS
  // =========================================================

  private loadLocalSettings(): void {

    const savedSettings =
      localStorage.getItem(
        'ecotrack-settings'
      );


    if (!savedSettings) {
      return;
    }


    try {

      const parsed =
        JSON.parse(savedSettings);


      if (parsed.notifications) {

        this.notifications = {
          ...this.notifications,
          ...parsed.notifications,
        };
      }


      if (parsed.privacy) {

        this.privacy = {
          ...this.privacy,
          ...parsed.privacy,
        };
      }

    } catch {

      console.warn(
        'Unable to load saved settings.'
      );
    }
  }
}
