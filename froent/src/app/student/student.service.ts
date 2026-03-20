import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StudentProfile, StudentProfileDTO } from './student.model';

@Injectable({ providedIn: 'root' })
export class StudentProfileService {
  private baseUrl = 'http://localhost:8080/api/student-profile';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getMyProfile(): Observable<StudentProfile> {
    return this.http.get<StudentProfile>(`${this.baseUrl}/me`, {
      headers: this.getAuthHeaders()
    });
  }

  getProfileById(userId: number): Observable<StudentProfile> {
    return this.http.get<StudentProfile>(`${this.baseUrl}/${userId}`, {
      headers: this.getAuthHeaders()
    });
  }

  createProfile(dto: StudentProfileDTO): Observable<{ message: string; profileId: number }> {
    return this.http.post<{ message: string; profileId: number }>(
      `${this.baseUrl}/create`, dto, { headers: this.getAuthHeaders() }
    );
  }

  updateProfile(dto: StudentProfileDTO): Observable<{ message: string; profileId: number }> {
    return this.http.put<{ message: string; profileId: number }>(
      `${this.baseUrl}/update`, dto, { headers: this.getAuthHeaders() }
    );
  }
}