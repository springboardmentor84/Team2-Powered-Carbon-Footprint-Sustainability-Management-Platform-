import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../constants/api.constants';
import { LeaderboardResponse, MyRankResponse } from '../models/leaderboard.model';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {

  private http = inject(HttpClient);

  getLeaderboard(): Observable<LeaderboardResponse[]> {
    return this.http.get<LeaderboardResponse[]>(
      `${environment.apiUrl}${API_ENDPOINTS.LEADERBOARD.BASE}`
    );
  }

  getMyRank(): Observable<MyRankResponse> {
    return this.http.get<MyRankResponse>(
      `${environment.apiUrl}${API_ENDPOINTS.LEADERBOARD.ME}`
    );
  }
}
