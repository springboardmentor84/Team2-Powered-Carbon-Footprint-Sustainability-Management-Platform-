import {
  Injectable,
  inject
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  environment
} from '../../../environments/environment';


export interface RecommendationResponse {

  title: string;

  recommendation: string;

  category: string;

  priority: string;

  reason: string;

}


@Injectable({
  providedIn: 'root'
})
export class AiService {

  private readonly http =
    inject(HttpClient);


  private readonly endpoint =
    `${environment.apiUrl}/api/v1/recommendations`;


  // =========================================================
  // GET ALL PERSONALIZED RECOMMENDATIONS
  // =========================================================

  getRecommendations(refresh: boolean = false):
    Observable<RecommendationResponse[]> {

    return this.http.get<
      RecommendationResponse[]
    >(`${this.endpoint}?refresh=${refresh}`);

  }


  // =========================================================
  // GET PRIMARY RECOMMENDATION
  // =========================================================

  getRecommendation():
    Observable<RecommendationResponse> {

    return new Observable(
      subscriber => {

        const request =
          this.getRecommendations()
            .subscribe({

              next: recommendations => {

                if (
                  recommendations &&
                  recommendations.length > 0
                ) {

                  subscriber.next(
                    recommendations[0]
                  );

                  subscriber.complete();

                  return;

                }


                subscriber.error(
                  new Error(
                    'No AI recommendation returned by backend.'
                  )
                );

              },

              error: error => {

                subscriber.error(error);

              }

            });


        return () => {

          request.unsubscribe();

        };

      }
    );

  }

}
