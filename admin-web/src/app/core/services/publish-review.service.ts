import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface PublishRequestItem {
  id: number;
  package_id: number;
  package_title?: string;
  package_subject?: string;
  author?: string;
  scope: string;
  status: string;
  auto_review_score?: number;
  auto_review_notes?: { issues?: string[]; recommendations?: string[] };
  copyright_type?: string;
  created_at: string;
}

export interface PlagiarismReportItem {
  id: number;
  package_id?: number;
  package_title?: string;
  reporter: string;
  target_user: string;
  target_user_id: number;
  reason: string;
  evidence?: string;
  status: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class PublishReviewService {
  private http = inject(HttpClient);
  private readonly publishBase = '/api/v1/admin/publish-requests';
  private readonly plagiarismBase = '/api/v1/admin/plagiarism';

  listPublishRequests(status = 'manual_review'): Observable<{ items: PublishRequestItem[] }> {
    return this.http.get<{ items: PublishRequestItem[] }>(this.publishBase, {
      params: { status },
    });
  }

  reviewPublishRequest(
    id: number,
    action: 'approve' | 'reject',
    note?: string,
    featured = false
  ): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.publishBase}/${id}/review`, {
      action,
      note,
      featured,
    });
  }

  processPayouts(): Observable<{ processed: number }> {
    return this.http.post<{ processed: number }>(`${this.publishBase}/process-payouts`, {});
  }

  listPlagiarismReports(status = 'pending'): Observable<{ items: PlagiarismReportItem[] }> {
    return this.http.get<{ items: PlagiarismReportItem[] }>(this.plagiarismBase, {
      params: { status },
    });
  }

  resolvePlagiarism(id: number, confirmed: boolean, adminNote?: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.plagiarismBase}/${id}/resolve`, {
      confirmed,
      admin_note: adminNote,
    });
  }
}
