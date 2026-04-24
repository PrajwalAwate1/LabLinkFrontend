import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserDto {
  userId: number;
  name: string;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  roleIds: number[];
}

export interface RoleDto {
  roleId: number;
  role: string;
}

export interface UserRegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  roleIds: number[];
}

export interface UserUpdateRequest {
  name: string;
  phone: string;
  isActive: boolean;
  password?: string;
  roleIds: number[];
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly apiUrl = 'http://localhost:5290';

  constructor(private http: HttpClient) {}

  getRoles(): Observable<RoleDto[]> {
    return this.http.get<RoleDto[]>(`${this.apiUrl}/api/role`);
  }

  getUsers(name?: string, phone?: string): Observable<UserDto[]> {
    let params = new HttpParams();
    if (name) params = params.set('name', name);
    if (phone) params = params.set('phone', phone);
    return this.http.get<UserDto[]>(`${this.apiUrl}/api/user/GetUser`, { params });
  }

  createUser(data: UserRegisterRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/user/register`, data);
  }

  updateUser(id: number, data: UserUpdateRequest): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/api/user/update/${id}`, data);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/api/user/delete/${id}`);
  }
}
