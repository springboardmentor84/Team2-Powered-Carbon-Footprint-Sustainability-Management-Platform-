import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './quick-actions.html',
  styleUrl: './quick-actions.css'
})
export class QuickActions {

  actions = [

    {
      icon:'add_circle',
      title:'Add Activity'
    },

    {
      icon:'flag',
      title:'Create Goal'
    },

    {
      icon:'download',
      title:'Download Report'
    },

    {
      icon:'smart_toy',
      title:'Ask AI'
    }

  ];

}
