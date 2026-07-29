import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsSummary } from '../../components/reports-summary/reports-summary';
import { ReportsCharts } from '../../components/reports-charts/reports-charts';
import { ReportsHistory } from '../../components/reports-history/reports-history';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    ReportsSummary,
    ReportsCharts,
    ReportsHistory
  ],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class Reports {

}
