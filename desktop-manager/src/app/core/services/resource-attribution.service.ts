import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';

export interface ResourceAttributionInput {
  resourceType: string;
  resourceId: string;
  resourceTitle?: string;
  sourceUrl: string;
  license?: string;
  author?: string;
}

const LOCAL_ATTRIBUTIONS_KEY = 'openmt_resource_attributions_v1';

@Injectable({ providedIn: 'root' })
export class ResourceAttributionService {
  private readonly apiBase = '/api/v1/resources/attributions';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  saveAttribution(input: ResourceAttributionInput): Observable<boolean> {
    const localEntry = {
      ...input,
      created_at: new Date().toISOString(),
    };
    this.appendLocal(localEntry);

    if (!this.authService.isAuthenticated()) {
      return of(true);
    }

    return this.http
      .post(
        this.apiBase,
        {
          resource_type: input.resourceType,
          resource_id: input.resourceId,
          resource_title: input.resourceTitle,
          source_url: input.sourceUrl,
          license: input.license,
          author: input.author,
        },
        { headers: this.authService.getAuthHeaders() }
      )
      .pipe(map(() => true), catchError(() => of(true)));
  }

  private appendLocal(entry: ResourceAttributionInput & { created_at: string }): void {
    try {
      const list = JSON.parse(localStorage.getItem(LOCAL_ATTRIBUTIONS_KEY) || '[]') as unknown[];
      list.unshift(entry);
      localStorage.setItem(LOCAL_ATTRIBUTIONS_KEY, JSON.stringify(list.slice(0, 200)));
    } catch {
      localStorage.setItem(LOCAL_ATTRIBUTIONS_KEY, JSON.stringify([entry]));
    }
  }
}
