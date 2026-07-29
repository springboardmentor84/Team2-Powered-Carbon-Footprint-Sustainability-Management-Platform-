import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { EditProfileDialog } from '../edit-profile-dialog/edit-profile-dialog';

@Component({
  selector: 'app-profile-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './profile-card.html',
  styleUrl: './profile-card.css'
})
export class ProfileCard {

  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  user = {

    name: 'Harshit Rai',

    email: 'harshit23btaml34@gmail.com',

    level: 'Eco Champion',

    joined: 'July 2026',

    carbon: '128 kg',

    streak: '15 Days',

    score: '86%'

  };

  editProfile() {

    this.dialog.open(EditProfileDialog, {

      width: '520px',

      data: { ...this.user }

    }).afterClosed().subscribe(result => {

      if(result){

        this.user = result;

        this.snackBar.open(

          'Profile Updated Successfully',

          'Close',

          {

            duration:3000,

            horizontalPosition:'right',

            verticalPosition:'top'

          }

        );

      }

    });

  }

}
