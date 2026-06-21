import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
  HttpErrorResponse,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { httpErrorInterceptor } from './http-error.interceptor';

describe('httpErrorInterceptor (UX-08)', () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let snackBar: { open: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    sessionStorage.clear();
    snackBar = { open: vi.fn() };
    router = { navigate: vi.fn().mockReturnValue(Promise.resolve(true)) };

    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      providers: [
        provideHttpClient(withInterceptors([httpErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: snackBar },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('should attach Bearer Authorization header when token exists in sessionStorage', () => {
    sessionStorage.setItem('access_token', 'abc-123');
    let completed = false;

    http.get('/api/v1/anything').subscribe({
      next: () => {
        completed = true;
      },
    });

    const req = httpMock.expectOne('/api/v1/anything');
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc-123');
    req.flush({ ok: true });
    expect(completed).toBe(true);
  });

  it('should NOT attach Authorization header when no token', () => {
    let completed = false;
    http.get('/api/v1/anything').subscribe({
      next: () => {
        completed = true;
      },
    });

    const req = httpMock.expectOne('/api/v1/anything');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({ ok: true });
    expect(completed).toBe(true);
  });

  it('should clear token and navigate to /login on 401, show snackbar', () => {
    sessionStorage.setItem('access_token', 'will-expire');
    let receivedStatus = 0;

    http.get('/api/v1/protected').subscribe({
      next: () => {
        throw new Error('should not succeed');
      },
      error: (err: HttpErrorResponse) => {
        receivedStatus = err.status;
      },
    });

    const req = httpMock.expectOne('/api/v1/protected');
    req.flush({ detail: 'Token expired' }, { status: 401, statusText: 'Unauthorized' });

    expect(receivedStatus).toBe(401);
    expect(sessionStorage.getItem('access_token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    expect(snackBar.open).toHaveBeenCalledWith(
      '未授权，请重新登录',
      '关闭',
      expect.objectContaining({ duration: 5000, panelClass: ['error-snackbar'] })
    );
  });

  it('should show 403 snackbar but NOT clear token or navigate', () => {
    sessionStorage.setItem('access_token', 'still-here');
    let receivedStatus = 0;

    http.get('/api/v1/forbidden').subscribe({
      error: (err: HttpErrorResponse) => {
        receivedStatus = err.status;
      },
    });

    const req = httpMock.expectOne('/api/v1/forbidden');
    req.flush({ detail: 'forbidden' }, { status: 403, statusText: 'Forbidden' });

    expect(receivedStatus).toBe(403);
    expect(sessionStorage.getItem('access_token')).toBe('still-here');
    expect(router.navigate).not.toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith(
      '禁止访问，权限不足',
      '关闭',
      expect.any(Object)
    );
  });

  it('should show 500 snackbar and rethrow original error', () => {
    let receivedError: HttpErrorResponse | null = null;
    http.get('/api/v1/boom').subscribe({
      error: (err: HttpErrorResponse) => {
        receivedError = err;
      },
    });

    const req = httpMock.expectOne('/api/v1/boom');
    req.flush({ detail: 'kaboom' }, { status: 500, statusText: 'Server Error' });

    expect(receivedError).toBeTruthy();
    expect((receivedError as HttpErrorResponse | null)?.status).toBe(500);
    expect(snackBar.open).toHaveBeenCalledWith(
      '服务器内部错误',
      '关闭',
      expect.any(Object)
    );
  });

  it('should use detail field for non-production 400 error', () => {
    http.get('/api/v1/bad').subscribe({ error: () => undefined });

    const req = httpMock.expectOne('/api/v1/bad');
    req.flush({ detail: '字段不能为空' }, { status: 400, statusText: 'Bad Request' });

    expect(snackBar.open).toHaveBeenCalledWith(
      '字段不能为空',
      '关闭',
      expect.any(Object)
    );
  });

  it('should show 404 snackbar when resource missing', () => {
    http.get('/api/v1/missing').subscribe({ error: () => undefined });

    const req = httpMock.expectOne('/api/v1/missing');
    req.flush({ detail: 'no such' }, { status: 404, statusText: 'Not Found' });

    expect(snackBar.open).toHaveBeenCalledWith(
      '请求的资源不存在',
      '关闭',
      expect.any(Object)
    );
  });
});