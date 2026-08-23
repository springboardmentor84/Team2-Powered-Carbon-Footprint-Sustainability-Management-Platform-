import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminDashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalEcoPointsGenerated: number;
  totalCarbonActivities: number;
  totalChallenges: number;
  completedChallenges: number;
  activeChallengeParticipations: number;
  totalCarbonEmissions: number;
  averageCarbonEmission: number;
  activeGoals: number;
  completedGoals: number;
  categoryEmissions: any[];
  recentActivity: any[];
  topEcoUsers: any[];
  activeChallenges: number;
  totalRewardActivities: number;
}

export interface AdminUser {
  id: number;
  fullName: string;
  email: string;
  role: string;
  ecoPoints: number;
  active: boolean;
  createdAt: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface AdminUserDetails extends AdminUser {
  totalCarbonEntries: number;
  totalCarbonEmissions: number;
  activeGoals: number;
  completedGoals: number;
  activeChallenges: number;
  completedChallenges: number;
  expiredChallenges: number;
  totalParticipations: number;
  
  rewardActivities: number;
  totalRewardedPoints: number;
  
  profileImage?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1/admin`;

  getDashboardMetrics(): Observable<AdminDashboardMetrics> {
    return this.http.get<AdminDashboardMetrics>(`${this.apiUrl}/dashboard`);
  }

  getAllUsers(
    search?: string,
    role?: string,
    active?: boolean,
    startDate?: string,
    endDate?: string,
    page: number = 0,
    size: number = 10,
    sort: string = 'createdAt,desc'
  ): Observable<Page<AdminUser>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);
      
    if (search) params = params.set('search', search);
    if (role) params = params.set('role', role);
    if (active !== undefined && active !== null) params = params.set('active', active);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<Page<AdminUser>>(`${this.apiUrl}/users`, { params });
  }

  getUserById(id: number): Observable<AdminUserDetails> {
    return this.http.get<AdminUserDetails>(`${this.apiUrl}/users/${id}`);
  }
}
