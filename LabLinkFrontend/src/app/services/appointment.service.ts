import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AppointmentDto {
  appointmentId?: number;
  patientId: number;
  bookedDateTime: string; 
  address: string;
  visitTypeId?: number | null;
  phlebotomistId?: number | null;
  isActive: boolean;
}

export interface AppointmentResponse {
  appointmentId: number;
  patientId: number;
  bookedDateTime: string;
  address?: string | null;
  visitTypeId?: number | null;
  phlebotomistId?: number | null;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly apiUrl = 'http://localhost:5290/api/appointments';

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` });
  }

  getByDate(date?: string): Observable<{ data: AppointmentResponse[] }> {
    const query = date ? `?date=${date}` : '';
    return this.http.get<{ data: AppointmentResponse[] }>(`${this.apiUrl}${query}`, { headers: this.headers() });
  }

  getById(id: number): Observable<{ data: AppointmentResponse }> {
    return this.http.get<{ data: AppointmentResponse }>(`${this.apiUrl}/${id}`, { headers: this.headers() });
  }

  create(dto: AppointmentDto): Observable<{ message: string; data: AppointmentResponse }> {
    return this.http.post<{ message: string; data: AppointmentResponse }>(this.apiUrl, dto, { headers: this.headers() });
  }

  update(id: number, dto: AppointmentDto): Observable<{ message: string; data: AppointmentResponse }> {
    return this.http.put<{ message: string; data: AppointmentResponse }>(`${this.apiUrl}/${id}`, dto, { headers: this.headers() });
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, { headers: this.headers() });
  }
}
