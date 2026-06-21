import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';

export type CreditAction =
  | 'save_tutorial'
  | 'upload_material'
  | 'link_graph'
  | 'link_resource'
  | 'apply_brand'
  | 'export_package'
  | 'publish_approved'
  | 'featured'
  | 'plagiarism_penalty';

export const CREDIT_RULES: Record<CreditAction, number> = {
  save_tutorial: 10,
  upload_material: 30,
  link_graph: 15,
  link_resource: 5,
  apply_brand: 5,
  export_package: 10,
  publish_approved: 100,
  featured: 200,
  plagiarism_penalty: -500,
};

export const LEVEL_NAMES: Record<number, string> = {
  1: '见习创课者',
  2: '活跃教师',
  3: '认证创作者',
  4: '金牌导师',
};

export interface CreditLedgerEntry {
  id: string | number;
  action: CreditAction | string;
  cc_delta: number;
  ref_type?: string;
  ref_id?: string;
  note?: string;
  created_at: string;
}

export interface CreatorProfileView {
  cc_total: number;
  level: number;
  level_name: string;
  badges: unknown[];
}

export interface CreatorOverview {
  profile: CreatorProfileView;
  stats?: { topic_drafts?: number; graph_links?: number; pending_publish?: number };
  recent_ledger?: CreditLedgerEntry[];
  next_level?: { level: number; name: string; cc_needed: number } | null;
  publish_frozen_until?: string | null;
}

const LOCAL_LEDGER_KEY = 'openmt_credit_ledger_v1';
const LOCAL_PROFILE_KEY = 'openmt_creator_profile_v1';

@Injectable({ providedIn: 'root' })
export class CreatorService {
  private readonly apiBase = '/api/v1/creators';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getOverview(): Observable<CreatorOverview> {
    if (!this.authService.isAuthenticated()) {
      return of(this.buildLocalOverview());
    }

    return this.http
      .get<CreatorOverview>(`${this.apiBase}/me`, { headers: this.authService.getAuthHeaders() })
      .pipe(catchError(() => of(this.buildLocalOverview())));
  }

  getLedger(limit = 50): Observable<CreditLedgerEntry[]> {
    if (!this.authService.isAuthenticated()) {
      return of(this.readLocalLedger().slice(0, limit));
    }

    return this.http
      .get<{ items: CreditLedgerEntry[] }>(`${this.apiBase}/ledger`, {
        headers: this.authService.getAuthHeaders(),
        params: { limit: String(limit) },
      })
      .pipe(
        map((resp) => resp.items || []),
        catchError(() => of(this.readLocalLedger().slice(0, limit)))
      );
  }

  award(action: CreditAction, ref?: { refType?: string; refId?: string; note?: string }): Observable<boolean> {
    if (this.authService.isAuthenticated()) {
      return this.http
        .post<{ awarded: boolean }>(
          `${this.apiBase}/award`,
          {
            action,
            ref_type: ref?.refType,
            ref_id: ref?.refId,
            note: ref?.note,
          },
          { headers: this.authService.getAuthHeaders() }
        )
        .pipe(
          map((resp) => resp.awarded),
          tap((awarded) => {
            if (!awarded) this.awardLocal(action, ref);
          }),
          catchError(() => {
            this.awardLocal(action, ref);
            return of(true);
          })
        );
    }

    this.awardLocal(action, ref);
    return of(true);
  }

  actionLabel(action: string): string {
    const labels: Record<string, string> = {
      save_tutorial: '保存教程',
      upload_material: '上传课件',
      link_graph: '挂接图谱',
      link_resource: '关联资源',
      apply_brand: '应用品牌模板',
      export_package: '导出教学包',
      publish_approved: '发布通过',
      featured: '官方精选',
      plagiarism_penalty: '抄袭扣罚',
    };
    return labels[action] || action;
  }

  computeLevel(ccTotal: number): number {
    if (ccTotal >= 2000) return 4;
    if (ccTotal >= 800) return 3;
    if (ccTotal >= 200) return 2;
    return 1;
  }

  private awardLocal(
    action: CreditAction,
    ref?: { refType?: string; refId?: string; note?: string }
  ): void {
    const ccDelta = CREDIT_RULES[action] ?? 0;
    if (ccDelta === 0) return;

    const refType = ref?.refType ?? '';
    const refId = ref?.refId ?? '';
    const ledger = this.readLocalLedger();

    if (ledger.some((e) => e.action === action && e.ref_type === refType && e.ref_id === refId)) {
      return;
    }

    const profile = this.readLocalProfile();
    profile.cc_total += ccDelta;
    profile.level = this.computeLevel(profile.cc_total);
    profile.level_name = LEVEL_NAMES[profile.level] || '见习创课者';

    ledger.unshift({
      id: `local-${Date.now()}`,
      action,
      cc_delta: ccDelta,
      ref_type: refType,
      ref_id: refId,
      note: ref?.note,
      created_at: new Date().toISOString(),
    });

    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
    localStorage.setItem(LOCAL_LEDGER_KEY, JSON.stringify(ledger.slice(0, 200)));
  }

  private buildLocalOverview(): CreatorOverview {
    const profile = this.readLocalProfile();
    return {
      profile,
      stats: { topic_drafts: 0, graph_links: 0 },
      recent_ledger: this.readLocalLedger().slice(0, 5),
      next_level: this.getNextLevel(profile.cc_total),
    };
  }

  private getNextLevel(ccTotal: number) {
    const thresholds = [
      { level: 2, name: '活跃教师', minCc: 200 },
      { level: 3, name: '认证创作者', minCc: 800 },
      { level: 4, name: '金牌导师', minCc: 2000 },
    ];
    const next = thresholds.find((t) => t.minCc > ccTotal);
    return next ? { level: next.level, name: next.name, cc_needed: next.minCc - ccTotal } : null;
  }

  private readLocalProfile(): CreatorProfileView {
    try {
      const raw = JSON.parse(localStorage.getItem(LOCAL_PROFILE_KEY) || '{}');
      const ccTotal = Number(raw.cc_total || 0);
      const level = this.computeLevel(ccTotal);
      return {
        cc_total: ccTotal,
        level,
        level_name: LEVEL_NAMES[level],
        badges: raw.badges || [],
      };
    } catch {
      return { cc_total: 0, level: 1, level_name: LEVEL_NAMES[1], badges: [] };
    }
  }

  private readLocalLedger(): CreditLedgerEntry[] {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_LEDGER_KEY) || '[]') as CreditLedgerEntry[];
    } catch {
      return [];
    }
  }
}
