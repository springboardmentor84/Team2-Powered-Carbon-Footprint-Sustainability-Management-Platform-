import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

import { ActivityService } from '../../../core/services/activity.service';

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
export class NotificationCard {

  private activityService = inject(ActivityService);

  get notifications(): NotificationItem[] {

    const notifications: NotificationItem[] = [];

    const carbon = this.activityService.getCarbonSaved();
    const score = this.activityService.getSustainabilityScore();
    const totalActivities = this.activityService.getActivities().length;

    let id = 1;

    if (carbon >= 100) {

      notifications.push({
        id: id++,
        type: 'GOAL',
        icon: '🏆',
        color: '#2E7D32',
        title: 'Goal Completed',
        message: 'Amazing! Weekly carbon target achieved.',
        time: 'Just Now',
        isRead: false
      });

    } else if (carbon >= 75) {

      notifications.push({
        id: id++,
        type: 'GOAL',
        icon: '🔥',
        color: '#43A047',
        title: '75% Goal Completed',
        message: 'You are almost there.',
        time: 'Today',
        isRead: false
      });

    } else {

      notifications.push({
        id: id++,
        type: 'GOAL',
        icon: '🌱',
        color: '#1565C0',
        title: 'Keep Going',
        message: `${(100-carbon).toFixed(1)} kg remaining to reach your goal.`,
        time: 'Today',
        isRead: false
      });

    }

    if (score >= 90) {

      notifications.push({
        id: id++,
        type: 'SCORE',
        icon: '⭐',
        color: '#F9A825',
        title: 'Excellent Sustainability',
        message: 'Your sustainability score is excellent.',
        time: 'Today',
        isRead: false
      });

    }

    if (totalActivities === 0) {

      notifications.push({
        id: id++,
        type: 'ACTIVITY',
        icon: '📢',
        color: '#E53935',
        title: 'No Activities',
        message: 'Add your first eco activity today.',
        time: 'Today',
        isRead: false
      });

    } else {

      notifications.push({
        id: id++,
        type: 'ACTIVITY',
        icon: '✅',
        color: '#43A047',
        title: 'Activities Synced',
        message: `${totalActivities} activities available.`,
        time: 'Just Now',
        isRead: false
      });

    }

    return notifications;

  }

}
