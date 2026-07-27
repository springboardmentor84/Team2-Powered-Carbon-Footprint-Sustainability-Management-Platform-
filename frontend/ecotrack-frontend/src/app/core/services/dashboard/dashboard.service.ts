import { Injectable, inject } from '@angular/core';
import { ActivityService } from '../activity.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private activityService = inject(ActivityService);

  // ==========================
  // Statistics
  // ==========================

  getDashboardStats() {

    return {

      carbonSaved: this.activityService.getCarbonSaved(),

      activities: this.activityService.getActivities().length,

      sustainabilityScore: this.activityService.getSustainabilityScore(),

      goalProgress: this.activityService.getGoalProgress()

    };

  }

  // ==========================
  // Weekly Chart
  // ==========================

  getWeeklyCarbonData(): number[] {

    const totals = [0,0,0,0,0,0,0];

    this.activityService.getActivities().forEach(activity=>{

      const date = new Date(activity.date);

      let day = date.getDay();

      day = day===0 ? 6 : day-1;

      totals[day]+=activity.carbon;

    });

    return totals;

  }

  // ==========================
  // Monthly Chart
  // ==========================

  getMonthlyCarbonData(): number[] {

    const totals = new Array(12).fill(0);

    this.activityService.getActivities().forEach(activity=>{

      const month = new Date(activity.date).getMonth();

      totals[month]+=activity.carbon;

    });

    return totals;

  }

  // ==========================
  // Recent Activities
  // ==========================

  getRecentActivities(limit:number=5){

    return this.activityService

      .getActivities()

      .slice(0,limit);

  }

  // ==========================
  // Notifications
  // ==========================

  getNotifications(){

    const notifications=[];

    const carbon=this.activityService.getCarbonSaved();

    const score=this.activityService.getSustainabilityScore();

    const activities=this.activityService.getActivities().length;

    if(carbon>=100){

      notifications.push({

        icon:'🏆',

        title:'Weekly Goal Achieved',

        description:'Congratulations!'

      });

    }else{

      notifications.push({

        icon:'🎯',

        title:'Goal Progress',

        description:`${(100-carbon).toFixed(1)} kg remaining`

      });

    }

    if(score>=80){

      notifications.push({

        icon:'🌱',

        title:'Excellent Sustainability',

        description:'Keep it up.'

      });

    }

    if(activities===0){

      notifications.push({

        icon:'📢',

        title:'No Activities',

        description:'Add your first activity.'

      });

    }

    return notifications;

  }

  // ==========================
  // AI Recommendation
  // ==========================

  getRecommendation(){

    const score=this.activityService.getSustainabilityScore();

    if(score<30){

      return{

        icon:'🚶',

        title:'Walk More',

        saving:'≈2kg/day'

      };

    }

    if(score<60){

      return{

        icon:'🚴',

        title:'Cycle More',

        saving:'≈3kg/day'

      };

    }

    if(score<80){

      return{

        icon:'♻',

        title:'Recycle More',

        saving:'≈1.5kg/day'

      };

    }

    return{

      icon:'🌱',

      title:'Excellent',

      saving:'Maintain your lifestyle'

    };

  }

  // ==========================
  // Streak
  // ==========================

  getCurrentStreak():number{

    const activities=[

      ...this.activityService.getActivities()

    ].sort(

      (a,b)=>

      new Date(b.date).getTime()

      -

      new Date(a.date).getTime()

    );

    if(!activities.length){

      return 0;

    }

    let streak=1;

    for(let i=1;i<activities.length;i++){

      const prev=new Date(activities[i-1].date);

      const curr=new Date(activities[i].date);

      const diff=Math.floor(

        (prev.getTime()-curr.getTime())

        /(1000*60*60*24)

      );

      if(diff===1){

        streak++;

      }else{

        break;

      }

    }

    return streak;

  }

  // ==========================
  // Achievements
  // ==========================

  getUnlockedBadges(){

    const carbon=this.activityService.getCarbonSaved();

    const score=this.activityService.getSustainabilityScore();

    const activities=this.activityService.getActivities().length;

    let badges=0;

    if(activities>=1) badges++;

    if(activities>=5) badges++;

    if(carbon>=20) badges++;

    if(score>=60) badges++;

    if(score>=90) badges++;

    return badges;

  }

}
