import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ChallengeService } from '../../../../core/services/challenge.service';
import { Challenge, ChallengeParticipation, ChallengeProgress, ChallengeLeaderboardEntry } from '../../../../core/models/challenge.model';

interface MyChallengeDetails {
  participation: ChallengeParticipation;
  progress: ChallengeProgress | null;
  leaderboard: ChallengeLeaderboardEntry[];
  loading: boolean;
}

@Component({
  selector: 'app-challenges',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './challenges.component.html',
  styleUrls: ['./challenges.component.css']
})
export class ChallengesComponent implements OnInit {
  private readonly challengeService = inject(ChallengeService);
  private readonly snackBar = inject(MatSnackBar);

  allChallenges: Challenge[] = [];
  availableChallenges: Challenge[] = [];
  myChallenges: MyChallengeDetails[] = [];
  
  loading = true;
  error = false;
  joiningChallengeId: number | null = null;
  leavingChallengeId: number | null = null;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = false;

    // Load all challenges and my participations
    this.challengeService.getAllChallenges().subscribe({
      next: (challenges) => {
        this.allChallenges = challenges;
        this.loadMyParticipations();
      },
      error: (err) => {
        console.error('Failed to load challenges', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  loadMyParticipations(): void {
    this.challengeService.getMyChallenges().subscribe({
      next: (participations) => {
        const joinedIds = participations.map(p => p.challengeId);
        
        // Filter out already joined challenges and past challenges
        const today = new Date().toISOString().split('T')[0];
        this.availableChallenges = this.allChallenges.filter(c => 
          !joinedIds.includes(c.id) && c.endDate >= today
        );

        this.myChallenges = participations.map(p => ({
          participation: p,
          progress: null,
          leaderboard: [],
          loading: true
        }));

        this.loading = false;

        // Load progress and leaderboard for each joined challenge
        this.myChallenges.forEach(mc => {
          this.loadChallengeDetails(mc);
        });
      },
      error: (err) => {
        console.error('Failed to load participations', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  loadChallengeDetails(mc: MyChallengeDetails): void {
    mc.loading = true;
    
    // Load progress
    this.challengeService.getChallengeProgress(mc.participation.challengeId).subscribe({
      next: (progress) => {
        mc.progress = progress;
        // Load leaderboard
        this.challengeService.getChallengeLeaderboard(mc.participation.challengeId).subscribe({
          next: (leaderboard) => {
            mc.leaderboard = leaderboard.slice(0, 3); // Top 3
            mc.loading = false;
          },
          error: (err) => {
            console.error('Failed to load leaderboard', err);
            mc.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Failed to load progress', err);
        mc.loading = false;
      }
    });
  }

  joinChallenge(challenge: Challenge): void {
    if (this.joiningChallengeId) return;
    this.joiningChallengeId = challenge.id;

    this.challengeService.joinChallenge(challenge.id).subscribe({
      next: () => {
        this.snackBar.open(`Successfully joined: ${challenge.title}!`, 'Close', { duration: 3000 });
        this.joiningChallengeId = null;
        this.loadData();
      },
      error: (err) => {
        console.error('Failed to join challenge', err);
        this.snackBar.open(err.error?.message || 'Failed to join challenge.', 'Close', { duration: 3000 });
        this.joiningChallengeId = null;
      }
    });
  }

  leaveChallenge(challengeId: number): void {
    if (this.leavingChallengeId) return;
    this.leavingChallengeId = challengeId;

    this.challengeService.leaveChallenge(challengeId).subscribe({
      next: () => {
        this.snackBar.open('Left challenge.', 'Close', { duration: 3000 });
        this.leavingChallengeId = null;
        this.loadData();
      },
      error: (err) => {
        console.error('Failed to leave challenge', err);
        this.snackBar.open('Failed to leave challenge.', 'Close', { duration: 3000 });
        this.leavingChallengeId = null;
      }
    });
  }
}
