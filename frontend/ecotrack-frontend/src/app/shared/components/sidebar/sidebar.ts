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

  { title:'Dashboard', icon:'dashboard', route:'/dashboard' },

  { title:'Activities', icon:'task', route:'/dashboard/activities' },

  { title:'Carbon Tracker', icon:'eco', route:'/dashboard/carbon-tracker' },

  { title:'Goals', icon:'flag', route:'/dashboard/goals' },

  { title:'Reports', icon:'description', route:'/dashboard/reports' },

  { title:'Analytics', icon:'analytics', route:'/dashboard/analytics' },

  { title:'Leaderboard', icon:'leaderboard', route:'/dashboard/leaderboard' },

  { title:'Notifications', icon:'notifications', route:'/dashboard/notifications' },

  { title:'Profile', icon:'person', route:'/dashboard/profile' },

  { title:'Settings', icon:'settings', route:'/dashboard/settings' },

  { title:'AI Assistant', icon:'smart_toy', route:'/dashboard/ai-assistant' }

];
}
