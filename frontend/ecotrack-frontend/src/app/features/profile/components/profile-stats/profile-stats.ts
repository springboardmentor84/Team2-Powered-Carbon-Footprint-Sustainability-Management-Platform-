import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { ProfileService, UserProfile } from '../../../../core/services/profile';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-profile-stats',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  templateUrl: './profile-stats.html',
  styleUrl: './profile-stats.css'
})
export class ProfileStats implements OnInit {
  private profileService = inject(ProfileService);
  private cdr = inject(ChangeDetectorRef);

  stats = [
    {
      title: 'Activities',
      value: 'Loading...',
      color: '#2E7D32'
    },
    {
      title: 'Total Emissions',
      value: 'Loading...',
      color: '#FB8C00'
    },
    {
      title: 'Global Rank',
      value: 'Loading...',
      color: '#1565C0'
    }
  ];

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: (profile: UserProfile) => {
        if (profile) {
          this.stats[0].value = profile.activitiesCount?.toString() || '0';
          this.stats[1].value = profile.totalEmissions !== undefined ? `${profile.totalEmissions} kg` : '0 kg';
          this.stats[2].value = profile.globalRank !== undefined && profile.globalRank !== null ? `#${profile.globalRank}` : 'N/A';
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.stats[0].value = 'Error loading';
        this.stats[1].value = 'Error loading';
        this.stats[2].value = 'Error loading';
        this.cdr.detectChanges();
      }
    });
  }
}
