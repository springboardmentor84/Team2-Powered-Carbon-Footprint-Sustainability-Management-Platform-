import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LeaderboardService } from '../../../../core/services/leaderboard.service';
import { LeaderboardResponse, MyRankResponse } from '../../../../core/models/leaderboard.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-leaderboard',
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
    }).subscribe({
      next: (res) => {
        this.leaderboard = res.top;
        this.myRank = res.me;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load leaderboard data', err);
        this.error = true;
        this.loading = false;
      }
    });
  }
}
