import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { GamificationService } from '../../../../core/services/gamification.service';
import { GamificationSummary, Reward, RewardTransaction } from '../../../../core/models/gamification.model';
import { finalize } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
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
  private readonly cdr = inject(ChangeDetectorRef);

  summary: GamificationSummary | null = null;
  rewardHistory: RewardTransaction[] = [];
  loading = true;
  error = false;
  redeemingRewardId: number | null = null;

  // Exact levels mapped from GamificationServiceImpl
  readonly LEVELS = [
    { level: 1, name: 'Eco Beginner', minPoints: 0, icon: 'seedling' },
    { level: 2, name: 'Green Contributor', minPoints: 500, icon: 'eco' },
    { level: 3, name: 'Sustainability Advocate', minPoints: 1000, icon: 'nature_people' },
    { level: 4, name: 'Earth Protector', minPoints: 2000, icon: 'public' },
    { level: 5, name: 'Eco Champion', minPoints: 3500, icon: 'verified' },
    { level: 6, name: 'Carbon Master', minPoints: 5000, icon: 'diamond' }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = false;
    
    forkJoin({
      summary: this.gamificationService.getGamificationSummary(),
      history: this.gamificationService.getRewardHistory()
    })
    .pipe(finalize(() => {
      this.loading = false;
      this.cdr.detectChanges();
    }))
    .subscribe({
      next: (data) => {
        this.summary = data.summary;
        this.rewardHistory = data.history;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load achievements data', err);
        this.error = true;
        this.cdr.detectChanges();
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
    this.cdr.detectChanges();
    this.gamificationService.redeemReward(reward.id).subscribe({
      next: () => {
        this.snackBar.open(`Successfully redeemed: ${reward.name}!`, 'Close', { duration: 3000 });
        this.loadData(); // Refresh summary to update points
      },
      error: (err) => {
        console.error('Failed to redeem reward', err);
        this.snackBar.open('Failed to redeem reward. Please try again later.', 'Close', { duration: 3000 });
        this.redeemingRewardId = null;
        this.cdr.detectChanges();
      }
    });
  }
}
