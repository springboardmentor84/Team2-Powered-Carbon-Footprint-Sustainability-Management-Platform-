import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { AdminAnalyticsService, AdminAnalyticsOverviewResponse, CategoryEmissionResponse, TopUserEmissionDTO, TrendDTO, ActivityMetricDTO } from '../../services/admin-analytics.service';
import { forkJoin } from 'rxjs';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-analytics.html',
  styleUrls: ['./admin-analytics.css']
})
export class AdminAnalytics implements OnInit, OnDestroy {
  @ViewChild('trendChart') trendChartRef!: ElementRef;
  @ViewChild('categoryChart') categoryChartRef!: ElementRef;

  trendChartInstance: Chart | null = null;
  categoryChartInstance: Chart | null = null;

  overview: AdminAnalyticsOverviewResponse | null = null;
  categories: CategoryEmissionResponse[] = [];
  trends: TrendDTO[] = [];
  topUsers: TopUserEmissionDTO[] = [];
  activities: ActivityMetricDTO[] = [];

  isLoading = true;
  error = '';

  // Filter state
  activeFilter = 'today'; // today, 7days, 30days, month, year, custom
  startDate: string = '';
  endDate: string = '';
  
  trendPeriod = 'daily'; // daily, weekly, monthly, yearly
  topUserLimit = 5;

  categoryColors: string[] = ['#2ecc71', '#3498db', '#9b59b6', '#e74c3c', '#f1c40f', '#e67e22', '#1abc9c'];

  constructor(
    private analyticsService: AdminAnalyticsService,
    private cdr: ChangeDetectorRef
  ) {}

  getPercentageText(value: number, total: number): string {
    if (!total || total === 0) return '0%';
    const pct = (value / total) * 100;
    if (pct > 0 && pct < 0.1) return '<0.1%';
    return pct.toFixed(1) + '%';
  }

  getPercentageNum(value: number, total: number): number {
    if (!total || total === 0) return 0;
    return (value / total) * 100;
  }

  ngOnInit(): void {
    this.applyFilter('30days'); // default to 30 days instead of today
  }

  ngOnDestroy(): void {
    if (this.trendChartInstance) this.trendChartInstance.destroy();
    if (this.categoryChartInstance) this.categoryChartInstance.destroy();
  }

  setDatesForFilter(filter: string) {
    const today = new Date();
    let start = new Date();
    
    switch(filter) {
      case 'today':
        break;
      case '7days':
        start.setDate(today.getDate() - 7);
        break;
      case '30days':
        start.setDate(today.getDate() - 30);
        break;
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'year':
        start = new Date(today.getFullYear(), 0, 1);
        break;
      case 'custom':
        // Don't auto-set for custom
        return;
    }

    if (filter !== 'custom') {
      this.startDate = start.toISOString().split('T')[0];
      this.endDate = today.toISOString().split('T')[0];
    }
  }

  applyFilter(filter: string) {
    this.activeFilter = filter;
    this.setDatesForFilter(filter);

    // Auto-adjust trend period based on filter
    if (filter === 'today' || filter === '7days') this.trendPeriod = 'daily';
    else if (filter === '30days') this.trendPeriod = 'weekly';
    else if (filter === 'month') this.trendPeriod = 'daily';
    else if (filter === 'year') this.trendPeriod = 'monthly';

    if (filter !== 'custom') {
      this.loadData();
    }
  }

  applyCustomFilter() {
    if (this.startDate && this.endDate) {
      if (new Date(this.startDate) > new Date(this.endDate)) {
        this.error = 'Start date cannot be after end date.';
        return;
      }
      this.activeFilter = 'custom';
      this.loadData();
    }
  }

  setTrendPeriod(period: string) {
    this.trendPeriod = period;
    this.loadData(); // Reload everything or just trends. Easiest to reload all for consistency, or just trends.
  }

  loadData(): void {
    this.isLoading = true;
    this.error = '';

    forkJoin({
      overview: this.analyticsService.getOverview(this.startDate, this.endDate),
      categories: this.analyticsService.getCategories(this.startDate, this.endDate),
      trends: this.analyticsService.getTrends(this.trendPeriod, this.startDate, this.endDate),
      topUsers: this.analyticsService.getTopUsers(this.topUserLimit, this.startDate, this.endDate),
      activities: this.analyticsService.getActivities(5, this.startDate, this.endDate)
    }).subscribe({
      next: (data) => {
        this.overview = data.overview;
        this.categories = data.categories;
        this.trends = data.trends;
        this.topUsers = data.topUsers;
        this.activities = data.activities;
        
        this.isLoading = false;
        this.cdr.detectChanges(); // Ensure canvas is in DOM

        this.renderTrendChart();
        this.renderCategoryChart();
      },
      error: (err) => {
        this.error = 'Failed to load analytics data.';
        this.isLoading = false;
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }

  renderTrendChart() {
    if (this.trendChartInstance) {
      this.trendChartInstance.destroy();
    }
    
    if (!this.trendChartRef || !this.trends.length) return;

    const ctx = this.trendChartRef.nativeElement.getContext('2d');
    
    this.trendChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.trends.map(t => t.period),
        datasets: [{
          label: 'Carbon Emissions (kg CO2)',
          data: this.trends.map(t => t.amount),
          borderColor: '#2ecc71',
          backgroundColor: 'rgba(46, 204, 113, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  renderCategoryChart() {
    if (this.categoryChartInstance) {
      this.categoryChartInstance.destroy();
    }

    if (!this.categoryChartRef || !this.categories.length) return;

    const ctx = this.categoryChartRef.nativeElement.getContext('2d');
    
    // Generate distinct colors using the class property
    const colors = this.categoryColors;
    
    this.categoryChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.categories.map(c => c.category),
        datasets: [{
          data: this.categories.map(c => c.totalEmission),
          backgroundColor: colors.slice(0, this.categories.length),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { position: 'right' }
        }
      }
    });
  }
}
