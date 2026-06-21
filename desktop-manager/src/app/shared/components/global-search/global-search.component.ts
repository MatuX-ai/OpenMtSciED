import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { AddToTutorialDialogService } from '../../../core/services/add-to-tutorial-dialog.service';
import { LinkableResource } from '../../../core/services/tutorial-resource.service';
import { TauriService } from '../../../core/services/tauri.service';

interface SearchResult {
  type: 'tutorial' | 'material' | 'project' | 'hardware' | 'external';
  title: string;
  description?: string;
  source?: string;
  id?: number;
  url?: string;
}

@Component({
  selector: 'app-global-search',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    FormsModule
  ],
  template: `
    <div class="search-container">
      <div class="search-header">
        <h2 mat-dialog-title>全局搜索</h2>
        <button mat-icon-button (click)="close()" class="close-btn">
          <i class="ri-close-line"></i>
        </button>
      </div>

      <div class="search-input-wrapper">
        <mat-form-field appearance="outline" class="search-field">
          <i matPrefix class="ri-search-line search-prefix-icon"></i>
          <input
            matInput
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange()"
            placeholder="搜索教程、课件、项目、硬件..."
            #searchInput
          />
        </mat-form-field>
      </div>

      <div class="search-results" *ngIf="results.length > 0">
        <div *ngFor="let group of groupedResults">
          <h3 class="result-group-title">{{ group.typeLabel }}</h3>
          <mat-list>
            <mat-list-item *ngFor="let result of group.items" class="result-item">
              <div class="result-main" (click)="openResult(result)">
                <i matListItemIcon [class]="getResultIcon(result.type)"></i>
                <div matListItemTitle>{{ result.title }}</div>
                <div matListItemLine class="result-description">{{ result.description }}</div>
                <div matListItemLine class="result-source" *ngIf="result.source">
                  来源: {{ result.source }}
                </div>
              </div>
              <button
                mat-stroked-button
                color="primary"
                class="add-btn"
                type="button"
                (click)="addToTutorial($event, result)"
              >
                加入教程
              </button>
            </mat-list-item>
          </mat-list>
        </div>
      </div>

      <div class="no-results" *ngIf="searchQuery && results.length === 0 && !loading">
        <i class="ri-file-search-line"></i>
        <p>未找到相关结果</p>
      </div>

      <div class="loading" *ngIf="loading">
        <i class="ri-loop-right-line spin"></i>
        <p>搜索中...</p>
      </div>

      <div class="search-hints" *ngIf="!searchQuery">
        <p>输入关键词开始搜索</p>
        <p class="hint-text">支持教程、课件、项目、硬件资源</p>
      </div>
    </div>
  `,
  styles: [`
    .search-container {
      padding: 16px;
    }

    .search-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .search-header h2 {
      margin: 0;
      font-size: 20px;
    }

    .close-btn {
      width: 32px;
      height: 32px;

      i[class^="ri-"] {
        font-size: 20px;
      }
    }

    .search-input-wrapper {
      margin-bottom: 16px;
    }

    .search-field {
      width: 100%;
    }

    .search-prefix-icon {
      font-size: 20px;
      color: var(--text-secondary, #666);
      margin-right: 8px;
    }

    .search-results {
      max-height: 400px;
      overflow-y: auto;
    }

    .result-group-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-secondary, #666);
      margin: 16px 0 8px;
      text-transform: uppercase;
    }

    .result-item {
      border-radius: 8px;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
      height: auto !important;
      min-height: 72px;

      i[class^="ri-"] {
        font-size: 22px;
        color: var(--primary-color, #1976d2);
      }
    }

    .result-main {
      flex: 1;
      cursor: pointer;
      min-width: 0;
    }

    .result-main:hover {
      opacity: 0.85;
    }

    .add-btn {
      flex-shrink: 0;
      font-size: 12px;
    }

    .result-description {
      font-size: 13px;
      color: var(--text-secondary, #666);
    }

    .result-source {
      font-size: 12px;
      color: var(--primary-color, #1976d2);
    }

    .no-results, .loading, .search-hints {
      text-align: center;
      padding: 32px 0;
      color: var(--text-secondary, #666);

      i[class^="ri-"] {
        font-size: 48px;
        margin-bottom: 16px;
        display: inline-block;
      }
    }

    .loading .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .hint-text {
      font-size: 13px;
      margin-top: 8px;
    }
  `]
})
export class GlobalSearchComponent implements OnInit, OnDestroy {
  searchQuery = '';
  results: SearchResult[] = [];
  loading = false;
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private dialogRef: MatDialogRef<GlobalSearchComponent>,
    private tauriService: TauriService,
    private router: Router,
    private addToTutorialDialog: AddToTutorialDialogService
  ) {}

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(query => {
        if (query.trim()) {
          this.performSearch(query.trim());
        } else {
          this.results = [];
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchQuery);
  }

  async performSearch(query: string): Promise<void> {
    this.loading = true;
    try {
      // 调用后端智能搜索 API
      const response: any = await this.tauriService.smartSearch(query, 20);
      if (response && response.success && response.data) {
        this.results = this.transformResults(response.data);
      } else {
        this.results = [];
      }
    } catch (error) {
      console.error('搜索失败:', error);
      this.results = [];
    } finally {
      this.loading = false;
    }
  }

  transformResults(data: any[]): SearchResult[] {
    return data.map(item => ({
      type: this.determineType(item),
      title: item.title || item.name,
      description: item.description || item.summary,
      source: item.source || '本地',
      id: item.id,
      url: item.url || item.link,
    }));
  }

  determineType(item: any): SearchResult['type'] {
    if (item.url || item.link) return 'external';
    if (item.type === 'tutorial' || item.course_type) return 'tutorial';
    if (item.type === 'material' || item.material_type) return 'material';
    if (item.type === 'project') return 'project';
    if (item.type === 'hardware') return 'hardware';
    return 'tutorial';
  }

  getResultIcon(type: SearchResult['type']): string {
    const iconMap: Record<SearchResult['type'], string> = {
      tutorial: 'ri-book-2-line',
      material: 'ri-book-shelf-line',
      project: 'ri-folder-shield-2-line',
      hardware: 'ri-cpu-line',
      external: 'ri-links-line',
    };
    return iconMap[type];
  }

  get groupedResults() {
    const groups: Record<string, { typeLabel: string; items: SearchResult[] }> = {
      tutorial: { typeLabel: '教程', items: [] },
      material: { typeLabel: '课件', items: [] },
      project: { typeLabel: '项目', items: [] },
      hardware: { typeLabel: '硬件', items: [] },
      external: { typeLabel: '全网资源', items: [] },
    };

    this.results.forEach(result => {
      groups[result.type]?.items.push(result);
    });

    return Object.values(groups).filter(g => g.items.length > 0);
  }

  addToTutorial(event: Event, result: SearchResult): void {
    event.stopPropagation();
    const resource = this.toLinkableResource(result);
    this.addToTutorialDialog.open(resource).subscribe();
  }

  private toLinkableResource(result: SearchResult): LinkableResource {
    const typeMap: Record<SearchResult['type'], LinkableResource['type']> = {
      tutorial: 'tutorial',
      material: 'material',
      project: 'external',
      hardware: 'hardware',
      external: 'external',
    };
    return {
      title: result.title,
      description: result.description,
      source: result.source,
      url: result.url,
      type: typeMap[result.type],
      id: result.id,
    };
  }

  close(): void {
    this.dialogRef.close();
  }

  openResult(result: SearchResult): void {
    this.dialogRef.close();
    switch (result.type) {
      case 'tutorial':
        void this.router.navigate(['/resource-explorer'], {
          queryParams: { search: result.title, type: 'tutorial' },
        });
        break;
      case 'material':
        void this.router.navigate(['/resource-explorer'], {
          queryParams: { search: result.title, type: 'material' },
        });
        break;
      case 'hardware':
        void this.router.navigate(['/hardware-projects'], {
          queryParams: { search: result.title },
        });
        break;
      case 'project':
        void this.router.navigate(['/my-projects'], {
          queryParams: { search: result.title },
        });
        break;
    }
  }
}
