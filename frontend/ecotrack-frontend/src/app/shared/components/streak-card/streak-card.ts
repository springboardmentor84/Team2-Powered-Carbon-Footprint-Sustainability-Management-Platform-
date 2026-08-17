import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DashboardService } from '../../../core/services/dashboard/dashboard.service';

@Component({
  selector: 'app-streak-card',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './streak-card.html',
  styleUrl: './streak-card.css'
})
export class StreakCard implements OnInit {

  private dashboardService = inject(DashboardService);
  private cdr = inject(ChangeDetectorRef);
  
  loading = true;
  summary: any = null;

  ngOnInit() {
    this.dashboardService.getSummary().subscribe({
      next: (res) => {
        this.summary = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get currentStreak(): number {
    return this.summary?.currentStreak || 0;
  }

  get longestStreak(): number {
    return this.summary?.currentStreak || 0;
  }

  get activeDays(): number {
    return this.summary?.totalEntries || 0;
  }

}
