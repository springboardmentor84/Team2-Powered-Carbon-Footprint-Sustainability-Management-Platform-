import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { LeaderboardService } from '../../../../core/services/leaderboard.service';
import { LeaderboardResponse, MyRankResponse } from '../../../../core/models/leaderboard.model';
import { forkJoin, finalize } from 'rxjs';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonToggleModule
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

  searchQuery: string = '';
  filterMode: 'top10' | 'top25' | 'all' = 'top10';

  get filteredLeaderboard(): LeaderboardResponse[] {
    let filtered = this.leaderboard;
    if (this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(u => u.fullName.toLowerCase().includes(q));
    }
    
    if (this.filterMode === 'top10') {
      return filtered.slice(0, 10);
    } else if (this.filterMode === 'top25') {
      return filtered.slice(0, 25);
    }
    return filtered;
  }

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
