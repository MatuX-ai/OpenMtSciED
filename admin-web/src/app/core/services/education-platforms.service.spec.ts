import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EducationPlatformsService, PlatformStatus } from './education-platforms.service';

describe('EducationPlatformsService (UX-07)', () => {
  let service: EducationPlatformsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(EducationPlatformsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should GET /api/v1/admin/education-platforms and map response.data', () => {
    const mockPlatforms: PlatformStatus[] = [
      {
        id: '1',
        platform_name: 'khan_academy',
        source: 'khan',
        target_url: 'https://example.com',
        type: 'course',
        output_file: 'out.json',
        status: 'active',
        last_run: '2026-06-19T00:00:00Z',
        total_items: 100,
        error_message: null,
      },
    ];

    service.getPlatforms().subscribe((result) => {
      expect(result).toEqual(mockPlatforms);
      expect(result.length).toBe(1);
      expect(result[0].platform_name).toBe('khan_academy');
    });

    const req = httpMock.expectOne(
      (r) => r.url === '/api/v1/admin/education-platforms' && r.method === 'GET'
    );
    req.flush({ data: mockPlatforms });
  });

  it('should POST /api/v1/education-platforms/generate with empty body for generateAllPlatforms', () => {
    service.generateAllPlatforms().subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === '/api/v1/education-platforms/generate' && r.method === 'POST'
    );
    expect(req.request.body).toEqual({});
    req.flush({ success: true });
  });

  it('should POST with { platform_name } for generatePlatform(name)', () => {
    service.generatePlatform('khan_academy').subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === '/api/v1/education-platforms/generate' && r.method === 'POST'
    );
    expect(req.request.body).toEqual({ platform_name: 'khan_academy' });
    req.flush({ success: true });
  });

  it('should fallback to [] when response.data is missing on getPlatforms', () => {
    service.getPlatforms().subscribe((result) => {
      expect(result).toEqual([]);
    });

    const req = httpMock.expectOne('/api/v1/admin/education-platforms');
    req.flush({});
  });

  it('should return undefined on successful POST (void observable)', () => {
    let nextCalled = false;
    service.generateAllPlatforms().subscribe({
      next: () => {
        nextCalled = true;
      },
    });

    const req = httpMock.expectOne('/api/v1/education-platforms/generate');
    req.flush(null, { status: 200, statusText: 'OK' });
    expect(nextCalled).toBe(true);
  });
});
