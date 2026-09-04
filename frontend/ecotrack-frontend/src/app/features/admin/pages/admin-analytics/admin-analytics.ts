import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { AdminAnalyticsService, AdminAnalyticsOverviewResponse, CategoryEmissionResponse, TopUserEmissionDTO } from '../../services/admin-analytics.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-analytics.html',
  styleUrls: ['./admin-analytics.css']
})
export class AdminAnalytics implements OnInit {
  overview: AdminAnalyticsOverviewResponse | null = null;
  categories: CategoryEmissionResponse[] = [];
  topUsers: TopUserEmissionDTO[] = [];
  isLoading = true;
  error = '';

  constructor(
    private analyticsService: AdminAnalyticsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.error = '';

    forkJoin({
      overview: this.analyticsService.getOverview(),
      categories: this.analyticsService.getCategories(),
      topUsers: this.analyticsService.getTopUsers(5)
    }).subscribe({
      next: (data) => {
        this.overview = data.overview;
        this.categories = data.categories;
        this.topUsers = data.topUsers;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load analytics data.';
        this.isLoading = false;
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }
}
