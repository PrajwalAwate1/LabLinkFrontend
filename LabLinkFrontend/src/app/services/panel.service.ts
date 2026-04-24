import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  constructor(private http: HttpClient) {}

  getPanels(panelName?: string, panelCode?: string): Observable<PanelResultDto[]> {
    let params = new HttpParams();
    if (panelName) params = params.set('panelName', panelName);
    if (panelCode) params = params.set('panelCode', panelCode);
    return this.http.get<PanelResultDto[]>(`${this.apiUrl}/api/Panel`, { params });
  }

  createPanel(data: PanelCreateRequest): Observable<PanelResultDto> {
    return this.http.post<PanelResultDto>(`${this.apiUrl}/api/Panel/create`, data);
  }

  updatePanel(data: PanelUpdateRequest): Observable<PanelResultDto> {
    return this.http.put<PanelResultDto>(`${this.apiUrl}/api/Panel/update`, data);
  }

  deactivatePanel(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/Panel/deactivate/${id}`);
  }
}
