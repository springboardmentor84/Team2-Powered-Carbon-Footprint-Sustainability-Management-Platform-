import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { ActivityService } from '../../../core/services/activity.service';

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

  private activityService = inject(ActivityService);

  get activities() {
    return this.activityService
      .getActivities()
      .sort((a, b) => b.id - a.id)
      .slice(0, 5);
  }

  getIcon(category: string): string {

    switch (category.toLowerCase()) {

      case 'walking':
        return '🚶';

      case 'cycling':
        return '🚴';

      case 'recycling':
        return '♻️';

      case 'transport':
        return '🚌';

      case 'food':
        return '🥗';

      case 'water':
        return '💧';

      case 'electricity':
        return '⚡';

      case 'waste':
        return '🗑️';

      default:
        return '🌱';

    }

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
