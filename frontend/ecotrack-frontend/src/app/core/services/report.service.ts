import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface GeneratedReportResponse {
  id: number;
  reportPeriod: string;
  startDate: string;
  endDate: string;
  totalEmissions: number;
  totalActivities: number;
  format: string;
  downloads: number;
  generatedAt: string;
}

export interface GenerateReportRequest {
  reportPeriod: string;
  startDate?: string | null;
  endDate?: string | null;
  format: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1/reports`;

  getReportHistory(): Observable<GeneratedReportResponse[]> {
    return this.http.get<GeneratedReportResponse[]>(`${this.apiUrl}/history`);
  }

  generateReport(request: GenerateReportRequest): Observable<GeneratedReportResponse> {
    return this.http.post<GeneratedReportResponse>(`${this.apiUrl}/generate`, request);
  }

  downloadReport(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, { responseType: 'blob' });
  }
}
