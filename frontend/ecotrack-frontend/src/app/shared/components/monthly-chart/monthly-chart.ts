import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChild,
  inject
} from '@angular/core';

import { Chart } from 'chart.js/auto';
import { MatCardModule } from '@angular/material/card';
import { ActivityService } from '../../../core/services/activity.service';

@Component({
  selector: 'app-monthly-chart',
  standalone: true,

  imports: [
    MatCardModule
  ],

  templateUrl: './monthly-chart.html',
  styleUrl: './monthly-chart.css'
})
export class MonthlyChart implements AfterViewInit {

  @ViewChild('monthlyChart')
  monthlyChart!: ElementRef<HTMLCanvasElement>;

  private activityService = inject(ActivityService);

  chart!: Chart;

  ngAfterViewInit(): void {

    this.createChart();

  }

  createChart() {

    this.chart = new Chart(this.monthlyChart.nativeElement, {

      type: 'bar',

      data: {

        labels: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec'
        ],

        datasets: [

          {

            label: 'Carbon Saved (kg)',

            data: this.getMonthlyData(),

            backgroundColor: '#43A047',

            borderRadius: 8

          }

        ]

      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        animation: {

          duration: 1500

        },

        plugins: {

          legend: {

            display: false

          }

        },

        scales: {

          y: {

            beginAtZero: true

          }

        }

      }

    });

  }

  getMonthlyData(): number[] {

    const totals = new Array(12).fill(0);

    const list = this.activityService.getActivities();

    list.forEach(activity => {

      const month = new Date(activity.date).getMonth();

      totals[month] += activity.carbon;

    });

    return totals;

  }

}
