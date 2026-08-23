import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import {
  Subscription,
  forkJoin
} from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import {
  MatDialog,
  MatDialogModule
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { Chart } from 'chart.js/auto';

import { ActivityService } from '../../../../core/services/activity.service';

import {
  DashboardService,
  DashboardSummary
} from '../../../../core/services/dashboard/dashboard.service';

import { AnalyticsService } from '../../../../core/services/analytics.service';
import { AnalyticsResponse } from '../../../../core/models/analytics.model';

import {
  GoalService,
  GoalResponse
} from '../../../../core/services/goal';

import {
  AddActivityDialog
} from '../../../activities/components/add-activity-dialog/add-activity-dialog';

import { MonthlyChart }
  from '../../../../shared/components/monthly-chart/monthly-chart';

import { GoalProgress }
  from '../../../../shared/components/goal-progress/goal-progress';

import { SustainabilityScore }
  from '../../../../shared/components/sustainability-score/sustainability-score';

import { RecentActivities }
  from '../../../../shared/components/recent-activities/recent-activities';

import { NotificationCard }
  from '../../../../shared/components/notification-card/notification-card';

import { CalendarCard }
  from '../../../../shared/components/calendar-card/calendar-card';

import { AiRecommendation }
  from '../../../../shared/components/ai-recommendation/ai-recommendation';

import { QuickActions }
  from '../../../../shared/components/quick-actions/quick-actions';

import { ProfileWidget }
  from '../../../../shared/components/profile-widget/profile-widget';

import { AchievementCard }
  from '../../../../shared/components/achievement-card/achievement-card';

import { StreakCard }
  from '../../../../shared/components/streak-card/streak-card';

import { WeatherCard }
  from '../../../../shared/components/weather-card/weather-card';


@Component({
  selector: 'app-dashboard-home',

  standalone: true,

  imports: [
    CommonModule,
    RouterModule,

    MatCardModule,
    MatIconModule,
    MatDialogModule,

    MonthlyChart,
    GoalProgress,
    SustainabilityScore,
    RecentActivities,
    NotificationCard,
    CalendarCard,
    AiRecommendation,
    QuickActions,
    AchievementCard,
    StreakCard,
    WeatherCard,
    ProfileWidget
  ],

  templateUrl: './dashboard-home.html',

  styleUrl: './dashboard-home.css'
})
export class DashboardHome
  implements OnInit, AfterViewInit, OnDestroy {


  // =========================================================
  // SERVICES
  // =========================================================

  readonly activityService =
    inject(ActivityService);

  private readonly dashboardService =
    inject(DashboardService);

  private readonly goalService =
    inject(GoalService);

  private readonly dialog =
    inject(MatDialog);

  private readonly analyticsService =
    inject(AnalyticsService);


  // =========================================================
  // SUBSCRIPTIONS
  // =========================================================

  private activitySubscription?: Subscription;

  private dashboardSubscription?: Subscription;

  private goalSubscription?: Subscription;

  private goalChangedSubscription?: Subscription;

  private goalProgressSubscription?: Subscription;

  private analyticsSubscription?: Subscription;


  // =========================================================
  // CHART
  // =========================================================

  @ViewChild('carbonChart')
  carbonChart?: ElementRef<HTMLCanvasElement>;

  chart?: Chart;


  // =========================================================
  // STATE
  // =========================================================

  loading = true;

  dashboardError = false;

  errorMessage = '';

  goals: GoalResponse[] = [];

  goalProgress = 0;

  analyticsData?: AnalyticsResponse | null = null;


  // =========================================================
  // DASHBOARD CARDS
  // =========================================================

  stats = [
    {
      icon: 'eco',
      title: 'Carbon Emitted',
      value: '0.0 kg',
      subtitle: 'Total CO₂ Emission',
      color: '#2E7D32'
    },

    {
      icon: 'directions_walk',
      title: 'Activities',
      value: '0',
      subtitle: 'Activities Logged',
      color: '#1565C0'
    },

    {
      icon: 'emoji_events',
      title: 'Sustainability Score',
      value: '0',
      subtitle: 'Out of 100',
      color: '#FB8C00'
    },

    {
      icon: 'flag',
      title: 'Goals',
      value: '0%',
      subtitle: 'Overall Progress',
      color: '#8E24AA'
    }
  ];


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    console.log(
      '[DASHBOARD] Initializing dashboard...'
    );


    // ---------------------------------------------------------
    // Listen to shared activity state
    // ---------------------------------------------------------

    this.activitySubscription =
      this.activityService
        .activities$
        .subscribe(activities => {

          console.log(
            '[DASHBOARD] Activities received:',
            activities
          );

          this.updateActivityBasedCards();

          this.updateChart();

        });


    // ---------------------------------------------------------
    // Load data
    // ---------------------------------------------------------

    this.activityService.loadActivities();

    this.loadDashboardSummary();

    this.loadGoals();

    this.loadAnalytics();


    // ---------------------------------------------------------
    // Refresh goals only when goalChanged$ emits
    // ---------------------------------------------------------

    this.goalChangedSubscription =
      this.goalService
        .goalChanged$
        .subscribe(() => {

          console.log(
            '[DASHBOARD] Goal changed → refreshing goals'
          );

          this.loadGoals();

        });

  }


  // =========================================================
  // AFTER VIEW INIT
  // =========================================================

  ngAfterViewInit(): void {

    setTimeout(() => {

      this.createChart();

    }, 0);

  }


  // =========================================================
  // DESTROY
  // =========================================================

  ngOnDestroy(): void {

    this.activitySubscription?.unsubscribe();

    this.dashboardSubscription?.unsubscribe();

    this.goalSubscription?.unsubscribe();

    this.goalChangedSubscription?.unsubscribe();

    this.goalProgressSubscription?.unsubscribe();

    this.analyticsSubscription?.unsubscribe();

    this.chart?.destroy();

  }


  // =========================================================
  // DASHBOARD SUMMARY
  // =========================================================

  private loadDashboardSummary(): void {

    this.dashboardSubscription?.unsubscribe();


    console.log(
      '[DASHBOARD] Loading backend summary...'
    );


    this.dashboardSubscription =
      this.dashboardService
        .getSummary()
        .subscribe({

          next: (summary: DashboardSummary) => {

            console.log(
              '[DASHBOARD] Backend summary:',
              summary
            );


            this.dashboardError = false;

            this.errorMessage = '';


            // Carbon emitted
            this.stats[0].value =
              `${Number(
                summary.totalCarbonEmission ?? 0
              ).toFixed(1)} kg`;


            // Activity count
            this.stats[1].value =
              String(
                summary.totalEntries ?? 0
              );


            // Sustainability score comes from activities
          const activities =
  this.activityService
    .getActivities();


const totalCarbon =
  activities.reduce(
    (sum, activity) => {

      return (
        sum +
        Number(
          activity.carbonEmission ??
          activity.carbon ??
          0
        )
      );

    },
    0
  );


const activityCount =
  activities.length;


const averageEmission =
  activityCount > 0
    ? totalCarbon / activityCount
    : 0;


const sustainabilityScore =
  activityCount === 0
    ? 100
    : Math.max(
        0,
        Math.min(
          100,
          Math.round(
            100 -
            (
              averageEmission * 10
            )
          )
        )
      );


this.stats[2].value =
  String(
    sustainabilityScore
  );


            // Goal progress is loaded separately
            this.updateGoalCard();

            this.refreshStats();

            this.loading = false;

          },


          error: error => {

            console.error(
              '[DASHBOARD] Summary API failed:',
              error
            );


            this.dashboardError = true;

            this.errorMessage =
              'Dashboard summary unavailable. Showing live activity data.';


            // Use activities as fallback
            this.updateActivityBasedCards();

            this.loading = false;

          }

        });

  }


  // =========================================================
  // ACTIVITY FALLBACK
  // =========================================================

  private updateActivityBasedCards(): void {

    const activities =
      this.activityService
        .getActivities();


    const totalCarbon =
      activities.reduce(
        (sum, activity) => {

          const carbon =
            Number(
              activity.carbonEmission ??
              activity.carbon ??
              0
            );

          return sum + carbon;

        },
        0
      );


    const activityCount =
      activities.length;


    const averageEmission =
  activityCount > 0
    ? totalCarbon / activityCount
    : 0;


const sustainabilityScore =
  activityCount === 0
    ? 100
    : Math.max(
        0,
        Math.min(
          100,
          Math.round(
            100 -
            (
              averageEmission * 10
            )
          )
        )
      );

    this.stats[0].value =
      `${totalCarbon.toFixed(1)} kg`;


    this.stats[1].value =
      String(activityCount);


    this.stats[2].value =
      String(sustainabilityScore);


    this.updateGoalCard();

    this.refreshStats();

  }


  // =========================================================
  // LOAD GOALS
  // =========================================================

  private loadGoals(): void {

    this.goalSubscription?.unsubscribe();


    console.log(
      '[DASHBOARD] Loading goals...'
    );


    this.goalSubscription =
      this.goalService
        .getMyGoals()
        .subscribe({

          next: goals => {

            console.log(
              '[DASHBOARD] Goals received:',
              goals
            );


            this.goals =
              Array.isArray(goals)
                ? goals
                : [];


            this.loadGoalProgress();

          },


          error: error => {

            console.error(
              '[DASHBOARD] Goal loading failed:',
              error
            );


            this.goals = [];

            this.goalProgress = 0;

            this.updateGoalCard();

          }

        });

  }


  // =========================================================
  // LOAD GOAL PROGRESS
  // =========================================================

  private loadGoalProgress(): void {

    this.goalProgressSubscription?.unsubscribe();


    if (!this.goals.length) {

      this.goalProgress = 0;

      this.updateGoalCard();

      return;

    }


    const progressRequests =
      this.goals.map(
        goal =>
          this.goalService
            .getGoalProgress(goal.id)
      );


    this.goalProgressSubscription =
      forkJoin(progressRequests)
        .subscribe({

          next: progressList => {

            console.log(
              '[DASHBOARD] Goal progress list:',
              progressList
            );


            if (!progressList.length) {

              this.goalProgress = 0;

              this.updateGoalCard();

              return;

            }


            let totalTarget = 0;

            let totalCurrent = 0;


            progressList.forEach(progress => {

              totalTarget +=
                Number(
                  progress.targetCarbon ?? 0
                );


              totalCurrent +=
                Number(
                  progress.currentCarbon ?? 0
                );

            });


            if (totalTarget <= 0) {

              this.goalProgress = 0;

            } else {

              this.goalProgress =
                Math.min(
                  Math.max(
                    Math.round(
                      (totalCurrent / totalTarget) * 100
                    ),
                    0
                  ),
                  100
                );

            }


            console.log(
              '[DASHBOARD] Overall goal progress:',
              this.goalProgress
            );


            this.updateGoalCard();

          },


          error: error => {

            console.error(
              '[DASHBOARD] Goal progress failed:',
              error
            );


            this.goalProgress = 0;

            this.updateGoalCard();

          }

        });

  }


  // =========================================================
  // UPDATE GOAL CARD
  // =========================================================

  private updateGoalCard(): void {

    this.stats[3].value =
      `${this.goalProgress}%`;

    this.refreshStats();

  }


  // =========================================================
  // REFRESH UI ARRAY
  // =========================================================

  private refreshStats(): void {

    this.stats = [
      ...this.stats
    ];

  }


  // =========================================================
  // CHART
  // =========================================================

  private createChart(): void {

    if (!this.carbonChart) {

      return;

    }


    this.chart?.destroy();


    this.chart =
      new Chart(
        this.carbonChart.nativeElement,
        {

          type: 'line',

          data: {

            labels: [
              'Mon',
              'Tue',
              'Wed',
              'Thu',
              'Fri',
              'Sat',
              'Sun'
            ],

            datasets: [

              {

                label:
                  'Carbon Emission',

                data: [
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ],

                borderColor:
                  '#2E7D32',

                backgroundColor:
                  'rgba(76,175,80,0.18)',

                borderWidth: 3,

                fill: true,

                tension: 0.4,

                pointRadius: 5,

                pointHoverRadius: 7

              }

            ]

          },

          options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

              legend: {
                display: false
              }

            },

            scales: {

              x: {

                grid: {
                  display: false
                }

              },

              y: {

                beginAtZero: true,

                ticks: {
                  precision: 1
                }

              }

            }

          }

        }

      );


    this.updateChart();

  }


  // =========================================================
  // LOAD ANALYTICS DATA FOR CHART
  // =========================================================

  private loadAnalytics(): void {
    this.analyticsSubscription = this.analyticsService.getAnalytics().subscribe({
      next: (data) => {
        this.analyticsData = data;
      },
      error: (err) => {
        console.error('[DASHBOARD] Analytics load failed:', err);
      }
    });
  }


  // =========================================================
  // UPDATE WEEKLY CHART
  // =========================================================

  private updateChart(): void {

    if (!this.chart) {

      return;

    }


    const totals = [
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ];


    const activities =
      this.activityService
        .getActivities();


    activities.forEach(activity => {

      const activityDate =
        activity.date ||
        activity.createdAt;


      if (!activityDate) {

        return;

      }


      const date =
        new Date(activityDate);


      if (isNaN(date.getTime())) {

        return;

      }


      let day =
        date.getDay();


      // JavaScript:
      // Sunday = 0
      // Monday = 1
      //
      // Convert to:
      // Monday = 0
      // Sunday = 6

      day =
        day === 0
          ? 6
          : day - 1;


      totals[day] +=
        Number(
          activity.carbonEmission ??
          activity.carbon ??
          0
        );

    });


    this.chart.data.datasets[0].data =
      totals;


    this.chart.update();

  }


  // =========================================================
  // ADD ACTIVITY
  // =========================================================

  openDialog(): void {

    const dialogRef =
      this.dialog.open(
        AddActivityDialog,
        {
          width: '500px',
          maxWidth: '95vw',
          autoFocus: false
        }
      );


    dialogRef
      .afterClosed()
      .subscribe(result => {

        if (!result) {

          return;

        }


        console.log(
          '[DASHBOARD] Activity dialog closed successfully'
        );


        // ActivityService already updates
        // activitiesSubject after successful POST.
        //
        // Refresh backend summary as well.

        this.loadDashboardSummary();

      });

  }

}
