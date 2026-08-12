import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {

  private http = inject(HttpClient);

  getMyRank(): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}${API_ENDPOINTS.LEADERBOARD.ME}`
    );
  }
}
