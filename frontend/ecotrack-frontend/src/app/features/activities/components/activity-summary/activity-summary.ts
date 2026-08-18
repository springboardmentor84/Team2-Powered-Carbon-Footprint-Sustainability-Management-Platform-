import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';

import { ActivityService } from '../../../../core/services/activity.service';
import { DashboardService } from '../../../../core/services/dashboard/dashboard.service';

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
  
  private streakSub?: Subscription;
  private backendStreak = 0;

  ngOnInit() {
    this.streakSub = this.dashboardService.getSummary().subscribe({
      next: (summary) => {
        if (summary && summary.currentStreak !== undefined) {
          this.backendStreak = summary.currentStreak;
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.streakSub) {
      this.streakSub.unsubscribe();
    }
  }

  get cards() {
    const activities = this.activityService.getActivities();
    const carbon = this.activityService.getCarbonSaved();
    const score = this.activityService.getSustainabilityScore();

    return [
      {
        title: 'Total Activities',
        value: activities.length,
        subtitle: 'All time logs',
        icon: 'task_alt',
        color: '#2E7D32'
      },
      {
        title: 'Total Emissions',
        value: Number(carbon.toFixed(2)) + ' kg',
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
        title: 'Weekly Score',
        value: score + '%',
        subtitle: 'Sustainability index',
        icon: 'leaderboard',
        color: '#1565C0'
      }
    ];
  }
}
