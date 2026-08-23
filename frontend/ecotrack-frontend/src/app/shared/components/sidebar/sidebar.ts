import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { LayoutService } from '../../../core/services/layout/layout.service';
import { NotificationService } from '../../../core/services/notification';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit, OnDestroy {
  private layoutService = inject(LayoutService);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);
  private sub = new Subscription();

  isCollapsed = false;
  unreadCount = 0;

  ngOnInit() {
    this.sub.add(this.layoutService.isSidebarCollapsed$.subscribe(collapsed => {
      this.isCollapsed = collapsed;
      this.cdr.markForCheck();
    }));

    this.sub.add(this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
      this.cdr.markForCheck();
    }));

    this.loadUnreadCount();
    
    // Check every 30 seconds to fetch fresh notifications (which updates unreadCount$)
    setInterval(() => {
      this.loadUnreadCount();
    }, 30000);
  }

  loadUnreadCount() {
    this.notificationService.getNotifications().subscribe();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

 menu = [

  { title:'Dashboard', icon:'dashboard', route:'/dashboard' },

  { title:'Activities', icon:'task', route:'/dashboard/activities' },

  { title:'Carbon Tracker', icon:'eco', route:'/dashboard/carbon-tracker' },

  { title:'Goals', icon:'flag', route:'/dashboard/goals' },

  { title:'Reports', icon:'description', route:'/dashboard/reports' },

  { title:'Analytics', icon:'analytics', route:'/dashboard/analytics' },

  { title:'Leaderboard', icon:'leaderboard', route:'/dashboard/leaderboard' },

  { title:'Achievements', icon:'emoji_events', route:'/dashboard/achievements' },

  { title:'Challenges', icon:'public', route:'/dashboard/challenges' },

  { title:'Notifications', icon:'notifications', route:'/dashboard/notifications' },

  { title:'Profile', icon:'person', route:'/dashboard/profile' },

  { title:'Settings', icon:'settings', route:'/dashboard/settings' },

  { title:'AI Assistant', icon:'smart_toy', route:'/dashboard/ai-assistant' }

];
}
