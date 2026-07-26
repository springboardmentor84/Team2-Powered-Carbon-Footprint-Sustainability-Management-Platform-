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

import {
  Activity,
  ActivityService
} from '../../../../core/services/activity.service';

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
    MatSelectModule
  ],
  templateUrl: './edit-activity-dialog.html',
  styleUrl: './edit-activity-dialog.css'
})
export class EditActivityDialog {

  constructor(
    private dialogRef: MatDialogRef<EditActivityDialog>,
    private activityService: ActivityService,

    @Inject(MAT_DIALOG_DATA)
    public activity: Activity
  ) {}

  save() {

    this.activityService.updateActivity(this.activity);

    this.dialogRef.close();

  }

  cancel() {

    this.dialogRef.close();

  }

}
