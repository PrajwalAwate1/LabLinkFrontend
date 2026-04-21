import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface ResultEntryDto {
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

@Injectable({ providedIn: 'root' })
export class ResultEntryService {
  private readonly apiUrl = 'http://localhost:5290';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getByOrderItemId(orderItemId: number): Observable<{ data: ResultEntryDto[] }> {
    return this.http.get<{ data: ResultEntryDto[] }>(
      `${this.apiUrl}/api/results/order/${orderItemId}`,
      { headers: this.getHeaders() }
    );
  }

  create(data: ResultEntryCreateRequest): Observable<{ message: string; data: ResultEntryDto }> {
    return this.http.post<{ message: string; data: ResultEntryDto }>(
      `${this.apiUrl}/api/results`,
      data,
      { headers: this.getHeaders() }
    );
  }

  update(id: number, data: ResultEntryCreateRequest): Observable<{ message: string; data: ResultEntryDto }> {
    return this.http.put<{ message: string; data: ResultEntryDto }>(
      `${this.apiUrl}/api/results/${id}`,
      data,
      { headers: this.getHeaders() }
    );
  }
}
