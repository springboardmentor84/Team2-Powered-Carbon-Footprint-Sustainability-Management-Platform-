import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChild,
  inject,
  OnInit,
  OnDestroy
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { Chart } from 'chart.js/auto';

import { ActivityService } from '../../../../core/services/activity.service';
import { AddActivityDialog } from '../../../activities/components/add-activity-dialog/add-activity-dialog';

import { MonthlyChart } from '../../../../shared/components/monthly-chart/monthly-chart';
import { GoalProgress } from '../../../../shared/components/goal-progress/goal-progress';
import { SustainabilityScore } from '../../../../shared/components/sustainability-score/sustainability-score';
import { RecentActivities } from '../../../../shared/components/recent-activities/recent-activities';
import { NotificationCard } from '../../../../shared/components/notification-card/notification-card';
import { CalendarCard } from '../../../../shared/components/calendar-card/calendar-card';
import { AiRecommendation } from '../../../../shared/components/ai-recommendation/ai-recommendation';
import { QuickActions } from '../../../../shared/components/quick-actions/quick-actions';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,

  imports: [
    CommonModule,
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
    QuickActions
  ],

  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.css'
})

export class DashboardHome implements OnInit, AfterViewInit, OnDestroy {

  private dialog = inject(MatDialog);
  private activityService = inject(ActivityService);

  private subscription!: Subscription;

  @ViewChild('carbonChart')
  carbonChart!: ElementRef<HTMLCanvasElement>;

  chart!: Chart;

  stats = [

    {
      icon: 'eco',
      title: 'Carbon Saved',
      value: '0 kg',
      subtitle: 'CO₂ Reduced',
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

  ngOnInit(): void {

    this.subscription = this.activityService.activities$.subscribe(() => {

      this.refreshDashboard();

    });

  }

  ngAfterViewInit(): void {

    this.createChart();

  }

  ngOnDestroy(): void {

    this.subscription.unsubscribe();

  }


 refreshDashboard() {

  const carbon = this.activityService.getCarbonSaved();

  const activities = this.activityService.getActivities().length;

  const score = this.activityService.getSustainabilityScore();

  const goal = this.activityService.getGoalProgress();

  // Show saved values immediately
  this.stats[0].value = carbon.toFixed(1) + ' kg';

  this.stats[1].value = activities.toString();

  this.stats[2].value = score.toString();

  this.stats[3].value = goal + '%';

  if (this.chart) {

    this.updateChart();

  }

}
  createChart(): void {

    this.chart = new Chart(this.carbonChart.nativeElement, {

      type: 'line',

      data: {

        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],

        datasets: [

          {

            label: 'Carbon Saved',

            data: [0, 0, 0, 0, 0, 0, 0],

            borderColor: '#2E7D32',

            backgroundColor: 'rgba(76,175,80,.20)',

            borderWidth: 4,

            fill: true,

            tension: .45,

            pointRadius: 6,

            pointHoverRadius: 8,

            pointBackgroundColor: '#2E7D32',

            pointBorderColor: '#ffffff',

            pointBorderWidth: 2

          }

        ]

      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        animation: {

          duration: 1200

        },

        plugins: {

          legend: {

            display: false

          }

        },

        scales: {

          x: {

            grid: {

              display: false

            }

          },

          y: {

            beginAtZero: true,

            ticks: {

              precision: 0

            },

            grid: {

              color: '#eeeeee'

            }

          }

        }

      }

    });

    this.updateChart();

  }

  updateChart(): void {

    if (!this.chart) return;

    const activities = this.activityService.getActivities();

    const totals = [0, 0, 0, 0, 0, 0, 0];

    activities.forEach(activity => {

      const d = new Date(activity.date);

      let day = d.getDay();

      day = day === 0 ? 6 : day - 1;

      totals[day] += activity.carbon;

    });

    this.chart.data.datasets[0].data = totals;

    this.chart.update();

  }

  openDialog(): void {

    this.dialog.open(AddActivityDialog, {

      width: '500px'

    }).afterClosed().subscribe(result => {

      if (result) {

        this.refreshDashboard();

      }

    });

  }

}
