import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface LabOrderResponse {
  orderId: number;
  patientId: number;
  clientId?: number;
  orderDate: string;
  priority: number;
  isActive: boolean;
}

export interface OrderItemResponse {
  orderItemId: number;
  orderId: number;
  testId?: number;
  panelId?: number;
  department?: string;
  isActive: boolean;
}

export interface SpecimenResponse {
  specimenId: number;
  orderId: number;
  orderItemId: number;
  specimenTypeId?: number;
  containerTypeId?: number;
  collectedBy?: number;
  collectedDate?: string;
  rejectionReason?: string;
  isActive: boolean;
}

export interface SpecimenCreateDto {
  orderID: number;
  orderItemId: number;
  specimenTypeId?: number;
  containerTypeId?: number;
  collectedBy?: number;
  collectedDate?: string;
  rejectionReason?: string;
  isActive: boolean;
}

export interface PatientInfo {
  patientId: number;
  name: string;
}

export interface TestInfo {
  testId: number;
  testName: string;
}

export interface UserInfo {
  userId: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class PhlebotomistService {
  private apiUrl = 'http://localhost:5290/api';

  constructor(private http: HttpClient) {}

  getLabOrders(orderDate?: string): Observable<LabOrderResponse[]> {
    let url = `${this.apiUrl}/laborders/list`;
    if (orderDate) {
      url += `?orderDate=${orderDate}`;
    }
    return this.http.get<{ message: string; data: LabOrderResponse[] }>(url)
      .pipe(map(response => response.data));
  }

  getOrderItems(orderId: number): Observable<OrderItemResponse[]> {
    return this.http.get<{ message: string; data: OrderItemResponse[] }>(
      `${this.apiUrl}/orderitems/order/${orderId}`
    ).pipe(map(response => response.data));
  }

  getSpecimensByOrderItemId(orderItemId: number): Observable<SpecimenResponse[]> {
    return this.http.get<SpecimenResponse[]>(
      `${this.apiUrl}/Specimen/orderitem/${orderItemId}`
    );
  }

  createSpecimen(dto: SpecimenCreateDto): Observable<SpecimenResponse> {
    return this.http.post<SpecimenResponse>(`${this.apiUrl}/Specimen`, dto);
  }

  deleteSpecimen(specimenId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Specimen/delete/${specimenId}`);
  }

  getPatientById(patientId: number): Observable<PatientInfo> {
    return this.http.get<{ message: string; data: any }>(
      `${this.apiUrl}/patients/${patientId}`
    ).pipe(
      map(response => ({
        patientId: response.data.patientId,
        name: response.data.name
      }))
    );
  }

  getTestById(testId: number): Observable<TestInfo> {
    return this.http.get<{ message: string; data: any }>(
      `${this.apiUrl}/Test/${testId}`
    ).pipe(
      map(response => {
        const d = response?.data ?? response;
        return {
          testId: d?.testId ?? testId,
          testName: d?.testName ?? `Test #${testId}`
        };
      })
    );
  }

  getUserById(userId: number): Observable<UserInfo> {
    return this.http.get<{ message: string; data: any }>(
      `${this.apiUrl}/User/GetUser?userId=${userId}`
    ).pipe(
      map(response => ({
        userId: response.data.userId,
        name: response.data.name
      }))
    );
  }
}
