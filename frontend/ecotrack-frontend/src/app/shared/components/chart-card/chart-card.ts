import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-chart-card',
  standalone: true,
  imports: [],
  templateUrl: './chart-card.html',
  styleUrl: './chart-card.css'
})
export class ChartCard implements AfterViewInit {

  @ViewChild('chartCanvas')
  chartCanvas!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void {

    new Chart(this.chartCanvas.nativeElement,{

      type:'line',

      data:{

        labels:[
          'Mon',
          'Tue',
          'Wed',
          'Thu',
          'Fri',
          'Sat',
          'Sun'
        ],

        datasets:[{

          label:'Carbon Saved',

          data:[4,6,5,9,10,12,15],

          borderWidth:3,

          tension:.4

        }]

      },

      options:{

        responsive:true,

        maintainAspectRatio:false

      }

    });

  }

}
