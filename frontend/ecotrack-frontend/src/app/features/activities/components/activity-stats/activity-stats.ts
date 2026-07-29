import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

import { ActivityService } from '../../../../core/services/activity.service';

@Component({
  selector: 'app-activity-stats',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  templateUrl: './activity-stats.html',
  styleUrl: './activity-stats.css'
})
export class ActivityStats {

  private activityService = inject(ActivityService);

  get totalActivities(): number {

    return this.activityService.getActivities().length;

  }

  get totalCarbon(): number {

    return this.activityService.getCarbonSaved();

  }

  get totalCategories(): number {

    const categories = new Set(
      this.activityService
        .getActivities()
        .map(activity => activity.category)
    );

    return categories.size;

  }

  get todayActivities(): number {

    const today = new Date().toISOString().substring(0,10);

    return this.activityService
      .getActivities()
      .filter(activity => activity.date === today)
      .length;

  }

}
