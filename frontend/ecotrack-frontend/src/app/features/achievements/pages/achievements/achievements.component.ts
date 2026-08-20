import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { GamificationService } from '../../../../core/services/gamification.service';
import { GamificationSummary, Reward } from '../../../../core/models/gamification.model';

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './achievements.component.html',
  styleUrls: ['./achievements.component.css']
})
export class AchievementsComponent implements OnInit {
  private readonly gamificationService = inject(GamificationService);
  private readonly snackBar = inject(MatSnackBar);

  summary: GamificationSummary | null = null;
  loading = true;
  error = false;
  redeemingRewardId: number | null = null;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = false;
    this.gamificationService.getGamificationSummary().subscribe({
      next: (data) => {
        this.summary = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load achievements data', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  redeemReward(reward: Reward): void {
    if (this.redeemingRewardId) return;

    if (!this.summary || this.summary.ecoPoints < reward.pointsRequired) {
      this.snackBar.open('Not enough EcoPoints to redeem this reward.', 'Close', { duration: 3000 });
      return;
    }

    this.redeemingRewardId = reward.id;
    this.gamificationService.redeemReward(reward.id).subscribe({
      next: () => {
        this.snackBar.open(`Successfully redeemed: ${reward.name}!`, 'Close', { duration: 3000 });
        this.loadData(); // Refresh summary to update points
      },
      error: (err) => {
        console.error('Failed to redeem reward', err);
        this.snackBar.open('Failed to redeem reward. Please try again later.', 'Close', { duration: 3000 });
        this.redeemingRewardId = null;
      }
    });
  }
}
