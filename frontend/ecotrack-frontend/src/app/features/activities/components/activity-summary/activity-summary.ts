import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { ActivityService } from '../../../../core/services/activity.service';

@Component({
  selector: 'app-activity-summary',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './activity-summary.html',
  styleUrl: './activity-summary.css'
})
export class ActivitySummary {

  private activityService = inject(ActivityService);

  get cards() {

    const activities = this.activityService.getActivities();

    const carbon = this.activityService.getCarbonSaved();

    const score = this.activityService.getSustainabilityScore();

    const streak = this.calculateStreak();

    return [

      {
        title: 'Activities',
        value: activities.length,
        icon: 'task_alt',
        color: '#2E7D32'
      },

      {
        title: 'Total Emissions',
        value: carbon.toFixed(1) + ' kg',
        icon: 'eco',
        color: '#43A047'
      },

      {
        title: 'Current Streak',
        value: streak + ' Days',
        icon: 'local_fire_department',
        color: '#FB8C00'
      },

      {
        title: 'Weekly Score',
        value: score + '%',
        icon: 'leaderboard',
        color: '#1565C0'
      }

    ];

  }

  calculateStreak(): number {

    const activities = this.activityService.getActivities();

    if (activities.length === 0) {

      return 0;

    }

    const uniqueDates = [
      ...new Set(
        activities.map(a => a.date)
      )
    ];

    return uniqueDates.length;

  }

}
