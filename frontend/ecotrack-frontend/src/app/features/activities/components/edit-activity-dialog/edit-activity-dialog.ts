import { Component, Inject } from '@angular/core';

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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ActivityService } from '../../../../core/services/activity.service';
import { Activity } from '../../../../core/models/activity.model';

@Component({
  selector: 'app-edit-activity-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  templateUrl: './edit-activity-dialog.html',
  styleUrl: './edit-activity-dialog.css'
})
export class EditActivityDialog {

  constructor(
    private dialogRef: MatDialogRef<EditActivityDialog>,
    private activityService: ActivityService,
    private snackBar: MatSnackBar,

    @Inject(MAT_DIALOG_DATA)
    public activity: Activity
  ) {}

  save(): void {

    this.activityService.updateActivity(this.activity);

    this.snackBar.open(
      'Activity Updated Successfully',
      'Close',
      {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      }
    );

    this.dialogRef.close(true);

  }

  cancel(): void {

    this.dialogRef.close(false);

  }

}
