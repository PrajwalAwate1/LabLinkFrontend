import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LabOrderResponse {
  orderId: number;
  patientId: number;
  clientId?: number | null;
  priority: number;
  isActive: boolean;
  orderDate: string;
}

export interface OrderItemResponse {
  orderItemId: number;
  orderId: number;
  testId?: number | null;
  panelId?: number | null;
  department?: string | null;
  isActive: boolean;
}

export interface ResultEntryResponse {
  resultId: number;
  orderItemId: number;
  testId: number;
  analyte?: string | null;
  value?: string | null;
  units?: string | null;
  source?: string | null;
  flag?: string | null;
  enteredByUsername?: string | null;
  enteredDate?: string | null;
}

@Injectable({ providedIn: 'root' })
export class TestResultService {
  private readonly base = 'http://localhost:5290/api';

  constructor(private http: HttpClient) {}

  getLabOrders(patientId: number): Observable<{ data: LabOrderResponse[] }> {
    return this.http.get<{ data: LabOrderResponse[] }>(`${this.base}/laborders/list?patientId=`);
  }

  getOrderItems(orderId: number): Observable<{ data: OrderItemResponse[] }> {
    return this.http.get<{ data: OrderItemResponse[] }>(`${this.base}/orderitems/order/`);
  }

  getResults(orderItemId: number): Observable<{ data: ResultEntryResponse[] }> {
    return this.http.get<{ data: ResultEntryResponse[] }>(`${this.base}/results/order/`);
  }
}
