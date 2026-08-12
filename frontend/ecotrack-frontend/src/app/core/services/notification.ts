import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../constants/api.constants';

export interface NotificationResponse {
  id: number;
  type: string;
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

  getNotifications(): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(
      `${environment.apiUrl}${API_ENDPOINTS.NOTIFICATIONS.BASE}`
    );
  }
}
