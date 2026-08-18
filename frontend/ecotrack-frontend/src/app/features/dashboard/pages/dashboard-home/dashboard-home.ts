import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { Subscription, forkJoin } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { Chart } from 'chart.js/auto';

import { ActivityService } from '../../../../core/services/activity.service';
import { DashboardService } from '../../../../core/services/dashboard/dashboard.service';
import { GoalService, GoalResponse, GoalProgressResponse } from '../../../../core/services/goal';

import { AddActivityDialog } from '../../../activities/components/add-activity-dialog/add-activity-dialog';

import { MonthlyChart } from '../../../../shared/components/monthly-chart/monthly-chart';
import { GoalProgress } from '../../../../shared/components/goal-progress/goal-progress';
import { SustainabilityScore } from '../../../../shared/components/sustainability-score/sustainability-score';
import { RecentActivities } from '../../../../shared/components/recent-activities/recent-activities';
import { NotificationCard } from '../../../../shared/components/notification-card/notification-card';
import { CalendarCard } from '../../../../shared/components/calendar-card/calendar-card';
import { AiRecommendation } from '../../../../shared/components/ai-recommendation/ai-recommendation';
import { QuickActions } from '../../../../shared/components/quick-actions/quick-actions';
import { ProfileWidget } from '../../../../shared/components/profile-widget/profile-widget';
import { AchievementCard } from '../../../../shared/components/achievement-card/achievement-card';
import { StreakCard } from '../../../../shared/components/streak-card/streak-card';
import { WeatherCard } from '../../../../shared/components/weather-card/weather-card';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule,
    MonthlyChart,
    GoalProgress,
    SustainabilityScore,
    RecentActivities,
    NotificationCard,
    CalendarCard,
    AiRecommendation,
    QuickActions,
    AchievementCard,
    StreakCard,
    WeatherCard,
    ProfileWidget
  ],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.css'
})
export class DashboardHome implements OnInit, AfterViewInit, OnDestroy {

  // =========================================================
  // SERVICES
  // =========================================================

  readonly activityService = inject(ActivityService);
  private readonly dashboardService = inject(DashboardService);
  private readonly goalService = inject(GoalService);
  private readonly dialog = inject(MatDialog);
  private readonly cdr = inject(ChangeDetectorRef);

  // =========================================================
  // SUBSCRIPTIONS
  // =========================================================

  private activitySubscription?: Subscription;
  private dashboardSubscription?: Subscription;
  private goalSubscription?: Subscription;

  // =========================================================
  // CHART
  // =========================================================

  @ViewChild('carbonChart')
  carbonChart?: ElementRef<HTMLCanvasElement>;

  chart?: Chart;

  // =========================================================
  // STATE
  // =========================================================

  loading = true;
  dashboardError = false;
  errorMessage = '';

  // =========================================================
  // GOAL STATE
  // =========================================================

  goals: GoalResponse[] = [];
  goalProgressMap: Record<number, GoalProgressResponse> = {};
  goalProgress = 0;

  // =========================================================
  // DASHBOARD CARDS
  // =========================================================

  stats = [
    {
      icon: 'eco',
      title: 'Total Carbon Emission',
      value: '0 kg',
      subtitle: 'CO₂ Emitted',
      color: '#2E7D32'
    },
    {
      icon: 'directions_walk',
      title: 'Activities',
      value: '0',
      subtitle: 'Activities Logged',
      color: '#1565C0'
    },
    {
      icon: 'emoji_events',
      title: 'Sustainability Score',
      value: '0',
      subtitle: 'Out of 100',
      color: '#FB8C00'
    },
    {
      icon: 'flag',
      title: 'Goals',
      value: '0%',
      subtitle: 'Progress',
      color: '#8E24AA'
    }
  ];

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    // -----------------------------------------
    // LOAD ACTIVITIES
    // -----------------------------------------
    this.activityService.loadActivities();

    // -----------------------------------------
    // LISTEN FOR ACTIVITY CHANGES
    // -----------------------------------------
    this.activitySubscription = this.activityService.activities$.subscribe(() => {
      this.updateDashboardCards();
      this.updateChart();
      this.loadGoals();
      this.loadDashboardSummary();
    });

    // -----------------------------------------
    // INITIAL GOAL LOAD
    // -----------------------------------------
    this.loadGoals();

    // -----------------------------------------
    // DASHBOARD SUMMARY
    // -----------------------------------------
    this.loadDashboardSummary();
  }

  // =========================================================
  // VIEW INIT
  // =========================================================

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.createChart();
    });
  }

  // =========================================================
  // DESTROY
  // =========================================================

  ngOnDestroy(): void {
    this.activitySubscription?.unsubscribe();
    this.dashboardSubscription?.unsubscribe();
    this.goalSubscription?.unsubscribe();
    this.chart?.destroy();
  }

  // =========================================================
  // LOAD GOALS
  // =========================================================

  private loadGoals(): void {
    this.goalSubscription?.unsubscribe();
    this.goalSubscription = this.goalService.getMyGoals().subscribe({
      next: goals => {
        this.goals = Array.isArray(goals) ? goals : [];
        this.loadGoalProgress();
      },
      error: error => {
        console.warn('[DASHBOARD] Goals unavailable:', error);
        this.goals = [];
        this.goalProgressMap = {};
        this.goalProgress = 0;
        this.updateDashboardGoalCard();
      }
    });
  }

  // =========================================================
  // LOAD LIVE GOAL PROGRESS
  // =========================================================

  private loadGoalProgress(): void {
    if (!this.goals.length) {
      this.goalProgressMap = {};
      this.goalProgress = 0;
      this.updateDashboardGoalCard();
      return;
    }

    const requests = this.goals.map(goal => this.goalService.getGoalProgress(goal.id));

    forkJoin(requests).subscribe({
      next: progressList => {
        const map: Record<number, GoalProgressResponse> = {};
        progressList.forEach(progress => {
          map[progress.goalId] = progress;
        });
        this.goalProgressMap = map;
        this.calculateOverallGoalProgress();
        this.updateDashboardGoalCard();
      },
      error: error => {
        console.warn('[DASHBOARD] Goal progress unavailable:', error);
        this.calculateFallbackGoalProgress();
        this.updateDashboardGoalCard();
      }
    });
  }

  // =========================================================
  // CALCULATE GOAL PROGRESS
  // =========================================================

  private calculateOverallGoalProgress(): void {
    if (!this.goals.length) {
      this.goalProgress = 0;
      return;
    }

    let totalTarget = 0;
    let totalCurrent = 0;

    this.goals.forEach(goal => {
      const progress = this.goalProgressMap[goal.id];
      totalTarget += Number(progress?.targetCarbon ?? goal.targetCarbon ?? 0);
      totalCurrent += Number(progress?.currentCarbon ?? goal.currentCarbon ?? 0);
    });

    if (totalTarget <= 0) {
      this.goalProgress = 0;
      return;
    }

    this.goalProgress = Math.min(Math.max(Math.round((totalCurrent / totalTarget) * 100), 0), 100);
  }

  // =========================================================
  // FALLBACK GOAL PROGRESS
  // =========================================================

  private calculateFallbackGoalProgress(): void {
    let totalTarget = 0;
    let totalCurrent = 0;

    this.goals.forEach(goal => {
      totalTarget += Number(goal.targetCarbon || 0);
      totalCurrent += Number(goal.currentCarbon || 0);
    });

    if (totalTarget <= 0) {
      this.goalProgress = 0;
      return;
    }

    this.goalProgress = Math.min(Math.max(Math.round((totalCurrent / totalTarget) * 100), 0), 100);
  }

  // =========================================================
  // UPDATE GOAL CARD
  // =========================================================

  private updateDashboardGoalCard(): void {
    this.stats[3].value = `${this.goalProgress}%`;
    this.stats = [...this.stats];
    this.cdr.detectChanges();
  }

  // =========================================================
  // DASHBOARD CARDS
  // =========================================================

  private updateDashboardCards(): void {
    const score = this.activityService.getSustainabilityScore();
    this.stats[2].value = String(score);
    
    // Note: stats[0] (Carbon) and stats[1] (Activities) are populated by loadDashboardSummary()

    this.updateDashboardGoalCard();

    this.stats = [...this.stats];
    this.loading = false;
    this.cdr.detectChanges();
  }

  // =========================================================
  // BACKEND DASHBOARD SUMMARY
  // =========================================================

  private loadDashboardSummary(): void {
    this.dashboardSubscription?.unsubscribe();

    this.dashboardSubscription = this.dashboardService.getSummary().subscribe({
      next: summary => {
        // Guarantee consistent source of truth
        const totalCarbon = this.activityService.getCarbonSaved();
        const activities = this.activityService.getActivityCount();
        
        this.stats[0].value = `${Number(totalCarbon.toFixed(2))} kg`;
        this.stats[1].value = activities.toString();
        this.stats = [...this.stats];
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Failed to load dashboard summary', error);
        this.dashboardError = true;
        this.errorMessage = 'Dashboard summary unavailable.';
        this.cdr.detectChanges();
      }
    });
  }

  // =========================================================
  // CHART
  // =========================================================

  private createChart(): void {
    if (!this.carbonChart) {
      return;
    }

    this.chart = new Chart(this.carbonChart.nativeElement, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Carbon Emission',
          data: [0, 0, 0, 0, 0, 0, 0],
          borderColor: '#2E7D32',
          backgroundColor: 'rgba(76,175,80,.18)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, ticks: { precision: 1 } }
        }
      }
    });

    this.updateChart();
  }

  // =========================================================
  // UPDATE CHART
  // =========================================================

  updateChart(): void {
    if (!this.chart) {
      return;
    }

    const totals = [0, 0, 0, 0, 0, 0, 0];

    this.activityService.getActivities().forEach(activity => {
      if (!activity.date) {
        return;
      }
      const date = new Date(activity.date);
      let day = date.getDay();
      day = day === 0 ? 6 : day - 1;
      totals[day] += Number(activity.carbonEmission || activity.carbon || 0);
    });

    this.chart.data.datasets[0].data = totals;
    this.chart.update();
  }

  // =========================================================
  // ADD ACTIVITY
  // =========================================================

  openDialog(): void {
    const dialogRef = this.dialog.open(AddActivityDialog, {
      width: '500px',
      maxWidth: '95vw',
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateDashboardCards();
        this.updateChart();
        this.loadGoals();
        this.loadDashboardSummary();
      }
    });
  }
}
