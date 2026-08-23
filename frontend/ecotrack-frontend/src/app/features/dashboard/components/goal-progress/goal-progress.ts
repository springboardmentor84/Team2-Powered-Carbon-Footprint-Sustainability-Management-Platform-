import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  RouterModule
} from '@angular/router';

import {
  MatCardModule
} from '@angular/material/card';

import {
  MatProgressBarModule
} from '@angular/material/progress-bar';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  GoalService,
  GoalResponse,
  GoalProgressResponse
} from '../../../../core/services/goal';


@Component({
  selector: 'app-goal-progress',

  standalone: true,

  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule
  ],

  templateUrl: './goal-progress.html',

  styleUrl: './goal-progress.css'
})
export class GoalProgress implements OnInit {

  private readonly goalService =
    inject(GoalService);

  private readonly cdr =
    inject(ChangeDetectorRef);


  loading = true;

  error = false;

  activeGoal:
    GoalResponse | null = null;

  percentage = 0;

  daysRemaining = 0;

  limitExceeded = false;


  ngOnInit(): void {

    this.fetchGoals();

    this.goalService.goalChanged$
      .subscribe(() => {

        this.fetchGoals();

      });

  }


  fetchGoals(): void {

    this.loading = true;

    this.error = false;

    this.activeGoal = null;

    this.percentage = 0;

    this.limitExceeded = false;


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


          const activeGoal =
            goals.find(
              goal =>
                goal.status === 'ACTIVE'
            ) ?? goals[0];


          this.activeGoal =
            activeGoal;


          this.calculateDaysRemaining();


          this.loadLiveProgress(
            activeGoal.id
          );

        },


        error: (
          error: HttpErrorResponse
        ) => {

          console.error(
            'Failed to load goals for dashboard widget',
            error
          );

          this.error = true;

          this.loading = false;

          this.cdr.detectChanges();

        }

      });

  }


  private loadLiveProgress(
    goalId: number
  ): void {

    this.goalService
      .getGoalProgress(goalId)
      .subscribe({

        next: (
          progress: GoalProgressResponse
        ) => {

          if (
            !this.activeGoal
          ) {

            return;

          }


          this.activeGoal = {

            ...this.activeGoal,

            currentCarbon:
              progress.currentCarbon,

            status:
              progress.status

          };


          if (
            progress.targetCarbon > 0
          ) {

            const rawPercentage =
              (
                progress.currentCarbon /
                progress.targetCarbon
              ) * 100;


            this.limitExceeded =
              rawPercentage > 100;


            this.percentage =
              Math.min(
                rawPercentage,
                100
              );

          } else {

            this.percentage = 0;

            this.limitExceeded = false;

          }


          this.loading = false;

          this.cdr.detectChanges();

        },


        error: (
          error: HttpErrorResponse
        ) => {

          console.error(
            'Failed to load live goal progress',
            error
          );

          /*
           * The goal itself loaded successfully.
           * Do not hide it just because the progress
           * endpoint failed.
           */

          this.calculateFallbackProgress();

          this.loading = false;

          this.cdr.detectChanges();

        }

      });

  }


  private calculateFallbackProgress(): void {

    if (
      !this.activeGoal ||
      this.activeGoal.targetCarbon <= 0
    ) {

      this.percentage = 0;

      this.limitExceeded = false;

      return;

    }


    const rawPercentage =
      (
        this.activeGoal.currentCarbon /
        this.activeGoal.targetCarbon
      ) * 100;


    this.limitExceeded =
      rawPercentage > 100;


    this.percentage =
      Math.min(
        rawPercentage,
        100
      );

  }


  private calculateDaysRemaining(): void {

    if (
      !this.activeGoal?.endDate
    ) {

      this.daysRemaining = 0;

      return;

    }


    const end =
      new Date(
        this.activeGoal.endDate
      );


    end.setHours(
      23,
      59,
      59,
      999
    );


    const now =
      new Date();


    const difference =
      end.getTime() -
      now.getTime();


    this.daysRemaining =
      Math.max(
        0,
        Math.ceil(
          difference /
          (
            1000 *
            60 *
            60 *
            24
          )
        )
      );

  }


  retry(): void {

    this.fetchGoals();

  }

}