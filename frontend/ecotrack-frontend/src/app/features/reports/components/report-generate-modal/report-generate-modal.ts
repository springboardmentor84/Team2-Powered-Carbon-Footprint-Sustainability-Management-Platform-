import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-report-generate-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, FormsModule],
  templateUrl: './report-generate-modal.html',
  styleUrl: './report-generate-modal.css'
})
export class ReportGenerateModal {
  dialogRef = inject(MatDialogRef<ReportGenerateModal>);

  period: string = 'This Month';
  format: string = 'PDF';
  
  customStartDate: string = '';
  customEndDate: string = '';

  onCancel(): void {
    this.dialogRef.close();
  }

  onGenerate(): void {
    const request = {
      reportPeriod: this.period,
      startDate: this.period === 'Custom Date Range' ? this.customStartDate : null,
      endDate: this.period === 'Custom Date Range' ? this.customEndDate : null,
      format: this.format
    };
    
    // Simple date mapping for common periods
    if (this.period !== 'Custom Date Range') {
      const now = new Date();
      let start = new Date();
      if (this.period === 'This Month') {
        start.setDate(1);
      } else if (this.period === 'Last Month') {
        start.setMonth(now.getMonth() - 1);
        start.setDate(1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        request.endDate = end.toISOString().split('T')[0];
      } else if (this.period === 'Last 3 Months') {
        start.setMonth(now.getMonth() - 3);
      } else if (this.period === 'This Year') {
        start.setMonth(0);
        start.setDate(1);
      }
      if (!request.endDate) {
        request.endDate = now.toISOString().split('T')[0];
      }
      request.startDate = start.toISOString().split('T')[0];
    }
    
    this.dialogRef.close(request);
  }
}
