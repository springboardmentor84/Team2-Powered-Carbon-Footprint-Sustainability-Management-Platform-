import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { GoalService } from '../../../core/services/goal';

@Component({
  selector: 'app-goal-progress',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule
  ],
  templateUrl: './goal-progress.html',
  styleUrl: './goal-progress.css'
})
export class GoalProgress implements OnInit {

  private goalService = inject(GoalService);

  activeGoal: any = null;

  ngOnInit(): void {
    this.goalService.getMyGoals().subscribe({
      next: (goals) => {
        const active = goals.find(g => g.status === 'ACTIVE');
        if (active) {
          this.activeGoal = active;
        } else if (goals.length > 0) {
          this.activeGoal = goals[0]; // fallback to first completed goal if no active
        }
      },
      error: (err) => console.error('Failed to load goals', err)
    });
  }

  get carbonSaved(): number {
    return this.activeGoal ? this.activeGoal.currentCarbon : 0;
  }

  get progress(): number {
    if (!this.activeGoal || this.activeGoal.targetCarbon === 0) return 0;
    return Math.min(
      (this.activeGoal.currentCarbon / this.activeGoal.targetCarbon) * 100,
      100
    );
  }

  get remaining(): number {
    if (!this.activeGoal) return 0;
    return Math.max(
      this.activeGoal.targetCarbon - this.activeGoal.currentCarbon,
      0
    );
  }

}
