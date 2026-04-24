import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PatientUpsertDto {
  isCreate: boolean;
  patientId?: number | null;
  userId: number;
  name: string;
  dob: string;
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
  dob?: string;
  gender?: string;
  contactInfo?: string;
  email?: string;
  address?: string;
  isActive: boolean;
  primaryPhysicianName?: string;
}

@Injectable({ providedIn: 'root' })
export class PatientService {
  private readonly baseUrl = 'http://localhost:5290/api/patients';

  constructor(private http: HttpClient) {}

  upsert(dto: PatientUpsertDto): Observable<{ message: string; data: PatientResponseDto }> {
    return this.http.post<{ message: string; data: PatientResponseDto }>(`${this.baseUrl}/upsert`, dto);
  }

  getById(id: number): Observable<{ message: string; data: PatientResponseDto }> {
    return this.http.get<{ message: string; data: PatientResponseDto }>(`${this.baseUrl}/${id}`);
  }

  list(name?: string, phone?: string): Observable<{ message: string; data: PatientResponseDto[] }> {
    let params: any = {};
    if (name) params.name = name;
    if (phone) params.phone = phone;
    return this.http.get<{ message: string; data: PatientResponseDto[] }>(`${this.baseUrl}/list`, { params });
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }

  upsertPatient(dto: PatientUpsertDto): Observable<{ message: string; data: PatientResponseDto }> {
    return this.upsert(dto);
  }

  getPatient(id: number): Observable<{ message: string; data: PatientResponseDto }> {
    return this.getById(id);
  }

  searchPatients(name?: string, phone?: string): Observable<{ message: string; data: PatientResponseDto[] }> {
    return this.list(name, phone);
  }
}
