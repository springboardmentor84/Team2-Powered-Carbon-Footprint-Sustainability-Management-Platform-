import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

import { ActivityService } from '../../../core/services/activity.service';

@Component({
  selector: 'app-achievement-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  templateUrl: './achievement-card.html',
  styleUrl: './achievement-card.css'
})
export class AchievementCard {

  private activityService = inject(ActivityService);

  get badges(){

    const carbon = this.activityService.getCarbonSaved();

    const score = this.activityService.getSustainabilityScore();

    const activities = this.activityService.getActivities().length;

    return [

      {
        icon:'🌱',
        title:'First Step',
        desc:'Complete first activity',
        unlocked:activities>=1
      },

      {
        icon:'🚶',
        title:'Walker',
        desc:'Log 5 activities',
        unlocked:activities>=5
      },

      {
        icon:'♻️',
        title:'Eco Saver',
        desc:'Save 20 kg CO₂',
        unlocked:carbon>=20
      },

      {
        icon:'🔥',
        title:'Green Hero',
        desc:'Reach score 60',
        unlocked:score>=60
      },

      {
        icon:'👑',
        title:'Eco Champion',
        desc:'Reach score 90',
        unlocked:score>=90
      }

    ];

  }

  get unlockedCount(){

    return this.badges.filter(x=>x.unlocked).length;

  }

}
