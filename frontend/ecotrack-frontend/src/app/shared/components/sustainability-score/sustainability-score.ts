import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { SustainabilityScore as SustainabilityScoreModel } from '../../../core/models/dashboard.model';

@Component({
  selector: 'app-sustainability-score',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule
  ],
  templateUrl: './sustainability-score.html',
  styleUrl: './sustainability-score.css'
})
export class SustainabilityScore {

  scoreData: any = {

    score: 'N/A',

    level: 'Unavailable',

    progress: 0

  };

}
