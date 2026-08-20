import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GamificationSummary } from '../models/gamification.model';

@Injectable({
  providedIn: 'root'
})
export class GamificationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/gamification`;

  getGamificationSummary(): Observable<GamificationSummary> {
    return this.http.get<GamificationSummary>(`${this.apiUrl}/summary`);
  }

  redeemReward(rewardId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/rewards/${rewardId}/redeem`, {});
  }
}
