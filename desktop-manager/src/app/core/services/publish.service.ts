import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';
import { TopicDraft } from '../../features/topic-studio/topic-studio.models';
import { BrandTemplate } from './brand-template.service';

export type PublishScope = 'private' | 'school' | 'public';
export type CopyrightType = 'original' | 'licensed' | 'open_source';

export interface PublishResult {
  package: {
    id: number;
    scope: PublishScope;
    status: string;
    published_at?: string | null;
  };
  request: {
    id: number;
    status: string;
    auto_review_score?: number;
  };
  auto_review?: {
    score: number;
    passed: boolean;
    requiresManual: boolean;
    issues: string[];
    recommendations: string[];
  };
}

export interface PublicPackageItem {
  id: number;
  user_id?: number;
  title: string;
  subject?: string;
  grade_level?: string;
  author?: string;
  is_featured?: boolean;
  published_at?: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  display_name: string;
  cc_total?: number;
  cc_earned?: number;
  level_name?: string;
}

const LOCAL_PUBLISH_KEY = 'openmt_publish_requests_v1';

@Injectable({ providedIn: 'root' })
export class PublishService {
  private readonly apiBase = '/api/v1';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  submitPublish(
    draft: TopicDraft,
    options: {
      scope: PublishScope;
      copyrightConfirmed: boolean;
      copyrightType: CopyrightType;
      matchedResources: unknown[];
      graphLink?: { concept_id: number; concept_name: string } | null;
      brand?: Partial<BrandTemplate>;
    }
  ): Observable<PublishResult> {
    const remoteId = draft.remoteId;
    const packageJson = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      topic: {
        title: draft.title,
        subject: draft.subject,
        grade_level: draft.grade_level,
        goals: draft.goals,
        outline: draft.outline,
      },
      tutorial_id: draft.local_tutorial_id,
      matched_resources: options.matchedResources,
      graph_link: options.graphLink,
      brand: options.brand,
    };

    if (!this.authService.isAuthenticated() || !remoteId) {
      const localResult = this.saveLocalPublish(draft, options.scope, packageJson);
      return of(localResult);
    }

    return this.http
      .post<PublishResult>(
        `${this.apiBase}/topic-studio/drafts/${remoteId}/publish`,
        {
          scope: options.scope,
          copyright_confirmed: options.copyrightConfirmed,
          copyright_type: options.copyrightType,
          package_json: packageJson,
        },
        { headers: this.authService.getAuthHeaders() }
      )
      .pipe(
        tap((result) => this.cacheLocalPublish(result)),
        catchError(() => of(this.saveLocalPublish(draft, options.scope, packageJson)))
      );
  }

  searchPublicLibrary(query = '', limit = 20): Observable<PublicPackageItem[]> {
    return this.http
      .get<{ items: PublicPackageItem[] }>(`${this.apiBase}/public/library`, {
        params: { q: query, limit: String(limit) },
      })
      .pipe(
        map((resp) => resp.items || []),
        catchError(() => of(this.readLocalPublicLibrary(query)))
      );
  }

  getLeaderboard(limit = 10): Observable<{ all_time: LeaderboardEntry[]; monthly: LeaderboardEntry[] }> {
    return this.http
      .get<{ all_time: LeaderboardEntry[]; monthly: LeaderboardEntry[] }>(
        `${this.apiBase}/creators/leaderboard`,
        { params: { limit: String(limit) } }
      )
      .pipe(
        catchError(() =>
          of({ all_time: [], monthly: [] })
        )
      );
  }

  reportPlagiarism(input: {
    targetUserId: number;
    packageId?: number;
    reason: string;
    evidence?: string;
  }): Observable<boolean> {
    if (!this.authService.isAuthenticated()) {
      return of(false);
    }

    return this.http
      .post(
        `${this.apiBase}/plagiarism/report`,
        {
          target_user_id: input.targetUserId,
          package_id: input.packageId,
          reason: input.reason,
          evidence: input.evidence,
        },
        { headers: this.authService.getAuthHeaders() }
      )
      .pipe(map(() => true), catchError(() => of(false)));
  }

  scopeLabel(scope: PublishScope): string {
    const labels: Record<PublishScope, string> = {
      private: '私有（仅本人）',
      school: '校内共享',
      public: '平台公开',
    };
    return labels[scope];
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      published: '已发布',
      pending_review: '待审核',
      manual_review: '人工审核中',
      auto_passed: '自动通过',
      approved: '已通过',
      rejected: '已拒绝',
      draft: '草稿',
    };
    return labels[status] || status;
  }

  private saveLocalPublish(
    draft: TopicDraft,
    scope: PublishScope,
    packageJson: Record<string, unknown>
  ): PublishResult {
    const result: PublishResult = {
      package: {
        id: Date.now(),
        scope,
        status: scope === 'private' ? 'published' : 'pending_review',
        published_at: scope === 'private' ? new Date().toISOString() : null,
      },
      request: {
        id: Date.now(),
        status: scope === 'private' ? 'approved' : 'manual_review',
      },
      auto_review: {
        score: scope === 'private' ? 100 : 70,
        passed: scope === 'private',
        requiresManual: scope !== 'private',
        issues: [],
        recommendations: [],
      },
    };

    const cache = this.readLocalPublishCache();
    cache.unshift({
      draft_id: draft.id,
      title: draft.title,
      scope,
      status: result.package.status,
      package_json: packageJson,
      created_at: new Date().toISOString(),
    });
    localStorage.setItem(LOCAL_PUBLISH_KEY, JSON.stringify(cache.slice(0, 50)));

    if (scope === 'public' && result.package.status === 'published') {
      this.addToLocalPublicLibrary(draft, packageJson);
    }

    return result;
  }

  private cacheLocalPublish(result: PublishResult): void {
    const cache = this.readLocalPublishCache();
    cache.unshift({
      title: '',
      scope: result.package.scope,
      status: result.package.status,
      created_at: new Date().toISOString(),
    });
    localStorage.setItem(LOCAL_PUBLISH_KEY, JSON.stringify(cache.slice(0, 50)));
  }

  private readLocalPublishCache(): Array<Record<string, unknown>> {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_PUBLISH_KEY) || '[]');
    } catch {
      return [];
    }
  }

  private readLocalPublicLibrary(query: string): PublicPackageItem[] {
    try {
      const items = JSON.parse(
        localStorage.getItem('openmt_public_library_v1') || '[]'
      ) as PublicPackageItem[];
      if (!query) return items;
      const kw = query.toLowerCase();
      return items.filter(
        (i) =>
          i.title.toLowerCase().includes(kw) ||
          (i.subject || '').toLowerCase().includes(kw)
      );
    } catch {
      return [];
    }
  }

  private addToLocalPublicLibrary(draft: TopicDraft, packageJson: Record<string, unknown>): void {
    const items = this.readLocalPublicLibrary('');
    items.unshift({
      id: Date.now(),
      title: draft.title,
      subject: draft.subject,
      grade_level: draft.grade_level,
      author: '本地用户',
      published_at: new Date().toISOString(),
    });
    localStorage.setItem('openmt_public_library_v1', JSON.stringify(items.slice(0, 100)));
  }
}
