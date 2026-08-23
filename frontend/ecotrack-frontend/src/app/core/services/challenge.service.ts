import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../constants/api.constants';
import { Challenge, ChallengeParticipation, ChallengeProgress, ChallengeLeaderboardEntry } from '../models/challenge.model';

export interface AdminChallengeDetails {
  id: number;
  title: string;
  description: string;
  category: string;
  target: number;
  reward: number;
  startDate: string;
  endDate: string;
  createdBy: string;
  createdAt: string;
  participantCount: number;
  completionCount: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChallengeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}${API_ENDPOINTS.CHALLENGES.BASE}`;

  // General Challenge Endpoints
  getAllChallenges(
    search?: string,
    category?: string,
    startDate?: string,
    endDate?: string,
    page: number = 0,
    size: number = 100,
    sort: string = 'startDate,desc'
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);
      
    if (search) params = params.set('search', search);
    if (category) params = params.set('category', category);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<any>(this.apiUrl, { params });
  }

  getChallengeById(id: number): Observable<AdminChallengeDetails> {
    return this.http.get<AdminChallengeDetails>(`${this.apiUrl}/${id}`);
  }

  createChallenge(data: any): Observable<Challenge> {
    return this.http.post<Challenge>(this.apiUrl, data);
  }

  // Participation Endpoints
  getMyChallenges(): Observable<ChallengeParticipation[]> {
    return this.http.get<ChallengeParticipation[]>(`${this.apiUrl}/my`);
  }

  joinChallenge(id: number): Observable<ChallengeParticipation> {
    return this.http.post<ChallengeParticipation>(`${this.apiUrl}/${id}/join`, {});
  }

  leaveChallenge(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/leave`);
  }

  getChallengeProgress(id: number): Observable<ChallengeProgress> {
    return this.http.get<ChallengeProgress>(`${this.apiUrl}/${id}/progress`);
  }

  getChallengeLeaderboard(id: number): Observable<ChallengeLeaderboardEntry[]> {
    return this.http.get<ChallengeLeaderboardEntry[]>(`${this.apiUrl}/${id}/leaderboard`);
  }
}
