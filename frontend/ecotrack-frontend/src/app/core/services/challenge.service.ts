import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Challenge, ChallengeParticipation, ChallengeProgress, ChallengeLeaderboardEntry } from '../models/challenge.model';

@Injectable({
  providedIn: 'root'
})
export class ChallengeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/challenges`;

  // General Challenge Endpoints
  getAllChallenges(): Observable<Challenge[]> {
    return this.http.get<Challenge[]>(this.apiUrl);
  }

  getChallengeById(id: number): Observable<Challenge> {
    return this.http.get<Challenge>(`${this.apiUrl}/${id}`);
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
