import { Component, inject, Input, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { ActivityService } from '../../../../core/services/activity.service';
import { ReportService } from '../../../../core/services/report.service';

@Component({
  selector: 'app-reports-summary',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './reports-summary.html',
  styleUrl: './reports-summary.css'
})
export class ReportsSummary implements OnChanges, OnInit {
  private activityService = inject(ActivityService);
  private reportService = inject(ReportService);

  @Input() periodFilter: string = 'This Month';
  @Input() categoryFilter: string = 'All Categories';
  @Input() customStartDate: string = '';
  @Input() customEndDate: string = '';

  totalReports: number = 0;
  totalEmissions: number = 0;
  monthlyReports: number = 0;
  downloads: number = 0;

  ngOnInit() {
    this.fetchData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['periodFilter'] || changes['categoryFilter'] || changes['customStartDate'] || changes['customEndDate']) {
      this.fetchData();
    }
  }

  fetchData() {
    this.reportService.getReportHistory().subscribe({
      next: (history) => {
        const safeHistory = Array.isArray(history) ? history : [];
        this.totalReports = safeHistory.length;
        this.downloads = safeHistory.reduce((acc, r) => acc + (r.downloads || 0), 0);
        
        const now = new Date();
        this.monthlyReports = safeHistory.filter(r => {
          const generated = new Date(r.generatedAt);
          return generated.getMonth() === now.getMonth() && generated.getFullYear() === now.getFullYear();
        }).length;
      },
      error: (err) => {
        console.error('Failed to fetch report history for summary', err);
        this.totalReports = 0;
        this.downloads = 0;
        this.monthlyReports = 0;
      }
    });

    this.activityService.activities$.subscribe(activities => {
      let filtered = activities;

      if (this.categoryFilter !== 'All Categories') {
        filtered = filtered.filter(a => String(a.category).toUpperCase() === this.categoryFilter.toUpperCase());
      }

      if (this.periodFilter !== 'Custom' && this.periodFilter !== 'This Year') {
        // Just a basic filter approach for now to handle simple date logic
        const now = new Date();
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
        const now = new Date();
        filtered = filtered.filter(a => {
          const d = new Date(a.createdAt || a.date);
          return d.getFullYear() === now.getFullYear();
        });
      } else if (this.periodFilter === 'Custom' && this.customStartDate && this.customEndDate) {
        const start = new Date(this.customStartDate);
        const end = new Date(this.customEndDate);
        filtered = filtered.filter(a => {
          const d = new Date(a.createdAt || a.date);
          return d >= start && d <= end;
        });
      }

      this.totalEmissions = filtered.reduce((sum, item) => sum + Number(item.carbonEmission || item.carbon || 0), 0);
    });
  }

  get cards() {
    return [
      { title: 'Total Reports', value: this.totalReports, icon: '📄', color: '#1565C0' },
      { title: 'Total Emissions', value: this.totalEmissions.toFixed(1) + ' kg', icon: '🌱', color: '#2E7D32' },
      { title: 'Monthly Reports', value: this.monthlyReports, icon: '📊', color: '#FB8C00' },
      { title: 'Downloads', value: this.downloads, icon: '⬇️', color: '#8E24AA' }
    ];
  }
}
