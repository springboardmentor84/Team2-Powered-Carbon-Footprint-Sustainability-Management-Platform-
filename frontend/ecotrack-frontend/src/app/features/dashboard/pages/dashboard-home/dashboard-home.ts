import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChild,
  inject,
  OnInit,
  OnDestroy
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import {
  Subscription,
  merge
} from 'rxjs';

import {
  MatCardModule
} from '@angular/material/card';

import {
  MatDialog,
  MatDialogModule
} from '@angular/material/dialog';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  Chart
} from 'chart.js/auto';

import {
  ActivityService
} from '../../../../core/services/activity.service';

import {
  AddActivityDialog
} from '../../../activities/components/add-activity-dialog/add-activity-dialog';

import {
  MonthlyChart
} from '../../../../shared/components/monthly-chart/monthly-chart';

import {
  GoalProgress
} from '../../../../shared/components/goal-progress/goal-progress';

import {
  SustainabilityScore
} from '../../../../shared/components/sustainability-score/sustainability-score';

import {
  RecentActivities
} from '../../../../shared/components/recent-activities/recent-activities';

import {
  NotificationCard
} from '../../../../shared/components/notification-card/notification-card';

import {
  CalendarCard
} from '../../../../shared/components/calendar-card/calendar-card';

import {
  AiRecommendation
} from '../../../../shared/components/ai-recommendation/ai-recommendation';

import {
  QuickActions
} from '../../../../shared/components/quick-actions/quick-actions';

import {
  ProfileWidget
} from '../../../../shared/components/profile-widget/profile-widget';

import {
  AchievementCard
} from '../../../../shared/components/achievement-card/achievement-card';

import {
  StreakCard
} from '../../../../shared/components/streak-card/streak-card';

import {
  WeatherCard
} from '../../../../shared/components/weather-card/weather-card';


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

  templateUrl:
    './dashboard-home.html',

  styleUrl:
    './dashboard-home.css'

})
export class DashboardHome
  implements
    OnInit,
    AfterViewInit,
    OnDestroy {


  // =========================================================
  // SERVICES
  // =========================================================

  private readonly dialog =
    inject(MatDialog);

  private readonly activityService =
    inject(ActivityService);


  // =========================================================
  // SUBSCRIPTION
  // =========================================================

  private subscription?: Subscription;


  // =========================================================
  // CHART
  // =========================================================

  @ViewChild('carbonChart')
  carbonChart?: ElementRef<HTMLCanvasElement>;

  chart?: Chart;


  // =========================================================
  // DASHBOARD STATS
  // =========================================================

  stats = [

    {
      icon: 'eco',

      title: 'Carbon Saved',

      value: '0 kg',

      subtitle: 'CO₂ Reduced',

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

      subtitle: 'Progress',

      color: '#8E24AA'
    }

  ];


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    /*
     * Listen to BOTH streams.
     *
     * activities$:
     *   Updates whenever the local activity list changes.
     *
     * activityChanged$:
     *   Explicit notification after successful
     *   backend POST / PUT / DELETE.
     */

    this.subscription = merge(

      this.activityService.activities$,

      this.activityService.activityChanged$

    ).subscribe(() => {

      this.refreshDashboard();

    });


    /*
     * Initial dashboard calculation.
     */

    this.refreshDashboard();

  }


  // =========================================================
  // AFTER VIEW INIT
  // =========================================================

  ngAfterViewInit(): void {

    /*
     * Canvas is available only after the view
     * has been initialized.
     */

    setTimeout(() => {

      this.createChart();

    });

  }


  // =========================================================
  // DESTROY
  // =========================================================

  ngOnDestroy(): void {

    this.subscription?.unsubscribe();

    this.chart?.destroy();

  }


  // =========================================================
  // REFRESH DASHBOARD
  // =========================================================

  refreshDashboard(): void {

    /*
     * Read latest values directly from ActivityService.
     */

    const carbon =
      this.activityService.getCarbonSaved();

    const activities =
      this.activityService.getActivityCount();

    const score =
      this.activityService.getSustainabilityScore();

    const goal =
      this.activityService.getGoalProgress();


    /*
     * Update cards.
     */

    this.stats[0].value =
      `${carbon.toFixed(1)} kg`;

    this.stats[1].value =
      activities.toString();

    this.stats[2].value =
      score.toString();

    this.stats[3].value =
      `${goal}%`;


    /*
     * Create a new array reference so Angular
     * immediately detects the change.
     */

    this.stats = [
      ...this.stats
    ];


    /*
     * Update chart if it already exists.
     */

    if (this.chart) {

      this.updateChart();

    }

  }


  // =========================================================
  // CREATE WEEKLY CHART
  // =========================================================

  createChart(): void {

    if (!this.carbonChart) {

      return;

    }


    /*
     * Prevent duplicate Chart.js instances.
     */

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
                  'Carbon Saved',

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
                  'rgba(76,175,80,.20)',

                borderWidth:
                  4,

                fill:
                  true,

                tension:
                  0.45,

                pointRadius:
                  6,

                pointHoverRadius:
                  8,

                pointBackgroundColor:
                  '#2E7D32',

                pointBorderColor:
                  '#ffffff',

                pointBorderWidth:
                  2

              }

            ]

          },

          options: {

            responsive:
              true,

            maintainAspectRatio:
              false,

            plugins: {

              legend: {

                display:
                  false

              }

            },

            scales: {

              x: {

                grid: {

                  display:
                    false

                }

              },

              y: {

                beginAtZero:
                  true,

                ticks: {

                  precision:
                    0

                }

              }

            }

          }

        }

      );


    this.updateChart();

  }


  // =========================================================
  // UPDATE WEEKLY CHART
  // =========================================================

  updateChart(): void {

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


    this.activityService
      .getActivities()
      .forEach(activity => {

        if (!activity.date) {

          return;

        }


        const date =
          new Date(activity.date);


        if (
          Number.isNaN(
            date.getTime()
          )
        ) {

          return;

        }


        /*
         * JavaScript:
         *
         * Sunday = 0
         * Monday = 1
         * ...
         * Saturday = 6
         *
         * Convert it to:
         *
         * Monday = 0
         * ...
         * Sunday = 6
         */

        let day =
          date.getDay();


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
  // OPEN ADD ACTIVITY DIALOG
  // =========================================================

  openDialog(): void {

    this.dialog

      .open(
        AddActivityDialog,
        {
          width: '500px'
        }
      )

      .afterClosed()

      .subscribe(result => {

        /*
         * ActivityService already updates
         * activitiesSubject and activityChangedSubject
         * after successful POST.
         *
         * Therefore NO page reload is required here.
         */

        if (result) {

          this.refreshDashboard();

        }

      });

  }

}

