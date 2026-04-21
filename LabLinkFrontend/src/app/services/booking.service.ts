import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TestItem {
  testId: number;
  code: string;
  name: string;
  isActive: boolean;
}

export interface PanelItem {
  panelId: number;
  panelCode: string;
  panelName: string;
  isActive: boolean;
}

export interface AppointmentItemDto {
  appointmentId: number;
  testId?: number | null;
  panelId?: number | null;
  priority: number;
  instructions?: string;
  isActive?: boolean;
}

export interface AppointmentItemResponse {
  appItemId: number;
  appointmentId: number;
  testId?: number | null;
  test?: { testId: number; name: string; code: string } | null;
  panelId?: number | null;
  panel?: { panelId: number; panelName: string; panelCode: string } | null;
  priority: number;
  instructions?: string;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly baseUrl = 'http://localhost:5290/api';

  constructor(private http: HttpClient) {}

  private get headers() {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  }

  getTests(): Observable<TestItem[]> {
    return this.http.get<TestItem[]>(`${this.baseUrl}/test`, { headers: this.headers });
  }

  getPanels(): Observable<PanelItem[]> {
    return this.http.get<PanelItem[]>(`${this.baseUrl}/panel`, { headers: this.headers });
  }

  createAppointmentItem(dto: AppointmentItemDto): Observable<any> {
    return this.http.post(`${this.baseUrl}/appointmentitem/create`, dto, { headers: this.headers });
  }

  getItemsByAppointment(appointmentId: number): Observable<{ data: AppointmentItemResponse[] }> {
    return this.http.get<{ data: AppointmentItemResponse[] }>(
      `${this.baseUrl}/appointmentitem/appointment/${appointmentId}`,
      { headers: this.headers }
    );
  }

  deleteAppointmentItem(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/appointmentitem/${id}`, { headers: this.headers });
  }
}
