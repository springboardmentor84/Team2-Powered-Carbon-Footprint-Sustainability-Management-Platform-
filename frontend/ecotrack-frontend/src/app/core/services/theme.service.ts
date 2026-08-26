import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storageKey = 'ecotrack-theme';

  readonly themeMode = signal<ThemeMode>(this.getSavedTheme());

  constructor() {
    this.applyTheme(this.themeMode());

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener(
      'change',
      () => {
        if (this.themeMode() === 'system') {
          this.applyTheme('system');
        }
      }
    );
  }

  setTheme(theme: ThemeMode): void {
    this.themeMode.set(theme);
    localStorage.setItem(this.storageKey, theme);
    this.applyTheme(theme);
  }

  private getSavedTheme(): ThemeMode {
    const saved = localStorage.getItem(this.storageKey);

    if (
      saved === 'light' ||
      saved === 'dark' ||
      saved === 'system'
    ) {
      return saved;
    }

    return 'light';
  }

  private applyTheme(theme: ThemeMode): void {
    const root = document.documentElement;

    let activeTheme: 'light' | 'dark' = 'light';

    if (theme === 'dark') {
      activeTheme = 'dark';
    } else if (theme === 'system') {
      activeTheme = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches
        ? 'dark'
        : 'light';
    }

    root.setAttribute('data-theme', activeTheme);
  }
}
