import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Destination } from './destination.model';

@Injectable({ providedIn: 'root' })
export class DestinationService {
  private baseUrl = 'http://localhost:8080/api/destinations';

  constructor(private http: HttpClient) {}

  // Optional: If your backend needs JWT auth
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // Get all destinations
  getAllDestinations(): Observable<Destination[]> {
    return this.http.get<Destination[]>(this.baseUrl, {
      headers: this.getAuthHeaders()
    });
  }

  // Get destination by ID
  getDestinationById(id: number): Observable<Destination> {
    return this.http.get<Destination>(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}