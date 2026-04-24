import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Specimen {
  specimenId: number;
  orderId: number;
  orderItemId: number;
  specimenTypeId: number | null;
  specimenTypeName: string | null;
  containerTypeId: number | null;
  containerTypeName: string | null;
  collectedBy: number | null;
  collectedByName: string | null;
  collectedDate: string | null;
  rejectionReason: string | null;
  isActive: boolean;
}

export interface SpecimenCreateRequest {
  orderID: number;
  orderItemId: number;
  specimenTypeId: number | null;
  containerTypeId: number | null;
  collectedBy: number | null;
  collectedDate: string | null;
  rejectionReason: string | null;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class SpecimenService {
  private readonly apiUrl = 'http://localhost:5290/api/Specimen';

  constructor(private http: HttpClient) {}

  getAll(): Observable<{ data: Specimen[] }> {
    return this.http.get<{ data: Specimen[] }>(this.apiUrl);
  }

  getById(id: number): Observable<{ data: Specimen }> {
    return this.http.get<{ data: Specimen }>(`${this.apiUrl}/${id}`);
  }

  getByOrderId(orderId: number): Observable<{ data: Specimen[] }> {
    return this.http.get<{ data: Specimen[] }>(`${this.apiUrl}/order/${orderId}`);
  }

  create(specimen: SpecimenCreateRequest): Observable<Specimen> {
    return this.http.post<Specimen>(this.apiUrl, specimen);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
