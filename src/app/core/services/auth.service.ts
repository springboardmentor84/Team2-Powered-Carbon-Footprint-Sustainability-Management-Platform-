import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);

  private readonly API = environment.apiUrl + '/auth';

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.API}/login`,
      request
    );
  }

  register(request: RegisterRequest): Observable<RegisterResponse> {
  return this.http.post<RegisterResponse>(
    `${this.API}/signup`,
    request
  );
}
  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  saveUser(user: LoginResponse): void {
    localStorage.setItem(
      'user',
      JSON.stringify(user)
    );
  }

  getUser(): LoginResponse | null {

    const data = localStorage.getItem('user');

    if (!data) {
      return null;
    }

    return JSON.parse(data);

  }

}