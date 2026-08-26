import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ThemeMode,
  ThemeService
} from '../../../../core/services/theme.service';

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

  saving = false;
  successMessage = '';

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

  ngOnInit(): void {
    this.selectedTheme = this.themeService.themeMode();

    this.loadLocalSettings();
  }

  setTheme(theme: ThemeMode): void {
    this.selectedTheme = theme;
    this.themeService.setTheme(theme);
  }

  saveSettings(): void {
    this.saving = true;
    this.successMessage = '';

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
      this.successMessage = 'Settings saved successfully.';
    }, 400);
  }

  private loadLocalSettings(): void {
    const savedSettings = localStorage.getItem('ecotrack-settings');

    if (!savedSettings) {
      return;
    }

    try {
      const parsed = JSON.parse(savedSettings);

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
      console.warn('Unable to load saved settings.');
    }
  }
}
