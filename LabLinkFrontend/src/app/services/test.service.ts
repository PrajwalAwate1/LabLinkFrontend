import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TestDto {
  testId: number;
  code: string;
  name: string;
  departmentId: number | null;
  specimenTypeId: number | null;
  containerTypeId: number;
  volumeReq: number | null;
  units: number | null;
  maxNormalValue: number;
  minNormalValue: number;
  tatTargetMinutes: number | null;
  refRangeJson: string | null;
  isActive: boolean;
}

export interface TestCreateRequest {
  code: string;
  name: string;
  departmentId: number | null;
  specimenTypeId: number | null;
  containerTypeId: number;
  volumeReq: number | null;
  units: number | null;
  maxNormalValue: number;
  minNormalValue: number;
  tatTargetMinutes: number | null;
  refRangeJson: string | null;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class TestService {
  private readonly apiUrl = 'http://localhost:5290';

  constructor(private http: HttpClient) {}

  getTests(name?: string, code?: string): Observable<TestDto[]> {
    let params = new HttpParams();
    if (name) params = params.set('name', name);
    if (code) params = params.set('code', code);
    return this.http.get<TestDto[]>(`${this.apiUrl}/api/test`, { params });
  }

  getById(id: number): Observable<TestDto> {
    return this.http.get<TestDto>(`${this.apiUrl}/api/test/${id}`);
  }

  createTest(data: TestCreateRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}/api/test`, data, { responseType: 'text' });
  }

  updateTest(id: number, data: TestCreateRequest): Observable<string> {
    return this.http.put(`${this.apiUrl}/api/test/${id}`, data, { responseType: 'text' });
  }

  deactivateTest(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/api/test/${id}`, { responseType: 'text' });
  }
}
