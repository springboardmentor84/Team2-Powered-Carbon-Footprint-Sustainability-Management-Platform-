import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';

import { ActivityService } from '../../../core/services/activity.service';
import { ProfileService, UserProfile } from '../../../core/services/profile';

@Component({
  selector: 'app-profile-widget',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    RouterModule
  ],
  templateUrl: './profile-widget.html',
  styleUrl: './profile-widget.css'
})
export class ProfileWidget implements OnInit {

  private activityService = inject(ActivityService);
  private profileService = inject(ProfileService);

  user: any = {
    name: 'Loading...',
    email: 'Loading...',
    avatar: 'assets/images/avatar.png',
    memberSince: 'Loading...'
  };

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: (profile: any) => {
        if (profile) {
          this.user.name = profile.fullName || 'N/A';
          this.user.email = profile.email || 'N/A';
          if (profile.profileImage) {
            this.user.avatar = profile.profileImage;
          }
          if (profile.joined) {
            try {
              const joinedDate = new Date(profile.joined);
              this.user.memberSince = joinedDate.getFullYear().toString();
            } catch (e) {
              this.user.memberSince = profile.joined;
            }
          } else {
            this.user.memberSince = 'N/A';
          }
        }
      },
      error: (err) => {
        console.error('Failed to load profile', err);
        this.user.name = 'Error loading';
        this.user.email = 'Error loading';
        this.user.memberSince = 'Error loading';
      }
    });
  }

  get carbon() {
    return this.activityService.getCarbonSaved();
  }

  get score() {
    return this.activityService.getSustainabilityScore();
  }

  get activities() {
    return this.activityService.getActivities().length;
  }

  get ecoLevel() {

    if (this.score >= 90) return 'Eco Champion';

    if (this.score >= 70) return 'Green Hero';

    if (this.score >= 50) return 'Eco Explorer';

    return 'Beginner';

  }

}
