import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PageInfo {
  key: string;
  title: string;
  route: string;
}

@Injectable({
  providedIn: 'root'
})
export class PageService {
  private readonly apiBaseUrl = 'http://localhost:8080';

  constructor(private readonly http: HttpClient) {}

  getPages(): Observable<PageInfo[]> {
    return this.http.get<PageInfo[]>(`${this.apiBaseUrl}/api/test/pages`);
  }
}
