import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-goal-progress',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule,
    MatButtonModule
  ],
  templateUrl: './goal-progress.html',
  styleUrl: './goal-progress.css'
})
export class GoalProgress {

  totalGoals = 12;

  completedGoals = 9;

  get percentage(): number {

    return (this.completedGoals / this.totalGoals) * 100;

  }

}
