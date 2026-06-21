import { Injectable } from '@angular/core';
import { Observable, from, map, of } from 'rxjs';

import { MatchedResourceItem } from '../../features/topic-studio/topic-studio.models';
import { TopicStudioService } from '../../features/topic-studio/topic-studio.service';
import { TauriService } from './tauri.service';

const LINKS_STORAGE_KEY = 'openmt_tutorial_resource_links_v1';

export interface LinkableResource {
  title: string;
  description?: string;
  source?: string;
  url?: string;
  type: MatchedResourceItem['type'];
  id?: string | number;
}

export interface LocalTutorial {
  id: number;
  name: string;
  category?: string;
  description?: string;
}

export interface TutorialSuggestion {
  tutorial: LocalTutorial;
  score: number;
  reason: string;
}

interface StoredLinks {
  [courseId: string]: MatchedResourceItem[];
}

@Injectable({ providedIn: 'root' })
export class TutorialResourceService {
  constructor(
    private tauriService: TauriService,
    private topicStudioService: TopicStudioService
  ) {}

  listLocalTutorials(): Observable<LocalTutorial[]> {
    return from(this.tauriService.getCourses()).pipe(
      map((rows) =>
        (rows as Record<string, unknown>[]).map((row) => ({
          id: Number(row['id']),
          name: (row['name'] as string) || '未命名教程',
          category: (row['category'] as string) || undefined,
          description: (row['description'] as string) || undefined,
        }))
      ),
      map((items) => items.filter((t) => !Number.isNaN(t.id)))
    );
  }

  suggestTutorials(
    query: string,
    subject?: string,
    excludeCourseId?: number,
    limit = 5
  ): Observable<TutorialSuggestion[]> {
    return this.listLocalTutorials().pipe(
      map((tutorials) => {
        const scored = tutorials
          .filter((t) => t.id !== excludeCourseId)
          .map((tutorial) => this.scoreTutorial(tutorial, query, subject))
          .filter((s) => s.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, limit);
        return scored;
      })
    );
  }

  getLinksForCourse(courseId: number): MatchedResourceItem[] {
    const store = this.readLinks();
    return store[String(courseId)] || [];
  }

  linkResourceToTutorial(courseId: number, resource: LinkableResource): Observable<boolean> {
    const item = this.toMatchedItem(resource);
    const store = this.readLinks();
    const key = String(courseId);
    const existing = store[key] || [];

    if (this.isDuplicate(existing, item)) {
      return of(false);
    }

    store[key] = [...existing, item];
    this.writeLinks(store);

    const draft = this.topicStudioService.findDraftByTutorialId(courseId);
    if (draft) {
      const merged = [...(draft.matched_resources || []), item];
      return this.topicStudioService
        .updateDraft(draft.id, {
          matched_resources: merged,
          status: 'resources_matched',
        })
        .pipe(map(() => true));
    }

    return of(true);
  }

  suggestTutorialsForMaterial(
    materialName: string,
    category?: string,
    currentCourseId?: number
  ): Observable<TutorialSuggestion[]> {
    return this.suggestTutorials(materialName, category, currentCourseId, 3);
  }

  private scoreTutorial(
    tutorial: LocalTutorial,
    query: string,
    subject?: string
  ): TutorialSuggestion {
    const queryTokens = this.tokenize(query);
    const haystack = [tutorial.name, tutorial.description || '', tutorial.category || ''].join(' ');
    const hayTokens = new Set(this.tokenize(haystack));

    let score = 0;
    const reasons: string[] = [];

    for (const token of queryTokens) {
      if (hayTokens.has(token)) {
        score += 2;
        reasons.push(`关键词「${token}」`);
      }
    }

    if (subject && tutorial.category && tutorial.category.includes(subject)) {
      score += 3;
      reasons.push('学科一致');
    }

    if (tutorial.name.includes(query) || query.includes(tutorial.name)) {
      score += 4;
      reasons.push('标题相似');
    }

    return {
      tutorial,
      score,
      reason: reasons.length ? reasons.slice(0, 2).join('、') : '相关推荐',
    };
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .split(/[\s,，、/\\|]+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 2);
  }

  private toMatchedItem(resource: LinkableResource): MatchedResourceItem {
    return {
      id: resource.id,
      title: resource.title,
      type: resource.type,
      source: resource.source,
      url: resource.url,
      reason: '手动加入',
    };
  }

  private isDuplicate(existing: MatchedResourceItem[], item: MatchedResourceItem): boolean {
    return existing.some(
      (e) =>
        e.title === item.title &&
        e.url === item.url &&
        e.type === item.type &&
        String(e.id ?? '') === String(item.id ?? '')
    );
  }

  private readLinks(): StoredLinks {
    try {
      return JSON.parse(localStorage.getItem(LINKS_STORAGE_KEY) || '{}') as StoredLinks;
    } catch {
      return {};
    }
  }

  private writeLinks(store: StoredLinks): void {
    localStorage.setItem(LINKS_STORAGE_KEY, JSON.stringify(store));
  }
}
