import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';

import { MatButtonModule } from '@angular/material/button';

import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-ai-recommendation',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './ai-recommendation.html',
  styleUrls: ['./ai-recommendation.css']
})
export class AiRecommendation {

  recommendation = {

    title: "Today's Recommendation",

    description:'Use public transport or bicycle today. You can reduce approximately 2.8 kg CO₂ emission.',

    impact:'+12 Sustainability Points'

  };

}
