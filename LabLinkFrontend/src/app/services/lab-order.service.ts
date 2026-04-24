import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LabOrderDto {
  patientId: number;
  clientId?: number | null;
  priority: number;
  isActive: boolean;
  orderId?: number;
  orderDate?: string;
}

export interface LabOrderResponse {
  orderId: number;
  patientId: number;
  patientName?: string;
  orderDate?: string;
  priority: number;
  orderItemCount?: number;
  pendingResultCount?: number;
  isActive: boolean;
}

export interface OrderItemDto {
  orderItemId?: number;
  orderId: number;
  testId?: number | null;
  panelId?: number | null;
  department?: string;
  isActive: boolean;
}

export interface OrderItemResponse {
  orderItemId: number;
  orderId: number;
  testId?: number | null;
  panelId?: number | null;
  department?: string;
}

@Injectable({ providedIn: 'root' })
export class LabOrderService {
  private readonly baseUrl = 'http://localhost:5290/api';

  constructor(private http: HttpClient) {}

  createLabOrder(dto: LabOrderDto): Observable<{ message: string; data: any }> {
    return this.http.post<{ message: string; data: any }>(
      `${this.baseUrl}/laborders/create`, dto
    );
  }

  createOrderItem(dto: OrderItemDto): Observable<{ message: string; data: any }> {
    return this.http.post<{ message: string; data: any }>(
      `${this.baseUrl}/orderitems/create`, dto
    );
  }
}
