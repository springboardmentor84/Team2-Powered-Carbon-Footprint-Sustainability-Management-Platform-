import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';

import {
  BehaviorSubject,
  Observable,
  throwError
} from 'rxjs';

import {
  catchError,
  map,
  tap
} from 'rxjs/operators';

import { environment } from '../../../environments/environment';

const API_ENDPOINTS = {

  CARBON: {

    BASE: '/api/v1/carbon',

    BY_ID: (id: number) => `/api/v1/carbon/${id}`

  }

};


// ============================================
// FRONTEND ACTIVITY MODEL
// ============================================

export interface Activity {

  id: number;

  title: string;

  activity?: string;

  category: string;

  quantity: number;

  unit: string;

  carbon: number;

  carbonEmission?: number;

  date: string;

  notes: string;

  createdAt?: string;

  updatedAt?: string;
}


// ============================================
// BACKEND REQUEST
// ============================================

export interface CarbonEntryRequest {

  category: string;

  activity: string;

  quantity: number;

  unit: string;
}


// ============================================
// BACKEND RESPONSE
// ============================================

export interface CarbonEntryResponse {

  id: number;

  category: string;

  activity: string;

  quantity: number;

  unit: string;

  carbonEmission: number;

  createdAt: string;

  updatedAt: string;
}


@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  private http = inject(HttpClient);


  private readonly activitiesSubject =
    new BehaviorSubject<Activity[]>([]);


  readonly activities$ =
    this.activitiesSubject.asObservable();


  constructor() {

    this.loadActivities();

  }


  // ============================================
  // FRONTEND CATEGORY → BACKEND ENUM
  // ============================================

  private normalizeCategory(
    category: string
  ): string {

    const value =
      category
        .trim()
        .toUpperCase();


    const mapping: Record<string, string> = {

      'TRANSPORTATION': 'TRANSPORT',

      'TRANSPORT': 'TRANSPORT',

      'ELECTRICITY': 'ELECTRICITY',

      'WATER': 'WATER',

      'FOOD': 'FOOD',

      'WASTE': 'WASTE',

      'SHOPPING': 'SHOPPING',

      'OTHERS': 'OTHER',

      'OTHER': 'OTHER'

    };


    return mapping[value] || value;

  }


  // ============================================
  // BACKEND → FRONTEND MAPPING
  // ============================================

  private mapResponseToActivity(
    response: CarbonEntryResponse
  ): Activity {

    return {

      id: response.id,

      title: response.activity,

      activity: response.activity,

      category: this.displayCategory(
        response.category
      ),

      quantity: response.quantity,

      unit: response.unit,

      carbon: response.carbonEmission,

      carbonEmission:
        response.carbonEmission,

      date: response.createdAt,

      notes: '',

      createdAt: response.createdAt,

      updatedAt: response.updatedAt

    };

  }


  // ============================================
  // BACKEND ENUM → DISPLAY NAME
  // ============================================

  private displayCategory(
    category: string
  ): string {

    const mapping: Record<string, string> = {

      'TRANSPORT': 'Transportation',

      'ELECTRICITY': 'Electricity',

      'WATER': 'Water',

      'FOOD': 'Food',

      'WASTE': 'Waste',

      'SHOPPING': 'Shopping',

      'OTHER': 'Others'

    };


    return mapping[category] || category;

  }


  // ============================================
  // GET ALL ACTIVITIES
  // GET /api/v1/carbon
  // ============================================

  loadActivities(): void {

    this.http
      .get<CarbonEntryResponse[]>(
        `${environment.apiUrl}${API_ENDPOINTS.CARBON.BASE}`
      )
      .pipe(

        catchError((error: HttpErrorResponse) => {

          console.error(
            'Failed to load carbon entries:',
            error
          );

          return throwError(
            () => error
          );

        })

      )
      .subscribe({

        next: (responses) => {

          const activities =
            responses.map(response =>
              this.mapResponseToActivity(response)
            );


          this.activitiesSubject.next(
            activities
          );

        },


        error: (error) => {

          console.error(
            'Activity loading failed:',
            error
          );

          this.activitiesSubject.next([]);

        }

      });

  }


  // ============================================
  // GET ACTIVITIES
  // ============================================

  getActivities(): Activity[] {

    return this.activitiesSubject.value;

  }


  getActivities$():
    Observable<Activity[]> {

    return this.activities$;

  }


  // ============================================
  // GET SINGLE ACTIVITY
  // GET /api/v1/carbon/{id}
  // ============================================

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


  // ============================================
  // ADD ACTIVITY
  // POST /api/v1/carbon
  // ============================================

  addActivity(
    activity: Omit<Activity, 'id'>
  ): Observable<Activity> {

    const request: CarbonEntryRequest = {

      category:
        this.normalizeCategory(
          activity.category
        ),

      activity:
        activity.title.trim(),

      quantity:
        Number(activity.quantity),

      unit:
        activity.unit.trim()

    };


    console.log(
      'POST /api/v1/carbon REQUEST:',
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
            'POST /api/v1/carbon RESPONSE:',
            response
          );


          const newActivity =
            this.mapResponseToActivity(
              response
            );


          this.activitiesSubject.next([

            newActivity,

            ...this.activitiesSubject.value

          ]);

        }),


        map(response =>
          this.mapResponseToActivity(
            response
          )
        )

      );

  }


  // ============================================
  // UPDATE ACTIVITY
  // PUT /api/v1/carbon/{id}
  // ============================================

  updateActivity(
    updated: Activity
  ): Observable<Activity> {

    const request: CarbonEntryRequest = {

      category:
        this.normalizeCategory(
          updated.category
        ),

      activity:
        updated.title.trim(),

      quantity:
        Number(updated.quantity),

      unit:
        updated.unit.trim()

    };


    return this.http
      .put<CarbonEntryResponse>(
        `${environment.apiUrl}${API_ENDPOINTS.CARBON.BY_ID(updated.id)}`,
        request
      )
      .pipe(

        tap(response => {

          const updatedActivity =
            this.mapResponseToActivity(
              response
            );


          const list =
            this.activitiesSubject.value.map(
              item =>
                item.id === updatedActivity.id
                  ? updatedActivity
                  : item
            );


          this.activitiesSubject.next(
            list
          );

        }),


        map(response =>
          this.mapResponseToActivity(
            response
          )
        )

      );

  }


  // ============================================
  // DELETE ACTIVITY
  // DELETE /api/v1/carbon/{id}
  // ============================================

  deleteActivity(
    id: number
  ): Observable<void> {

    return this.http
      .delete<void>(
        `${environment.apiUrl}${API_ENDPOINTS.CARBON.BY_ID(id)}`
      )
      .pipe(

        tap(() => {

          this.activitiesSubject.next(

            this.activitiesSubject.value.filter(
              activity =>
                activity.id !== id
            )

          );

        })

      );

  }


  // ============================================
  // CLEAR LOCAL VIEW
  // ============================================

  clearAllActivities(): void {

    this.activitiesSubject.next([]);

  }


  // ============================================
  // DASHBOARD HELPERS
  // ============================================

  getCarbonSaved(): number {

    return this.activitiesSubject.value.reduce(

      (sum, item) =>
        sum + item.carbon,

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
          case 'transportation':
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

      }
    );


    return Math.min(
      score,
      100
    );

  }


  getGoalProgress(
    goal = 100
  ): number {

    if (goal <= 0) {

      return 0;

    }


    return Math.min(

      Math.round(
        (
          this.getCarbonSaved() /
          goal
        ) * 100
      ),

      100

    );

  }

}
