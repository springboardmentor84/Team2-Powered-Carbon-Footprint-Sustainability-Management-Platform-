import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

import Chart from 'chart.js/auto';

@Component({
  selector: 'app-reports-charts',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  templateUrl: './reports-charts.html',
  styleUrl: './reports-charts.css'
})
export class ReportsCharts implements AfterViewInit {

  @ViewChild('reportChart')
  chartCanvas!: ElementRef<HTMLCanvasElement>;

  chart!: Chart;

  ngAfterViewInit(): void {

    this.chart = new Chart(
      this.chartCanvas.nativeElement,
      {
        type: 'line',

        data: {

          labels: [
            'Mon',
            'Tue',
            'Wed',
            'Thu',
            'Fri',
            'Sat',
            'Sun'
          ],

          datasets: [

            {

              label: 'Carbon Saved (kg)',

              data: [
                5,
                7,
                6,
                9,
                10,
                8,
                12
              ],

              borderColor: '#2E7D32',

              backgroundColor: 'rgba(46,125,50,.15)',

              fill: true,

              tension: .35

            }

          ]

        },

        options: {

          responsive: true,

          maintainAspectRatio: false

        }

      }

    );

  }

}
