import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, AdminDashboardMetrics } from '../../../../core/services/admin.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {
  private adminService = inject(AdminService);

  metrics = signal<AdminDashboardMetrics | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadMetrics();
  }

  loadMetrics() {
    this.loading.set(true);
    this.error.set(null);
    this.adminService.getDashboardMetrics()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.metrics.set(data),
        error: (err) => this.error.set(err.message || 'Failed to load metrics')
      });
  }
}
