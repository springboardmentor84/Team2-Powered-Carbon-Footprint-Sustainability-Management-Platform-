import { Injectable, inject } from '@angular/core';
import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  environment
} from '../../../environments/environment';

import {
  API_ENDPOINTS
} from '../constants/api.constants';


export interface UserProfile {

  id?: number;

  fullName?: string;

  email?: string;

  phone?: string;

  gender?: string;

  dob?: string;

  location?: string;

  university?: string;

  department?: string;

  rollNumber?: string;

  year?: string;

  username?: string;

  profileImage?: string;

  accountStatus?: string;

  joined?: string;

  lastLogin?: string;

  level?: string;

  carbon?: number;

  streak?: number;

  score?: number;

}


@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private http = inject(HttpClient);

  private readonly API =
    environment.apiUrl;


  // ============================
  // GET PROFILE
  // ============================

  getProfile(): Observable<UserProfile> {

    return this.http.get<UserProfile>(

      `${this.API}${API_ENDPOINTS.USER.PROFILE}`

    );

  }


  // ============================
  // UPDATE PROFILE
  // ============================

  updateProfile(
    profile: UserProfile
  ): Observable<UserProfile> {

    return this.http.put<UserProfile>(

      `${this.API}${API_ENDPOINTS.USER.PROFILE}`,

      profile

    );

  }


  // ============================
  // UPDATE PREFERENCES
  // ============================

  updatePreferences(
    preferences: any
  ): Observable<any> {

    return this.http.put(

      `${this.API}${API_ENDPOINTS.USER.PREFERENCES}`,

      preferences

    );

  }


  // ============================
  // PROFILE IMAGE
  // ============================

  uploadProfileImage(
    file: File
  ): Observable<any> {

    const formData =
      new FormData();

    formData.append(
      'image',
      file
    );


    return this.http.post(

      `${this.API}${API_ENDPOINTS.USER.PROFILE_IMAGE}`,

      formData

    );

  }

}
