import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminMonitoringService, SystemHealthResponse } from '../../services/admin-monitoring.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-admin-monitoring',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-monitoring.html',
  styleUrls: ['./admin-monitoring.css']
})
export class AdminMonitoring implements OnInit {
  health: SystemHealthResponse | null = null;
  isLoading = true;
  error = '';

  constructor(
    private monitoringService: AdminMonitoringService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkHealth();
  }

  checkHealth(): void {
    this.isLoading = true;
    this.error = '';
    this.monitoringService.getHealth().subscribe({
      next: (data) => {
        this.health = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to fetch system health status. The backend might be unreachable.';
        this.isLoading = false;
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }

  formatUptime(seconds: number): string {
    const d = Math.floor(seconds / (3600*24));
    const h = Math.floor(seconds % (3600*24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);

    const dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
    const hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    const mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    const sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return (dDisplay + hDisplay + mDisplay + sDisplay).replace(/,\s*$/, "");
  }
}
