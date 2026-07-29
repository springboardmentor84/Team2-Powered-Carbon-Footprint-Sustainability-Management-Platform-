import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-reports-history',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  templateUrl: './reports-history.html',
  styleUrl: './reports-history.css'
})
export class ReportsHistory {

  reports = [

    {
      month: 'July 2026',
      carbon: '128 kg',
      score: '86%',
      status: 'Excellent'
    },

    {
      month: 'June 2026',
      carbon: '114 kg',
      score: '81%',
      status: 'Good'
    },

    {
      month: 'May 2026',
      carbon: '97 kg',
      score: '74%',
      status: 'Average'
    }

  ];

}
