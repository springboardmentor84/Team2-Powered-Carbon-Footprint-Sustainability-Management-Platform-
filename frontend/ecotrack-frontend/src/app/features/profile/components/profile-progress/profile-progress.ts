import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { ProfileService, UserProfile } from '../../../../core/services/profile';

@Component({
  selector: 'app-profile-progress',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  templateUrl: './profile-progress.html',
  styleUrl: './profile-progress.css'
})
export class ProfileProgress implements OnInit {

  private profileService = inject(ProfileService);
  private cdr = inject(ChangeDetectorRef);

  progress = 0;
  nextLevel = 'Loading...';
  remaining = 0;

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: (profile: UserProfile) => {
        if (profile) {
          this.progress = profile.progressPercentage || 0;
          this.nextLevel = profile.nextLevel || 'Max Level Reached';
          this.remaining = profile.pointsRemaining || 0;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.nextLevel = 'Error loading progress';
        this.cdr.detectChanges();
      }
    });
  }
}
