import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MaterialsService } from './materials.service';

describe('MaterialsService (UX-07)', () => {
  let service: MaterialsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MaterialsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should GET /api/v1/libraries/materials', () => {
    service.getMaterials({ skip: 0, limit: 25 }).subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === '/api/v1/libraries/materials' && r.method === 'GET'
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('skip')).toBe('0');
    expect(req.request.params.get('limit')).toBe('25');
    req.flush({ data: [], total: 0 });
  });

  it('should map response to {items, total}', () => {
    const mockItems = [{ chapter_id: 'c1', title: 'Chapter 1' }];
    service.getMaterials().subscribe((result) => {
      expect(result.items).toEqual(mockItems);
      expect(result.total).toBe(42);
    });

    const req = httpMock.expectOne('/api/v1/libraries/materials');
    req.flush({ data: mockItems, total: 42 });
  });

  it('should omit params when not provided', () => {
    service.getMaterials().subscribe();

    const req = httpMock.expectOne('/api/v1/libraries/materials');
    expect(req.request.params.keys().length).toBe(0);
    expect(req.request.params.toString()).toBe('');
    req.flush({ data: [], total: 0 });
  });
});
