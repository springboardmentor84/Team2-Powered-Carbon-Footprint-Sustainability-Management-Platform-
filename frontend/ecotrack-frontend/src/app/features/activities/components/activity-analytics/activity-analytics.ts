import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { ActivityService } from '../../../../core/services/activity.service';

@Component({
  selector: 'app-activity-analytics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './activity-analytics.html',
  styleUrl: './activity-analytics.css'
})
export class ActivityAnalytics {

  private activityService = inject(ActivityService);

  get activities() {

    return this.activityService.getActivities();

  }

  get totalActivities() {

    return this.activities.length;

  }

  get carbonSaved() {

    return this.activityService.getCarbonSaved().toFixed(1);

  }

  get averageCarbon() {

    if (this.activities.length === 0) {

      return '0.0';

    }

    const total = this.activityService.getCarbonSaved();

    return (total / this.activities.length).toFixed(1);

  }

  get bestCategory() {

    if (this.activities.length === 0) {

      return '-';

    }

    const map: any = {};

    this.activities.forEach(activity => {

      map[activity.category] = (map[activity.category] || 0) + activity.carbon;

    });

    return Object.keys(map).reduce((a, b) =>
      map[a] > map[b] ? a : b
    );

  }

  get progress() {

    const value = this.activityService.getCarbonSaved();

    return Math.min((value / 100) * 100, 100);

  }

}
