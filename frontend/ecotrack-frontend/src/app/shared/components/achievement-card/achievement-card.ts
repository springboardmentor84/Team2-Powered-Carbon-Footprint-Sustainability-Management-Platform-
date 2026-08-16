import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { BadgeService, BadgeResponse } from '../../../core/services/badge.service';
import { ProfileService } from '../../../core/services/profile';

@Component({
  selector: 'app-achievement-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule
  ],
  templateUrl: './achievement-card.html',
  styleUrl: './achievement-card.css'
})
export class AchievementCard implements OnInit {

  private badgeService = inject(BadgeService);
  private profileService = inject(ProfileService);

  badgeList: any[] = [];
  userPoints = 0;

  ngOnInit(): void {
    // 1. Get User Profile for points
    this.profileService.getProfile().subscribe({
      next: (profile: any) => {
        this.userPoints = profile?.ecoPoints || 0;
        this.loadBadges();
      },
      error: () => {
        this.loadBadges(); // still load badges
      }
    });
  }

  loadBadges(): void {
    this.badgeService.getBadges().subscribe({
      next: (badges: BadgeResponse[]) => {
        this.badgeList = badges.map(b => {
          let isUnlocked = b.unlocked;
          if (isUnlocked === undefined || isUnlocked === null) {
             isUnlocked = this.userPoints >= (b.pointsRequired || 0);
          }
          return {
            icon: b.icon || '🏆',
            title: b.name,
            desc: b.description || `Requires ${b.pointsRequired} pts`,
            unlocked: isUnlocked
          };
        });
      }
    });
  }

  get badges() {
    return this.badgeList;
  }

  get unlockedCount() {
    return this.badgeList.filter(x => x.unlocked).length;
  }
}
