import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';

import {
  Observable,
  Subject,
  timeout,
  catchError,
   tap,
  throwError
} from 'rxjs';
export interface GoalRequest {
  title: string;
  targetCarbon: number;
  startDate: string;
  endDate: string;
}

export interface GoalResponse {
  id: number;
  title: string;
  targetCarbon: number;
  currentCarbon: number;
  startDate: string;
  endDate: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GoalProgressResponse {
  goalId: number;
  title: string;
  targetCarbon: number;
  currentCarbon: number;
  remainingCarbon: number;
  completionPercentage: number;
  status: string;
  startDate: string;
  endDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class GoalService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:8080/api/v1/goals';

private readonly goalChangedSubject =
  new Subject<void>();

readonly goalChanged$ =
  this.goalChangedSubject.asObservable();
  // =========================================================
  // GET ALL GOALS
  // =========================================================

  getMyGoals(): Observable<GoalResponse[]> {

    console.log(
      '[GOALS] GET:',
      this.apiUrl
    );

    return this.http
      .get<GoalResponse[]>(
        this.apiUrl
      )
      .pipe(

        timeout(10000),

        catchError(
          (error: HttpErrorResponse | any) => {

            console.error(
              '[GOALS] GET FAILED:',
              error
            );

            return throwError(
              () => error
            );

          }
        )

      );

  }


  // =========================================================
  // GET ONE GOAL
  // =========================================================

  getGoalById(
    id: number
  ): Observable<GoalResponse> {

    return this.http
      .get<GoalResponse>(
        `${this.apiUrl}/${id}`
      )
      .pipe(
        timeout(10000)
      );

  }


  // =========================================================
  // CREATE
  // =========================================================

  createGoal(
    request: GoalRequest
  ): Observable<GoalResponse> {

    console.log(
      '[GOALS] POST:',
      request
    );

    return this.http
  .post<GoalResponse>(
    this.apiUrl,
    request
  )
  .pipe(

    timeout(10000),

    tap(() => {
      this.goalChangedSubject.next();
    })

  );
  }


  // =========================================================
  // UPDATE
  // =========================================================

  updateGoal(
    id: number,
    request: GoalRequest
  ): Observable<GoalResponse> {

   return this.http
  .put<GoalResponse>(
    `${this.apiUrl}/${id}`,
    request
  )
  .pipe(

    timeout(10000),

    tap(() => {
      this.goalChangedSubject.next();
    })

  );
  }


  // =========================================================
  // DELETE
  // =========================================================

  deleteGoal(
    id: number
  ): Observable<void> {

    return this.http
  .delete<void>(
    `${this.apiUrl}/${id}`
  )
  .pipe(

    timeout(10000),

    tap(() => {
      this.goalChangedSubject.next();
    })

  );

  }


  // =========================================================
  // LIVE PROGRESS
  // =========================================================

  getGoalProgress(
    id: number
  ): Observable<GoalProgressResponse> {

    console.log(
      '[GOALS] PROGRESS GET:',
      `${this.apiUrl}/${id}/progress`
    );

    return this.http
      .get<GoalProgressResponse>(
        `${this.apiUrl}/${id}/progress`
      )
      .pipe(
        timeout(10000)
      );

  }

}
