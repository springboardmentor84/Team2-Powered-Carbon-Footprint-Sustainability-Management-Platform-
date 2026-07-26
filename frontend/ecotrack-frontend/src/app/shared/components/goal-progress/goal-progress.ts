import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { ActivityService } from '../../../core/services/activity.service';

@Component({
  selector: 'app-goal-progress',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule
  ],
  templateUrl: './goal-progress.html',
  styleUrl: './goal-progress.css'
})
export class GoalProgress {

  private activityService = inject(ActivityService);

  goal = 100;

  get carbonSaved(): number {

    return this.activityService.getCarbonSaved();

  }

  get progress(): number {

    return Math.min(
      (this.carbonSaved / this.goal) * 100,
      100
    );

  }

  get remaining(): number {

    return Math.max(
      this.goal - this.carbonSaved,
      0
    );

  }

}
