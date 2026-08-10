import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  TOKEN_KEY,
  USER_KEY
} from '../constants/app.constants';

import { API_ENDPOINTS } from '../constants/api.constants';


export interface LoginRequest {
  email: string;
  password: string;
}


export interface LoginResponse {
  token: string;
  email: string;
  fullName: string;
}


export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}


export interface RegisterResponse {
  message: string;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);

  private readonly API = environment.apiUrl;


  // ============================
  // LOGIN
  // ============================

  login(
    request: LoginRequest
  ): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(
      `${this.API}${API_ENDPOINTS.AUTH.LOGIN}`,
      request
    );

  }


  // ============================
  // SIGNUP
  // ============================

  register(
    request: RegisterRequest
  ): Observable<RegisterResponse> {

    return this.http.post<RegisterResponse>(
      `${this.API}${API_ENDPOINTS.AUTH.SIGNUP}`,
      request
    );

  }


  // ============================
  // TOKEN
  // ============================

  saveToken(token: string): void {

    localStorage.setItem(
      TOKEN_KEY,
      token
    );

  }


  getToken(): string | null {

    return localStorage.getItem(
      TOKEN_KEY
    );

  }


  // ============================
  // USER
  // ============================

  saveUser(user: LoginResponse): void {

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(user)
    );

  }


  getUser(): LoginResponse | null {

    const data =
      localStorage.getItem(USER_KEY);

    return data
      ? JSON.parse(data)
      : null;

  }


  // ============================
  // LOGOUT
  // ============================

  logout(): void {

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

  }

}
