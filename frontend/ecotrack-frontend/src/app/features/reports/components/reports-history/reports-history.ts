import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ReportService, GeneratedReportResponse } from '../../../../core/services/report.service';
import { ReportDetailsModal } from '../report-details-modal/report-details-modal';

@Component({
  selector: 'app-reports-history',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './reports-history.html',
  styleUrl: './reports-history.css'
})
export class ReportsHistory implements OnInit {
  private reportService = inject(ReportService);
  private dialog = inject(MatDialog);

  reports: GeneratedReportResponse[] = [];
  loading = false;

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.loading = true;
    this.reportService.getReportHistory().subscribe({
      next: (history) => {
        this.reports = Array.isArray(history) ? history : [];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  viewDetails(report: GeneratedReportResponse) {
    this.dialog.open(ReportDetailsModal, {
      width: '500px',
      data: { report }
    });
  }

  download(report: GeneratedReportResponse) {
    this.reportService.downloadReport(report.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const ext = report.format === 'CSV' ? 'csv' : 'pdf';
        a.download = `ecotrack_report_${report.reportPeriod.replace(' ', '_')}.${ext}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Refresh the list to show updated downloads count
        this.loadHistory();
      },
      error: (err) => console.error('Download failed', err)
    });
  }
}
