import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../constants/api.constants';

export interface BadgeResponse {
  id?: number;
  name?: string;
  description?: string;
  icon?: string;
  pointsRequired?: number;
  unlocked?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BadgeService {

  private http = inject(HttpClient);

  getBadges(): Observable<BadgeResponse[]> {
    return this.http.get<BadgeResponse[]>(
      `${environment.apiUrl}${API_ENDPOINTS.BADGES.BASE}`
    );
  }
}
