import {
  Component,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  MatCardModule
} from '@angular/material/card';

import {
  Subscription
} from 'rxjs';

import {
  ActivityService
} from '../../../core/services/activity.service';


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


  private subscription?:
    Subscription;


  score = 0;


  ngOnInit(): void {


    /*
     * Listen to ActivityService.
     *
     * This fires immediately after:
     *
     * ADD
     * UPDATE
     * DELETE
     */

    this.subscription =
      this.activityService
        .activities$
        .subscribe(activities => {

          this.calculateScore(
            activities
          );

        });


    /*
     * Load latest backend activities.
     */

    this.activityService
      .loadActivities();

  }


  ngOnDestroy(): void {

    this.subscription?.unsubscribe();

  }


  private calculateScore(
    activities: any[]
  ): void {


    if (
      !activities ||
      activities.length === 0
    ) {

      this.score = 0;

      return;

    }


    /*
     * Sustainability score is based
     * on logged sustainable activities.
     *
     * Each activity contributes according
     * to its category.
     */

    let totalScore = 0;


    activities.forEach(
      activity => {


        const category =
          String(
            activity.category || ''
          )
          .trim()
          .toUpperCase();


        switch (category) {


          case 'TRANSPORT':

            totalScore += 6;

            break;


          case 'ELECTRICITY':

            totalScore += 5;

            break;


          case 'WATER':

            totalScore += 4;

            break;


          case 'WASTE':

            totalScore += 4;

            break;


          case 'FOOD':

            totalScore += 3;

            break;


          case 'SHOPPING':

            totalScore += 3;

            break;


          default:

            totalScore += 2;

            break;

        }

      }
    );


    /*
     * Maximum score = 100.
     */

    this.score =
      Math.min(
        Math.round(totalScore),
        100
      );

  }

}
