import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-profile-stats',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  templateUrl: './profile-stats.html',
  styleUrl: './profile-stats.css'
})
export class ProfileStats {

  stats = [

    {
      title: 'Activities',
      value: 47,
      color: '#2E7D32'
    },

    {
      title: 'Trees Saved',
      value: 21,
      color: '#43A047'
    },

    {
      title: 'CO₂ Saved',
      value: '128 kg',
      color: '#FB8C00'
    },

    {
      title: 'Global Rank',
      value: '#18',
      color: '#1565C0'
    }

  ];

}
