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

    const score = this.activityService.getSustainabilityScore();

    const average =
      activities.length > 0
        ? (carbon / activities.length).toFixed(1)
        : '0';

    return [

      {
        title: 'Activities',
        value: activities.length,
        color: '#2E7D32'
      },

      {
        title: 'Carbon Saved',
        value: carbon.toFixed(1) + ' kg',
        color: '#43A047'
      },

      {
        title: 'Average',
        value: average + ' kg',
        color: '#FB8C00'
      },

      {
        title: 'Score',
        value: score + '%',
        color: '#1565C0'
      }

    ];

  }

}
