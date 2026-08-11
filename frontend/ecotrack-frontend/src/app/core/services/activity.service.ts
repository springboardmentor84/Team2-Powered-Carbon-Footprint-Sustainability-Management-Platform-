import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';

import {
  BehaviorSubject,
  Observable,
  catchError,
  map,
  tap,
  throwError
} from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  API_ENDPOINTS
} from '../constants/api.constants';

import {
  Activity,
  CarbonEntryRequest,
  CarbonEntryResponse
} from '../models/activity.model';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  private readonly http = inject(HttpClient);

  private readonly activitiesSubject =
    new BehaviorSubject<Activity[]>([]);

  readonly activities$ =
    this.activitiesSubject.asObservable();


  // =========================================================
  // BACKEND RESPONSE → FRONTEND ACTIVITY
  // =========================================================

  private mapResponseToActivity(
    response: CarbonEntryResponse
  ): Activity {

    return {
      id: response.id,

      title: response.activity,
      activity: response.activity,

      category: response.category,

      quantity: response.quantity,
      unit: response.unit,

      carbon: response.carbonEmission,
      carbonEmission: response.carbonEmission,

      date: response.createdAt,
      notes: '',

      createdAt: response.createdAt,
      updatedAt: response.updatedAt
    };
  }


  // =========================================================
  // LOAD ALL ACTIVITIES
  // GET /api/v1/carbon
  // =========================================================

  loadActivities(): void {

    this.http
      .get<CarbonEntryResponse[]>(
        `${environment.apiUrl}${API_ENDPOINTS.CARBON.BASE}`
      )
      .pipe(
        map(responses =>
          responses.map(response =>
            this.mapResponseToActivity(response)
          )
        ),

        catchError((error: HttpErrorResponse) => {

          console.error(
            'Failed to load activities:',
            error
          );

          return throwError(() => error);
        })
      )
      .subscribe({
        next: activities => {

          this.activitiesSubject.next(
            activities
          );

        },

        error: error => {

          console.error(
            'Activity loading failed:',
            error
          );

          this.activitiesSubject.next([]);
        }
      });
  }


  // =========================================================
  // GET CURRENT ACTIVITIES
  // =========================================================

  getActivities(): Activity[] {

    return this.activitiesSubject.value;
  }


  getActivities$(): Observable<Activity[]> {

    return this.activities$;
  }


  // =========================================================
  // GET ONE ACTIVITY
  // GET /api/v1/carbon/{id}
  // =========================================================

  getActivityById(
    id: number
  ): Observable<Activity> {

    return this.http
      .get<CarbonEntryResponse>(
        `${environment.apiUrl}${API_ENDPOINTS.CARBON.BY_ID(id)}`
      )
      .pipe(
        map(response =>
          this.mapResponseToActivity(response)
        )
      );
  }


  // =========================================================
  // ADD ACTIVITY
  // POST /api/v1/carbon
  // =========================================================

  addActivity(
    activity: Omit<Activity, 'id'>
  ): Observable<Activity> {

    const request: CarbonEntryRequest = {

      category: activity.category,

      activity:
        activity.activity ||
        activity.title,

      quantity: activity.quantity,

      unit: activity.unit
    };


    console.log(
      'POST /api/v1/carbon:',
      request
    );


    return this.http
      .post<CarbonEntryResponse>(
        `${environment.apiUrl}${API_ENDPOINTS.CARBON.BASE}`,
        request
      )
      .pipe(

        tap(response => {

          console.log(
            'Activity saved successfully:',
            response
          );

          const newActivity =
            this.mapResponseToActivity(response);

          this.activitiesSubject.next([

            newActivity,

            ...this.activitiesSubject.value

          ]);

        }),

        map(response =>
          this.mapResponseToActivity(response)
        ),

        catchError((error: HttpErrorResponse) => {

          console.error(
            'Activity save failed:',
            error
          );

          return throwError(() => error);
        })
      );
  }


  // =========================================================
  // UPDATE ACTIVITY
  // PUT /api/v1/carbon/{id}
  // =========================================================

  updateActivity(
    updated: Activity
  ): Observable<Activity> {

    const request: CarbonEntryRequest = {

      category: updated.category,

      activity:
        updated.activity ||
        updated.title,

      quantity: updated.quantity,

      unit: updated.unit
    };


    console.log(
      'PUT /api/v1/carbon/' + updated.id,
      request
    );


    return this.http
      .put<CarbonEntryResponse>(
        `${environment.apiUrl}${API_ENDPOINTS.CARBON.BY_ID(updated.id)}`,
        request
      )
      .pipe(

        map(response => {

          const updatedActivity =
            this.mapResponseToActivity(response);

          const current =
            this.activitiesSubject.value;

          const updatedList =
            current.map(item =>
              item.id === updatedActivity.id
                ? updatedActivity
                : item
            );

          this.activitiesSubject.next(
            updatedList
          );

          return updatedActivity;
        }),

        catchError((error: HttpErrorResponse) => {

          console.error(
            'Activity update failed:',
            error
          );

          return throwError(() => error);
        })
      );
  }


  // =========================================================
  // DELETE ACTIVITY
  // DELETE /api/v1/carbon/{id}
  // =========================================================

  deleteActivity(
    id: number
  ): Observable<void> {

    console.log(
      'DELETE /api/v1/carbon/' + id
    );


    return this.http
      .delete<void>(
        `${environment.apiUrl}${API_ENDPOINTS.CARBON.BY_ID(id)}`
      )
      .pipe(

        tap(() => {

          const updated =
            this.activitiesSubject.value.filter(
              activity =>
                activity.id !== id
            );

          this.activitiesSubject.next(
            updated
          );

        }),

        catchError((error: HttpErrorResponse) => {

          console.error(
            'Activity delete failed:',
            error
          );

          return throwError(() => error);
        })
      );
  }


  // =========================================================
  // CLEAR FRONTEND VIEW ONLY
  // =========================================================

  clearAllActivities(): void {

    this.activitiesSubject.next([]);
  }


  // =========================================================
  // DASHBOARD HELPERS
  // =========================================================

  getCarbonSaved(): number {

    return this.activitiesSubject.value.reduce(

      (sum, item) =>
        sum + (item.carbonEmission || 0),

      0
    );
  }


  getActivityCount(): number {

    return this.activitiesSubject.value.length;
  }


  getSustainabilityScore(): number {

    let score = 0;

    this.activitiesSubject.value.forEach(
      item => {

        switch (
          item.category.toLowerCase()
        ) {

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

          case 'waste':
            score += 4;
            break;

          case 'shopping':
            score += 3;
            break;

          default:
            score += 2;
        }
      }
    );

    return Math.min(score, 100);
  }


  getGoalProgress(
    goal = 100
  ): number {

    if (goal <= 0) {
      return 0;
    }

    return Math.min(

      Math.round(
        (this.getCarbonSaved() / goal) * 100
      ),

      100
    );
  }
}
