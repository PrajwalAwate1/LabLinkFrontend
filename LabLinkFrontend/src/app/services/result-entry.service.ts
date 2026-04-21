import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ResultEntry {
  resultId: number;
  orderItemId: number;
  testId: number;
  analyte: string | null;
  value: string | null;
  units: string | null;
  source: string | null;
  flag: string | null;
  enteredByUsername: string | null;
  enteredDate: string | null;
}

export interface ResultEntryCreateRequest {
  orderItemId: number;
  testId: number;
  analyte: string | null;
  value: string | null;
  units: string | null;
  source: string | null;
}

export interface LabOrderList {
  orderId: number;
  patientId: number;
  patientName: string | null;
  orderDate: string | null;
  priority: number;
  orderItemCount: number;
  pendingResultCount: number;
  isActive: boolean;
}

export interface OrderItemWithTest {
  orderItemId: number;
  orderId: number;
  testId: number | null;
  panelId: number | null;
  department: string | null;
  testCode: string | null;
  testName: string | null;
  units: string | null;
  minNormalValue: number | null;
  maxNormalValue: number | null;
  hasResult: boolean;
  existingResult: ResultEntry | null;
}

export interface LabOrderDetail {
  orderId: number;
  patientId: number;
  patientName: string | null;
  orderDate: string | null;
  priority: number;
  orderItems: OrderItemWithTest[];
}

@Injectable({
  providedIn: 'root'
})
export class ResultEntryService {
  private readonly apiUrl = 'http://localhost:5290/api/results';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAllOrders(): Observable<{ data: LabOrderList[] }> {
    return this.http.get<{ data: LabOrderList[] }>(`${this.apiUrl}/orders`, { headers: this.getHeaders() });
  }

  getOrderDetail(orderId: number): Observable<{ data: LabOrderDetail }> {
    return this.http.get<{ data: LabOrderDetail }>(`${this.apiUrl}/orders/${orderId}`, { headers: this.getHeaders() });
  }

  getByOrderItemId(orderItemId: number): Observable<{ data: ResultEntry[] }> {
    return this.http.get<{ data: ResultEntry[] }>(`${this.apiUrl}/order/${orderItemId}`, { headers: this.getHeaders() });
  }

  create(entry: ResultEntryCreateRequest): Observable<{ message: string; data: ResultEntry }> {
    return this.http.post<{ message: string; data: ResultEntry }>(this.apiUrl, entry, { headers: this.getHeaders() });
  }

  update(id: number, entry: ResultEntryCreateRequest): Observable<{ message: string; data: ResultEntry }> {
    return this.http.put<{ message: string; data: ResultEntry }>(`${this.apiUrl}/${id}`, entry, { headers: this.getHeaders() });
  }
}
