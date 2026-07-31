import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';

import { ActivityService } from '../../../core/services/activity.service';

@Component({
  selector: 'app-profile-widget',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    RouterModule
  ],
  templateUrl: './profile-widget.html',
  styleUrl: './profile-widget.css'
})
export class ProfileWidget {

  private activityService = inject(ActivityService);

  user = {
    name: 'Harshit Rai',
    email: 'harshit23btaml34@gmail.com',
    avatar: 'assets/images/avatar.png',
    memberSince: '2026'
  };

  get carbon() {
    return this.activityService.getCarbonSaved();
  }

  get score() {
    return this.activityService.getSustainabilityScore();
  }

  get activities() {
    return this.activityService.getActivities().length;
  }

  get ecoLevel() {

    if (this.score >= 90) return 'Eco Champion';

    if (this.score >= 70) return 'Green Hero';

    if (this.score >= 50) return 'Eco Explorer';

    return 'Beginner';

  }

}
