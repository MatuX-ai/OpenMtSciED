import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CoursesService } from './courses.service';

describe('CoursesService (UX-07)', () => {
  let service: CoursesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CoursesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should GET /api/v1/admin/courses with default empty params', () => {
    service.getCourses().subscribe((result) => {
      expect(result).toEqual({ items: [], total: 0 });
    });

    const req = httpMock.expectOne(
      (r) => r.url === '/api/v1/admin/courses' && r.method === 'GET'
    );
    expect(req.request.params.toString()).toBe('');
    req.flush({ data: [], total: 0 });
  });

  it('should map response.data and response.total on success', () => {
    const mockItems = [{ id: 1, title: 'C1' }];
    service.getCourses().subscribe((result) => {
      expect(result.items).toEqual(mockItems);
      expect(result.total).toBe(7);
    });

    const req = httpMock.expectOne('/api/v1/admin/courses');
    req.flush({ data: mockItems, total: 7 });
  });

  it('should pass skip/limit/level/subject/search as query params', () => {
    service
      .getCourses({ skip: 0, limit: 20, level: 'k12', subject: 'physics', search: 'robot' })
      .subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === '/api/v1/admin/courses' && r.method === 'GET'
    );
    expect(req.request.params.get('skip')).toBe('0');
    expect(req.request.params.get('limit')).toBe('20');
    expect(req.request.params.get('level')).toBe('k12');
    expect(req.request.params.get('subject')).toBe('physics');
    expect(req.request.params.get('search')).toBe('robot');
    req.flush({ data: [], total: 0 });
  });

  it('should propagate HTTP 500 error to subscribers', () => {
    let receivedError: unknown = null;
    service.getCourses().subscribe({
      next: () => {
        throw new Error('should not succeed');
      },
      error: (err) => {
        receivedError = err;
      },
    });

    const req = httpMock.expectOne('/api/v1/admin/courses');
    req.flush(null, { status: 500, statusText: 'Server Error' });
    expect(receivedError).toBeTruthy();
    expect((receivedError as { status: number }).status).toBe(500);
  });
});
