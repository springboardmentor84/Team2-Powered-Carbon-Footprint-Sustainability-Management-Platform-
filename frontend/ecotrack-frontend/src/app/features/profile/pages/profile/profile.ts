import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileCard } from '../../components/profile-card/profile-card';
import { ProfileStats } from '../../components/profile-stats/profile-stats';
import { ProfileProgress } from '../../components/profile-progress/profile-progress';
import { ProfileAchievements } from '../../components/profile-achievements/profile-achievements';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ProfileCard,
    ProfileStats,
    ProfileProgress,
    ProfileAchievements
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {

}
