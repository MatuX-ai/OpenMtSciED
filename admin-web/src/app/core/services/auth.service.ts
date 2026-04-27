import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  role: string | null;
  is_active: boolean;
  is_superuser: boolean;
  organization_id: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1';
  private currentUserSubject = new BehaviorSubject<UserInfo | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    const token = localStorage.getItem('access_token');
    if (token) {
      this.loadCurrentUser();
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access_token);
        this.loadCurrentUser();
      })
    );
  }

  register(data: RegisterRequest): Observable<UserInfo> {
    return this.http.post<UserInfo>(`${this.apiUrl}/auth/register`, data);
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  private loadCurrentUser(): void {
    this.http.get<UserInfo>(`${this.apiUrl}/auth/me`, { headers: this.getAuthHeaders() }).subscribe({
      next: (user) => this.currentUserSubject.next(user),
      error: (error) => {
        // 只在token确实无效时清除，网络错误时保留token
        if (error?.status === 401 || error?.status === 403) {
          console.warn('Token已过期或无效，清除登录状态');
          this.logout();
        } else {
          console.warn('加载用户信息失败，可能是网络问题或后端未启动:', error?.message);
          // 不清除token，等待下次重试
        }
      }
    });
  }
}
