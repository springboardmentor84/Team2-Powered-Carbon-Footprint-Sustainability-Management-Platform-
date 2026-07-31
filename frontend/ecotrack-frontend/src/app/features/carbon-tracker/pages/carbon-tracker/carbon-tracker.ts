import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

import { ActivityService } from '../../../../core/services/activity.service';

@Component({
  selector: 'app-carbon-tracker',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  templateUrl: './carbon-tracker.html',
  styleUrl: './carbon-tracker.css'
})
export class CarbonTracker {

  private activityService = inject(ActivityService);

  get totalCarbon() {
    return this.activityService.getCarbonSaved().toFixed(1);
  }

  get totalActivities() {
    return this.activityService.getActivityCount();
  }

  get ecoScore() {
    return this.activityService.getSustainabilityScore();
  }

  get goalProgress() {
    return this.activityService.getGoalProgress();
  }

}
