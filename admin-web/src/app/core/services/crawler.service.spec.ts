import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CrawlerService, CreateCrawlerRequest } from './crawler.service';

describe('CrawlerService (UX-08)', () => {
  let service: CrawlerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CrawlerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should GET /api/v1/admin/crawler and unwrap response.data', () => {
    const mockTasks = [
      {
        id: '1',
        name: 'khan',
        description: 'Khan Academy',
        status: 'idle' as const,
        progress: 0,
        total_items: 0,
        scraped_items: 0,
        last_run: null,
        next_scheduled: null,
        error_message: null,
      },
    ];

    service.getCrawlerTasks().subscribe((result) => {
      expect(result).toEqual(mockTasks);
      expect(result.length).toBe(1);
    });

    const req = httpMock.expectOne(
      (r) => r.url === '/api/v1/admin/crawler' && r.method === 'GET'
    );
    req.flush({ data: mockTasks });
  });

  it('should fallback to [] when response.data is missing on getCrawlerTasks', () => {
    service.getCrawlerTasks().subscribe((result) => {
      expect(result).toEqual([]);
    });

    const req = httpMock.expectOne('/api/v1/admin/crawler');
    req.flush([]);
  });

  it('should POST /api/v1/admin/crawler with payload on createCrawler', () => {
    const payload: CreateCrawlerRequest = {
      name: 'openstax',
      url: 'https://openstax.org',
      type: 'course',
      description: 'OpenStax crawler',
    };
    const created = {
      id: '42',
      name: 'openstax',
      description: 'OpenStax crawler',
      status: 'idle' as const,
      progress: 0,
      total_items: 0,
      scraped_items: 0,
      last_run: null,
      next_scheduled: null,
      error_message: null,
    };

    service.createCrawler(payload).subscribe((result) => {
      expect(result).toEqual(created);
      expect(result.id).toBe('42');
    });

    const req = httpMock.expectOne(
      (r) => r.url === '/api/v1/admin/crawler' && r.method === 'POST'
    );
    expect(req.request.body).toEqual(payload);
    req.flush(created);
  });

  it('should DELETE /api/v1/admin/crawler/{id} and POST /:id/run + /:id/schedule', () => {
    let deleteCalled = false;
    let runCalled = false;
    let scheduleCalled = false;

    service.deleteCrawler('abc').subscribe({
      next: () => {
        deleteCalled = true;
      },
    });
    service.runCrawler('abc').subscribe({
      next: () => {
        runCalled = true;
      },
    });
    service.setSchedule('abc', 6).subscribe({
      next: () => {
        scheduleCalled = true;
      },
    });

    const delReq = httpMock.expectOne(
      (r) => r.url === '/api/v1/admin/crawler/abc' && r.method === 'DELETE'
    );
    expect(delReq.request.body).toBeNull();
    delReq.flush(null, { status: 204, statusText: 'No Content' });

    const runReq = httpMock.expectOne(
      (r) => r.url === '/api/v1/admin/crawler/abc/run' && r.method === 'POST'
    );
    expect(runReq.request.body).toEqual({});
    runReq.flush(null, { status: 200, statusText: 'OK' });

    const schedReq = httpMock.expectOne(
      (r) =>
        r.url === '/api/v1/admin/crawler/abc/schedule' &&
        r.method === 'POST' &&
        r.params.get('interval_hours') === '6'
    );
    expect(schedReq.request.body).toEqual({});
    schedReq.flush(null, { status: 200, statusText: 'OK' });

    expect(deleteCalled).toBe(true);
    expect(runCalled).toBe(true);
    expect(scheduleCalled).toBe(true);
  });

  it('should propagate HTTP 500 error from getCrawlerTasks', () => {
    let receivedStatus = 0;
    service.getCrawlerTasks().subscribe({
      next: () => {
        throw new Error('should not succeed');
      },
      error: (err) => {
        receivedStatus = err.status;
      },
    });

    const req = httpMock.expectOne('/api/v1/admin/crawler');
    req.flush({ message: 'boom' }, { status: 500, statusText: 'Server Error' });
    expect(receivedStatus).toBe(500);
  });
});