import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AnalyticsService } from '../../../../core/services/analytics.service';
import { AnalyticsResponse } from '../../../../core/models/analytics.model';

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
export class ActivityAnalytics implements OnInit {

  private analyticsService = inject(AnalyticsService);

  analyticsData: AnalyticsResponse | null = null;
  loading = true;

  ngOnInit() {
    this.analyticsService.getAnalytics().subscribe({
      next: (data) => {
        this.analyticsData = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load analytics', err);
        this.loading = false;
      }
    });
  }
}
