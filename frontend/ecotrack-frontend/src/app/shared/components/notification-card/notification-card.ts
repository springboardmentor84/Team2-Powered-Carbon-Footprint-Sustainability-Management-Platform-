import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';

import { MatIconModule } from '@angular/material/icon';

@Component({
  selector:'app-notification-card',
  standalone:true,
  imports:[
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl:'./notification-card.html',
  styleUrl:'./notification-card.css'
})
export class NotificationCard{

  notifications=[

    '🌱 Weekly goal completed',

    '🚶 Walk 2 km to earn 15 points',

    '🏆 You moved to Rank #14',

    '♻ New sustainability challenge available'

  ];

}
