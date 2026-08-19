import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ReportsSummary } from '../../components/reports-summary/reports-summary';
import { ReportsCharts } from '../../components/reports-charts/reports-charts';
import { ReportsHistory } from '../../components/reports-history/reports-history';
import { ReportGenerateModal } from '../../components/report-generate-modal/report-generate-modal';
import { ReportService } from '../../../../core/services/report.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatSnackBarModule,
    ReportsSummary,
    ReportsCharts,
    ReportsHistory
  ],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class Reports {
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private reportService = inject(ReportService);

  periodFilter: string = 'This Month';
  categoryFilter: string = 'All Categories';
  customStartDate: string = '';
  customEndDate: string = '';

  periods = ['This Month', 'Last Month', 'Last 3 Months', 'Last 6 Months', 'This Year', 'Custom'];
  categories = ['All Categories', 'Transport', 'Food', 'Electricity', 'Water', 'Waste', 'Shopping', 'Other'];

  openGenerateModal(): void {
    const dialogRef = this.dialog.open(ReportGenerateModal, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(request => {
      if (request) {
        this.reportService.generateReport(request).subscribe({
          next: (res) => {
            this.snackBar.open('Report generated successfully!', 'Close', { duration: 3000 });
            // This will trigger the history component to refresh if we set up a subject, 
            // but for simplicity we will reload the page or trigger an event.
            window.location.reload(); 
          },
          error: (err) => {
            console.error(err);
            this.snackBar.open('Failed to generate report', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
}
