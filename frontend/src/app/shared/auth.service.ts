import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

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
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api/v1';
  private http = inject(HttpClient);
  private currentUserSubject = new BehaviorSubject<UserInfo | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // 初始化时检查本地存储的 token
    const token = localStorage.getItem('access_token');
    if (token) {
      this.loadCurrentUser();
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/token`, formData)
      .pipe(
        tap((response) => {
          localStorage.setItem('access_token', response.access_token);
          this.loadCurrentUser();
        })
      );
  }

  register(userData: RegisterRequest): Observable<UserInfo> {
    return this.http.post<UserInfo>(`${this.apiUrl}/auth/register`, userData);
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.currentUserSubject.next(null);
  }

  private loadCurrentUser(): void {
    const token = localStorage.getItem('access_token');
    if (token) {
      this.http
        .get<UserInfo>(`${this.apiUrl}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .subscribe({
          next: (user) => this.currentUserSubject.next(user),
          error: () => this.logout(),
        });
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * 修改密码
   */
  changePassword(oldPassword: string, newPassword: string): Observable<void> {
    const token = this.getToken();
    if (!token) {
      throw new Error('未登录');
    }
    return this.http.post<void>(
      `${this.apiUrl}/users/me/password`,
      { old_password: oldPassword, new_password: newPassword },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
