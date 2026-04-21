import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface PanelResultDto {
  panelId: number;
  panelCode: string;
  panelName: string;
  isActive: boolean;
  testIds: number[];
}

export interface PanelCreateRequest {
  panelCode: string;
  panelName: string;
  testIds: number[];
}

export interface PanelUpdateRequest {
  id: number;
  panelCode: string;
  panelName: string;
  testIds: number[];
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class PanelService {
  private readonly apiUrl = 'http://localhost:5290';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getPanels(panelName?: string, panelCode?: string): Observable<PanelResultDto[]> {
    let params = new HttpParams();
    if (panelName) params = params.set('panelName', panelName);
    if (panelCode) params = params.set('panelCode', panelCode);
    return this.http.get<PanelResultDto[]>(`${this.apiUrl}/api/Panel`, {
      headers: this.getHeaders(),
      params
    });
  }

  createPanel(data: PanelCreateRequest): Observable<PanelResultDto> {
    return this.http.post<PanelResultDto>(`${this.apiUrl}/api/Panel/create`, data, {
      headers: this.getHeaders()
    });
  }

  updatePanel(data: PanelUpdateRequest): Observable<PanelResultDto> {
    return this.http.put<PanelResultDto>(`${this.apiUrl}/api/Panel/update`, data, {
      headers: this.getHeaders()
    });
  }

  deactivatePanel(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/Panel/deactivate/${id}`, {
      headers: this.getHeaders()
    });
  }
}
