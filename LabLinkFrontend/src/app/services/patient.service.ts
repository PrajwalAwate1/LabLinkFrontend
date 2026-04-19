import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PatientUpsertDto {
  isCreate: boolean;
  patientId?: number | null;
  userId: number;
  name: string;
  dob: string;         // ISO date string "YYYY-MM-DD"
  gender?: string | null;
  contactInfo: string;
  address?: string | null;
  isActive: boolean;
  primaryPhysicianName?: string | null;
}

export interface PatientResponseDto {
  patientId: number;
  userId: number;
  name: string;
  dob?: string | null;
  gender?: string | null;
  contactInfo?: string | null;
  email?: string | null;
  address?: string | null;
  isActive: boolean;
  primaryPhysicianName?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private readonly apiUrl = 'http://localhost:5290/api/patients';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getPatient(patientId: number): Observable<{ message: string; data: PatientResponseDto }> {
    return this.http.get<{ message: string; data: PatientResponseDto }>(
      `${this.apiUrl}/${patientId}`,
      { headers: this.getHeaders() }
    );
  }

  searchPatients(name: string, phone: string): Observable<{ message: string; data: PatientResponseDto[] }> {
    const params = new URLSearchParams();
    if (name) params.set('name', name);
    if (phone) params.set('phone', phone);
    return this.http.get<{ message: string; data: PatientResponseDto[] }>(
      `${this.apiUrl}/list?${params.toString()}`,
      { headers: this.getHeaders() }
    );
  }

  upsertPatient(dto: PatientUpsertDto): Observable<{ message: string; data: PatientResponseDto }> {
    return this.http.post<{ message: string; data: PatientResponseDto }>(
      `${this.apiUrl}/upsert`,
      dto,
      { headers: this.getHeaders() }
    );
  }
}
