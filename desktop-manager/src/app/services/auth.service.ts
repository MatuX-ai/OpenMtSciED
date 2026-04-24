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
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  location?: string;
  website?: string;
  role: string | null;
  is_active: boolean;
  is_superuser: boolean;
  organization_id: number | null;
  created_at?: string;
  updated_at?: string;
  last_login_at?: string;
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
      .post<AuthResponse>(`${this.apiUrl}/auth/login`, formData)
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
          error: (error: any) => {
            // 只在token确实无效时清除，网络错误时保留token
            if (error?.status === 401 || error?.status === 403) {
              console.warn('Token已过期或无效，清除登录状态');
              this.logout();
            } else {
              console.warn('加载用户信息失败，可能是网络问题或后端未启动:', error?.message);
              // 不清除token，等待下次重试
            }
          },
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
      `${this.apiUrl}/auth/me/password`,
      { old_password: oldPassword, new_password: newPassword },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  /**
   * 更新用户个人资料
   */
  updateProfile(profileData: {
    full_name?: string;
    avatar_url?: string;
    bio?: string;
    phone?: string;
    location?: string;
    website?: string;
  }): Observable<UserInfo> {
    const token = this.getToken();
    if (!token) {
      throw new Error('未登录');
    }
    return this.http.put<UserInfo>(
      `${this.apiUrl}/auth/me/profile`,
      profileData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    ).pipe(
      tap((user) => {
        this.currentUserSubject.next(user);
      })
    );
  }
}
