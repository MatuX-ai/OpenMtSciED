import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { User } from '../../models/user.models';

describe('UserService (UX-08)', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should GET /api/v1/users with default page=1 limit=50 when no filters', () => {
    service.getUsers().subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === '/api/v1/users' && r.method === 'GET'
    );
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('50');
    expect(req.request.params.has('role')).toBe(false);
    expect(req.request.params.has('status')).toBe(false);
    expect(req.request.params.has('search')).toBe(false);
    req.flush({ data: [] });
  });

  it('should pass role/status/search as query params when provided', () => {
    service.getUsers(2, 20, 'admin', 'active', 'alice').subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === '/api/v1/users' && r.method === 'GET'
    );
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('limit')).toBe('20');
    expect(req.request.params.get('role')).toBe('admin');
    expect(req.request.params.get('status')).toBe('active');
    expect(req.request.params.get('search')).toBe('alice');
    req.flush({ data: [] });
  });

  it('should GET /api/v1/users/{id} and return response on getUser()', () => {
    const mockUser: User = {
      id: 5,
      username: 'carol',
      email: 'carol@example.com',
      role: 'user',
      is_active: true,
      is_superuser: false,
      organization_id: 2,
    };

    service.getUser(5).subscribe((result) => {
      expect(result).toEqual(mockUser);
      expect(result.id).toBe(5);
    });

    const req = httpMock.expectOne(
      (r) => r.url === '/api/v1/users/5' && r.method === 'GET'
    );
    req.flush(mockUser);
  });

  it('should DELETE /api/v1/users/{id} on deleteUser()', () => {
    let nextCalled = false;
    service.deleteUser(7).subscribe({
      next: () => {
        nextCalled = true;
      },
    });

    const req = httpMock.expectOne(
      (r) => r.url === '/api/v1/users/7' && r.method === 'DELETE'
    );
    req.flush(null, { status: 204, statusText: 'No Content' });
    expect(nextCalled).toBe(true);
  });

  it('should POST FormData (file + conflict_resolution) on bulkImportUsers()', () => {
    const mockResult = {
      success_count: 3,
      failed_count: 1,
      conflicts_count: 0,
      errors: [],
      conflicts: {},
      imported_users: [],
    };
    const file = new File(['name,email\nfoo,foo@x.com'], 'users.csv', {
      type: 'text/csv',
    });

    service.bulkImportUsers(file, 'skip').subscribe((result) => {
      expect(result).toEqual(mockResult);
      expect(result.success_count).toBe(3);
    });

    const req = httpMock.expectOne(
      (r) => r.url === '/api/v1/auth/bulk-import' && r.method === 'POST'
    );
    expect(req.request.body instanceof FormData).toBe(true);
    const formData = req.request.body as FormData;
    expect(formData.get('file')).toBeTruthy();
    expect((formData.get('file') as File).name).toBe('users.csv');
    expect(formData.get('conflict_resolution')).toBe('skip');
    req.flush(mockResult);
  });

  it('should default conflict_resolution to "skip" when not specified', () => {
    const file = new File(['x'], 'u.csv');
    service.bulkImportUsers(file).subscribe();

    const req = httpMock.expectOne('/api/v1/auth/bulk-import');
    const formData = req.request.body as FormData;
    expect(formData.get('conflict_resolution')).toBe('skip');
    req.flush({ success_count: 0, failed_count: 0, conflicts_count: 0, errors: [], conflicts: {}, imported_users: [] });
  });

  it('should GET /api/v1/users/stats and return stats payload', () => {
    const mockStats = {
      totalUsers: 100,
      activeUsers: 80,
      inactiveUsers: 20,
      adminUsers: 5,
      orgAdminUsers: 3,
    };

    service.getUserStats().subscribe((result) => {
      expect(result).toEqual(mockStats);
      expect(result.totalUsers).toBe(100);
    });

    const req = httpMock.expectOne(
      (r) => r.url === '/api/v1/users/stats' && r.method === 'GET'
    );
    req.flush(mockStats);
  });
});