import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

import { ActivityService } from '../../../core/services/activity.service';

@Component({
  selector: 'app-profile-widget',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  templateUrl: './profile-widget.html',
  styleUrl: './profile-widget.css'
})
export class ProfileWidget {

  private activityService = inject(ActivityService);

  user = {

    id:1,

    name:'Harshit Rai',

    email:'harshit@ecotrack.com',

    memberSince:'July 2026',

    avatar:'https://ui-avatars.com/api/?name=Harshit+Rai&background=2E7D32&color=fff&size=256'

  };

  get carbon(){

    return this.activityService.getCarbonSaved().toFixed(1);

  }

  get score(){

    return this.activityService.getSustainabilityScore();

  }

  get activities(){

    return this.activityService.getActivities().length;

  }

  get ecoLevel(){

    const score=this.score;

    if(score<30) return 'Eco Beginner';

    if(score<60) return 'Green Explorer';

    if(score<80) return 'Eco Hero';

    return 'Eco Champion';

  }

  editProfile(){

    alert('Profile API will be connected here.');

  }

}
