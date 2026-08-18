import {
  Component,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';

import { ActivityService } from '../../../../core/services/activity.service';
import { Activity } from '../../../../core/models/activity.model';
import { DashboardService, CategoryEmission } from '../../../../core/services/dashboard/dashboard.service';

@Component({
  selector: 'app-carbon-tracker',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    RouterModule
  ],

  templateUrl: './carbon-tracker.html',
  styleUrl: './carbon-tracker.css'
})
export class CarbonTracker
  implements OnInit, OnDestroy {

  private readonly activityService =
    inject(ActivityService);

  private readonly dashboardService =
    inject(DashboardService);

  private loadingSub?: Subscription;
  private errorSub?: Subscription;
  private subscription?: Subscription;

  activities: Activity[] = [];
  categoryEmissions: CategoryEmission[] = [];
  
  loading = true;
  apiError = false;

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
    this.loadingSub = this.activityService.loading$.subscribe(isLoading => {
      this.loading = isLoading;
    });
    
    this.errorSub = this.activityService.error$.subscribe(hasError => {
      this.apiError = hasError;
    });

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

          this.updateInsights();
        });

    this.loadActivities();
  }

  updateInsights(): void {
    const categoryMap = new Map<string, number>();
    for (const act of this.activities) {
      const cat = String(act.category).toUpperCase();
      const em = Number(act.carbonEmission || act.carbon || 0);
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + em);
    }
    
    this.categoryEmissions = Array.from(categoryMap.entries()).map(([category, totalEmission]) => ({
      category,
      totalEmission
    })).sort((a, b) => b.totalEmission - a.totalEmission);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.loadingSub?.unsubscribe();
    this.errorSub?.unsubscribe();
  }

  loadActivities(): void {
    if (this.loading && this.activities.length > 0) {
      return;
    }
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

  get recentActivities(): Activity[] {
    return this.activities;
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
        return 'directions_car';

      case 'FOOD':
        return 'restaurant';

      case 'ELECTRICITY':
        return 'bolt';

      case 'WATER':
        return 'water_drop';

      case 'WASTE':
        return 'delete_outline';

      case 'SHOPPING':
        return 'shopping_bag';

      default:
        return 'eco';

    }

  }

}
