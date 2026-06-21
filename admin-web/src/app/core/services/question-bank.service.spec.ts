import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { QuestionBankService } from './question-bank.service';

describe('QuestionBankService (UX-07)', () => {
  let service: QuestionBankService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(QuestionBankService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should GET /api/v1/questions/banks and return response.data', () => {
    const mockBanks = [
      { id: 1, name: 'K1', total_questions: 10 },
      { id: 2, name: 'K2', total_questions: 20 },
    ];

    service.getBanks().subscribe((result) => {
      expect(result).toEqual(mockBanks);
      expect(result.length).toBe(2);
    });

    const req = httpMock.expectOne(
      (r) => r.url === '/api/v1/questions/banks' && r.method === 'GET'
    );
    req.flush({ data: mockBanks });
  });

  it('should POST {body} and unwrap response.data', () => {
    const newBank = { id: 9, name: 'NewBank', total_questions: 0 };
    service.createBank({ name: 'NewBank' }).subscribe((result) => {
      expect(result).toEqual(newBank);
      expect(result.id).toBe(9);
    });

    const req = httpMock.expectOne(
      (r) => r.url === '/api/v1/questions/banks' && r.method === 'POST'
    );
    expect(req.request.body).toEqual({ name: 'NewBank' });
    req.flush({ data: newBank });
  });

  it('should PUT /api/v1/questions/banks/{id} and unwrap response.data', () => {
    const updated = { id: 3, name: 'Renamed', total_questions: 5 };
    service.updateBank(3, { name: 'Renamed' }).subscribe((result) => {
      expect(result).toEqual(updated);
      expect(result.name).toBe('Renamed');
    });

    const req = httpMock.expectOne(
      (r) => r.url === '/api/v1/questions/banks/3' && r.method === 'PUT'
    );
    expect(req.request.body).toEqual({ name: 'Renamed' });
    req.flush({ data: updated });
  });

  it('should DELETE /api/v1/questions/banks/{id}', () => {
    let nextCalled = false;
    service.deleteBank(7).subscribe({
      next: () => {
        nextCalled = true;
      },
    });

    const req = httpMock.expectOne(
      (r) => r.url === '/api/v1/questions/banks/7' && r.method === 'DELETE'
    );
    req.flush(null, { status: 204, statusText: 'No Content' });
    expect(nextCalled).toBe(true);
  });

  it('should fallback to response body when response.data missing on create/update', () => {
    const plainBank = { id: 1, name: 'X', total_questions: 0 };

    service.createBank({ name: 'X' }).subscribe((result) => {
      expect(result).toEqual(plainBank);
    });

    const req = httpMock.expectOne('/api/v1/questions/banks');
    req.flush(plainBank);
  });
});
