import {
  Component,
  inject,
  OnDestroy,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  MatCardModule
} from '@angular/material/card';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  MatProgressSpinnerModule
} from '@angular/material/progress-spinner';

import {
  Subscription
} from 'rxjs';

import {
  ActivityService
} from '../../../../core/services/activity.service';

import {
  Activity
} from '../../../../core/models/activity.model';

import {
  AnalyticsResponse
} from '../../../../core/models/analytics.model';


@Component({
  selector: 'app-activity-analytics',

  standalone: true,

  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],

  templateUrl: './activity-analytics.html',

  styleUrl: './activity-analytics.css'
})
export class ActivityAnalytics
  implements OnInit, OnDestroy {

  private readonly activityService =
    inject(ActivityService);


  private subscription?: Subscription;


  analyticsData:
    AnalyticsResponse | null =
      null;


  loading = true;


  ngOnInit(): void {

    /*
     * Build analytics directly from the same
     * activities used by the activity table.
     */

    this.subscription =
      this.activityService
        .getActivities$()
        .subscribe(
          (activities: Activity[]) => {

            this.buildAnalytics(
              activities
            );

            this.loading = false;

          }
        );

  }


  private buildAnalytics(
    activities: Activity[]
  ): void {

    const totalActivities =
      activities.length;


    const totalEmissions =
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


    const averageEmissions =
      totalActivities > 0
        ? totalEmissions /
          totalActivities
        : 0;


    const categoryTotals =
      new Map<string, number>();


    activities.forEach(
      activity => {

        const category =
          activity.category || 'OTHER';


        const emission =
          Number(
            activity.carbonEmission ??
            activity.carbon ??
            0
          );


        categoryTotals.set(

          category,

          (
            categoryTotals.get(category) || 0
          ) + emission

        );

      }
    );


    let topCategory =
      'N/A';


    let highestEmission =
      -1;


    categoryTotals.forEach(
      (emission, category) => {

        if (
          emission >
          highestEmission
        ) {

          highestEmission =
            emission;

          topCategory =
            category;

        }

      }
    );


    this.analyticsData = {

      totalActivities,

      totalEmissions:
        Number(
          totalEmissions.toFixed(2)
        ),

      averageEmissions:
        Number(
          averageEmissions.toFixed(2)
        ),

      topCategory,

      monthlyEmissions: {},

      categoryBreakdown:
        Array.from(
          categoryTotals.entries()
        ).map(
          ([category, totalEmission]) => ({

            category,

            totalEmission:
              Number(
                totalEmission.toFixed(2)
              )

          })
        )

    };

  }


  ngOnDestroy(): void {

    this.subscription
      ?.unsubscribe();

  }

}
