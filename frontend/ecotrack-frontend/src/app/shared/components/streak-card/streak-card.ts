import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

import { ActivityService } from '../../../core/services/activity.service';

@Component({
  selector: 'app-streak-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  templateUrl: './streak-card.html',
  styleUrl: './streak-card.css'
})
export class StreakCard {

  private activityService = inject(ActivityService);

  get currentStreak(): number {

    const activities = [...this.activityService.getActivities()]
      .sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime());

    if(!activities.length) return 0;

    let streak = 1;

    for(let i=1;i<activities.length;i++){

      const prev = new Date(activities[i-1].date);

      const curr = new Date(activities[i].date);

      const diff = Math.floor(

        (prev.getTime()-curr.getTime())/

        (1000*60*60*24)

      );

      if(diff===1){

        streak++;

      }else{

        break;

      }

    }

    return streak;

  }

  get longestStreak(){
    return this.currentStreak;
  }

  get activeDays(){

    return this.activityService.getActivities().length;

  }

}
