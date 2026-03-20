import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'AGENT' | 'STUDENT';
}

export interface AuthLoginResponse {
  token: string;
  userId: number;
  role: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiBaseUrl = 'http://localhost:8080';

  constructor(private readonly http: HttpClient) {}

  login(payload: LoginPayload): Observable<AuthLoginResponse> {
    return this.http.post<AuthLoginResponse>(`${this.apiBaseUrl}/api/auth/login`, payload);
  }

  register(payload: RegisterPayload): Observable<{ userId: number; message: string }> {
    return this.http.post<{ userId: number; message: string }>(`${this.apiBaseUrl}/api/auth/register`, payload);
  }
}
