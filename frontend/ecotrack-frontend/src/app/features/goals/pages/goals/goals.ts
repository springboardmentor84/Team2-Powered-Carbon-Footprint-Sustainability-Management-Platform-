import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

import { ActivityService } from '../../../../core/services/activity.service';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  templateUrl: './goals.html',
  styleUrl: './goals.css'
})
export class Goals {

  private activityService = inject(ActivityService);

  target = 100;

  get carbonSaved() {
    return this.activityService.getCarbonSaved();
  }

  get progress() {
    return this.activityService.getGoalProgress(this.target);
  }

  get remaining() {
    return Math.max(this.target - this.carbonSaved, 0).toFixed(1);
  }

}
