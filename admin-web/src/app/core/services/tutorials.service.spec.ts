import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TutorialsService } from './tutorials.service';

describe('TutorialsService (UX-07)', () => {
  let service: TutorialsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TutorialsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should GET /api/v1/libraries/tutorials with skip/limit params', () => {
    service.getTutorials({ skip: 10, limit: 50 }).subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === '/api/v1/libraries/tutorials' && r.method === 'GET'
    );
    expect(req.request.params.get('skip')).toBe('10');
    expect(req.request.params.get('limit')).toBe('50');
    req.flush({ data: [], total: 0 });
  });

  it('should map {data,total} to {items,total}', () => {
    const mockItems = [{ tutorial_id: 'a', title: 'Tutorial A' }];
    service.getTutorials().subscribe((result) => {
      expect(result.items).toEqual(mockItems);
      expect(result.total).toBe(3);
    });

    const req = httpMock.expectOne('/api/v1/libraries/tutorials');
    req.flush({ data: mockItems, total: 3 });
  });

  it('should omit params when none provided (default {})', () => {
    service.getTutorials().subscribe();

    const req = httpMock.expectOne('/api/v1/libraries/tutorials');
    expect(req.request.params.keys().length).toBe(0);
    expect(req.request.params.toString()).toBe('');
    req.flush({ data: [], total: 0 });
  });
});
