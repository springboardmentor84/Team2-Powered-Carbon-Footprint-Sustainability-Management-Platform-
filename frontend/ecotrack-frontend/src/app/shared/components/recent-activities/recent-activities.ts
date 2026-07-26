import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';

import { MatTableModule } from '@angular/material/table';

import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-recent-activities',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule
  ],
  templateUrl: './recent-activities.html',
  styleUrl: './recent-activities.css'
})
export class RecentActivities {

  displayedColumns = [
    'icon',
    'activity',
    'carbon',
    'date'
  ];

  activities = [

    {
      icon:'directions_walk',
      activity:'Walked 4 km',
      carbon:'1.8 kg',
      date:'Today'
    },

    {
      icon:'pedal_bike',
      activity:'Cycling',
      carbon:'2.5 kg',
      date:'Yesterday'
    },

    {
      icon:'park',
      activity:'Tree Plantation',
      carbon:'5.0 kg',
      date:'2 Days Ago'
    },

    {
      icon:'recycling',
      activity:'Plastic Recycled',
      carbon:'0.8 kg',
      date:'3 Days Ago'
    }

  ];

}
