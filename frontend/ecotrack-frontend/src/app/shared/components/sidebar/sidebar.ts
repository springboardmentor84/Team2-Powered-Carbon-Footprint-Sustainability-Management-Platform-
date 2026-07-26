import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatListModule,
    MatIconModule
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {

  menu = [

    {
      title:'Dashboard',
      icon:'dashboard',
      route:'/dashboard'
    },

    {
      title:'Activities',
      icon:'task',
      route:'/activities'
    },

    {
      title:'Carbon Tracker',
      icon:'eco',
      route:'/carbon-tracker'
    },

    {
      title:'Goals',
      icon:'flag',
      route:'/goals'
    },

    {
      title:'Reports',
      icon:'description',
      route:'/reports'
    },

    {
      title:'Analytics',
      icon:'analytics',
      route:'/analytics'
    },

    {
      title:'Leaderboard',
      icon:'leaderboard',
      route:'/leaderboard'
    },

    {
      title:'Notifications',
      icon:'notifications',
      route:'/notifications'
    },

    {
      title:'Profile',
      icon:'person',
      route:'/profile'
    },

    {
      title:'Settings',
      icon:'settings',
      route:'/settings'
    },

    {
      title:'AI Assistant',
      icon:'smart_toy',
      route:'/ai-assistant'
    }

  ];

}
