import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { ActivitySummary } from '../../components/activity-summary/activity-summary';
import { ActivityAnalytics } from '../../components/activity-analytics/activity-analytics';
import { ActivityFilter } from '../../components/activity-filter/activity-filter';
import { ActivityTableComponent } from '../../components/activity-table/activity-table';

import { AddActivityDialog } from '../../components/add-activity-dialog/add-activity-dialog';

@Component({
  selector: 'app-activities',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    ActivitySummary,
    ActivityAnalytics,
    ActivityFilter,
    ActivityTableComponent
  ],
  templateUrl: './activities.html',
  styleUrl: './activities.css'
})
export class Activities {

  private dialog = inject(MatDialog);

  openDialog() {

    this.dialog.open(AddActivityDialog, {

      width: '550px'

    });

  }

}
