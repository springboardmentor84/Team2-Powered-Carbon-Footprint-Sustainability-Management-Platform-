import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

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

  currentDate = new Date();

  monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  weekDays = [
    'S','M','T','W','T','F','S'
  ];

  days:number[]=[];

  constructor(){

    this.generateCalendar();

  }

  get month(){

    return this.monthNames[this.currentDate.getMonth()];

  }

  get year(){

    return this.currentDate.getFullYear();

  }

  previousMonth(){

    this.currentDate = new Date(

      this.currentDate.getFullYear(),

      this.currentDate.getMonth()-1,

      1

    );

    this.generateCalendar();

  }

  nextMonth(){

    this.currentDate = new Date(

      this.currentDate.getFullYear(),

      this.currentDate.getMonth()+1,

      1

    );

    this.generateCalendar();

  }

  generateCalendar(){

    this.days=[];

    const totalDays = new Date(

      this.currentDate.getFullYear(),

      this.currentDate.getMonth()+1,

      0

    ).getDate();

    for(let i=1;i<=totalDays;i++){

      this.days.push(i);

    }

  }

  isToday(day:number){

    const today=new Date();

    return (

      today.getDate()==day &&

      today.getMonth()==this.currentDate.getMonth() &&

      today.getFullYear()==this.currentDate.getFullYear()

    );

  }

}
