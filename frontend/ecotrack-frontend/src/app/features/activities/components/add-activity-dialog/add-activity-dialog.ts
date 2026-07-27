import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

import { ActivityService } from '../../../../core/services/activity.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
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
    MatSnackBarModule,
    MatSelectModule
  ],
  templateUrl: './add-activity-dialog.html',
  styleUrl: './add-activity-dialog.css'
})
export class AddActivityDialog {

constructor(
private dialogRef: MatDialogRef<AddActivityDialog>,
private activityService: ActivityService,
private snackBar: MatSnackBar
){}

  categories = [
    'Walking',
    'Cycling',
    'Recycling',
    'Transport',
    'Food',
    'Electricity',
    'Water',
    'Waste'
  ];

  activity = {
    userId: 1,
    title: '',
    category: '',
    carbon: 0,
    date: new Date().toISOString().substring(0, 10),
    notes: ''
  };

  save(): void {

    if (
      !this.activity.title.trim() ||
      !this.activity.category ||
      this.activity.carbon <= 0 ||
      !this.activity.date
    ) {
      return;
    }

    this.activityService.addActivity({
      userId: this.activity.userId,
      title: this.activity.title.trim(),
      category: this.activity.category,
      carbon: Number(this.activity.carbon),
      date: this.activity.date,
      notes: this.activity.notes.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    this.snackBar.open(
      'Activity Added Successfully',
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

  resetForm(): void {

    this.activity = {
      userId: 1,
      title: '',
      category: '',
      carbon: 0,
      date: new Date().toISOString().substring(0, 10),
      notes: ''
    };

  }

}
