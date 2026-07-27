import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { ActivityService } from '../../../core/services/activity.service';

@Component({
  selector: 'app-recent-activities',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  templateUrl: './recent-activities.html',
  styleUrl: './recent-activities.css'
})
export class RecentActivities {

  private activityService = inject(ActivityService);

  get activities() {

    return this.activityService
      .getActivities()
      .slice(0,5);

  }

  getIcon(category:string){

    switch(category.toLowerCase()){

      case 'walking':
        return '🚶';

      case 'cycling':
        return '🚴';

      case 'recycling':
        return '♻';

      case 'transport':
        return '🚌';

      case 'food':
        return '🥗';

      case 'water':
        return '💧';

      case 'electricity':
        return '⚡';

      default:
        return '🌱';

    }

  }

}
