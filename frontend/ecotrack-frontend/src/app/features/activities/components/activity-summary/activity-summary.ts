import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Subscription, forkJoin } from 'rxjs';

import { ActivityService } from '../../../../core/services/activity.service';
import { DashboardService } from '../../../../core/services/dashboard/dashboard.service';
import { AnalyticsService } from '../../../../core/services/analytics.service';

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
export class ActivitySummary implements OnInit, OnDestroy {

  private activityService = inject(ActivityService);
  private dashboardService = inject(DashboardService);
  private analyticsService = inject(AnalyticsService);
  
  private sub?: Subscription;
  private backendStreak = 0;
  private averageEmissions = 0;
  private totalActivities = 0;
  private totalEmissions = 0;

  ngOnInit() {
    this.sub = forkJoin({
      summary: this.dashboardService.getSummary(),
      analytics: this.analyticsService.getAnalytics()
    }).subscribe({
      next: ({ summary, analytics }) => {
        if (summary && summary.currentStreak !== undefined) {
          this.backendStreak = summary.currentStreak;
        }
        if (analytics) {
          this.averageEmissions = analytics.averageEmissions;
          this.totalActivities = analytics.totalActivities;
          this.totalEmissions = analytics.totalEmissions;
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
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
        value: Number(this.totalEmissions.toFixed(2)) + ' kg',
        subtitle: 'Carbon footprint',
        icon: 'eco',
        color: '#43A047'
      },
      {
        title: 'Current Streak',
        value: this.backendStreak + ' Days',
        subtitle: 'Keep it up!',
        icon: 'local_fire_department',
        color: '#FB8C00'
      },
      {
        title: 'Avg Emissions',
        value: this.averageEmissions + ' kg',
        subtitle: 'Per activity',
        icon: 'data_usage',
        color: '#1565C0'
      }
    ];
  }
}
