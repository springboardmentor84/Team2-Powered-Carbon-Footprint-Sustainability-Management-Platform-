import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';

import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  MatDialog,
  MatDialogModule
} from '@angular/material/dialog';

import {
  MatTableDataSource,
  MatTableModule
} from '@angular/material/table';

import {
  MatPaginator,
  MatPaginatorModule
} from '@angular/material/paginator';

import {
  MatSort,
  MatSortModule
} from '@angular/material/sort';

import {
  MatFormFieldModule
} from '@angular/material/form-field';

import {
  MatInputModule
} from '@angular/material/input';

import {
  MatSelectModule
} from '@angular/material/select';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  MatCardModule
} from '@angular/material/card';

import { AddActivityDialog } from '../add-activity-dialog/add-activity-dialog';

import {
  ActivityService
} from '../../../../core/services/activity.service';

import {
  Activity
} from '../../../../core/models/activity.model';


@Component({
  selector: 'app-activity-table',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,

    MatTableModule,
    MatPaginatorModule,
    MatSortModule,

    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatCardModule
  ],

  templateUrl: './activity-table.html',
  styleUrl: './activity-table.css'
})
export class ActivityTableComponent
  implements OnInit, AfterViewInit {

  private readonly activityService =
    inject(ActivityService);

  private readonly dialog =
    inject(MatDialog);

  activities: Activity[] = [];

  dataSource =
    new MatTableDataSource<Activity>([]);

  /*
   * IMPORTANT:
   * These names MUST exactly match matColumnDef
   * names in activity-table.html.
   */
  displayedColumns: string[] = [
    'activity',
    'category',
    'quantity',
    'unit',
    'carbon',
    'date',
    'action'
  ];

  search = '';

  selectedCategory = '';

  selectedDate = '';

  minCarbon: number | null = null;

  sortType = 'latest';

  categories: string[] = [
    'TRANSPORT',
    'ELECTRICITY',
    'WATER',
    'FOOD',
    'WASTE',
    'SHOPPING',
    'OTHER'
  ];

  exporting = false;
  private searchSubject = new Subject<string>();

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  @ViewChild(MatSort)
  sort!: MatSort;

  onSearchChange(searchTerm: string): void {
    this.searchSubject.next(searchTerm);
  }

  ngOnInit(): void {

    // Fetch activities from backend on load
    this.activityService.loadActivities();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.loadData();
    });

    /*
     * ActivityService is the single source of truth.
     *
     * When an activity is:
     * - loaded
     * - created
     * - updated
     * - deleted
     *
     * this subscription automatically refreshes the table.
     */
    this.activityService
      .getActivities$()
      .subscribe((activities: Activity[]) => {

        this.activities = activities;

        this.loadData();

      });
  }


  ngAfterViewInit(): void {

    this.dataSource.paginator =
      this.paginator;

    this.dataSource.sort =
      this.sort;

    this.dataSource.sortingDataAccessor =
      (item: Activity, property: string): string | number => {

        switch (property) {

          case 'activity':
            return item.title?.toLowerCase() ?? '';

          case 'category':
            return item.category?.toLowerCase() ?? '';

          case 'quantity':
            return Number(item.quantity) || 0;

          case 'unit':
            return item.unit?.toLowerCase() ?? '';

          case 'carbon':
            return Number(item.carbonEmission ?? item.carbon) || 0;

          case 'date':
            return item.date
              ? new Date(item.date).getTime()
              : 0;

          default:
            return '';
        }
      };
  }


  loadData(): void {

    let result =
      [...this.activities];


    /*
     * SEARCH
     */
    const search =
      this.search
        .trim()
        .toLowerCase();

    if (search) {

      result =
        result.filter((activity: Activity) => {

          return (

            activity.title
              ?.toLowerCase()
              .includes(search)

            ||

            activity.category
              ?.toLowerCase()
              .includes(search)

            ||

            activity.unit
              ?.toLowerCase()
              .includes(search)

            ||

            String(activity.quantity)
              .includes(search)

            ||

            String(
              activity.carbonEmission ??
              activity.carbon ??
              ''
            ).includes(search)

          );
        });
    }


    /*
     * CATEGORY
     */
    if (this.selectedCategory) {

      result =
        result.filter(
          (activity: Activity) =>
            activity.category ===
            this.selectedCategory
        );
    }


    /*
     * DATE
     */
    if (this.selectedDate) {

      result =
        result.filter((activity: Activity) => {

          if (!activity.date) {
            return false;
          }

          const activityDate =
            new Date(activity.date)
              .toISOString()
              .substring(0, 10);

          return activityDate ===
            this.selectedDate;
        });
    }


    /*
     * MINIMUM CARBON
     */
    if (
      this.minCarbon !== null &&
      this.minCarbon >= 0
    ) {

      result =
        result.filter((activity: Activity) => {

          const carbon =
            Number(
              activity.carbonEmission ??
              activity.carbon ??
              0
            );

          return carbon >=
            Number(this.minCarbon);
        });
    }


    /*
     * SORTING
     */
    if (this.sortType === 'latest') {
      result.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
    } else if (this.sortType === 'oldest') {
      result.sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime());
    } else if (this.sortType === 'carbon-high') {
      result.sort((a, b) => Number(b.carbonEmission ?? b.carbon ?? 0) - Number(a.carbonEmission ?? a.carbon ?? 0));
    } else if (this.sortType === 'carbon-low') {
      result.sort((a, b) => Number(a.carbonEmission ?? a.carbon ?? 0) - Number(b.carbonEmission ?? b.carbon ?? 0));
    }

    /*
     * Update table.
     */
    this.dataSource.data =
      result;


    /*
     * Reset pagination after filtering.
     */
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  reset(): void {
    this.search = '';
    this.selectedCategory = '';
    this.selectedDate = '';
    this.minCarbon = null;
    this.sortType = 'latest';
    this.loadData();
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }


  /*
   * DELETE
   */
  delete(activity: Activity): void {

    if (!activity.id) {

      console.error(
        'Cannot delete activity without an ID.'
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${activity.title}"?`
      );

    if (!confirmed) {
      return;
    }


    this.activityService
      .deleteActivity(activity.id)
      .subscribe({

        next: () => {

          console.log(
            'ACTIVITY DELETED SUCCESSFULLY:',
            activity.id
          );

          /*
           * ActivityService updates its BehaviorSubject.
           * The table subscription automatically refreshes.
           */
        },

        error: (error) => {

          console.error(
            'ACTIVITY DELETE FAILED:',
            error
          );

          if (error.status === 401) {

            alert(
              'Session expired. Please login again.'
            );

          } else if (error.status === 403) {

            alert(
              'You are not authorized to delete this activity.'
            );

          } else if (error.status === 404) {

            alert(
              'Activity was not found.'
            );

          } else if (error.status === 0) {

            alert(
              'Backend is not reachable.'
            );

          } else {

            alert(
              error.error?.message ||
              'Failed to delete activity.'
            );
          }
        }
      });
  }


  /*
   * EDIT
   */
  edit(activity: Activity): void {

    const dialogRef =
      this.dialog.open(
        AddActivityDialog,
        {
          width: '500px',

          data: {
            mode: 'edit',
            activity: activity
          }
        }
      );


    dialogRef
      .afterClosed()
      .subscribe((result: Activity | undefined) => {

        if (!result) {
          return;
        }

        console.log(
          'ACTIVITY UPDATED:',
          result
        );

      });
  }


  /*
   * EXPORT CSV
   */
  exportCSV(): void {

    const rows =
      this.dataSource.filteredData;

    if (!rows.length) {

      alert(
        'No activities available to export.'
      );

      return;
    }

    this.exporting = true;


    const headers = [
      'Activity',
      'Category',
      'Quantity',
      'Unit',
      'Carbon Emission',
      'Date'
    ];


    const csvRows =
      rows.map((activity: Activity) => [

        activity.title,

        activity.category,

        activity.quantity,

        activity.unit,

        activity.carbonEmission ??
        activity.carbon ??
        0,

        activity.date
          ? new Date(activity.date)
              .toISOString()
          : ''
      ]);


    const csv = [

      headers.join(','),

      ...csvRows.map(row =>

        row
          .map(value =>
            `"${String(value ?? '')
              .replace(/"/g, '""')}"`
          )
          .join(',')
      )

    ].join('\n');


    setTimeout(() => {
      const blob =
        new Blob(
          [csv],
          {
            type:
              'text/csv;charset=utf-8;'
          }
        );


      const url =
        URL.createObjectURL(blob);


      const link =
        document.createElement('a');

      link.href = url;

      link.download =
        'ecotrack-activities.csv';

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      
      this.exporting = false;
    }, 500); // Simulate network/generation delay for UX
  }
}

