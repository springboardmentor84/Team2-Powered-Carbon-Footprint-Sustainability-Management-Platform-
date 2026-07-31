import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-goal-progress-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule
  ],
  templateUrl: './goal-progress-card.html',
  styleUrl: './goal-progress-card.css'
})
export class GoalProgressCard {

  goal = {

    title: 'Reduce Carbon Footprint',

    targetValue: 500,

    currentValue: 320,

    progressPercentage: 64,

    unit: 'kg CO₂',

    targetDate: '31 Dec 2026'

  };

}
