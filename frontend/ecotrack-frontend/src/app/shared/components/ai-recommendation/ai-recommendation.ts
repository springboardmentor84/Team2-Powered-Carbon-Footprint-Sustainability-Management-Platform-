import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

import { ActivityService } from '../../../core/services/activity.service';

@Component({
  selector: 'app-ai-recommendation',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  templateUrl: './ai-recommendation.html',
  styleUrl: './ai-recommendation.css'
})
export class AiRecommendation {

  private activityService = inject(ActivityService);

  get recommendation() {

    const carbon = this.activityService.getCarbonSaved();

    const score = this.activityService.getSustainabilityScore();

    if(score < 30){

      return {
        icon:'🚶',
        title:'Walk More',
        text:'Walking instead of driving can improve your sustainability score quickly.',
        saving:'≈ 2 kg CO₂/day'
      };

    }

    if(score < 60){

      return {
        icon:'🚴',
        title:'Try Cycling',
        text:'Replace short trips with cycling to reduce emissions.',
        saving:'≈ 3 kg CO₂/day'
      };

    }

    if(score < 80){

      return {
        icon:'♻',
        title:'Increase Recycling',
        text:'Recycling more household waste can further improve your score.',
        saving:'≈ 1.5 kg CO₂/day'
      };

    }

    return {

      icon:'🌱',

      title:'Excellent Work',

      text:'Maintain your eco-friendly lifestyle and inspire others.',

      saving:`${carbon.toFixed(1)} kg CO₂ saved`

    };

  }

}
