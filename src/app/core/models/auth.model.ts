export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  id: number;
  fullName: string;
  email: string;
  role: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: number;
  fullName: string;
  email: string;
  role: string;
  ecoPoints: number;
  active: boolean;
}