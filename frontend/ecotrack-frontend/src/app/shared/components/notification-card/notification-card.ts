import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

import { ActivityService } from '../../../core/services/activity.service';

@Component({
  selector: 'app-notification-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  templateUrl: './notification-card.html',
  styleUrl: './notification-card.css'
})
export class NotificationCard {

  private activityService = inject(ActivityService);

  get notifications() {

    const list = [];

    const carbon = this.activityService.getCarbonSaved();

    const score = this.activityService.getSustainabilityScore();

    if(carbon >= 100){

      list.push({
        icon:'🏆',
        title:'Weekly Goal Achieved',
        desc:'Congratulations! You reached your carbon goal.'
      });

    }else{

      list.push({
        icon:'🎯',
        title:'Goal Progress',
        desc:`Only ${(100-carbon).toFixed(1)} kg left to reach your goal`
      });

    }

    if(score >= 80){

      list.push({
        icon:'🌱',
        title:'Excellent Sustainability',
        desc:'Your sustainability score is outstanding.'
      });

    }else{

      list.push({
        icon:'💡',
        title:'Keep Improving',
        desc:'Try cycling or walking more often.'
      });

    }

    if(this.activityService.getActivities().length==0){

      list.push({
        icon:'📢',
        title:'No Activities',
        desc:'Add your first activity today.'
      });

    }else{

      list.push({
        icon:'✅',
        title:'Activities Updated',
        desc:'Dashboard synchronized successfully.'
      });

    }

    return list;

  }

}
