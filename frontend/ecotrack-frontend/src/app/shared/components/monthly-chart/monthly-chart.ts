import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject
} from '@angular/core';

import {
  MatCardModule
} from '@angular/material/card';

import {
  Subscription
} from 'rxjs';

import {
  Chart
} from 'chart.js/auto';

import {
  ActivityService
} from '../../../core/services/activity.service';

@Component({
  selector: 'app-monthly-chart',

  standalone: true,

  imports: [
    MatCardModule
  ],

  templateUrl:
    './monthly-chart.html',

  styleUrl:
    './monthly-chart.css'
})
export class MonthlyChart
  implements AfterViewInit, OnDestroy {

  @ViewChild('monthlyChart')
  monthlyChart!: ElementRef<HTMLCanvasElement>;

  private readonly activityService =
    inject(ActivityService);

  private subscription?: Subscription;

  chart?: Chart;

  ngAfterViewInit(): void {

    this.createChart();

    /*
     * Automatically update whenever
     * ActivityService changes.
     */

    this.subscription =
      this.activityService.activities$
        .subscribe(() => {

          this.updateChart();

        });

  }

  ngOnDestroy(): void {

    this.subscription?.unsubscribe();

    this.chart?.destroy();

  }

  private createChart(): void {

    this.chart =
      new Chart(
        this.monthlyChart.nativeElement,
        {

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

                label:
                  'Carbon Emission (kg)',

                data:
                  new Array(12).fill(0),

                backgroundColor:
                  '#43A047',

                borderRadius: 8

              }

            ]

          },

          options: {

            responsive: true,

            maintainAspectRatio: false,

            animation: {
              duration: 500
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

        }
      );

    this.updateChart();

  }

  private updateChart(): void {

    if (!this.chart) {
      return;
    }

    const totals =
      new Array(12).fill(0);

    this.activityService
      .getActivities()
      .forEach(activity => {

        if (!activity.date) {
          return;
        }

        const month =
          new Date(
            activity.date
          ).getMonth();

        totals[month] +=
          Number(
            activity.carbonEmission ||
            activity.carbon ||
            0
          );

      });

    this.chart.data.datasets[0].data =
      totals;

    this.chart.update();

  }

}
