import {
  Component,
  inject,
  OnDestroy,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  MatCardModule
} from '@angular/material/card';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  Subscription
} from 'rxjs';

import {
  ActivityService
} from '../../../../core/services/activity.service';

import {
  DashboardService
} from '../../../../core/services/dashboard/dashboard.service';

import {
  Activity
} from '../../../../core/models/activity.model';


@Component({
  selector: 'app-activity-summary',

  standalone: true,

  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],

  templateUrl: './activity-summary.html',

  styleUrl: './activity-summary.css'
})
export class ActivitySummary
  implements OnInit, OnDestroy {

  private readonly activityService =
    inject(ActivityService);

  private readonly dashboardService =
    inject(DashboardService);


  private activitySubscription?: Subscription;

  private summarySubscription?: Subscription;


  private backendStreak = 0;

  private averageEmissions = 0;

  private totalActivities = 0;

  private totalEmissions = 0;


  ngOnInit(): void {

    /*
     * Use the same activity data that powers
     * the activity table.
     */

    this.activitySubscription =
      this.activityService
        .getActivities$()
        .subscribe(
          (activities: Activity[]) => {

            this.updateSummaryFromActivities(
              activities
            );

          }
        );


    /*
     * Streak is still provided by the dashboard API.
     */

    this.summarySubscription =
      this.dashboardService
        .getSummary()
        .subscribe({

          next: summary => {

            this.backendStreak =
              Number(
                summary?.currentStreak ?? 0
              );

          },

          error: error => {

            console.error(
              '[ACTIVITY SUMMARY] Failed to load streak:',
              error
            );

            this.backendStreak = 0;

          }

        });

  }


  private updateSummaryFromActivities(
    activities: Activity[]
  ): void {

    this.totalActivities =
      activities.length;


    this.totalEmissions =
      activities.reduce(
        (total, activity) => {

          return (
            total +
            Number(
              activity.carbonEmission ??
              activity.carbon ??
              0
            )
          );

        },
        0
      );


    this.averageEmissions =
      this.totalActivities > 0
        ? this.totalEmissions /
          this.totalActivities
        : 0;

  }


  get cards() {

    return [

      {
        title: 'Total Activities',

        value: this.totalActivities,

        subtitle: 'All time logs',

        icon: 'task_alt',

        color: '#2E7D32'
      },


      {
        title: 'Total Emissions',

        value:
          `${this.totalEmissions.toFixed(2)} kg`,

        subtitle: 'Carbon footprint',

        icon: 'eco',

        color: '#43A047'
      },


      {
        title: 'Current Streak',

        value:
          `${this.backendStreak} Days`,

        subtitle: 'Keep it up!',

        icon: 'local_fire_department',

        color: '#FB8C00'
      },


      {
        title: 'Avg Emissions',

        value:
          `${this.averageEmissions.toFixed(2)} kg`,

        subtitle: 'Per activity',

        icon: 'data_usage',

        color: '#1565C0'
      }

    ];

  }


  ngOnDestroy(): void {

    this.activitySubscription
      ?.unsubscribe();

    this.summarySubscription
      ?.unsubscribe();

  }

}
