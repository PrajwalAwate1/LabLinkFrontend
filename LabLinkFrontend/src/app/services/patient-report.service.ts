import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface PatientTestResult {
  testCode: string;
  testName: string;
  department: string;
  value: string;
  units: string;
  flag: string;
  normalRange: string;
  resultDate: string;
}

export interface PatientLabReport {
  orderId: number;
  orderDate: string;
  priority: number;
  status: string;
  isReviewed: boolean;
  reviewDate: string | null;
  reviewedBy: string | null;
  reviewNotes: string | null;
  testResults: PatientTestResult[];
}

export interface PatientReportSummary {
  totalReports: number;
  pendingReports: number;
  reviewedReports: number;
  reports: PatientLabReport[];
}

@Injectable({ providedIn: 'root' })
export class PatientReportService {
  private apiUrl = 'http://localhost:5290/api/patient/reports';

  constructor(private http: HttpClient) {}

  getMyReports(): Observable<{ data: PatientReportSummary }> {
    return this.http.get<{ data: PatientReportSummary }>(this.apiUrl).pipe(
      tap(response => console.log('API Response:', response))
    );
  }

  getReportByOrderId(orderId: number): Observable<{ data: PatientLabReport }> {
    return this.http.get<{ data: PatientLabReport }>(`${this.apiUrl}/${orderId}`).pipe(
      tap(response => console.log('API Report Detail Response:', response))
    );
  }
}
