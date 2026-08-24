import {
  ChangeDetectorRef,
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
  Subscription,
  of
} from 'rxjs';

import {
  catchError,
  timeout
} from 'rxjs/operators';

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

  private readonly cdr =
    inject(ChangeDetectorRef);


  private subscription?: Subscription;


  recommendation:
    RecommendationResponse | null =
      null;


  loading = true;

  error = false;

  usingFallback = false;


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
  // LOAD RECOMMENDATION
  // =========================================================

  refreshRecommendation(): void {

    this.subscription?.unsubscribe();


    this.loading = true;

    this.error = false;

    this.usingFallback = false;

    this.recommendation = null;


    this.cdr.detectChanges();


    this.subscription =
      this.aiService
        .getRecommendation()
        .pipe(

          // Do not allow the dashboard to remain
          // on the loading skeleton forever.
          timeout(20000),


          catchError(error => {

            console.error(
              '[DASHBOARD AI] Recommendation failed:',
              error
            );


            return of(null);

          })

        )
        .subscribe({

          next: (
            response:
              RecommendationResponse | null
          ) => {

            if (response) {

              console.log(
                '[DASHBOARD AI] Live recommendation:',
                response
              );


              this.recommendation =
                response;


              this.usingFallback =
                false;


              this.error =
                false;

            } else {

              console.warn(
                '[DASHBOARD AI] Using fallback recommendation'
              );


              this.recommendation =
                this.getFallbackRecommendation();


              this.usingFallback =
                true;


              this.error =
                false;

            }


            this.loading =
              false;


            this.cdr.detectChanges();

          },


          error: error => {

            console.error(
              '[DASHBOARD AI] Unexpected error:',
              error
            );


            this.recommendation =
              this.getFallbackRecommendation();


            this.usingFallback =
              true;


            this.loading =
              false;


            this.error =
              false;


            this.cdr.detectChanges();

          }

        });

  }


  // =========================================================
  // FALLBACK
  // =========================================================

  private getFallbackRecommendation():
    RecommendationResponse {

    return {

      title:
        'Continue Tracking Your Progress',


      recommendation:
        'Keep recording your daily activities. Consistent tracking helps EcoTrack identify your highest-emission habits and generate more personalized sustainability recommendations.',


      category:
        'GENERAL',


      priority:
        'MEDIUM',


      reason:
        'The live AI service is temporarily unavailable. This fallback insight keeps your dashboard useful while the recommendation service reconnects.'

    };

  }


  // =========================================================
  // DISPLAY HELPERS
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
