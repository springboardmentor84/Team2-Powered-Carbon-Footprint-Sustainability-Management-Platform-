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
import { Subscription } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import {
  MatDialog,
  MatDialogModule
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { Chart } from 'chart.js/auto';

import { ActivityService } from '../../../../core/services/activity.service';

import {
  AddActivityDialog
} from '../../../activities/components/add-activity-dialog/add-activity-dialog';

import { MonthlyChart } from '../../../../shared/components/monthly-chart/monthly-chart';
import { GoalProgress } from '../../../../shared/components/goal-progress/goal-progress';
import { SustainabilityScore } from '../../../../shared/components/sustainability-score/sustainability-score';
import { RecentActivities } from '../../../../shared/components/recent-activities/recent-activities';
import { NotificationCard } from '../../../../shared/components/notification-card/notification-card';
import { CalendarCard } from '../../../../shared/components/calendar-card/calendar-card';
import { AiRecommendation } from '../../../../shared/components/ai-recommendation/ai-recommendation';
import { QuickActions } from '../../../../shared/components/quick-actions/quick-actions';
import { ProfileWidget } from '../../../../shared/components/profile-widget/profile-widget';
import { AchievementCard } from '../../../../shared/components/achievement-card/achievement-card';
import { StreakCard } from '../../../../shared/components/streak-card/streak-card';
import { WeatherCard } from '../../../../shared/components/weather-card/weather-card';


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


  private activityService =
    inject(ActivityService);


  private dialog =
    inject(MatDialog);


  private subscription?: Subscription;


  @ViewChild('carbonChart')
  carbonChart?: ElementRef<HTMLCanvasElement>;


  chart?: Chart;


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


  ngOnInit(): void {

    /*
     * IMPORTANT:
     *
     * ActivityService.activities$ is the single
     * source of truth for dashboard activity data.
     *
     * Whenever an activity is added, edited or deleted,
     * ActivityService emits a new array.
     *
     * This subscription therefore updates the dashboard
     * automatically without reloading the page.
     */

    this.subscription =
      this.activityService.activities$
        .subscribe(activities => {

          console.log(
            'DASHBOARD RECEIVED UPDATED ACTIVITIES:',
            activities
          );

          this.refreshDashboard(activities);

        });


    /*
     * Load current backend data once when dashboard starts.
     */

    this.activityService.loadActivities();

  }


  ngAfterViewInit(): void {

    /*
     * Chart canvas may not exist until after the view
     * has been initialized.
     */

    setTimeout(() => {

      this.createChart();

    });

  }


  ngOnDestroy(): void {

    this.subscription?.unsubscribe();

    this.chart?.destroy();

  }


  // ============================================================
  // DASHBOARD REFRESH
  // ============================================================

  private refreshDashboard(
    activities = this.activityService.getActivities()
  ): void {


    /*
     * Calculate everything directly from the same
     * ActivityService data.
     */

    const carbon =
      activities.reduce(
        (sum, activity) =>
          sum + (Number(activity.carbon) || 0),
        0
      );


    const activityCount =
      activities.length;


    const score =
      this.calculateSustainabilityScore(activities);


    const goal =
      this.calculateGoalProgress(carbon);


    /*
     * Update cards.
     */

    this.stats[0].value =
      `${carbon.toFixed(1)} kg`;


    this.stats[1].value =
      activityCount.toString();


    this.stats[2].value =
      score.toString();


    this.stats[3].value =
      `${goal}%`;


    /*
     * Force Angular to detect the new array.
     */

    this.stats =
      [...this.stats];


    /*
     * Update chart immediately.
     */

    if (this.chart) {

      this.updateChart(activities);

    }

  }


  // ============================================================
  // SUSTAINABILITY SCORE
  // ============================================================

  private calculateSustainabilityScore(
    activities: any[]
  ): number {


    let score = 0;


    activities.forEach(activity => {

      const category =
        String(activity.category || '')
          .toLowerCase();


      switch (category) {

        case 'transport':
          score += 6;
          break;

        case 'electricity':
          score += 5;
          break;

        case 'water':
          score += 4;
          break;

        case 'food':
          score += 3;
          break;

        case 'waste':
          score += 4;
          break;

        case 'shopping':
          score += 2;
          break;

        default:
          score += 2;

      }

    });


    return Math.min(score, 100);

  }


  // ============================================================
  // GOAL PROGRESS
  // ============================================================

  private calculateGoalProgress(
    carbonSaved: number
  ): number {


    const goal = 100;


    if (goal <= 0) {

      return 0;

    }


    return Math.min(

      Math.round(
        (carbonSaved / goal) * 100
      ),

      100

    );

  }


  // ============================================================
  // CREATE CHART
  // ============================================================

  private createChart(): void {


    if (!this.carbonChart) {

      return;

    }


    /*
     * Destroy previous chart if one exists.
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

                label: 'Carbon Saved',

                data: [
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ],

                borderColor: '#2E7D32',

                backgroundColor:
                  'rgba(76,175,80,.20)',

                borderWidth: 4,

                fill: true,

                tension: 0.45,

                pointRadius: 6,

                pointHoverRadius: 8,

                pointBackgroundColor:
                  '#2E7D32',

                pointBorderColor:
                  '#ffffff',

                pointBorderWidth: 2

              }

            ]

          },

          options: {

            responsive: true,

            maintainAspectRatio: false,

            animation: false,

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

                  precision: 0

                }

              }

            }

          }

        }
      );


    /*
     * Populate chart using current data.
     */

    this.updateChart(
      this.activityService.getActivities()
    );

  }


  // ============================================================
  // UPDATE CHART
  // ============================================================

  private updateChart(
    activities: any[]
  ): void {


    if (!this.chart) {

      return;

    }


    const totals =
      [0, 0, 0, 0, 0, 0, 0];


    activities.forEach(activity => {


      if (!activity.date) {

        return;

      }


      const date =
        new Date(activity.date);


      let day =
        date.getDay();


      /*
       * JavaScript:
       *
       * Sunday = 0
       * Monday = 1
       *
       * We want:
       *
       * Monday = 0
       * Sunday = 6
       */

      day =
        day === 0
          ? 6
          : day - 1;


      totals[day] +=
        Number(activity.carbon) || 0;

    });


    this.chart.data.datasets[0].data =
      totals;


    this.chart.update();

  }


  // ============================================================
  // ADD ACTIVITY
  // ============================================================

  openDialog(): void {


    const dialogRef =
      this.dialog.open(
        AddActivityDialog,
        {
          width: '500px'
        }
      );


    dialogRef
      .afterClosed()
      .subscribe(result => {


        if (!result) {

          return;

        }


        /*
         * DO NOT manually reload the page.
         *
         * ActivityService.addActivity()
         * already updates activitiesSubject.
         *
         * activities$ emits automatically.
         *
         * ngOnInit subscription above receives it.
         *
         * refreshDashboard() runs automatically.
         */

        console.log(
          'DASHBOARD ACTIVITY ADDED:',
          result
        );

      });

  }

}
