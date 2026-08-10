import {
  Component,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import {
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';

import {
  MatFormFieldModule
} from '@angular/material/form-field';

import {
  MatInputModule
} from '@angular/material/input';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MatSelectModule
} from '@angular/material/select';

import {
  ActivityService
} from '../../../../core/services/activity.service';


@Component({
  selector: 'app-add-activity-dialog',

  standalone: true,

  imports: [

    CommonModule,

    FormsModule,

    MatDialogModule,

    MatFormFieldModule,

    MatInputModule,

    MatButtonModule,

    MatSelectModule

  ],

  templateUrl:
    './add-activity-dialog.html',

  styleUrl:
    './add-activity-dialog.css'

})
export class AddActivityDialog {


  private dialogRef =
    inject(MatDialogRef<AddActivityDialog>);


  private activityService =
    inject(ActivityService);


  category = '';

  activity = '';

  quantity: number | null = null;

  unit = '';

  saving = false;

  errorMessage = '';


  categories = [

    'Transportation',

    'Electricity',

    'Food',

    'Waste',

    'Water',

    'Shopping',

    'Others'

  ];


  units = [

    'km',

    'kWh',

    'kg',

    'litre',

    'minutes',

    'hours',

    'units'

  ];


  save(): void {


    console.log(
      'SAVE BUTTON CLICKED'
    );


    this.errorMessage = '';


    if (!this.category) {

      this.errorMessage =
        'Please select a category.';

      return;

    }


    if (!this.activity.trim()) {

      this.errorMessage =
        'Please enter an activity.';

      return;

    }


    if (
      this.quantity === null ||
      this.quantity <= 0
    ) {

      this.errorMessage =
        'Please enter a quantity greater than 0.';

      return;

    }


    if (!this.unit) {

      this.errorMessage =
        'Please select a unit.';

      return;

    }


    this.saving = true;


    const request = {

      category: this.category,

      activity:
        this.activity.trim(),

      quantity:
        Number(this.quantity),

      unit:
        this.unit

    };


    console.log(
      'SENDING ACTIVITY:',
      request
    );


    this.activityService
      .addActivity({

        title:
          request.activity,

        activity:
          request.activity,

        category:
          request.category,

        quantity:
          request.quantity,

        unit:
          request.unit,

        carbon: 0,

        date:
          new Date().toISOString(),

        notes: ''

      })

      .subscribe({

        next: (response) => {


          console.log(
            'ACTIVITY SAVED SUCCESSFULLY:',
            response
          );


          this.saving = false;


          this.dialogRef.close(
            response
          );

        },


        error: (error) => {


          console.error(
            'ACTIVITY SAVE FAILED:',
            error
          );


          this.saving = false;


          if (error.status === 400) {

            this.errorMessage =
              error.error?.message ||
              error.error?.error ||
              'Invalid activity data. Check category, quantity and unit.';

          }

          else if (error.status === 401) {

            this.errorMessage =
              'Session expired. Please login again.';

          }

          else if (error.status === 403) {

            this.errorMessage =
              'You are not authorized to save activities.';

          }

          else if (error.status === 0) {

            this.errorMessage =
              'Backend is not reachable. Start Spring Boot.';

          }

          else {

            this.errorMessage =
              error.error?.message ||
              error.error?.error ||
              'Failed to save activity.';

          }

        }

      });

  }


  cancel(): void {

    this.dialogRef.close();

  }

}
