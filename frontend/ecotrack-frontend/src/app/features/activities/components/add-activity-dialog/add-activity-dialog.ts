import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

import { ActivityService } from '../../../../core/services/activity.service';

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
  templateUrl: './add-activity-dialog.html',
  styleUrl: './add-activity-dialog.css'
})
export class AddActivityDialog {

  constructor(
    private dialogRef: MatDialogRef<AddActivityDialog>,
    private activityService: ActivityService
  ) {}

  activity = {
    title: '',
    category: '',
    carbon: 0,
    date: '',
    notes: ''
  };

  save() {

    this.activityService.addActivity(this.activity);

    this.dialogRef.close();

  }

  cancel() {

    this.dialogRef.close();

  }

}
