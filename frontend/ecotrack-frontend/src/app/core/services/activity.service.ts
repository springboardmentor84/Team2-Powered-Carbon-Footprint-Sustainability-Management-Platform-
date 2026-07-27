import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface Activity {
  id: number;
  userId?: number;
  title: string;
  category: string;
  carbon: number;
  date: string;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  private readonly STORAGE_KEY = 'ecotrack_activities';

  private readonly activitiesSubject =
    new BehaviorSubject<Activity[]>(this.loadActivities());

  readonly activities$ = this.activitiesSubject.asObservable();

  constructor() {
    this.persist();
  }

  // ============================
  // Repository Layer (Temporary)
  // Replace ONLY these methods later
  // ============================

  private loadActivities(): Activity[] {

    const data = localStorage.getItem(this.STORAGE_KEY);

    if (data) {
      return JSON.parse(data);
    }

    const defaultActivities: Activity[] = [

      {
        id: 1,
        userId: 1,
        title: 'Walk 4 km',
        category: 'Walking',
        carbon: 2.5,
        date: '2026-07-26',
        notes: 'Morning Walk',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },

      {
        id: 2,
        userId: 1,
        title: 'Recycled Plastic',
        category: 'Recycling',
        carbon: 1.8,
        date: '2026-07-25',
        notes: 'Home Recycling',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

    ];

    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(defaultActivities)
    );

    return defaultActivities;

  }

  private persist(): void {

    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(this.activitiesSubject.value)
    );

  }

  // ============================
  // API READY METHODS
  // ============================

  getActivities(): Activity[] {
    return this.activitiesSubject.value;
  }

  getActivities$(): Observable<Activity[]> {
    return this.activities$;
  }

  getActivityById(id: number): Observable<Activity | undefined> {
    return of(
      this.activitiesSubject.value.find(x => x.id === id)
    );
  }

  addActivity(activity: Omit<Activity, 'id'>): void {

    const newActivity: Activity = {

      id: Date.now(),

      createdAt: new Date().toISOString(),

      updatedAt: new Date().toISOString(),

      ...activity

    };

    this.activitiesSubject.next([
      newActivity,
      ...this.activitiesSubject.value
    ]);
    this.persist();

  }

  updateActivity(updated: Activity): void {

    const list = this.activitiesSubject.value.map(item =>

      item.id === updated.id

        ? {
            ...updated,
            updatedAt: new Date().toISOString()
          }

        : item

    );

    this.activitiesSubject.next(list);

    this.persist();

  }

  deleteActivity(id: number): void {

    this.activitiesSubject.next(

      this.activitiesSubject.value.filter(
        activity => activity.id !== id
      )

    );

    this.persist();

  }

  clearAllActivities(): void {

    this.activitiesSubject.next([]);

    this.persist();

  }

  // ============================
  // Dashboard Helpers
  // ============================

  getCarbonSaved(): number {

    return this.activitiesSubject.value.reduce(

      (sum, item) => sum + item.carbon,

      0

    );

  }

  getActivityCount(): number {

    return this.activitiesSubject.value.length;

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

  getGoalProgress(goal = 100): number {

    return Math.min(

      Math.round((this.getCarbonSaved() / goal) * 100),

      100

    );

  }

}
