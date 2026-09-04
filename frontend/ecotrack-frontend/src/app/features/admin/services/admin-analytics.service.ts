import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface AdminAnalyticsOverviewResponse {
  totalUsers: number;
  totalEntries: number;
  totalEmissions: number;
  averageEmission: number;
  activeUsers: number;
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

@Injectable({
  providedIn: 'root'
})
export class AdminAnalyticsService {
  private apiUrl = `${environment.apiUrl}/admin/analytics`;

  constructor(private http: HttpClient) { }

  getOverview(): Observable<AdminAnalyticsOverviewResponse> {
    return this.http.get<AdminAnalyticsOverviewResponse>(`${this.apiUrl}/overview`);
  }

  getCategories(): Observable<CategoryEmissionResponse[]> {
    return this.http.get<CategoryEmissionResponse[]>(`${this.apiUrl}/categories`);
  }

  getTrends(year?: number): Observable<TrendDTO[]> {
    const params = year ? { year: year.toString() } : {};
    return this.http.get<TrendDTO[]>(`${this.apiUrl}/trends`, { params });
  }

  getTopUsers(limit: number = 10): Observable<TopUserEmissionDTO[]> {
    return this.http.get<TopUserEmissionDTO[]>(`${this.apiUrl}/users`, { params: { limit: limit.toString() } });
  }
}
