import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AppointmentDto {
  appointmentId: number;
  patientId: number;
  patientName?: string;
  bookedDateTime: string;
  address?: string;
  visitTypeId?: number;
  visitTypeName?: string;
  phlebotomistId?: number;
  phlebotomistName?: string;
  isActive: boolean;
}

// Alias for component compatibility
export type AppointmentResponse = AppointmentDto;

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly apiUrl = 'http://localhost:5290/api/appointments';

  constructor(private http: HttpClient) {}

  private get headers() {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  }

  getAll(date?: string): Observable<{ data: AppointmentDto[] }> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get<{ data: AppointmentDto[] }>(this.apiUrl, {
      headers: this.headers,
      params
    });
  }

  getById(id: number): Observable<{ data: AppointmentDto }> {
    return this.http.get<{ data: AppointmentDto }>(`${this.apiUrl}/${id}`, {
      headers: this.headers
    });
  }

  create(dto: any): Observable<any> {
    return this.http.post(this.apiUrl, dto, { headers: this.headers });
  }

  update(id: number, dto: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, dto, { headers: this.headers });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.headers });
  }

  // Alias method for component compatibility
  getByDate(date?: string): Observable<{ data: AppointmentDto[] }> {
    return this.getAll(date);
  }
}
