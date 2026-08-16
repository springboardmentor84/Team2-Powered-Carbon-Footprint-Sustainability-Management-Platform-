import {
  Component,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { ActivityService } from '../../../../core/services/activity.service';
import { Activity } from '../../../../core/models/activity.model';

@Component({
  selector: 'app-carbon-tracker',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './carbon-tracker.html',
  styleUrl: './carbon-tracker.css'
})
export class CarbonTracker
  implements OnInit, OnDestroy {

  private readonly activityService =
    inject(ActivityService);

  private subscription?: Subscription;

  activities: Activity[] = [];

  loading = true;

  saving = false;

  error = '';

  selectedCategory = 'ALL';

  categories = [
    'TRANSPORT',
    'FOOD',
    'ELECTRICITY',
    'WATER',
    'WASTE',
    'SHOPPING'
  ];

  form = {
    category: 'TRANSPORT',
    activity: '',
    quantity: 1,
    unit: 'km'
  };

  ngOnInit(): void {

    this.loadActivities();

    this.subscription =
      this.activityService.activities$
        .subscribe(activities => {

          this.activities =
            [...activities]
              .sort(
                (a, b) =>
                  new Date(
                    b.createdAt || b.date || ''
                  ).getTime()
                  -
                  new Date(
                    a.createdAt || a.date || ''
                  ).getTime()
              );

          this.loading = false;
        });

  }

  ngOnDestroy(): void {

    this.subscription?.unsubscribe();

  }

  loadActivities(): void {

    this.loading = true;

    this.activityService.loadActivities();

  }

  addActivity(): void {

    this.error = '';

    if (!this.form.activity.trim()) {

      this.error =
        'Please enter an activity name.';

      return;

    }

    if (
      !this.form.quantity ||
      this.form.quantity <= 0
    ) {

      this.error =
        'Quantity must be greater than zero.';

      return;

    }

    this.saving = true;

    this.activityService
      .addActivity({
        title: this.form.activity.trim(),
        activity: this.form.activity.trim(),
        category: this.form.category,
        quantity: Number(this.form.quantity),
        unit: this.form.unit,
        carbon: 0,
        carbonEmission: 0,
        date: new Date().toISOString(),
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .subscribe({

        next: () => {

          this.saving = false;

          this.form = {
            category: 'TRANSPORT',
            activity: '',
            quantity: 1,
            unit: 'km'
          };

        },

        error: error => {

          console.error(
            'Failed to save carbon activity:',
            error
          );

          this.error =
            'Unable to save activity. Please try again.';

          this.saving = false;

        }

      });

  }

  deleteActivity(
    id: number
  ): void {

    if (!id) {
      return;
    }

    this.activityService
      .deleteActivity(id)
      .subscribe({

        error: error => {

          console.error(
            'Failed to delete activity:',
            error
          );

          this.error =
            'Unable to delete activity.';

        }

      });

  }

  get filteredActivities(): Activity[] {

    if (
      this.selectedCategory === 'ALL'
    ) {

      return this.activities;

    }

    return this.activities.filter(
      activity =>
        String(activity.category)
          .toUpperCase()
        ===
        this.selectedCategory
    );

  }

  get totalCarbon(): number {

    return this.activities.reduce(
      (total, activity) =>
        total +
        Number(
          activity.carbonEmission ||
          activity.carbon ||
          0
        ),
      0
    );

  }

  get activityCount(): number {

    return this.activities.length;

  }

  get averageCarbon(): number {

    if (!this.activities.length) {
      return 0;
    }

    return this.totalCarbon /
      this.activities.length;

  }

  getCategoryIcon(
    category: string
  ): string {

    switch (
      String(category || '')
        .toUpperCase()
    ) {

      case 'TRANSPORT':
        return '🚗';

      case 'FOOD':
        return '🍽️';

      case 'ELECTRICITY':
        return '⚡';

      case 'WATER':
        return '💧';

      case 'WASTE':
        return '♻️';

      case 'SHOPPING':
        return '🛍️';

      default:
        return '🌱';

    }

  }

}
