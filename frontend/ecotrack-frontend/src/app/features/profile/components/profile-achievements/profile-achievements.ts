import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-profile-achievements',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  templateUrl: './profile-achievements.html',
  styleUrl: './profile-achievements.css'
})
export class ProfileAchievements {

  achievements = [

    {
      icon:'🌱',
      title:'Green Beginner',
      description:'Completed your first eco activity.',
      unlocked:true
    },

    {
      icon:'🔥',
      title:'15 Day Streak',
      description:'Stayed consistent for 15 days.',
      unlocked:true
    },

    {
      icon:'♻️',
      title:'Recycling Hero',
      description:'Logged 20 recycling activities.',
      unlocked:true
    },

    {
      icon:'🏆',
      title:'Eco Champion',
      description:'Reach Sustainability Score 95%.',
      unlocked:false
    }

  ];

}
