import {
  Component,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  Subscription,
  forkJoin
} from 'rxjs';

import {
  GoalService,
  GoalRequest,
  GoalResponse,
  GoalProgressResponse
} from '../../../../core/services/goal';

import {
  ActivityService
} from '../../../../core/services/activity.service';


interface GoalForm {

  title: string;

  targetCarbon: number;

  startDate: string;

  endDate: string;

}


@Component({

  selector: 'app-goals',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './goals.html',

  styleUrl: './goals.css'

})


export class Goals
  implements OnInit, OnDestroy {


  private readonly goalService =
    inject(GoalService);


  private readonly activityService =
    inject(ActivityService);


  private goalsSubscription?: Subscription;

  private activitySubscription?: Subscription;


  goals: GoalResponse[] = [];


  progressMap:
    Record<number, GoalProgressResponse> = {};


  loading = true;

  error = '';


  saving = false;


  showGoalModal = false;

  showDetailsModal = false;

  showDeleteModal = false;


  editingGoalId:
    number | null = null;


  selectedGoal:
    GoalResponse | null = null;


  form: GoalForm =
    this.emptyForm();


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    /*
     * Load activity history first.
     * This powers the sustainability score.
     */

    this.activityService
      .loadActivities();


    /*
     * When activity history changes,
     * refresh live goal progress.
     */

    this.activitySubscription =
      this.activityService
        .activities$
        .subscribe(() => {

          if (!this.loading) {

            this.loadGoalProgressForAll();

          }

        });


    /*
     * Load goals from PostgreSQL.
     */

    this.loadGoals();

  }


  // =========================================================
  // DESTROY
  // =========================================================

  ngOnDestroy(): void {

    this.goalsSubscription
      ?.unsubscribe();


    this.activitySubscription
      ?.unsubscribe();

  }


  // =========================================================
  // LOAD GOALS
  // =========================================================

  loadGoals(): void {

    this.goalsSubscription
      ?.unsubscribe();


    this.loading = true;

    this.error = '';


    console.log(
      '[GOALS PAGE] Loading goals...'
    );


    this.goalsSubscription =
      this.goalService
        .getMyGoals()
        .subscribe({

          next: goals => {

            console.log(
              '[GOALS PAGE] Goals received:',
              goals
            );


            this.goals =
              Array.isArray(goals)
                ? goals
                : [];


            /*
             * IMPORTANT:
             * Stop loading immediately after
             * GET /api/v1/goals responds.
             */

            this.loading = false;


            this.loadGoalProgressForAll();

          },


          error: error => {

            console.error(
              '[GOALS PAGE] Goal loading failed:',
              error
            );


            this.goals = [];

            this.progressMap = {};


            this.loading = false;


            if (
              error?.name ===
              'TimeoutError'
            ) {

              this.error =
                'Goal request timed out. Check that the Spring Boot backend and PostgreSQL database are running.';

            }

            else if (
              error?.status === 401
            ) {

              this.error =
                'Your login session has expired. Please login again.';

            }

            else if (
              error?.status === 403
            ) {

              this.error =
                'You do not have permission to access goals.';

            }

            else if (
              error?.status === 500
            ) {

              this.error =
                'Backend error while reading goals. Check the Spring Boot console.';

            }

            else {

              this.error =
                'Unable to load goals. Check the backend connection.';

            }

          }

        });

  }


  // =========================================================
  // LIVE GOAL PROGRESS
  // =========================================================

  loadGoalProgressForAll(): void {

    if (!this.goals.length) {

      this.progressMap = {};

      return;

    }


    const requests =
      this.goals.map(
        goal =>
          this.goalService
            .getGoalProgress(goal.id)
    );


    forkJoin(requests)
      .subscribe({

        next: progressList => {

          const map:
            Record<number, GoalProgressResponse> = {};


          progressList.forEach(
            progress => {

              map[progress.goalId] =
                progress;

            }
          );


          this.progressMap = map;


          /*
           * Update selected goal if open.
           */

          if (
            this.selectedGoal
          ) {

            const progress =
              this.progressMap[
                this.selectedGoal.id
              ];


            if (progress) {

              this.selectedGoal = {

                ...this.selectedGoal,

                currentCarbon:
                  Number(
                    progress.currentCarbon || 0
                  ),

                status:
                  progress.status

              };

            }

          }

        },


        error: error => {

          console.error(
            '[GOALS PAGE] Progress loading failed:',
            error
          );

        }

      });

  }


  // =========================================================
  // SUMMARY
  // =========================================================

  get activeGoalsCount(): number {

    return this.goals.filter(
      goal =>
        this.getStatusLabel(goal)
        === 'ACTIVE'
    ).length;

  }


  get completedGoalsCount(): number {

    return this.goals.filter(
      goal =>
        this.getStatusLabel(goal)
        === 'COMPLETED'
    ).length;

  }


  get totalTarget(): number {

    return this.goals.reduce(
      (sum, goal) =>
        sum +
        this.getTargetCarbon(goal),
      0
    );

  }


  get totalCurrent(): number {

    return this.activityService.getCarbonSaved();

  }


  get overallProgress(): number {

    if (
      !this.goals.length ||
      this.totalTarget <= 0
    ) {

      return 0;

    }


    return this.clamp(

      Math.round(
        (
          this.totalCurrent /
          this.totalTarget
        ) * 100
      )

    );

  }


  /*
   * Score is calculated from the activities
   * loaded from the backend/database.
   */

  get sustainabilityScore(): number {

    return this.activityService
      .getSustainabilityScore();

  }


  // =========================================================
  // GOAL CALCULATIONS
  // =========================================================

  getProgress(
    goal: GoalResponse
  ): number {

    const progress =
      this.progressMap[goal.id];


    if (progress) {

      return this.clamp(

        Number(
          progress.completionPercentage || 0
        )

      );

    }


    const target =
      this.getTargetCarbon(goal);


    if (target <= 0) {

      return 0;

    }


    return this.clamp(

      Math.round(

        (
          this.getCurrentCarbon(goal) /
          target

        ) * 100

      )

    );

  }


  getCurrentCarbon(
    goal: GoalResponse
  ): number {

    const progress =
      this.progressMap[goal.id];


    return Number(

      progress?.currentCarbon ??
      goal.currentCarbon ??
      0

    );

  }


  getTargetCarbon(
    goal: GoalResponse
  ): number {

    return Number(
      goal.targetCarbon || 0
    );

  }


  getRemainingCarbon(
    goal: GoalResponse
  ): number {

    const progress =
      this.progressMap[goal.id];


    if (progress) {

      return Math.max(

        Number(
          progress.remainingCarbon || 0
        ),

        0

      );

    }


    return Math.max(

      this.getTargetCarbon(goal) -
      this.getCurrentCarbon(goal),

      0

    );

  }


  // =========================================================
  // STATUS
  // =========================================================

  isActive(
    goal: GoalResponse
  ): boolean {

    return (
      this.getStatusLabel(goal)
      === 'ACTIVE'
    );

  }


  isCompleted(
    goal: GoalResponse
  ): boolean {

    return (
      String(goal.status)
        .toUpperCase()
        === 'COMPLETED'
      ||
      this.getProgress(goal)
      >= 100
    );

  }


  isExpired(
    goal: GoalResponse
  ): boolean {

    if (
      this.isCompleted(goal)
    ) {

      return false;

    }


    if (!goal.endDate) {

      return false;

    }


    return (

      String(goal.status)
        .toUpperCase()
        === 'FAILED'

      ||

      new Date(
        goal.endDate
      ).getTime()
      <
      new Date().getTime()

    );

  }


  getStatusLabel(
    goal: GoalResponse
  ): string {

    const status =
      String(
        goal.status || ''
      ).toUpperCase();


    if (
      status === 'COMPLETED' ||
      this.getProgress(goal) >= 100
    ) {

      return 'COMPLETED';

    }


    if (
      status === 'FAILED' ||
      this.isDateExpired(goal)
    ) {

      return 'EXPIRED';

    }


    return 'ACTIVE';

  }


  private isDateExpired(
    goal: GoalResponse
  ): boolean {

    if (!goal.endDate) {

      return false;

    }


    return (
      new Date(
        goal.endDate
      ).getTime()
      <
      Date.now()
    );

  }


  // =========================================================
  // DAYS REMAINING
  // =========================================================

  getDaysRemaining(goal: GoalResponse): number {

    if (!goal || !goal.endDate) {
      return 0;
    }

    const today = new Date();
    const endDate = new Date(goal.endDate);

    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    const difference =
      endDate.getTime() - today.getTime();

    return Math.max(
      Math.ceil(
        difference / (1000 * 60 * 60 * 24)
      ),
      0
    );
  }

  // =========================================================
  // ICON
  // =========================================================

  getGoalIcon(
    title: string
  ): string {

    const value =
      String(title || '')
        .toLowerCase();


    if (
      value.includes('transport') ||
      value.includes('travel')
    ) {

      return 'directions_car';

    }


    if (
      value.includes('food') ||
      value.includes('diet')
    ) {

      return 'restaurant';

    }


    if (
      value.includes('electric') ||
      value.includes('energy')
    ) {

      return 'bolt';

    }


    if (
      value.includes('water')
    ) {

      return 'water_drop';

    }


    if (
      value.includes('waste')
    ) {

      return 'delete';

    }


    if (
      value.includes('plastic')
    ) {

      return 'recycling';

    }


    return 'eco';

  }


  // =========================================================
  // CREATE / EDIT
  // =========================================================

  openCreateGoal(): void {

    this.editingGoalId = null;

    this.form =
      this.emptyForm();

    this.showGoalModal = true;

    this.error = '';

  }


  openEditGoal(
    goal: GoalResponse
  ): void {

    this.editingGoalId =
      goal.id;


    this.form = {

      title:
        goal.title,

      targetCarbon:
        this.getTargetCarbon(goal),

      startDate:
        this.toInputDate(
          new Date(goal.startDate)
        ),

      endDate:
        this.toInputDate(
          new Date(goal.endDate)
        )

    };


    this.showDetailsModal = false;

    this.showGoalModal = true;

  }


  closeGoalModal(): void {

    if (this.saving) {

      return;

    }


    this.showGoalModal =
      false;

    this.editingGoalId =
      null;

  }


  saveGoal(): void {

    const title =
      this.form.title.trim();


    const targetCarbon =
      Number(
        this.form.targetCarbon
      );


    if (!title) {

      this.error =
        'Please enter a goal title.';

      return;

    }


    if (
      !Number.isFinite(
        targetCarbon
      ) ||
      targetCarbon <= 0
    ) {

      this.error =
        'Target carbon must be greater than 0.';

      return;

    }


    if (
      !this.form.startDate ||
      !this.form.endDate
    ) {

      this.error =
        'Please select both dates.';

      return;

    }


    if (
      new Date(
        this.form.endDate
      ).getTime()
      <
      new Date(
        this.form.startDate
      ).getTime()
    ) {

      this.error =
        'End date must be after start date.';

      return;

    }


    const request:
      GoalRequest = {

      title,

      targetCarbon,

      startDate:
        this.form.startDate,

      endDate:
        this.form.endDate

    };


    this.saving = true;

    this.error = '';


    const request$ =
      this.editingGoalId !== null

        ?

        this.goalService
          .updateGoal(
            this.editingGoalId,
            request
          )

        :

        this.goalService
          .createGoal(
            request
          );


    request$
      .subscribe({

        next: savedGoal => {

  console.log(
    '[GOALS PAGE] Goal saved successfully:',
    savedGoal
  );

  this.saving = false;

  /*
   * IMPORTANT:
   * Update the local array immediately.
   * This makes the newly-created goal appear
   * without requiring a second click.
   */
  if (this.editingGoalId !== null) {

    this.goals = this.goals.map(goal =>
      goal.id === this.editingGoalId
        ? savedGoal
        : goal
    );

  } else {

    this.goals = [
      savedGoal,
      ...this.goals
    ];

  }

  /*
   * Close modal immediately.
   */
  this.showGoalModal = false;
  this.editingGoalId = null;

  /*
   * Clear old error.
   */
  this.error = '';

  /*
   * Load the latest calculated carbon progress
   * for the newly updated goal list.
   */
  this.loadGoalProgressForAll();

},


        error: error => {

          console.error(
            '[GOALS PAGE] Goal save failed:',
            error
          );


          this.saving = false;


          this.error =
            'Goal could not be saved. Check the backend response.';

        }

      });

  }


  // =========================================================
  // DETAILS
  // =========================================================

  openGoal(
    goal: GoalResponse
  ): void {

    this.selectedGoal =
      goal;

    this.showDetailsModal =
      true;

  }


  closeDetails(): void {

    this.showDetailsModal =
      false;

    this.selectedGoal =
      null;

  }


  // =========================================================
  // DELETE
  // =========================================================

  confirmDelete(
    goal: GoalResponse
  ): void {

    this.selectedGoal =
      goal;

    this.showDetailsModal =
      false;

    this.showDeleteModal =
      true;

  }


  closeDelete(): void {

    if (this.saving) {

      return;

    }


    this.showDeleteModal =
      false;

  }


  deleteGoal(): void {

    if (!this.selectedGoal) {

      return;

    }


    this.saving = true;

    this.error = '';


    this.goalService
      .deleteGoal(
        this.selectedGoal.id
      )
      .subscribe({

        next: () => {

          this.saving = false;

          this.showDeleteModal =
            false;

          this.selectedGoal =
            null;


          this.loadGoals();

        },


        error: error => {

          console.error(
            '[GOALS PAGE] Delete failed:',
            error
          );


          this.saving = false;

          this.error =
            'Unable to delete this goal.';

        }

      });

  }


  // =========================================================
  // FORM HELPERS
  // =========================================================

  private emptyForm(): GoalForm {

    const today =
      this.toInputDate(
        new Date()
      );


    return {

      title: '',

      targetCarbon: 100,

      startDate: today,

      endDate:
        this.toInputDate(
          this.addDays(
            new Date(),
            30
          )
        )

    };

  }


  private addDays(
    date: Date,
    days: number
  ): Date {

    const result =
      new Date(date);


    result.setDate(
      result.getDate() + days
    );


    return result;

  }


  private toInputDate(
    date: Date
  ): string {

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return '';

    }


    const year =
      date.getFullYear();


    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, '0');


    const day =
      String(
        date.getDate()
      ).padStart(2, '0');


    return `${year}-${month}-${day}`;

  }


  trackByGoalId(
    index: number,
    goal: GoalResponse
  ): number {

    return goal.id;

  }


  private clamp(
    value: number
  ): number {

    if (
      !Number.isFinite(value)
    ) {

      return 0;

    }


    return Math.min(
      Math.max(value, 0),
      100
    );

  }

}
