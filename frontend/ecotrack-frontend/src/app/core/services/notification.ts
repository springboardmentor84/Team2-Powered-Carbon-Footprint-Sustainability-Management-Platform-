import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../constants/api.constants';

export interface NotificationResponse {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}${API_ENDPOINTS.NOTIFICATIONS.BASE}`;

  getNotifications(): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(this.apiUrl);
  }

  markAsRead(id: number): Observable<NotificationResponse> {
    return this.http.put<NotificationResponse>(`${this.apiUrl}/${id}/read`, {});
  }

  deleteNotification(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
