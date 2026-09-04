import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface SystemHealthResponse {
  systemStatus: string;
  backendStatus: string;
  databaseStatus: string;
  uptimeSeconds: number;
  jvmMemoryUsedMB: number;
  jvmMemoryMaxMB: number;
  javaVersion: string;
  availableProcessors: number;
  lastChecked: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminMonitoringService {
  private apiUrl = `${environment.apiUrl}/api/v1/admin/system`;

  constructor(private http: HttpClient) { }

  getHealth(): Observable<SystemHealthResponse> {
    return this.http.get<SystemHealthResponse>(`${this.apiUrl}/health`);
  }
}
