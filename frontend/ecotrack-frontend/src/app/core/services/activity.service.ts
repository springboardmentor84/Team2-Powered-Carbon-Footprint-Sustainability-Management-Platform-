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
  throwError,
  finalize
} from 'rxjs';

import { environment } from '../../../environments/environment';

import { API_ENDPOINTS } from '../constants/api.constants';

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

  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  readonly loading$ = this.loadingSubject.asObservable();

  private readonly activitiesSubject =
    new BehaviorSubject<Activity[]>([]);

  readonly activities$ =
    this.activitiesSubject.asObservable();

  private readonly errorSubject = new BehaviorSubject<boolean>(false);
  readonly error$ = this.errorSubject.asObservable();

  private mapResponseToActivity(
    response: CarbonEntryResponse
  ): Activity {

    return {
      id: response.id,

      title: response.activity,
      activity: response.activity,

      category: response.category,

      quantity: Number(response.quantity) || 0,
      unit: response.unit,

      carbon: Number(response.carbonEmission) || 0,
      carbonEmission: Number(response.carbonEmission) || 0,

      date: response.createdAt,

      notes: '',

      createdAt: response.createdAt,
      updatedAt: response.updatedAt
    };
  }

  // =========================================================
  // LOAD FROM DATABASE
  // =========================================================

  loadActivities(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(false);

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
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe({
        next: activities => {
          this.activitiesSubject.next(activities);
        },
        error: error => {
          console.error(
            'Activity loading failed:',
            error
          );
          this.errorSubject.next(true);
          this.activitiesSubject.next([]);
        }
      });
  }

  // =========================================================
  // CURRENT FRONTEND DATA
  // =========================================================

  getActivities(): Activity[] {

    return this.activitiesSubject.value;
  }

  getActivities$(): Observable<Activity[]> {

    return this.activities$;
  }

  // =========================================================
  // GET ONE
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
  // ADD
  // =========================================================

  addActivity(
    activity: Omit<Activity, 'id'>
  ): Observable<Activity> {

    const request: CarbonEntryRequest = {

      category: activity.category,

      activity:
        activity.activity ||
        activity.title,

      quantity: Number(activity.quantity),

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

        map(response =>
          this.mapResponseToActivity(response)
        ),

        tap(newActivity => {

          console.log(
            'ACTIVITY SAVED TO BACKEND:',
            newActivity
          );

          /*
           * Update the shared frontend state immediately.
           * Every component subscribed to activities$ will react.
           */

          this.activitiesSubject.next([
            newActivity,
            ...this.activitiesSubject.value
          ]);

        }),

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
  // UPDATE
  // =========================================================

  updateActivity(
    updated: Activity
  ): Observable<Activity> {

    if (!updated.id) {

      return throwError(
        () =>
          new Error(
            'Activity ID is required for update.'
          )
      );

    }

    const request: CarbonEntryRequest = {

      category: updated.category,

      activity:
        updated.activity ||
        updated.title,

      quantity: Number(updated.quantity),

      unit: updated.unit

    };

    return this.http
      .put<CarbonEntryResponse>(
        `${environment.apiUrl}${API_ENDPOINTS.CARBON.BY_ID(updated.id)}`,
        request
      )
      .pipe(

        map(response =>
          this.mapResponseToActivity(response)
        ),

        tap(updatedActivity => {

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
  // DELETE
  // =========================================================

  deleteActivity(
    id: number
  ): Observable<void> {

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
  // DASHBOARD HELPERS
  // =========================================================

  getCarbonSaved(): number {

    return this.activitiesSubject.value.reduce(
      (sum, item) =>
        sum + Number(item.carbonEmission || item.carbon || 0),
      0
    );
  }

  getActivityCount(): number {

    return this.activitiesSubject.value.length;
  }

  getSustainabilityScore(): number {

    const activities =
      this.activitiesSubject.value;

    if (!activities.length) {
      return 0;
    }

    let score = 0;

    activities.forEach(item => {

      switch (
        String(item.category || '').toUpperCase()
      ) {

        case 'TRANSPORT':
          score += 6;
          break;

        case 'FOOD':
          score += 3;
          break;

        case 'ELECTRICITY':
          score += 5;
          break;

        case 'WATER':
          score += 4;
          break;

        case 'WASTE':
          score += 4;
          break;

        case 'SHOPPING':
          score += 3;
          break;

        default:
          score += 2;
      }

    });

    return Math.min(
      Math.round(score),
      100
    );
  }

  // getGoalProgress method removed as progress is fetched dynamically from the backend
}
