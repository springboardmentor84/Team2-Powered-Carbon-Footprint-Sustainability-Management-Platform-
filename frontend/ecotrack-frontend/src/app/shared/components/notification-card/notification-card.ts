import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

import { NotificationService, NotificationResponse } from '../../../core/services/notification';

interface NotificationItem {
  id: number;
  icon: string;
  color: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

@Component({
  selector: 'app-notification-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  templateUrl: './notification-card.html',
  styleUrl: './notification-card.css'
})
export class NotificationCard implements OnInit {

  private notificationService = inject(NotificationService);

  notificationList: NotificationItem[] = [];

  ngOnInit(): void {
    this.notificationService.getNotifications().subscribe({
      next: (notifications) => {
        this.notificationList = notifications.map(n => ({
          id: n.id,
          icon: this.getIconForTitle(n.title),
          color: this.getColorForTitle(n.title),
          title: n.title,
          message: n.message,
          time: new Date(n.createdAt).toLocaleDateString(),
          isRead: n.isRead
        }));
      },
      error: (err) => console.error('Failed to load notifications', err)
    });
  }

  private getIconForTitle(title: string): string {
    if (title.toLowerCase().includes('goal')) return '🏆';
    if (title.toLowerCase().includes('challenge')) return '🌍';
    if (title.toLowerCase().includes('badge')) return '🏅';
    if (title.toLowerCase().includes('reward')) return '🎁';
    return '🔔';
  }

  private getColorForTitle(title: string): string {
    if (title.toLowerCase().includes('goal')) return '#2E7D32';
    if (title.toLowerCase().includes('challenge')) return '#1565C0';
    if (title.toLowerCase().includes('badge')) return '#F57F17';
    if (title.toLowerCase().includes('reward')) return '#C2185B';
    return '#757575';
  }

  get notifications(): NotificationItem[] {
    return this.notificationList;
  }

}
