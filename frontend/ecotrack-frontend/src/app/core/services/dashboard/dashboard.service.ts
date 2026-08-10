import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

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

  private apiUrl = `${environment.apiUrl}/dashboard`;

  private getHeaders(): HttpHeaders {

    const token = localStorage.getItem('token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getSummary(): Observable<DashboardSummary> {

    return this.http.get<DashboardSummary>(
      `${this.apiUrl}/summary`,
      {
        headers: this.getHeaders()
      }
    );
  }

  getCategory(): Observable<CategoryEmission[]> {

    return this.http.get<CategoryEmission[]>(
      `${this.apiUrl}/category`,
      {
        headers: this.getHeaders()
      }
    );
  }

  getDaily(): Observable<number> {

    return this.http.get<number>(
      `${this.apiUrl}/daily`,
      {
        headers: this.getHeaders()
      }
    );
  }

  getWeekly(): Observable<number> {

    return this.http.get<number>(
      `${this.apiUrl}/weekly`,
      {
        headers: this.getHeaders()
      }
    );
  }

  getMonthly(): Observable<number> {

    return this.http.get<number>(
      `${this.apiUrl}/monthly`,
      {
        headers: this.getHeaders()
      }
    );
  }

  getRecent(): Observable<RecentCarbonEntry[]> {

    return this.http.get<RecentCarbonEntry[]>(
      `${this.apiUrl}/recent`,
      {
        headers: this.getHeaders()
      }
    );
  }
}
