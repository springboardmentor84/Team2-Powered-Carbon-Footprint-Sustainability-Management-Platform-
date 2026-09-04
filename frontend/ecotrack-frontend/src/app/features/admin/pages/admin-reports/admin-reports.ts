import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { AdminReportsService, AdminReportResponse, AdminReportGenerationRequest } from '../../services/admin-reports.service';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-reports.html',
  styleUrls: ['./admin-reports.css']
})
export class AdminReports implements OnInit {
  reports: AdminReportResponse[] = [];
  isLoading = true;
  isGenerating = false;
  error = '';
  
  generateRequest: AdminReportGenerationRequest = {
    startDate: null,
    endDate: null,
    format: 'PDF'
  };

  showGenerateModal = false;

  constructor(
    private reportsService: AdminReportsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.isLoading = true;
    this.reportsService.getReportHistory().subscribe({
      next: (data) => {
        this.reports = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load report history.';
        this.isLoading = false;
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }

  openGenerateModal(): void {
    this.showGenerateModal = true;
  }

  closeGenerateModal(): void {
    this.showGenerateModal = false;
  }

  generateReport(): void {
    this.isGenerating = true;
    this.reportsService.generateReport(this.generateRequest).subscribe({
      next: (report) => {
        this.reports.unshift(report); // Add to top of list
        this.isGenerating = false;
        this.closeGenerateModal();
      },
      error: (err) => {
        console.error(err);
        this.isGenerating = false;
        alert('Failed to generate report. Check console for details.');
      }
    });
  }

  downloadReport(id: number): void {
    this.reportsService.downloadReport(id);
    const report = this.reports.find(r => r.id === id);
    if (report) {
      report.downloads += 1;
    }
  }
}
