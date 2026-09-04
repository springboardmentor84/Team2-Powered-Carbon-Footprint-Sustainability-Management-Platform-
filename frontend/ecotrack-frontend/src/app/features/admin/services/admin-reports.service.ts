import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface AdminReportGenerationRequest {
  startDate: string | null;
  endDate: string | null;
  format: string;
}

export interface AdminReportResponse {
  id: number;
  reportPeriod: string;
  startDate: string;
  endDate: string;
  totalEmissions: number;
  totalActivities: number;
  format: string;
  downloads: number;
  generatedAt: string;
  generatedBy: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminReportsService {
  private apiUrl = `${environment.apiUrl}/api/v1/admin/reports`;

  constructor(private http: HttpClient) { }

  getReportHistory(): Observable<AdminReportResponse[]> {
    return this.http.get<AdminReportResponse[]>(this.apiUrl);
  }

  generateReport(request: AdminReportGenerationRequest): Observable<AdminReportResponse> {
    return this.http.post<AdminReportResponse>(`${this.apiUrl}/generate`, request);
  }

  downloadReport(id: number): void {
    // using window.open to trigger the download directly from the browser since it's an octet stream
    // it's easier than handling blobs in angular sometimes
    const token = localStorage.getItem('token');
    
    this.http.get(`${this.apiUrl}/${id}/download`, { responseType: 'blob' }).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admin-report-${id}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    });
  }
}
