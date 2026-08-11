import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../constants/api.constants';

export interface DashboardSummary {
  totalEntries: number;
  totalCarbonEmission: number;
  averageEmission: number;
}

export interface CategoryEmission {
  category: string;
  totalEmission: number;
}

export interface RecentCarbonEntry {
  id: number;
  category: string;
  activity: string;
  quantity: number;
  unit: string;
  carbonEmission: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private http = inject(HttpClient);

  // Summary
  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(
      `${environment.apiUrl}${API_ENDPOINTS.DASHBOARD.SUMMARY}`
    );
  }

  // Category chart
  getCategory(): Observable<CategoryEmission[]> {
    return this.http.get<CategoryEmission[]>(
      `${environment.apiUrl}${API_ENDPOINTS.DASHBOARD.CATEGORY}`
    );
  }

  // Daily value
  getDaily(): Observable<number> {
    return this.http.get<number>(
      `${environment.apiUrl}${API_ENDPOINTS.DASHBOARD.DAILY}`
    );
  }

  // Weekly value
  getWeekly(): Observable<number> {
    return this.http.get<number>(
      `${environment.apiUrl}${API_ENDPOINTS.DASHBOARD.WEEKLY}`
    );
  }

  // Monthly value
  getMonthly(): Observable<number> {
    return this.http.get<number>(
      `${environment.apiUrl}${API_ENDPOINTS.DASHBOARD.MONTHLY}`
    );
  }

  // Recent activities
  getRecent(): Observable<RecentCarbonEntry[]> {
    return this.http.get<RecentCarbonEntry[]>(
      `${environment.apiUrl}${API_ENDPOINTS.DASHBOARD.RECENT}`
    );
  }
}
