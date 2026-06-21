import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';
import {
  TopicDraft,
  TopicDraftInput,
  TopicOutline,
} from './topic-studio.models';

const STORAGE_KEY = 'openmt_topic_drafts_v1';

@Injectable({ providedIn: 'root' })
export class TopicStudioService {
  private readonly apiBase = '/api/v1/topic-studio';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  listDrafts(): Observable<TopicDraft[]> {
    return this.mergeRemoteAndLocal();
  }

  getDraft(id: string): Observable<TopicDraft | null> {
    const local = this.readLocal().find((d) => d.id === id);
    if (local?.remoteId && this.hasToken()) {
      return this.http
        .get<Record<string, unknown>>(`${this.apiBase}/drafts/${local.remoteId}`, {
          headers: this.authService.getAuthHeaders(),
        })
        .pipe(
          map((row) => this.fromApi(row, local.id)),
          catchError(() => of(local ?? null))
        );
    }
    return of(local ?? null);
  }

  createDraft(input: TopicDraftInput): Observable<TopicDraft> {
    const now = new Date().toISOString();
    const localDraft: TopicDraft = {
      id: `local-${crypto.randomUUID()}`,
      title: input.title.trim(),
      subject: input.subject,
      grade_level: input.grade_level,
      goals: input.goals,
      duration_hours: input.duration_hours,
      max_budget: input.max_budget,
      needs_hardware: input.needs_hardware ?? false,
      status: 'draft',
      current_step: 0,
      created_at: now,
      updated_at: now,
    };

    if (!this.hasToken()) {
      this.upsertLocal(localDraft);
      return of(localDraft);
    }

    return this.http
      .post<Record<string, unknown>>(`${this.apiBase}/drafts`, this.toApiPayload(input), {
        headers: this.authService.getAuthHeaders(),
      })
      .pipe(
        map((row) => {
          const draft = this.fromApi(row, localDraft.id);
          this.upsertLocal(draft);
          return draft;
        }),
        catchError(() => {
          this.upsertLocal(localDraft);
          return of(localDraft);
        })
      );
  }

  updateDraft(id: string, patch: Partial<TopicDraft>): Observable<TopicDraft> {
    const existing = this.readLocal().find((d) => d.id === id);
    if (!existing) {
      return throwError(() => new Error('草稿不存在'));
    }

    const merged: TopicDraft = {
      ...existing,
      ...patch,
      updated_at: new Date().toISOString(),
    };
    this.upsertLocal(merged);

    if (merged.remoteId && this.hasToken()) {
      return this.http
        .put<Record<string, unknown>>(
          `${this.apiBase}/drafts/${merged.remoteId}`,
          this.toApiPayload(merged),
          { headers: this.authService.getAuthHeaders() }
        )
        .pipe(
          map((row) => {
            const draft = this.fromApi(row, merged.id);
            this.upsertLocal(draft);
            return draft;
          }),
          catchError(() => of(merged))
        );
    }

    return of(merged);
  }

  deleteDraft(id: string): Observable<void> {
    const existing = this.readLocal().find((d) => d.id === id);
    this.removeLocal(id);

    if (existing?.remoteId && this.hasToken()) {
      return this.http
        .delete(`${this.apiBase}/drafts/${existing.remoteId}`, {
          headers: this.authService.getAuthHeaders(),
        })
        .pipe(map(() => undefined), catchError(() => of(undefined)));
    }

    return of(undefined);
  }

  findDraftByTutorialId(courseId: number): TopicDraft | null {
    return this.readLocal().find((d) => d.local_tutorial_id === courseId) ?? null;
  }

  generateOutline(draftId: string): Observable<TopicOutline> {
    const existing = this.readLocal().find((d) => d.id === draftId);
    if (!existing) {
      return throwError(() => new Error('草稿不存在'));
    }

    if (existing.remoteId && this.hasToken()) {
      return this.http
        .post<{ outline: TopicOutline }>(
          `${this.apiBase}/drafts/${existing.remoteId}/generate-outline`,
          {},
          { headers: this.authService.getAuthHeaders() }
        )
        .pipe(
          switchMap((resp) =>
            this.updateDraft(draftId, {
              outline: resp.outline,
              status: 'outline_ready',
              current_step: Math.max(existing.current_step, 1),
            }).pipe(map((d) => d.outline!))
          ),
          catchError(() => this.generateOutlineLocal(draftId, existing))
        );
    }

    return this.generateOutlineLocal(draftId, existing);
  }

  private generateOutlineLocal(draftId: string, draft: TopicDraft): Observable<TopicOutline> {
    const outline = this.buildStubOutline(draft);
    return this.updateDraft(draftId, {
      outline,
      status: 'outline_ready',
      current_step: Math.max(draft.current_step, 1),
    }).pipe(map((d) => d.outline!));
  }

  private mergeRemoteAndLocal(): Observable<TopicDraft[]> {
    const local = this.readLocal();

    if (!this.hasToken()) {
      return of(local.sort((a, b) => b.updated_at.localeCompare(a.updated_at)));
    }

    return this.http
      .get<{ items: Record<string, unknown>[] }>(`${this.apiBase}/drafts`, {
        headers: this.authService.getAuthHeaders(),
      })
      .pipe(
        map((resp) => {
          const remoteMap = new Map<number, TopicDraft>();
          for (const row of resp.items || []) {
            const remoteId = row['id'] as number;
            const localMatch = local.find((d) => d.remoteId === remoteId);
            const draft = this.fromApi(row, localMatch?.id ?? `remote-${remoteId}`);
            remoteMap.set(remoteId, draft);
            this.upsertLocal(draft);
          }

          const merged = [...remoteMap.values()];
          for (const item of local) {
            if (!item.remoteId && !merged.some((m) => m.id === item.id)) {
              merged.push(item);
            }
          }
          return merged.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
        }),
        catchError(() =>
          of(local.sort((a, b) => b.updated_at.localeCompare(a.updated_at)))
        )
      );
  }

  buildStubOutline(draft: Pick<TopicDraft, 'title' | 'subject' | 'goals'>): TopicOutline {
    const goalsText = draft.goals || '掌握本课题核心概念与基本实践';
    return {
      learning_objectives: [
        `理解「${draft.title}」的核心概念`,
        `能在${draft.subject || 'STEM'}情境中应用所学`,
        goalsText.length > 20 ? goalsText.slice(0, 80) : '完成一次可展示的课堂活动',
      ],
      sections: [
        {
          title: '导入与情境',
          duration_minutes: 10,
          activities: ['展示现象或问题情境', '引导学生提出假设'],
          assessment: '观察学生参与度',
        },
        {
          title: '探究与实践',
          duration_minutes: 25,
          activities: ['分组实验或项目实践', '记录数据与现象'],
          assessment: '检查实验记录完整性',
        },
        {
          title: '总结与迁移',
          duration_minutes: 15,
          activities: ['小组汇报', '联系生活应用'],
          assessment: '简答或口头反馈',
        },
      ],
      suggested_keywords: [draft.title, draft.subject || 'STEM', '课件', '实验'],
    };
  }

  private fromApi(row: Record<string, unknown>, localId: string): TopicDraft {
    return {
      id: localId,
      remoteId: row['id'] as number | undefined,
      title: (row['title'] as string) || '',
      subject: (row['subject'] as string) || undefined,
      grade_level: (row['grade_level'] as string) || undefined,
      goals: (row['goals'] as string) || undefined,
      duration_hours: (row['duration_hours'] as number) ?? undefined,
      max_budget: (row['max_budget'] as number) ?? undefined,
      needs_hardware: Boolean(row['needs_hardware']),
      outline: (row['outline'] as TopicOutline) || undefined,
      matched_resources: (row['matched_resources'] as TopicDraft['matched_resources']) || undefined,
      status: (row['status'] as TopicDraft['status']) || 'draft',
      current_step: Number(row['current_step'] ?? 0),
      local_tutorial_id: (row['local_tutorial_id'] as number) ?? undefined,
      created_at: (row['created_at'] as string) || new Date().toISOString(),
      updated_at: (row['updated_at'] as string) || new Date().toISOString(),
    };
  }

  private toApiPayload(draft: Partial<TopicDraft> | TopicDraftInput): Record<string, unknown> {
    return {
      title: draft.title,
      subject: (draft as TopicDraft).subject,
      grade_level: (draft as TopicDraft).grade_level,
      goals: (draft as TopicDraft).goals,
      duration_hours: (draft as TopicDraft).duration_hours,
      max_budget: (draft as TopicDraft).max_budget,
      needs_hardware: (draft as TopicDraft).needs_hardware,
      outline: (draft as TopicDraft).outline,
      matched_resources: (draft as TopicDraft).matched_resources,
      status: (draft as TopicDraft).status,
      current_step: (draft as TopicDraft).current_step,
      local_tutorial_id: (draft as TopicDraft).local_tutorial_id,
    };
  }

  private readLocal(): TopicDraft[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as TopicDraft[];
    } catch {
      return [];
    }
  }

  private upsertLocal(draft: TopicDraft): void {
    const list = this.readLocal().filter((d) => d.id !== draft.id);
    list.push(draft);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  private removeLocal(id: string): void {
    const list = this.readLocal().filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('access_token');
  }
}
