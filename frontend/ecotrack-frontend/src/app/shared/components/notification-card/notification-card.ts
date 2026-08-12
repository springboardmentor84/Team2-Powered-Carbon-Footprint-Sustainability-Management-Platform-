import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

import { NotificationService, NotificationResponse } from '../../../core/services/notification';

interface NotificationItem {
  id: number;
  type: string;
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
          type: n.type,
          icon: this.getIconForType(n.type),
          color: this.getColorForType(n.type),
          title: n.title,
          message: n.message,
          time: new Date(n.createdAt).toLocaleDateString(),
          isRead: n.isRead
        }));
      },
      error: (err) => console.error('Failed to load notifications', err)
    });
  }

  private getIconForType(type: string): string {
    if (type === 'GOAL') return '🏆';
    if (type === 'ACTIVITY') return '✅';
    if (type === 'SYSTEM') return '📢';
    return '🔔';
  }

  private getColorForType(type: string): string {
    if (type === 'GOAL') return '#2E7D32';
    if (type === 'ACTIVITY') return '#43A047';
    if (type === 'SYSTEM') return '#1565C0';
    return '#757575';
  }

  get notifications(): NotificationItem[] {
    return this.notificationList;
  }

}
