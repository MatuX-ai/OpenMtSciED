import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';
import { CreatorService } from './creator.service';

export interface BrandTemplate {
  id: number | string;
  name: string;
  logo_path?: string;
  watermark_text?: string;
  footer?: string;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

const LOCAL_TEMPLATES_KEY = 'openmt_brand_templates_v1';

@Injectable({ providedIn: 'root' })
export class BrandTemplateService {
  private readonly apiBase = '/api/v1/creators/brand-templates';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private creatorService: CreatorService
  ) {}

  listTemplates(): Observable<BrandTemplate[]> {
    if (!this.authService.isAuthenticated()) {
      return of(this.readLocal());
    }

    return this.http
      .get<{ items: BrandTemplate[] }>(this.apiBase, { headers: this.authService.getAuthHeaders() })
      .pipe(
        map((resp) => {
          const remote = resp.items || [];
          if (remote.length) {
            localStorage.setItem(LOCAL_TEMPLATES_KEY, JSON.stringify(remote));
          }
          return remote.length ? remote : this.readLocal();
        }),
        catchError(() => of(this.readLocal()))
      );
  }

  saveTemplate(input: Omit<BrandTemplate, 'id'> & { id?: number | string }): Observable<BrandTemplate> {
    const localTemplate: BrandTemplate = {
      id: input.id ?? `local-${Date.now()}`,
      name: input.name || '默认模板',
      logo_path: input.logo_path,
      watermark_text: input.watermark_text,
      footer: input.footer,
      is_default: input.is_default ?? true,
      updated_at: new Date().toISOString(),
    };

    if (!this.authService.isAuthenticated()) {
      this.upsertLocal(localTemplate);
      if (localTemplate.is_default) {
        this.creatorService.award('apply_brand', {
          refType: 'brand_template',
          refId: String(localTemplate.id),
          note: `保存品牌模板「${localTemplate.name}」`,
        }).subscribe();
      }
      return of(localTemplate);
    }

    return this.http
      .post<BrandTemplate>(
        this.apiBase,
        {
          name: input.name,
          logo_path: input.logo_path,
          watermark_text: input.watermark_text,
          footer: input.footer,
          is_default: input.is_default ?? true,
        },
        { headers: this.authService.getAuthHeaders() }
      )
      .pipe(
        tap((saved) => this.upsertLocal(saved)),
        catchError(() => {
          this.upsertLocal(localTemplate);
          return of(localTemplate);
        })
      );
  }

  getDefaultTemplate(): Observable<BrandTemplate | null> {
    return this.listTemplates().pipe(
      map((items) => items.find((t) => t.is_default) || items[0] || null)
    );
  }

  private readLocal(): BrandTemplate[] {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_TEMPLATES_KEY) || '[]') as BrandTemplate[];
    } catch {
      return [];
    }
  }

  private upsertLocal(template: BrandTemplate): void {
    let list = this.readLocal().filter((t) => String(t.id) !== String(template.id));
    if (template.is_default) {
      list = list.map((t) => ({ ...t, is_default: false }));
    }
    list.unshift(template);
    localStorage.setItem(LOCAL_TEMPLATES_KEY, JSON.stringify(list.slice(0, 20)));
  }
}
