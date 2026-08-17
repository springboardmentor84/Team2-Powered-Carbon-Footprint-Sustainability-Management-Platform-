import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';
import { GoalService, GoalResponse } from '../../../../core/services/goal';

@Component({
  selector: 'app-goal-progress',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './goal-progress.html',
  styleUrl: './goal-progress.css'
})
export class GoalProgress implements OnInit {
  private goalService = inject(GoalService);
  private cdr = inject(ChangeDetectorRef);

  loading = true;
  error = false;
  activeGoal: GoalResponse | null = null;
  percentage = 0;
  daysRemaining = 0;

  ngOnInit() {
    this.fetchGoals();
    this.goalService.goalChanged$.subscribe(() => {
      this.fetchGoals();
    });
  }

  fetchGoals() {
    this.loading = true;
    this.error = false;
    
    this.goalService.getMyGoals().subscribe({
      next: (goals: GoalResponse[]) => {
        if (goals && goals.length > 0) {
          // Assume the first one is the active goal for the dashboard
          this.activeGoal = goals[0];
          this.calculateProgress();
        } else {
          this.activeGoal = null;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to load goals for widget', err);
        this.error = true;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private calculateProgress() {
    if (!this.activeGoal) return;
    
    // Safety check for divide by zero
    if (this.activeGoal.targetCarbon > 0) {
      this.percentage = (this.activeGoal.currentCarbon / this.activeGoal.targetCarbon) * 100;
      if (this.percentage > 100) this.percentage = 100;
    } else {
      this.percentage = 0;
    }

    // Calculate days remaining
    if (this.activeGoal.endDate) {
      const end = new Date(this.activeGoal.endDate).getTime();
      const now = new Date().getTime();
      const diff = end - now;
      this.daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
    }
  }

  retry() {
    this.fetchGoals();
  }
}
