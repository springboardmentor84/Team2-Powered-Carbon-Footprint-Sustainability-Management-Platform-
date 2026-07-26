import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Activity {
  id: number;
  title: string;
  category: string;
  carbon: number;
  date: string;
  notes: string;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  private STORAGE_KEY = 'ecotrack_activities';

  private activitiesSubject = new BehaviorSubject<Activity[]>(this.loadActivities());

  activities$ = this.activitiesSubject.asObservable();

  constructor() {
    this.saveActivities();
  }

  private loadActivities(): Activity[] {

    const data = localStorage.getItem(this.STORAGE_KEY);

    if (data) {
      return JSON.parse(data);
    }

    const defaultActivities: Activity[] = [

      {
        id: 1,
        title: 'Walk 4 km',
        category: 'Walking',
        carbon: 2.5,
        date: '2026-07-26',
        notes: 'Morning Walk'
      },

      {
        id: 2,
        title: 'Recycled Plastic',
        category: 'Recycling',
        carbon: 1.8,
        date: '2026-07-25',
        notes: 'Home Recycling'
      }

    ];

    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(defaultActivities)
    );

    return defaultActivities;

  }

  private saveActivities() {

    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(this.activitiesSubject.value)
    );

  }

  getActivities(): Activity[] {

    return this.activitiesSubject.value;

  }

  addActivity(activity: Omit<Activity, 'id'>) {

    const newActivity: Activity = {

      id: Date.now(),

      ...activity

    };

    const list = [

      newActivity,

      ...this.activitiesSubject.value

    ];

    this.activitiesSubject.next(list);

    this.saveActivities();

  }

  updateActivity(updated: Activity) {

    const list = this.activitiesSubject.value.map(item =>

      item.id === updated.id ? updated : item

    );

    this.activitiesSubject.next(list);

    this.saveActivities();

  }

  deleteActivity(id: number) {

    const list = this.activitiesSubject.value.filter(

      item => item.id !== id

    );

    this.activitiesSubject.next(list);

    this.saveActivities();

  }

  clearAllActivities() {

    this.activitiesSubject.next([]);

    this.saveActivities();

  }

  // -------------------------
  // Dashboard Helper Methods
  // -------------------------

  getCarbonSaved(): number {

    return this.activitiesSubject.value.reduce(

      (sum, item) => sum + item.carbon,

      0

    );

  }

  getSustainabilityScore(): number {

    let score = 0;

    this.activitiesSubject.value.forEach(item => {

      switch (item.category.toLowerCase()) {

        case 'walking':
          score += 5;
          break;

        case 'cycling':
          score += 8;
          break;

        case 'recycling':
          score += 4;
          break;

        case 'transport':
          score += 6;
          break;

        case 'food':
          score += 3;
          break;

        case 'electricity':
          score += 5;
          break;

        case 'water':
          score += 4;
          break;

        default:
          score += 2;

      }

    });

    return Math.min(score, 100);

  }

  getGoalProgress(): number {

    const carbon = this.getCarbonSaved();

    return Math.min(

      Math.round((carbon / 100) * 100),

      100

    );

  }

}
