import {
  Component,
  Inject,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

import {
  ActivityService
} from '../../../../core/services/activity.service';

import {
  Activity
} from '../../../../core/models/activity.model';


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
    MatSelectModule,
    MatIconModule
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


  isEditMode = false;

  editingActivity?: Activity;


  categories = [
    {
      label: 'Transportation',
      value: 'TRANSPORT'
    },
    {
      label: 'Electricity',
      value: 'ELECTRICITY'
    },
    {
      label: 'Food',
      value: 'FOOD'
    },
    {
      label: 'Waste',
      value: 'WASTE'
    },
    {
      label: 'Water',
      value: 'WATER'
    },
    {
      label: 'Shopping',
      value: 'SHOPPING'
    },
    {
      label: 'Other',
      value: 'OTHER'
    }
  ];


  units = [
    'km',
    'kWh',
    'kg',
    'litre',
    'minutes',
    'hours',
    'units',
    'activity'
  ];


  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      mode?: string;
      activity?: Activity;
    }
  ) {

    if (
      data?.mode === 'edit' &&
      data.activity
    ) {

      this.isEditMode = true;

      this.editingActivity =
        data.activity;

      this.category =
        data.activity.category;

      this.activity =
        data.activity.title;

      this.quantity =
        data.activity.quantity;

      this.unit =
        data.activity.unit;
    }
  }


  save(): void {
    if (this.saving) return;

    this.errorMessage = '';

    // -----------------------------
    // VALIDATION
    // -----------------------------

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


    // ============================================
    // EDIT EXISTING ACTIVITY
    // ============================================

    if (
      this.isEditMode &&
      this.editingActivity?.id
    ) {

      const updatedActivity: Activity = {

        ...this.editingActivity,

        title:
          this.activity.trim(),

        activity:
          this.activity.trim(),

        category:
          this.category,

        quantity:
          this.quantity,

        unit:
          this.unit
      };


      this.activityService
        .updateActivity(updatedActivity)
        .subscribe({

          next: response => {

            console.log(
              'ACTIVITY UPDATED SUCCESSFULLY:',
              response
            );

            this.saving = false;

            this.dialogRef.close(
              response
            );
          },


          error: error => {

            console.error(
              'ACTIVITY UPDATE FAILED:',
              error
            );

            this.saving = false;

            this.handleError(error);
          }

        });


      return;
    }


    // ============================================
    // CREATE NEW ACTIVITY
    // ============================================

    const newActivity:
      Omit<Activity, 'id'> = {

      title:
        this.activity.trim(),

      activity:
        this.activity.trim(),

      category:
        this.category,

      carbon:
        0,

      carbonEmission:
        0,

      date:
        new Date().toISOString(),

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString(),

      notes:
        '',

      quantity:
        this.quantity,

      unit:
        this.unit
    };


    this.activityService
      .addActivity(newActivity)
      .subscribe({

        next: response => {

          console.log(
            'ACTIVITY CREATED SUCCESSFULLY:',
            response
          );

          this.saving = false;

          this.dialogRef.close(
            response
          );
        },


        error: error => {

          console.error(
            'ACTIVITY CREATE FAILED:',
            error
          );

          this.saving = false;

          this.handleError(error);
        }

      });
  }


  private handleError(error: any): void {

    if (error?.status === 400) {

      this.errorMessage =
        error.error?.message ||
        error.error?.error ||
        'Invalid activity data.';

    }

    else if (error?.status === 401) {

      this.errorMessage =
        'Session expired. Please login again.';

    }

    else if (error?.status === 403) {

      this.errorMessage =
        'You are not authorized for this operation.';

    }

    else if (error?.status === 404) {

      this.errorMessage =
        'Activity was not found.';

    }

    else if (error?.status === 0) {

      this.errorMessage =
        'Backend is not reachable.';

    }

    else {

      this.errorMessage =
        error.error?.message ||
        'Operation failed.';
    }
  }


  cancel(): void {

    this.dialogRef.close();
  }
}
