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
  tokenType?: string;
  expiresIn?: number;

  id?: number;
  email: string;
  fullName: string;
  role?: string;
}


export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}


export interface RegisterResponse {
  id?: number;
  fullName?: string;
  email?: string;
  message?: string;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http =
    inject(HttpClient);

  private readonly API =
    environment.apiUrl;


  // =========================================================
  // LOGIN
  // =========================================================

  login(
    request: LoginRequest
  ): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(
      `${this.API}${API_ENDPOINTS.AUTH.LOGIN}`,
      request
    );
  }


  // =========================================================
  // SIGNUP
  // =========================================================

  register(
    request: RegisterRequest
  ): Observable<RegisterResponse> {

    return this.http.post<RegisterResponse>(
      `${this.API}${API_ENDPOINTS.AUTH.SIGNUP}`,
      request
    );
  }


  // =========================================================
  // TOKEN
  // =========================================================

  saveToken(
    token: string
  ): void {

    // Always remove Bearer before saving.
    // Interceptor adds "Bearer " when making requests.
    const cleanToken =
      token
        .replace(/^Bearer\s+/i, '')
        .trim();

    localStorage.setItem(
      TOKEN_KEY,
      cleanToken
    );

    console.log(
      '[AUTH] Token saved successfully'
    );
  }


  getToken(): string | null {

    return localStorage.getItem(
      TOKEN_KEY
    );
  }


  hasToken(): boolean {

    return !!this.getToken();
  }


  // =========================================================
  // USER
  // =========================================================

  saveUser(
    user: LoginResponse
  ): void {

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(user)
    );
  }


  getUser(): LoginResponse | null {

    const data =
      localStorage.getItem(USER_KEY);

    if (!data) {
      return null;
    }

    try {

      return JSON.parse(data);

    } catch {

      return null;

    }
  }


  // =========================================================
  // LOGOUT
  // =========================================================

  logout(): void {

    localStorage.removeItem(TOKEN_KEY);

    localStorage.removeItem(USER_KEY);

    console.log(
      '[AUTH] User logged out and token removed'
    );
  }
}
