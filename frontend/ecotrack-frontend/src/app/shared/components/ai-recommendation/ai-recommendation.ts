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

  refreshRecommendation(): void {

    // Backend Ready
    // recommendationService.getRecommendation()

  }

  get recommendation() {

    const carbon = this.activityService.getCarbonSaved();
    const score = this.activityService.getSustainabilityScore();
    const activities = this.activityService.getActivities().length;

    if (activities === 0) {
      return {
        icon: '🌱',
        title: 'Start Your Journey',
        text: 'Log your first eco activity to unlock personalized AI insights.',
        saving: 'Potential Saving : 3 kg CO₂/day',
        priority: 'High',
        confidence: 98
      };
    }

    if (score < 30) {
      return {
        icon: '🚶',
        title: 'Walk More',
        text: 'Replace short vehicle trips with walking.',
        saving: 'Estimated Saving : 2 kg CO₂/day',
        priority: 'High',
        confidence: 96
      };
    }

    if (score < 50) {
      return {
        icon: '🚴',
        title: 'Use Bicycle',
        text: 'Cycling twice a week can significantly reduce your carbon footprint.',
        saving: 'Estimated Saving : 3 kg CO₂/day',
        priority: 'High',
        confidence: 94
      };
    }

    if (score < 70) {
      return {
        icon: '♻️',
        title: 'Recycle More',
        text: 'Increase plastic, paper and metal recycling.',
        saving: 'Estimated Saving : 1.5 kg CO₂/day',
        priority: 'Medium',
        confidence: 91
      };
    }

    if (score < 90) {
      return {
        icon: '⚡',
        title: 'Reduce Electricity Usage',
        text: 'Switch off unused appliances and use LED lighting.',
        saving: 'Estimated Saving : 2.3 kg CO₂/day',
        priority: 'Medium',
        confidence: 89
      };
    }

    return {
      icon: '🏆',
      title: 'Excellent Sustainability',
      text: 'Your eco habits are excellent. Keep inspiring others.',
      saving: `Total Saved : ${carbon.toFixed(1)} kg CO₂`,
      priority: 'Low',
      confidence: 99
    };

  }

}
