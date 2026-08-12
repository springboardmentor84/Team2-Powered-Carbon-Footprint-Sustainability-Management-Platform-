import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { DashboardService } from '../../../../core/services/dashboard/dashboard.service';
import { LeaderboardService } from '../../../../core/services/leaderboard.service';

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
  private dashboardService = inject(DashboardService);
  private leaderboardService = inject(LeaderboardService);

  stats = [
    {
      title: 'Activities',
      value: 'Loading...',
      color: '#2E7D32'
    },
    {
      title: 'Trees Saved',
      value: 21,
      color: '#43A047'
    },
    {
      title: 'CO₂ Saved',
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
    this.dashboardService.getSummary().subscribe({
      next: (summary: any) => {
        if (summary) {
          this.stats[0].value = summary.totalEntries?.toString() || '0';
          this.stats[2].value = `${summary.totalCarbonEmission || 0} kg`;
        }
      },
      error: () => {
        this.stats[0].value = 'Error loading';
        this.stats[2].value = 'Error loading';
      }
    });

    this.leaderboardService.getMyRank().subscribe({
      next: (rankData: any) => {
        const rankValue = typeof rankData === 'number' || typeof rankData === 'string' 
          ? rankData 
          : (rankData?.rank || 'N/A');
        
        this.stats[3].value = rankValue !== 'N/A' ? `#${rankValue}` : 'N/A';
      },
      error: () => {
        this.stats[3].value = 'Error loading';
      }
    });
  }
}
