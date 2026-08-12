import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { BadgeService, BadgeResponse } from '../../../../core/services/badge.service';

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
export class ProfileAchievements implements OnInit {
  private badgeService = inject(BadgeService);

  achievements: any[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.badgeService.getBadges().subscribe({
      next: (badges: BadgeResponse[]) => {
        if (badges) {
          this.achievements = badges.map(b => ({
            icon: b.icon || '🏆',
            title: b.name || 'Unnamed Badge',
            description: b.description || (b.pointsRequired ? `Requires ${b.pointsRequired} points.` : 'No description'),
            unlocked: b.unlocked
          }));
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
