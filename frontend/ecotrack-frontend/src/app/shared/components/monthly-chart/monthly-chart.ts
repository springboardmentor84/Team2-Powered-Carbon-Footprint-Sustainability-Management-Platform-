import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChild,
  inject
} from '@angular/core';

import { MatCardModule } from '@angular/material/card';

import { Chart } from 'chart.js/auto';

import { ActivityService } from '../../../core/services/activity.service';

import { MonthlyCarbonSummary } from '../../../core/models/dashboard.model';

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

  createChart(): void {

    const monthlyData = this.getMonthlySummary();

    this.chart = new Chart(this.monthlyChart.nativeElement, {

      type: 'bar',

      data: {

        labels: monthlyData.map(item => item.month),

        datasets: [

          {

            label: 'Carbon Saved (kg)',

            data: monthlyData.map(item => item.carbonSaved),

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

  private getMonthlySummary(): MonthlyCarbonSummary[] {

    const months = [

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

    ];

    const totals = new Array(12).fill(0);

    this.activityService.getActivities().forEach(activity => {

      const month = new Date(activity.date).getMonth();

      totals[month] += activity.carbon;

    });

    return months.map((month, index) => ({

      month,

      carbonSaved: totals[index]

    }));

  }

}
