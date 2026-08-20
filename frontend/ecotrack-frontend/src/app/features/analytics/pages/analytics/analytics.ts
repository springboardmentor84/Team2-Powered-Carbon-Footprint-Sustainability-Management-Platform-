import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { AnalyticsResponse } from '../../../../core/models/analytics.model';
import { MonthlyChart } from '../../../../shared/components/monthly-chart/monthly-chart';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MonthlyChart
  ],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css',
})
export class Analytics implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private cdr = inject(ChangeDetectorRef);
  
  analyticsData: AnalyticsResponse | null = null;
  loading = true;
  error = false;

  ngOnInit() {
    this.loadAnalytics();
  }

  loadAnalytics() {
    this.loading = true;
    this.error = false;
    this.cdr.detectChanges();

    this.analyticsService.getAnalytics().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (data) => {
        this.analyticsData = data;
      },
      error: (err) => {
        console.error('Failed to load analytics', err);
        this.error = true;
      }
    });
  }

  get isEmpty(): boolean {
    if (!this.analyticsData) return false;
    return this.analyticsData.totalActivities === 0 && 
           this.analyticsData.totalEmissions === 0 && 
           (!this.analyticsData.categoryBreakdown || this.analyticsData.categoryBreakdown.length === 0);
  }

  get topCategoryShare(): number {
    if (!this.analyticsData || !this.analyticsData.topCategory || this.analyticsData.topCategory === '-') return 0;
    
    const topCatData = this.analyticsData.categoryBreakdown?.find(
      c => c.category.toUpperCase() === this.analyticsData!.topCategory.toUpperCase()
    );
    
    if (topCatData && this.analyticsData.totalEmissions > 0) {
      return (topCatData.totalEmission / this.analyticsData.totalEmissions) * 100;
    }
    
    return 0;
  }
}
