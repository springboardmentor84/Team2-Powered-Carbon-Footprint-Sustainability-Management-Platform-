import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LeaderboardService } from '../../../../core/services/leaderboard.service';
import { LeaderboardResponse, MyRankResponse } from '../../../../core/models/leaderboard.model';
import { forkJoin, finalize } from 'rxjs';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './leaderboard.html',
  styleUrls: ['./leaderboard.css']
})
export class Leaderboard implements OnInit {
  private readonly leaderboardService = inject(LeaderboardService);
  private readonly cdr = inject(ChangeDetectorRef);

  leaderboard: LeaderboardResponse[] = [];
  myRank: MyRankResponse | null = null;
  loading = true;
  error = false;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = false;
    
    forkJoin({
      top: this.leaderboardService.getLeaderboard(),
      me: this.leaderboardService.getMyRank()
    })
    .pipe(finalize(() => {
      this.loading = false;
      this.cdr.detectChanges();
    }))
    .subscribe({
      next: (res) => {
        this.leaderboard = res.top;
        this.myRank = res.me;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load leaderboard data', err);
        this.error = true;
        this.cdr.detectChanges();
      }
    });
  }
}
