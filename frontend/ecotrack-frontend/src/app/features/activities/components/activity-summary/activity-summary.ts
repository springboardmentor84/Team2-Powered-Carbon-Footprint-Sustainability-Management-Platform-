import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-activity-summary',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './activity-summary.html',
  styleUrl: './activity-summary.css'
})
export class ActivitySummary {

  cards = [

    {
      title:'Activities',
      value:47,
      icon:'task_alt',
      color:'#2E7D32'
    },

    {
      title:'Carbon Saved',
      value:'128 kg',
      icon:'eco',
      color:'#43A047'
    },

    {
      title:'Current Streak',
      value:'15 Days',
      icon:'local_fire_department',
      color:'#FB8C00'
    },

    {
      title:'Weekly Score',
      value:'86%',
      icon:'leaderboard',
      color:'#1565C0'
    }

  ];

}
