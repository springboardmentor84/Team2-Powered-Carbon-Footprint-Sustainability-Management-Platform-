import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';

import { ActivityService } from '../../../core/services/activity.service';
import { ProfileService, UserProfile } from '../../../core/services/profile';
import { DashboardService } from '../../../core/services/dashboard/dashboard.service';

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
  private dashboardService = inject(DashboardService);
  private cdr = inject(ChangeDetectorRef);

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
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Failed to load profile', err);
        this.user.name = 'Error loading';
        this.user.email = 'Error loading';
        this.user.memberSince = 'Error loading';
        this.cdr.detectChanges();
      }
    });

    this.dashboardService.getSummary().subscribe({
      next: (summary) => {
        this.summaryData = summary;
      },
      error: (err) => console.error('Failed to load dashboard summary', err)
    });
  }

  summaryData: any = null;

  get carbon() {
    return this.summaryData ? this.summaryData.totalCarbonEmission.toFixed(1) : 0;
  }

  get score() {
    return 'N/A';
  }

  get activities() {
    return this.summaryData ? this.summaryData.totalEntries : 0;
  }

  get ecoLevel() {
    return 'Unavailable';
  }

}
