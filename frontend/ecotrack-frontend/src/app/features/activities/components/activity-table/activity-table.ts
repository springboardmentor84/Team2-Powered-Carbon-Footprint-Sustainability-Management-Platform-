import {
  Component,
  ViewChild,
  AfterViewInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import {
  Activity,
  ActivityService
} from '../../../../core/services/activity.service';

import { EditActivityDialog } from '../edit-activity-dialog/edit-activity-dialog';
import { DeleteConfirmDialog } from '../delete-confirm-dialog/delete-confirm-dialog';

@Component({
  selector: 'app-activity-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatSelectModule,
    MatPaginatorModule,
    MatSortModule,
    MatSnackBarModule
  ],
  templateUrl: './activity-table.html',
  styleUrl: './activity-table.css'
})
export class ActivityTable implements AfterViewInit {

  private dialog = inject(MatDialog);
  private activityService = inject(ActivityService);
  private snackBar = inject(MatSnackBar);

  search = '';
  selectedCategory = 'All';
  selectedDate = '';
  minCarbon = 0;

  categories = [
    'All',
    'Walking',
    'Recycling',
    'Transport',
    'Food',
    'Waste',
    'Water',
    'Electricity'
  ];

  displayedColumns = [
    'activity',
    'category',
    'carbonSaved',
    'date',
    'status',
    'action'
  ];

  dataSource = new MatTableDataSource<Activity>();

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  @ViewChild(MatSort)
  sort!: MatSort;

  constructor() {

    this.activityService.activities$
      .subscribe(() => this.loadData());

  }

  ngAfterViewInit(): void {

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

  }

  loadData(): void {

    let list = this.activityService.getActivities();

    if (this.selectedCategory !== 'All') {
      list = list.filter(x => x.category === this.selectedCategory);
    }

    if (this.selectedDate) {
      list = list.filter(x => x.date === this.selectedDate);
    }

    if (this.minCarbon > 0) {
      list = list.filter(x => x.carbon >= this.minCarbon);
    }

    if (this.search.trim()) {

      list = list.filter(item =>

        item.title.toLowerCase().includes(this.search.toLowerCase()) ||

        item.category.toLowerCase().includes(this.search.toLowerCase()) ||

        item.notes.toLowerCase().includes(this.search.toLowerCase())

      );

    }

    this.dataSource.data = list;

  }

  edit(activity: Activity): void {

    this.dialog.open(EditActivityDialog, {
      width: '550px',
      data: { ...activity }
    }).afterClosed().subscribe(() => {

      this.loadData();

    });

  }

  delete(activity: Activity): void {

    this.dialog.open(DeleteConfirmDialog, {
      width: '420px',
      data: activity.title
    }).afterClosed().subscribe(result => {

      if (result) {

        this.activityService.deleteActivity(activity.id);

        this.loadData();

        this.snackBar.open(
          'Activity Deleted Successfully',
          'Close',
          {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top'
          }
        );

      }

    });

  }

  exportCSV(): void {

    const rows = this.dataSource.data;

    let csv = 'Activity,Category,Carbon Saved,Date,Notes\n';

    rows.forEach(r => {

      csv += `${r.title},${r.category},${r.carbon},${r.date},${r.notes}\n`;

    });

    const blob = new Blob([csv], { type: 'text/csv' });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url;

    a.download = 'activities.csv';

    a.click();

    window.URL.revokeObjectURL(url);

    this.snackBar.open(
      'CSV Exported Successfully',
      'Close',
      {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      }
    );

  }

}
