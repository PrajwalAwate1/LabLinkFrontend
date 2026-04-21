import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface LookupItem {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class LookupService {
  private readonly apiUrl = 'http://localhost:5290';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getContainerTypes(): Observable<LookupItem[]> {
    return this.http.get<LookupItem[]>(`${this.apiUrl}/api/lookup/container-types`, {
      headers: this.getHeaders()
    });
  }

  getDepartments(): Observable<LookupItem[]> {
    return this.http.get<LookupItem[]>(`${this.apiUrl}/api/lookup/departments`, {
      headers: this.getHeaders()
    });
  }

  getSpecimenTypes(): Observable<LookupItem[]> {
    return this.http.get<LookupItem[]>(`${this.apiUrl}/api/lookup/specimen-types`, {
      headers: this.getHeaders()
    });
  }
}
