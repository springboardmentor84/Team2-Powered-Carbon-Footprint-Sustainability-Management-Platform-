import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminAnalyticsService, AdminAnalyticsOverviewResponse, CategoryEmissionResponse, TopUserEmissionDTO } from '../../services/admin-analytics.service';

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

  constructor(private analyticsService: AdminAnalyticsService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.error = '';

    this.analyticsService.getOverview().subscribe({
      next: (data) => {
        this.overview = data;
        this.loadCategories();
      },
      error: (err) => {
        this.error = 'Failed to load analytics overview.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  loadCategories(): void {
    this.analyticsService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.loadTopUsers();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  loadTopUsers(): void {
    this.analyticsService.getTopUsers(5).subscribe({
      next: (data) => {
        this.topUsers = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }
}
