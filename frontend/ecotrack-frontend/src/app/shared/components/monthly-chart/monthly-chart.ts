import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild
} from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { Chart } from 'chart.js/auto';
import { AnalyticsResponse } from '../../../core/models/analytics.model';

@Component({
  selector: 'app-monthly-chart',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './monthly-chart.html',
  styleUrl: './monthly-chart.css'
})
export class MonthlyChart implements AfterViewInit, OnChanges, OnDestroy {

  @ViewChild('monthlyChart')
  monthlyChart!: ElementRef<HTMLCanvasElement>;

  @Input() analyticsData?: AnalyticsResponse | null;

  chart?: Chart;

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['analyticsData'] && !changes['analyticsData'].firstChange) {
      this.updateChart();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private createChart(): void {
    this.chart = new Chart(this.monthlyChart.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Carbon Emission',
          data: new Array(12).fill(0),
          backgroundColor: '#43A047',
          borderRadius: 6
        }]
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
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(context.parsed.y) + ' kg';
                }
                return label;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Emissions (kg)',
              color: '#666',
              font: {
                weight: 'bold'
              }
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });

    this.updateChart();
  }

  private updateChart(): void {
    if (!this.chart || !this.analyticsData || !this.analyticsData.monthlyEmissions) {
      return;
    }

    const totals = new Array(12).fill(0);
    for (let i = 1; i <= 12; i++) {
      totals[i - 1] = this.analyticsData.monthlyEmissions[i] || 0;
    }

    this.chart.data.datasets[0].data = totals;
    this.chart.update();
  }
}
