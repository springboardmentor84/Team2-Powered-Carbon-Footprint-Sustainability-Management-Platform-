import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

import { ActivityService } from '../../../../core/services/activity.service';

@Component({
  selector: 'app-reports-summary',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  templateUrl: './reports-summary.html',
  styleUrl: './reports-summary.css'
})
export class ReportsSummary {

  private activityService = inject(ActivityService);

  get cards() {

    const activities = this.activityService.getActivities();

    const carbon = this.activityService.getCarbonSaved();

    const totalReports = activities.length > 0 ? 4 : 0;

    const monthlyReports = activities.length > 0 ? 1 : 0;

    const downloads = activities.length > 0 ? 2 : 0;

    return [

      {
        title: 'Total Reports',
        value: totalReports,
        icon: '📄',
        color: '#1565C0'
      },

      {
        title: 'Carbon Saved',
        value: carbon.toFixed(1) + ' kg',
        icon: '🌱',
        color: '#2E7D32'
      },

      {
        title: 'Monthly Reports',
        value: monthlyReports,
        icon: '📊',
        color: '#FB8C00'
      },

      {
        title: 'Downloads',
        value: downloads,
        icon: '⬇️',
        color: '#8E24AA'
      }

    ];

  }

}
