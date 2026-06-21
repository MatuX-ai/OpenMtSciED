import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';
import { CreatorService } from './creator.service';

export interface ConceptTutorialLinkRecord {
  concept_id: number;
  concept_name: string;
  local_tutorial_id: number;
  tutorial_title: string;
  subject?: string;
  updated_at: string;
}

export interface LinkedTutorialResource {
  local_tutorial_id: number;
  tutorial_title?: string;
  subject?: string;
  updated_at?: string;
}

const LOCAL_LINKS_KEY = 'openmt_concept_tutorial_links_v1';

@Injectable({ providedIn: 'root' })
export class KnowledgeGraphLinkService {
  private readonly apiBase = '/api/v1/knowledge-graph';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private creatorService: CreatorService
  ) {}

  linkTutorial(input: {
    localTutorialId: number;
    tutorialTitle: string;
    subject?: string;
    description?: string;
    conceptId?: number;
  }): Observable<ConceptTutorialLinkRecord | null> {
    const localRecord: ConceptTutorialLinkRecord = {
      concept_id: input.conceptId ?? 0,
      concept_name: input.tutorialTitle,
      local_tutorial_id: input.localTutorialId,
      tutorial_title: input.tutorialTitle,
      subject: input.subject,
      updated_at: new Date().toISOString(),
    };

    if (!this.authService.isAuthenticated()) {
      this.saveLocalLink(localRecord);
      this.creatorService.award('save_tutorial', {
        refType: 'tutorial',
        refId: String(input.localTutorialId),
        note: `保存教程「${input.tutorialTitle}」`,
      }).subscribe();
      this.creatorService.award('link_graph', {
        refType: 'tutorial',
        refId: String(input.localTutorialId),
        note: `挂接图谱「${input.tutorialTitle}」`,
      }).subscribe();
      return of(localRecord);
    }

    return this.http
      .post<{
        concept_id: number;
        concept_name: string;
        link_id: number;
      }>(`${this.apiBase}/nodes/link-tutorial`, {
        local_tutorial_id: input.localTutorialId,
        tutorial_title: input.tutorialTitle,
        subject: input.subject,
        description: input.description,
        concept_id: input.conceptId,
      }, { headers: this.authService.getAuthHeaders() })
      .pipe(
        map((resp) => {
          const record: ConceptTutorialLinkRecord = {
            concept_id: resp.concept_id,
            concept_name: resp.concept_name,
            local_tutorial_id: input.localTutorialId,
            tutorial_title: input.tutorialTitle,
            subject: input.subject,
            updated_at: new Date().toISOString(),
          };
          this.saveLocalLink(record);
          return record;
        }),
        catchError(() => {
          this.saveLocalLink(localRecord);
          this.creatorService.award('save_tutorial', {
            refType: 'tutorial',
            refId: String(input.localTutorialId),
          }).subscribe();
          this.creatorService.award('link_graph', {
            refType: 'tutorial',
            refId: String(input.localTutorialId),
          }).subscribe();
          return of(localRecord);
        })
      );
  }

  listLocalLinks(): ConceptTutorialLinkRecord[] {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_LINKS_KEY) || '[]') as ConceptTutorialLinkRecord[];
    } catch {
      return [];
    }
  }

  getLinksForConcept(conceptId: number): Observable<LinkedTutorialResource[]> {
    const local = this.listLocalLinks()
      .filter((l) => l.concept_id === conceptId || String(l.concept_id) === String(conceptId))
      .map((l) => ({
        local_tutorial_id: l.local_tutorial_id,
        tutorial_title: l.tutorial_title,
        subject: l.subject,
        updated_at: l.updated_at,
      }));

    if (!this.authService.isAuthenticated()) {
      return of(local);
    }

    return this.http
      .get<{ tutorials: LinkedTutorialResource[] }>(
        `${this.apiBase}/nodes/${conceptId}/resources`,
        { headers: this.authService.getAuthHeaders() }
      )
      .pipe(
        map((resp) => {
          const remote = resp.tutorials || [];
          const merged = [...remote];
          for (const item of local) {
            if (!merged.some((m) => m.local_tutorial_id === item.local_tutorial_id)) {
              merged.push(item);
            }
          }
          return merged;
        }),
        catchError(() => of(local))
      );
  }

  mergeLinksIntoGraphNodes<T extends { id: string; name: string; category?: number }>(
    nodes: T[]
  ): T[] {
    const links = this.listLocalLinks();
    const existingIds = new Set(nodes.map((n) => n.id));

    const extra = links
      .filter((l) => l.concept_id > 0)
      .map((l) => ({
        id: `concept-${l.concept_id}`,
        name: l.concept_name || l.tutorial_title,
        category: 2,
      } as T))
      .filter((n) => !existingIds.has(n.id));

    return [...nodes, ...extra];
  }

  private saveLocalLink(record: ConceptTutorialLinkRecord): void {
    const list = this.listLocalLinks().filter(
      (l) => l.local_tutorial_id !== record.local_tutorial_id
    );
    if (record.concept_id > 0) {
      list.unshift(record);
    } else {
      list.unshift({ ...record, concept_id: -Date.now() });
    }
    localStorage.setItem(LOCAL_LINKS_KEY, JSON.stringify(list.slice(0, 100)));
  }
}
