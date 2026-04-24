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

export type AppointmentResponse = AppointmentDto;

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly apiUrl = 'http://localhost:5290/api/appointments';

  constructor(private http: HttpClient) {}

  getAll(date?: string): Observable<{ data: AppointmentDto[] }> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get<{ data: AppointmentDto[] }>(this.apiUrl, { params });
  }

  getById(id: number): Observable<{ data: AppointmentDto }> {
    return this.http.get<{ data: AppointmentDto }>(`${this.apiUrl}/${id}`);
  }

  create(dto: any): Observable<any> {
    return this.http.post(this.apiUrl, dto);
  }

  update(id: number, dto: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getByDate(date?: string): Observable<{ data: AppointmentDto[] }> {
    return this.getAll(date);
  }
}
