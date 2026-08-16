import {
  Component,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  MatCardModule
} from '@angular/material/card';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  Subscription
} from 'rxjs';

import {
  AiService,
  RecommendationResponse
} from '../../../core/services/ai';


@Component({
  selector: 'app-ai-recommendation',

  standalone: true,

  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],

  templateUrl: './ai-recommendation.html',

  styleUrl: './ai-recommendation.css'
})
export class AiRecommendation
  implements OnInit, OnDestroy {

  private readonly aiService =
    inject(AiService);

  private subscription?: Subscription;


  recommendation:
    RecommendationResponse | null =
      null;


  loading = true;

  error = false;


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.refreshRecommendation();

  }


  // =========================================================
  // DESTROY
  // =========================================================

  ngOnDestroy(): void {

    this.subscription?.unsubscribe();

  }


  // =========================================================
  // LIVE AI REQUEST
  // =========================================================

  refreshRecommendation(): void {

    this.subscription?.unsubscribe();

    this.loading = true;

    this.error = false;


    this.subscription =
      this.aiService
        .getRecommendation()
        .subscribe({

          next: (
            response: RecommendationResponse
          ) => {

            console.log(
              'AI RECOMMENDATION:',
              response
            );

            this.recommendation =
              response;

            this.loading = false;

            this.error = false;

          },

          error: error => {

            console.error(
              'AI recommendation failed:',
              error
            );

            this.recommendation = null;

            this.loading = false;

            this.error = true;

          }

        });

  }


  // =========================================================
  // DISPLAY
  // =========================================================

  get icon(): string {

    switch (
      String(
        this.recommendation?.category || ''
      ).toUpperCase()
    ) {

      case 'TRANSPORT':
        return '🚗';

      case 'FOOD':
        return '🍽️';

      case 'ENERGY':
      case 'ELECTRICITY':
        return '⚡';

      case 'WATER':
        return '💧';

      case 'WASTE':
        return '♻️';

      default:
        return '🌱';

    }

  }


  get title(): string {

    return (
      this.recommendation?.title ||
      'AI Sustainability Insight'
    );

  }


  get text(): string {

    return (
      this.recommendation?.recommendation ||
      ''
    );

  }


  get category(): string {

    return (
      this.recommendation?.category ||
      'GENERAL'
    );

  }


  get priority(): string {

    return (
      this.recommendation?.priority ||
      'MEDIUM'
    );

  }


  get reason(): string {

    return (
      this.recommendation?.reason ||
      ''
    );

  }

}
