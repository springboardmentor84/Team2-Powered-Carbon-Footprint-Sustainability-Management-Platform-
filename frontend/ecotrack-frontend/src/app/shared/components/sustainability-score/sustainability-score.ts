import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { ActivityService } from '../../../core/services/activity.service';

@Component({
  selector: 'app-sustainability-score',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule
  ],
  templateUrl: './sustainability-score.html',
  styleUrl: './sustainability-score.css'
})
export class SustainabilityScore {

  private activityService = inject(ActivityService);

  get score(): number {

    const list = this.activityService.getActivities();

    let score = 0;

    list.forEach(item => {

      switch(item.category.toLowerCase()){

        case 'walking':
          score += 5;
          break;

        case 'cycling':
          score += 8;
          break;

        case 'recycling':
          score += 4;
          break;

        case 'transport':
          score += 6;
          break;

        case 'food':
          score += 3;
          break;

        case 'electricity':
          score += 5;
          break;

        case 'water':
          score += 4;
          break;

        default:
          score += 2;

      }

    });

    return Math.min(score,100);

  }

  get level(){

    if(this.score>=80){
      return 'Excellent';
    }

    if(this.score>=60){
      return 'Good';
    }

    if(this.score>=40){
      return 'Average';
    }

    return 'Needs Improvement';

  }

}
