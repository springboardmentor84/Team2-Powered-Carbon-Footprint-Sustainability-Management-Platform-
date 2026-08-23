import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AiService, RecommendationResponse } from '../../../../core/services/ai';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './ai-assistant.html',
  styleUrl: './ai-assistant.css'
})
export class AiAssistant implements OnInit {
  private readonly aiService = inject(AiService);
  private readonly cdr = inject(ChangeDetectorRef);

  recommendations: RecommendationResponse[] = [];
  loading = true;
  error = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadRecommendations();
  }

  loadRecommendations(): void {
    this.loading = true;
    this.error = false;
    this.errorMessage = '';
    this.cdr.detectChanges();

    console.log('[AI] Calling recommendations API...');

    this.aiService.getRecommendations().pipe(
      timeout(20000),
      catchError((err) => {
        console.error('[AI] API error:', err?.status, err?.message, err);
        const isTimeout = err?.name === 'TimeoutError';
        this.errorMessage = isTimeout
          ? 'Request timed out. The server may be slow.'
          : `Error ${err?.status ?? ''}: ${err?.error?.message ?? err?.message ?? 'Unable to reach server.'}`;
        this.error = true;
        this.loading = false;
        this.cdr.detectChanges();
        return of(null);
      })
    ).subscribe({
      next: (data) => {
        console.log('[AI] Response data:', data);
        if (data !== null && data !== undefined) {
          this.recommendations = data as RecommendationResponse[];
          console.log('[AI] Recommendations count:', this.recommendations.length);
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[AI] Subscribe error (should not reach here):', err);
        this.error = true;
        this.loading = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        console.log('[AI] Complete. loading:', this.loading, 'count:', this.recommendations.length);
      }
    });
  }

  getCategoryIcon(category: string): string {
    const map: Record<string, string> = {
      TRANSPORT: 'directions_car',
      FOOD: 'restaurant',
      ENERGY: 'bolt',
      WASTE: 'delete',
      WATER: 'water_drop',
      GENERAL: 'eco'
    };
    return map[category?.toUpperCase()] ?? 'lightbulb';
  }

  getCategoryLabel(category: string): string {
    const map: Record<string, string> = {
      TRANSPORT: 'Transport',
      FOOD: 'Food',
      ENERGY: 'Energy',
      WASTE: 'Waste',
      WATER: 'Water',
      GENERAL: 'General'
    };
    return map[category?.toUpperCase()] ?? category;
  }

  getPriorityColor(priority: string): string {
    const map: Record<string, string> = {
      HIGH: 'priority-high',
      MEDIUM: 'priority-medium',
      LOW: 'priority-low'
    };
    return map[priority?.toUpperCase()] ?? 'priority-low';
  }

  getPriorityIcon(priority: string): string {
    const map: Record<string, string> = {
      HIGH: 'priority_high',
      MEDIUM: 'remove',
      LOW: 'south'
    };
    return map[priority?.toUpperCase()] ?? 'remove';
  }
}
