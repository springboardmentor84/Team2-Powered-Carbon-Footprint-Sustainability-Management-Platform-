import {
  Component,
  ViewChild,
  AfterViewInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import {
  MatCardModule
} from '@angular/material/card';

import {
  MatTableDataSource,
  MatTableModule
} from '@angular/material/table';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MatInputModule
} from '@angular/material/input';

import {
  MatFormFieldModule
} from '@angular/material/form-field';

import {
  MatDialog,
  MatDialogModule
} from '@angular/material/dialog';

import {
  MatSelectModule
} from '@angular/material/select';

import {
  MatPaginator,
  MatPaginatorModule
} from '@angular/material/paginator';

import {
  MatSort,
  MatSortModule
} from '@angular/material/sort';

import {
  MatSnackBar,
  MatSnackBarModule
} from '@angular/material/snack-bar';

import {
  Activity,
  ActivityService
} from '../../../../core/services/activity.service';

import {
  EditActivityDialog
} from '../edit-activity-dialog/edit-activity-dialog';

import {
  DeleteConfirmDialog
} from '../delete-confirm-dialog/delete-confirm-dialog';


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

  templateUrl:
    './activity-table.html',

  styleUrl:
    './activity-table.css'

})
export class ActivityTable
  implements AfterViewInit {


  private dialog =
    inject(MatDialog);


  private activityService =
    inject(ActivityService);


  private snackBar =
    inject(MatSnackBar);


  search = '';

  selectedCategory = 'All';

  selectedDate = '';

  minCarbon = 0;


  categories = [

    'All',

    'Transportation',

    'Electricity',

    'Food',

    'Waste',

    'Water',

    'Shopping',

    'Others'

  ];


  displayedColumns = [

    'activity',

    'category',

    'quantity',

    'unit',

    'carbon',

    'date',

    'action'

  ];


  dataSource =
    new MatTableDataSource<Activity>([]);


  @ViewChild(MatPaginator)
  paginator!: MatPaginator;


  @ViewChild(MatSort)
  sort!: MatSort;


  constructor() {


    this.activityService
      .activities$
      .subscribe(() => {

        this.loadData();

      });

  }


  ngAfterViewInit(): void {

    this.dataSource.paginator =
      this.paginator;

    this.dataSource.sort =
      this.sort;

  }


  loadData(): void {


    let list =
      this.activityService
        .getActivities();


    if (
      this.selectedCategory !==
      'All'
    ) {

      list =
        list.filter(
          item =>
            item.category ===
            this.selectedCategory
        );

    }


    if (this.selectedDate) {

      list =
        list.filter(item => {

          const date =
            new Date(item.date);

          const year =
            date.getFullYear();

          const month =
            String(
              date.getMonth() + 1
            ).padStart(2, '0');

          const day =
            String(
              date.getDate()
            ).padStart(2, '0');

          const localDate =
            `${year}-${month}-${day}`;


          return (
            localDate ===
            this.selectedDate
          );

        });

    }


    if (this.minCarbon > 0) {

      list =
        list.filter(
          item =>
            item.carbon >=
            this.minCarbon
        );

    }


    if (this.search.trim()) {


      const search =
        this.search
          .trim()
          .toLowerCase();


      list =
        list.filter(item =>

          item.title
            .toLowerCase()
            .includes(search)

          ||

          item.category
            .toLowerCase()
            .includes(search)

          ||

          item.unit
            .toLowerCase()
            .includes(search)

        );

    }


    this.dataSource.data =
      list;

  }


  resetFilters(): void {

    this.search = '';

    this.selectedCategory =
      'All';

    this.selectedDate = '';

    this.minCarbon = 0;

    this.loadData();

  }


  edit(
    activity: Activity
  ): void {


    this.dialog
      .open(
        EditActivityDialog,
        {
          width: '550px',
          data: {
            ...activity
          }
        }
      )
      .afterClosed()
      .subscribe(result => {

        if (result) {

          this.loadData();

        }

      });

  }


  delete(
    activity: Activity
  ): void {


    this.dialog
      .open(
        DeleteConfirmDialog,
        {
          width: '420px',
          data: activity.title
        }
      )
      .afterClosed()
      .subscribe(result => {


        if (!result) {

          return;

        }


        this.activityService
          .deleteActivity(
            activity.id
          )
          .subscribe({

            next: () => {

              this.loadData();


              this.snackBar.open(
                'Activity Deleted Successfully',
                'Close',
                {
                  duration: 3000,

                  horizontalPosition:
                    'right',

                  verticalPosition:
                    'top'

                }
              );

            },


            error: (error) => {

              console.error(
                'Delete failed:',
                error
              );


              this.snackBar.open(
                'Failed to delete activity.',
                'Close',
                {
                  duration: 3000,

                  horizontalPosition:
                    'right',

                  verticalPosition:
                    'top'

                }
              );

            }

          });

      });

  }


  exportCSV(): void {


    const rows =
      this.dataSource.data;


    const escapeCSV =
      (value: unknown): string => {

        const text =
          String(
            value ?? ''
          );


        return `"${text.replace(
          /"/g,
          '""'
        )}"`;

      };


    let csv =
      'Activity,Category,Quantity,Unit,Carbon Emission,Date\n';


    rows.forEach(row => {


      csv += [

        escapeCSV(row.title),

        escapeCSV(row.category),

        escapeCSV(row.quantity),

        escapeCSV(row.unit),

        escapeCSV(row.carbon),

        escapeCSV(row.date)

      ].join(',') + '\n';

    });


    const blob =
      new Blob(
        [csv],
        {
          type:
            'text/csv;charset=utf-8;'
        }
      );


    const url =
      window.URL.createObjectURL(
        blob
      );


    const anchor =
      document.createElement('a');


    anchor.href = url;

    anchor.download =
      'activities.csv';


    anchor.click();


    window.URL.revokeObjectURL(
      url
    );


    this.snackBar.open(
      'CSV Exported Successfully',
      'Close',
      {
        duration: 3000,

        horizontalPosition:
          'right',

        verticalPosition:
          'top'

      }
    );

  }

}
