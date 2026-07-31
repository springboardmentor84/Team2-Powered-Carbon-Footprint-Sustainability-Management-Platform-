import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-reports-charts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports-charts.html',
  styleUrl: './reports-charts.css'
})
export class ReportsCharts implements AfterViewInit {

  @ViewChild('barChart')
  barChart!: ElementRef<HTMLCanvasElement>;

  @ViewChild('lineChart')
  lineChart!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void {

    new Chart(this.barChart.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Jan','Feb','Mar','Apr','May','Jun'],
        datasets: [
          {
            label: 'Carbon Saved (kg)',
            data: [18,25,31,28,42,55]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

    new Chart(this.lineChart.nativeElement, {
      type: 'line',
      data: {
        labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
        datasets: [
          {
            label: 'Daily Carbon',
            data: [2,5,3,6,4,8,7],
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

  }

}
