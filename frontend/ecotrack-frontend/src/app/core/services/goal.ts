import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../constants/api.constants';

export interface GoalResponse {
  id: number;
  title: string;
  targetCarbon: number;
  currentCarbon: number;
  startDate: string;
  endDate: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class GoalService {
  private http = inject(HttpClient);

  getMyGoals(): Observable<GoalResponse[]> {
    return this.http.get<GoalResponse[]>(
      `${environment.apiUrl}${API_ENDPOINTS.GOALS.BASE}`
    );
  }
}
