import {
  Component,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  MatCardModule
} from '@angular/material/card';

import {
  Subscription
} from 'rxjs';

import {
  ActivityService
} from '../../../core/services/activity.service';

import {
  Activity
} from '../../../core/models/activity.model';


@Component({
  selector: 'app-sustainability-score',

  standalone: true,

  imports: [
    CommonModule,
    MatCardModule
  ],

  templateUrl:
    './sustainability-score.html',

  styleUrl:
    './sustainability-score.css'
})
export class SustainabilityScore
  implements OnInit, OnDestroy {

  private readonly activityService =
    inject(ActivityService);


  private subscription?: Subscription;


  score = 100;

  totalEmission = 0;

  totalActivities = 0;


  ngOnInit(): void {

    this.subscription =
      this.activityService
        .activities$
        .subscribe(
          (activities: Activity[]) => {

            this.calculateScore(
              activities || []
            );

          }
        );


    this.activityService
      .loadActivities();

  }


  private calculateScore(
    activities: Activity[]
  ): void {

    this.totalActivities =
      activities.length;


    this.totalEmission =
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


    /*
     * Score is based on average carbon emission
     * per recorded activity.
     *
     * Lower average emission = higher score.
     */

    if (
      this.totalActivities === 0
    ) {

      this.score = 100;

      return;

    }


    const averageEmission =
      this.totalEmission /
      this.totalActivities;


    /*
     * 10 kg average emission is treated as
     * the upper reference value.
     *
     * Score always stays between 0 and 100.
     */

    const calculatedScore =
      100 -
      (
        averageEmission *
        10
      );


    this.score =
      Math.max(
        0,
        Math.min(
          100,
          Math.round(
            calculatedScore
          )
        )
      );

  }


  ngOnDestroy(): void {

    this.subscription
      ?.unsubscribe();

  }

}
