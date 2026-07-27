import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

import { ActivityService } from '../../../core/services/activity.service';

@Component({
  selector: 'app-calendar-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  templateUrl: './calendar-card.html',
  styleUrl: './calendar-card.css'
})
export class CalendarCard {

  private activityService = inject(ActivityService);

  currentDate = new Date();

  selectedDay: number | null = null;

  monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  weekDays = [
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat'
  ];

  days: number[] = [];

  constructor() {

    this.generateCalendar();

  }

  get month(): string {

    return this.monthNames[this.currentDate.getMonth()];

  }

  get year(): number {

    return this.currentDate.getFullYear();

  }

  previousMonth(): void {

    this.currentDate = new Date(

      this.currentDate.getFullYear(),

      this.currentDate.getMonth() - 1,

      1

    );

    this.selectedDay = null;

    this.generateCalendar();

  }

  nextMonth(): void {

    this.currentDate = new Date(

      this.currentDate.getFullYear(),

      this.currentDate.getMonth() + 1,

      1

    );

    this.selectedDay = null;

    this.generateCalendar();

  }

  generateCalendar(): void {

    this.days = [];

    const totalDays = new Date(

      this.currentDate.getFullYear(),

      this.currentDate.getMonth() + 1,

      0

    ).getDate();

    for (let i = 1; i <= totalDays; i++) {

      this.days.push(i);

    }

  }

  isToday(day: number): boolean {

    const today = new Date();

    return (

      today.getDate() === day &&

      today.getMonth() === this.currentDate.getMonth() &&

      today.getFullYear() === this.currentDate.getFullYear()

    );

  }

  hasActivity(day: number): boolean {

    const month = this.currentDate.getMonth();

    const year = this.currentDate.getFullYear();

    return this.activityService

      .getActivities()

      .some(activity => {

        const d = new Date(activity.date);

        return (

          d.getDate() === day &&

          d.getMonth() === month &&

          d.getFullYear() === year

        );

      });

  }

  selectDay(day: number): void {

    this.selectedDay = day;

  }

  getActivityCount(day: number): number {

    const month = this.currentDate.getMonth();

    const year = this.currentDate.getFullYear();

    return this.activityService

      .getActivities()

      .filter(activity => {

        const d = new Date(activity.date);

        return (

          d.getDate() === day &&

          d.getMonth() === month &&

          d.getFullYear() === year

        );

      }).length;

  }

}

