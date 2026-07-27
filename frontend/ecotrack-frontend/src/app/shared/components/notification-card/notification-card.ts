import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

import { ActivityService } from '../../../core/services/activity.service';

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

  get notifications() {

    const list: any[] = [];

    const carbon = this.activityService.getCarbonSaved();

    const score = this.activityService.getSustainabilityScore();

    const totalActivities = this.activityService.getActivities().length;

    // Goal Notifications

    if (carbon >= 100) {

      list.push({
        icon: '🏆',
        color: '#2E7D32',
        title: 'Goal Completed',
        desc: 'Amazing! Weekly carbon target achieved.',
        time: 'Just Now'
      });

    } else if (carbon >= 75) {

      list.push({
        icon: '🔥',
        color: '#43A047',
        title: '75% Goal Completed',
        desc: 'You are almost there.',
        time: 'Today'
      });

    } else if (carbon >= 50) {

      list.push({
        icon: '🎯',
        color: '#FB8C00',
        title: 'Halfway There',
        desc: '50% of your weekly goal completed.',
        time: 'Today'
      });

    } else {

      list.push({
        icon: '🌱',
        color: '#1565C0',
        title: 'Keep Going',
        desc: `${(100-carbon).toFixed(1)} kg remaining to reach your goal.`,
        time: 'Today'
      });

    }

    // Sustainability Score

    if (score >= 90) {

      list.push({
        icon: '⭐',
        color: '#F9A825',
        title: 'Excellent Sustainability',
        desc: 'Your sustainability score is excellent.',
        time: 'Today'
      });

    } else if (score >= 70) {

      list.push({
        icon: '🌍',
        color: '#2E7D32',
        title: 'Good Progress',
        desc: 'Keep maintaining eco-friendly habits.',
        time: 'Today'
      });

    } else {

      list.push({
        icon: '💡',
        color: '#8E24AA',
        title: 'Recommendation',
        desc: 'Walk or cycle more to improve your score.',
        time: 'Today'
      });

    }

    // Activity Notification

    if (totalActivities === 0) {

      list.push({
        icon: '📢',
        color: '#E53935',
        title: 'No Activities',
        desc: 'Add your first eco activity today.',
        time: 'Today'
      });

    } else {

      list.push({
        icon: '✅',
        color: '#43A047',
        title: 'Activities Synced',
        desc: `${totalActivities} activities available.`,
        time: 'Just Now'
      });

    }

    // Weekly Milestone

    if (totalActivities >= 10) {

      list.push({
        icon: '🎉',
        color: '#00897B',
        title: 'Weekly Milestone',
        desc: 'You completed more than 10 activities.',
        time: 'Today'
      });

    }

    return list;

  }

}
