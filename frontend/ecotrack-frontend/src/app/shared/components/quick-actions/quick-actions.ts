import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { AddActivityDialog } from '../../../features/activities/components/add-activity-dialog/add-activity-dialog';

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  templateUrl: './quick-actions.html',
  styleUrl: './quick-actions.css'
})
export class QuickActions {

  private dialog = inject(MatDialog);
  private router = inject(Router);

  addActivity(){

    this.dialog.open(AddActivityDialog,{
      width:'500px'
    });

  }

  openActivities(){

    this.router.navigate(['/activities']);

  }

  openDashboard(){

    this.router.navigate(['/dashboard']);

  }

  reports(){

    alert('Reports Module Coming Soon');

  }

}
