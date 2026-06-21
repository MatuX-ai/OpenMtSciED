import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { firstValueFrom, take } from 'rxjs';
import { AuthService, UserInfo } from './auth.service';

describe('AuthService (UX-08)', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('should NOT call /auth/me when no token in sessionStorage on construction', () => {
    // 重新构造以验证：清理 token 后无副作用
    sessionStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // 不应该有任何 HTTP 请求
    httpMock.expectNone(() => true);
    expect(service.isAuthenticated()).toBe(false);
    expect(service.getToken()).toBeNull();
  });

  it('should load /auth/me when token exists in sessionStorage (constructor)', async () => {
    sessionStorage.setItem('access_token', 'cached-token');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    const req = httpMock.expectOne(
      (r) => r.url === '/api/v1/auth/me' && r.method === 'GET'
    );
    expect(req.request.headers.get('Authorization')).toBe('Bearer cached-token');

    const mockUser: UserInfo = {
      id: 1,
      username: 'alice',
      email: 'alice@example.com',
      role: 'admin',
      is_active: true,
      is_superuser: false,
      organization_id: null,
    };
    req.flush(mockUser);

    const current = await firstValueFrom(service.currentUser$.pipe(take(1)));
    expect(current).toEqual(mockUser);
    expect(service.getCurrentUser()).toEqual(mockUser);
  });

  it('should store token and trigger loadCurrentUser on login()', async () => {
    const loginResponse = { access_token: 'new-token', token_type: 'bearer' };
    const mockUser: UserInfo = {
      id: 2,
      username: 'bob',
      email: 'bob@example.com',
      role: 'user',
      is_active: true,
      is_superuser: false,
      organization_id: 1,
    };

    service.login({ username: 'bob', password: 'pw' }).subscribe((res) => {
      expect(res).toEqual(loginResponse);
    });

    const loginReq = httpMock.expectOne(
      (r) => r.url === '/api/v1/auth/login' && r.method === 'POST'
    );
    expect(loginReq.request.body).toEqual({ username: 'bob', password: 'pw' });
    loginReq.flush(loginResponse);

    // 副作用：sessionStorage 写入
    expect(sessionStorage.getItem('access_token')).toBe('new-token');

    // 副作用：loadCurrentUser 触发 /auth/me
    const meReq = httpMock.expectOne('/api/v1/auth/me');
    expect(meReq.request.headers.get('Authorization')).toBe('Bearer new-token');
    meReq.flush(mockUser);

    const current = await firstValueFrom(service.currentUser$.pipe(take(1)));
    expect(current).toEqual(mockUser);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should clear token and emit null on logout()', () => {
    sessionStorage.setItem('access_token', 'will-be-cleared');
    expect(service.isAuthenticated()).toBe(true);

    service.logout();

    expect(sessionStorage.getItem('access_token')).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.getCurrentUser()).toBeNull();
  });

  it('should return Bearer Authorization header from getAuthHeaders()', () => {
    sessionStorage.setItem('access_token', 'tok-xyz');
    const headers = service.getAuthHeaders();
    expect(headers.get('Authorization')).toBe('Bearer tok-xyz');
  });

  it('should auto-logout when /auth/me returns 401 (token invalid)', () => {
    sessionStorage.setItem('access_token', 'expired-token');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    const req = httpMock.expectOne('/api/v1/auth/me');
    req.flush({ message: 'unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(sessionStorage.getItem('access_token')).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should KEEP token when /auth/me returns 500 (network/server error)', () => {
    sessionStorage.setItem('access_token', 'still-valid');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    const req = httpMock.expectOne('/api/v1/auth/me');
    req.flush({ message: 'oops' }, { status: 500, statusText: 'Server Error' });

    // 500 不应清除 token，等下次重试
    expect(sessionStorage.getItem('access_token')).toBe('still-valid');
    expect(service.isAuthenticated()).toBe(true);
  });
});