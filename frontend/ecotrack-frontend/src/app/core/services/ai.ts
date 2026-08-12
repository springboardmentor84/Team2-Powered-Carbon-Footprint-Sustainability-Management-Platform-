import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../constants/api.constants';

export interface AiRecommendationResponse {
  recommendation: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private http = inject(HttpClient);

  getRecommendation(): Observable<AiRecommendationResponse> {
    return this.http.get<AiRecommendationResponse>(
      `${environment.apiUrl}${API_ENDPOINTS.RECOMMENDATIONS.BASE}`
    );
  }
}
