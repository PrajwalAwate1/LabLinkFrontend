import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RoleDto {
  roleId: number;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly apiUrl = 'http://localhost:5290';

  constructor(private http: HttpClient) {}

  getRoles(): Observable<RoleDto[]> {
    return this.http.get<RoleDto[]>(`${this.apiUrl}/api/Role`);
  }
}
