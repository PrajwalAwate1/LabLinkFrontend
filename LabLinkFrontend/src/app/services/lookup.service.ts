import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LookupItem {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class LookupService {
  private readonly apiUrl = 'http://localhost:5290';

  constructor(private http: HttpClient) {}

  getContainerTypes(): Observable<LookupItem[]> {
    return this.http.get<LookupItem[]>(`${this.apiUrl}/api/lookup/container-types`);
  }

  getDepartments(): Observable<LookupItem[]> {
    return this.http.get<LookupItem[]>(`${this.apiUrl}/api/lookup/departments`);
  }

  getSpecimenTypes(): Observable<LookupItem[]> {
    return this.http.get<LookupItem[]>(`${this.apiUrl}/api/lookup/specimen-types`);
  }
}
