import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface RoleDto {
  roleId: number;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly apiUrl = 'http://localhost:5290';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getRoles(): Observable<RoleDto[]> {
    return this.http.get<RoleDto[]>(`${this.apiUrl}/api/Role`, {
      headers: this.getHeaders()
    });
  }
}
