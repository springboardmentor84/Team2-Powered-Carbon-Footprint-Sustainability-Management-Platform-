import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { GeneratedReportResponse, ReportService } from '../../../../core/services/report.service';

@Component({
  selector: 'app-report-details-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './report-details-modal.html',
  styleUrl: './report-details-modal.css'
})
export class ReportDetailsModal {
  constructor(
    public dialogRef: MatDialogRef<ReportDetailsModal>,
    @Inject(MAT_DIALOG_DATA) public data: { report: GeneratedReportResponse },
    private reportService: ReportService
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  onDownload(): void {
    this.reportService.downloadReport(this.data.report.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const ext = this.data.report.format === 'CSV' ? 'csv' : 'pdf';
        a.download = `ecotrack_report_${this.data.report.reportPeriod.replace(' ', '_')}.${ext}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (err) => console.error('Download failed', err)
    });
  }
}
