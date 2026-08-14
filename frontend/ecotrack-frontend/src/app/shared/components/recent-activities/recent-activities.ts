import {
  Component,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';

import { Subscription } from 'rxjs';

import {
  ActivityService
} from '../../../core/services/activity.service';

import {
  Activity
} from '../../../core/models/activity.model';


@Component({
  selector: 'app-recent-activities',

  standalone: true,

  imports: [
    CommonModule,
    RouterModule,
    MatIconModule
  ],

  templateUrl: './recent-activities.html',

  styleUrl: './recent-activities.css'
})
export class RecentActivities
  implements OnInit, OnDestroy {

  private readonly activityService =
    inject(ActivityService);

  private subscription?: Subscription;

  activities: Activity[] = [];

  loading = true;

  error = false;


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    /*
     * Subscribe to the shared activity state.
     *
     * This means:
     * - existing database activities appear
     * - newly added activities appear immediately
     * - updated activities refresh immediately
     * - deleted activities disappear immediately
     */

    this.subscription =
      this.activityService.activities$
        .subscribe({
          next: activities => {

            this.activities =
              [...(activities || [])]
                .sort(
                  (a, b) =>
                    new Date(
                      b.createdAt || b.date || ''
                    ).getTime()
                    -
                    new Date(
                      a.createdAt || a.date || ''
                    ).getTime()
                )
                .slice(0, 5);

            this.loading = false;

            this.error = false;

          },

          error: error => {

            console.error(
              'Recent activities stream failed:',
              error
            );

            this.activities = [];

            this.loading = false;

            this.error = true;

          }
        });


    /*
     * Explicitly load activities from the backend.
     *
     * This is important because activities$ starts empty
     * when the application is opened.
     */

    this.activityService.loadActivities();

  }


  // =========================================================
  // DESTROY
  // =========================================================

  ngOnDestroy(): void {

    this.subscription?.unsubscribe();

  }


  // =========================================================
  // HELPERS
  // =========================================================

  getActivityTitle(
    activity: Activity
  ): string {

    return (
      activity.activity ||
      activity.title ||
      activity.category ||
      'Carbon activity'
    );

  }


  getCarbon(
    activity: Activity
  ): number {

    return Number(
      activity.carbonEmission ??
      activity.carbon ??
      0
    );

  }


  getDate(
    activity: Activity
  ): string {

    return (
      activity.createdAt ||
      activity.date ||
      ''
    );

  }


  getCategoryIcon(
    category: string
  ): string {

    switch (
      String(category || '')
        .toUpperCase()
    ) {

      case 'TRANSPORT':
        return 'directions_car';

      case 'FOOD':
        return 'restaurant';

      case 'ELECTRICITY':
      case 'ENERGY':
        return 'bolt';

      case 'WATER':
        return 'water_drop';

      case 'WASTE':
        return 'delete';

      case 'SHOPPING':
        return 'shopping_bag';

      default:
        return 'eco';

    }

  }


  trackByActivityId(
    index: number,
    activity: Activity
  ): number {

    return Number(activity.id);

  }

}
