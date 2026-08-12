import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

import { ActivityService } from '../../../core/services/activity.service';
import { Activity } from '../../../core/models/activity.model';
import { DashboardService } from '../../../core/services/dashboard/dashboard.service';

@Component({
  selector: 'app-recent-activities',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  templateUrl: './recent-activities.html',
  styleUrl: './recent-activities.css'
})
export class RecentActivities {

  private dashboardService = inject(DashboardService);

  activities: any[] = []; // Using any to match both Activity and RecentCarbonEntry formats in the HTML template for now.

  constructor() {
    this.loadActivities();
  }

  private loadActivities(): void {
    this.dashboardService.getRecent().subscribe({
      next: (recent) => {
        this.activities = recent;
      },
      error: (err) => console.error('Failed to load recent activities', err)
    });
  }

  getIcon(category: string): string {

    const icons: Record<string, string> = {

      walking: '🚶',
      cycling: '🚴',
      recycling: '♻️',
      transport: '🚌',
      food: '🥗',
      water: '💧',
      electricity: '⚡',
      waste: '🗑️'

    };

    return icons[category.toLowerCase()] || '🌱';

  }

  getBadgeColor(carbon: number): string {

    if (carbon >= 5) return '#2E7D32';

    if (carbon >= 2) return '#F9A825';

    return '#D32F2F';

  }

  getRelativeDate(date: string): string {

    const today = new Date();

    const activityDate = new Date(date);

    const diff = Math.floor(
      (today.getTime() - activityDate.getTime()) /
      (1000 * 60 * 60 * 24)
    );

    if (diff === 0) return 'Today';

    if (diff === 1) return 'Yesterday';

    return activityDate.toLocaleDateString();

  }

}
