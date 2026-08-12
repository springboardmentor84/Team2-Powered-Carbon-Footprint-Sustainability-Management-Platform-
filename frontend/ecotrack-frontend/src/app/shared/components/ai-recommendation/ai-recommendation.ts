import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

import { AiService } from '../../../core/services/ai';

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
export class AiRecommendation implements OnInit {

  private aiService = inject(AiService);

  recommendationData: any = {
    icon: '🌱',
    title: 'AI Recommendation',
    text: 'Loading recommendation...',
    saving: '',
    priority: '',
    confidence: 0
  };

  ngOnInit(): void {
    this.refreshRecommendation();
  }

  refreshRecommendation(): void {
    this.aiService.getRecommendation().subscribe({
      next: (res) => {
        // Since backend just returns a single string 'recommendation', we map it to 'text'.
        this.recommendationData = {
          icon: '💡',
          title: 'AI Insight',
          text: res.recommendation,
          saving: 'Personalized Insight',
          priority: 'Dynamic',
          confidence: 100
        };
      },
      error: (err) => {
        console.error('Failed to load AI recommendation', err);
        this.recommendationData.text = 'Failed to load recommendation. Please try again later.';
      }
    });
  }

  get recommendation() {
    return this.recommendationData;
  }

}
