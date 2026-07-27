import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { ActivityService } from '../../../core/services/activity.service';

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

  private activityService = inject(ActivityService);

  addActivity(){

    this.dialog.open(AddActivityDialog,{
      width:'520px'
    });

  }

  openActivities(){

    this.router.navigate(['/activities']);

  }

  openDashboard(){

    this.router.navigate(['/dashboard']);

  }

  exportCSV(){

    const rows=this.activityService.getActivities();

    let csv='Activity,Category,Carbon Saved,Date,Notes\n';

    rows.forEach(r=>{

      csv+=`${r.title},${r.category},${r.carbon},${r.date},${r.notes}\n`;

    });

    const blob=new Blob([csv],{type:'text/csv'});

    const url=window.URL.createObjectURL(blob);

    const a=document.createElement('a');

    a.href=url;

    a.download='EcoTrack-Activities.csv';

    a.click();

    window.URL.revokeObjectURL(url);

  }

  clearActivities(){

    const ok=confirm('Delete all activities?');

    if(ok){

      this.activityService.clearAllActivities();

    }

  }

  syncData(){

    alert('Backend API will sync data here.');

  }

  reports(){

    alert('Reports module will be connected with backend.');

  }

}
