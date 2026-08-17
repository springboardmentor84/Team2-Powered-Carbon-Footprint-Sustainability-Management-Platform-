import {
  Component,
  OnDestroy,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';

import { MatProgressBarModule } from '@angular/material/progress-bar';

import { MatIconModule } from '@angular/material/icon';

import { Subscription } from 'rxjs';

import {
  GoalService,
  GoalResponse,
  GoalProgressResponse
} from '../../../core/services/goal';

import {
  ActivityService
} from '../../../core/services/activity.service';


@Component({
  selector: 'app-goal-progress',

  standalone: true,

  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatProgressBarModule,
    MatIconModule
  ],

  templateUrl: './goal-progress.html',

  styleUrl: './goal-progress.css'
})
export class GoalProgress
  implements OnInit, OnDestroy {

  private readonly goalService =
    inject(GoalService);

  private cdr = inject(ChangeDetectorRef);
  
  private readonly activityService =
    inject(ActivityService);

  private activitySubscription?: Subscription;

  private goalSubscription?: Subscription;

  private progressSubscription?: Subscription;


  activeGoal:
    GoalProgressResponse | null = null;


  loading = true;

  error = false;


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.loadGoal();

    /*
     * Keep goal progress synchronized with
     * carbon activity changes.
     */

    this.activitySubscription =
      this.activityService.activities$
        .subscribe(() => {

          /*
           * Do not reload while the first request
           * is still being resolved unnecessarily.
           */

          if (!this.loading) {

            this.loadGoal();

          }

        });

  }


  // =========================================================
  // DESTROY
  // =========================================================

  ngOnDestroy(): void {

    this.activitySubscription?.unsubscribe();

    this.goalSubscription?.unsubscribe();

    this.progressSubscription?.unsubscribe();

  }


  // =========================================================
  // LOAD GOAL
  // =========================================================

  private loadGoal(): void {

    this.goalSubscription?.unsubscribe();

    this.loading = true;

    this.error = false;


    this.goalSubscription =
      this.goalService
        .getMyGoals()
        .subscribe({

          next: (
            goals: GoalResponse[]
          ) => {

            if (
              !goals ||
              goals.length === 0
            ) {

              this.activeGoal = null;
              this.loading = false;
              this.cdr.detectChanges();
              return;

            }


            /*
             * Prefer an ACTIVE goal.
             */

            const active =
              goals.find(
                goal =>
                  String(goal.status)
                    .toUpperCase() === 'ACTIVE'
              );


            /*
             * If no active goal exists,
             * show the first goal returned.
             */

            const selectedGoal =
              active || goals[0];


            this.loadGoalProgress(
              selectedGoal.id
            );

          },

          error: error => {

            console.error(
              'Failed to load sustainability goals:',
              error
            );

            this.activeGoal = null;
            this.error = true;
            this.loading = false;
            this.cdr.detectChanges();
          }

        });

  }


  // =========================================================
  // LIVE GOAL PROGRESS
  // =========================================================

  private loadGoalProgress(
    goalId: number
  ): void {

    this.progressSubscription?.unsubscribe();


    this.progressSubscription =
      this.goalService
        .getGoalProgress(goalId)
        .subscribe({

          next: (
            progress: GoalProgressResponse
          ) => {

            console.log(
              'LIVE SUSTAINABILITY GOAL:',
              progress
            );

            this.activeGoal = progress;
            this.loading = false;
            this.error = false;
            this.cdr.detectChanges();
          },

          error: error => {

            console.error(
              'Failed to load goal progress:',
              error
            );

            this.activeGoal = null;
            this.error = true;
            this.loading = false;
            this.cdr.detectChanges();
          }

        });

  }


  // =========================================================
  // DISPLAY VALUES
  // =========================================================

  get goalTitle(): string {

    return (
      this.activeGoal?.title ||
      'Sustainability Goal'
    );

  }


  get currentCarbon(): number {

    return Number(
      this.activeGoal?.currentCarbon || 0
    );

  }


  get targetCarbon(): number {

    return Number(
      this.activeGoal?.targetCarbon || 0
    );

  }


  get remainingCarbon(): number {

    return Math.max(
      Number(
        this.activeGoal?.remainingCarbon || 0
      ),
      0
    );

  }


  get progress(): number {

    const value =
      Number(
        this.activeGoal?.completionPercentage || 0
      );


    if (!Number.isFinite(value)) {

      return 0;

    }


    return Math.min(
      Math.max(value, 0),
      100
    );

  }


  get startDate(): string {

    return this.activeGoal?.startDate || '';

  }


  get endDate(): string {

    return this.activeGoal?.endDate || '';

  }


  get status(): string {

    return (
      this.activeGoal?.status ||
      'ACTIVE'
    );

  }


  get hasGoal(): boolean {

    return this.activeGoal !== null;

  }

}
