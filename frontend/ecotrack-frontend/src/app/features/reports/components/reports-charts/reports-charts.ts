import { Component, ElementRef, ViewChild, AfterViewInit, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { ActivityService } from '../../../../core/services/activity.service';

@Component({
  selector: 'app-reports-charts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports-charts.html',
  styleUrl: './reports-charts.css'
})
export class ReportsCharts implements AfterViewInit, OnChanges {
  @ViewChild('barChart') barChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChart') lineChart!: ElementRef<HTMLCanvasElement>;

  @Input() periodFilter: string = 'This Month';
  @Input() categoryFilter: string = 'All Categories';
  @Input() customStartDate: string = '';
  @Input() customEndDate: string = '';

  private activityService = inject(ActivityService);
  private barChartInstance: Chart | null = null;
  private lineChartInstance: Chart | null = null;

  ngAfterViewInit(): void {
    this.initCharts();
    this.updateCharts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.barChartInstance && this.lineChartInstance) {
      this.updateCharts();
    }
  }

  private initCharts() {
    this.barChartInstance = new Chart(this.barChart.nativeElement, {
      type: 'bar',
      data: { labels: [], datasets: [] },
      options: { responsive: true, maintainAspectRatio: false }
    });

    this.lineChartInstance = new Chart(this.lineChart.nativeElement, {
      type: 'line',
      data: { labels: [], datasets: [] },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  private updateCharts() {
    this.activityService.activities$.subscribe(activities => {
      let filtered = activities;

      if (this.categoryFilter !== 'All Categories') {
        filtered = filtered.filter(a => String(a.category).toUpperCase() === this.categoryFilter.toUpperCase());
      }

      const now = new Date();
      if (this.periodFilter !== 'Custom' && this.periodFilter !== 'This Year') {
        filtered = filtered.filter(a => {
          const d = new Date(a.createdAt || a.date);
          if (this.periodFilter === 'This Month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          if (this.periodFilter === 'Last Month') {
            const lastM = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            return d.getMonth() === lastM.getMonth() && d.getFullYear() === lastM.getFullYear();
          }
          if (this.periodFilter === 'Last 3 Months') {
            const threeMAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
            return d >= threeMAgo;
          }
          if (this.periodFilter === 'Last 6 Months') {
            const sixMAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
            return d >= sixMAgo;
          }
          return true;
        });
      } else if (this.periodFilter === 'This Year') {
        filtered = filtered.filter(a => new Date(a.createdAt || a.date).getFullYear() === now.getFullYear());
      } else if (this.periodFilter === 'Custom' && this.customStartDate && this.customEndDate) {
        const start = new Date(this.customStartDate);
        const end = new Date(this.customEndDate);
        filtered = filtered.filter(a => {
          const d = new Date(a.createdAt || a.date);
          return d >= start && d <= end;
        });
      }

      this.updateBarChart(filtered);
      this.updateLineChart(filtered);
    });
  }

  private updateBarChart(activities: any[]) {
    if (!this.barChartInstance) return;

    const monthlyData: { [key: string]: number } = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize months for the current year or selected period
    months.forEach(m => monthlyData[m] = 0);

    activities.forEach(a => {
      const d = new Date(a.createdAt || a.date);
      const m = months[d.getMonth()];
      monthlyData[m] += Number(a.carbonEmission || a.carbon || 0);
    });

    this.barChartInstance.data.labels = Object.keys(monthlyData);
    this.barChartInstance.data.datasets = [{
      label: 'Total Emissions (kg)',
      data: Object.values(monthlyData),
      backgroundColor: '#2e7d32'
    }];
    this.barChartInstance.update();
  }

  private updateLineChart(activities: any[]) {
    if (!this.lineChartInstance) return;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyData: { [key: string]: number } = {};
    
    days.forEach(d => dailyData[d] = 0);

    // Get current week
    const now = new Date();
    const currentWeekActivities = activities.filter(a => {
      const d = new Date(a.createdAt || a.date);
      const diff = now.getTime() - d.getTime();
      return diff <= 7 * 24 * 60 * 60 * 1000;
    });

    currentWeekActivities.forEach(a => {
      const d = new Date(a.createdAt || a.date);
      const day = days[d.getDay()];
      dailyData[day] += Number(a.carbonEmission || a.carbon || 0);
    });

    this.lineChartInstance.data.labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    this.lineChartInstance.data.datasets = [{
      label: 'Daily Carbon',
      data: [
        dailyData['Mon'], dailyData['Tue'], dailyData['Wed'], 
        dailyData['Thu'], dailyData['Fri'], dailyData['Sat'], dailyData['Sun']
      ],
      fill: true,
      tension: 0.4,
      borderColor: '#FB8C00',
      backgroundColor: 'rgba(251, 140, 0, 0.2)'
    }];
    this.lineChartInstance.update();
  }
}
