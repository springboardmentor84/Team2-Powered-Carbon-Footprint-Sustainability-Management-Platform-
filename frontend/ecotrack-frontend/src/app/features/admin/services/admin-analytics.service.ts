import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface EngagementMetricsDTO {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  failedGoals: number;
  totalChallenges: number;
  activeChallenges: number;
  totalChallengeParticipants: number;
  completedChallengeParticipations: number;
  reportsGenerated: number;
}

export interface AdminAnalyticsOverviewResponse {
  totalUsers: number;
  totalEntries: number;
  totalEmissions: number;
  averageEmission: number;
  activeUsers: number;
  engagement: EngagementMetricsDTO;
}

export interface CategoryEmissionResponse {
  category: string;
  totalEmission: number;
}

export interface TrendDTO {
  period: string;
  amount: number;
}

export interface TopUserEmissionDTO {
  name: string;
  email: string;
  totalEmission: number;
}

export interface ActivityMetricDTO {
  activity: string;
  entries: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminAnalyticsService {
  private apiUrl = `${environment.apiUrl}/api/v1/admin/analytics`;

  constructor(private http: HttpClient) { }

  private buildParams(startDate?: string | null, endDate?: string | null, extraParams: any = {}): HttpParams {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    for (const key in extraParams) {
      if (extraParams[key] !== undefined && extraParams[key] !== null) {
        params = params.set(key, extraParams[key].toString());
      }
    }
    return params;
  }

  getOverview(startDate?: string | null, endDate?: string | null): Observable<AdminAnalyticsOverviewResponse> {
    return this.http.get<AdminAnalyticsOverviewResponse>(`${this.apiUrl}/overview`, { params: this.buildParams(startDate, endDate) });
  }

  getCategories(startDate?: string | null, endDate?: string | null): Observable<CategoryEmissionResponse[]> {
    return this.http.get<CategoryEmissionResponse[]>(`${this.apiUrl}/categories`, { params: this.buildParams(startDate, endDate) });
  }

  getTrends(period: string = 'daily', startDate?: string | null, endDate?: string | null): Observable<TrendDTO[]> {
    return this.http.get<TrendDTO[]>(`${this.apiUrl}/trends`, { params: this.buildParams(startDate, endDate, { period }) });
  }

  getTopUsers(limit: number = 10, startDate?: string | null, endDate?: string | null): Observable<TopUserEmissionDTO[]> {
    return this.http.get<TopUserEmissionDTO[]>(`${this.apiUrl}/users`, { params: this.buildParams(startDate, endDate, { limit }) });
  }

  getActivities(limit: number = 5, startDate?: string | null, endDate?: string | null): Observable<ActivityMetricDTO[]> {
    return this.http.get<ActivityMetricDTO[]>(`${this.apiUrl}/activities`, { params: this.buildParams(startDate, endDate, { limit }) });
  }
}
