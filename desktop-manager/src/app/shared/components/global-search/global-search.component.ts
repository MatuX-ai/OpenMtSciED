import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { TauriService } from '../../../core/services/tauri.service';

interface SearchResult {
  type: 'tutorial' | 'material' | 'project' | 'hardware';
  title: string;
  description?: string;
  source?: string;
  id?: number;
}

@Component({
  selector: 'app-global-search',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatListModule,
    FormsModule
  ],
  template: `
    <div class="search-container">
      <div class="search-header">
        <h2 mat-dialog-title>全局搜索</h2>
        <button mat-icon-button (click)="close()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="search-input-wrapper">
        <mat-form-field appearance="outline" class="search-field">
          <mat-icon matPrefix>search</mat-icon>
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
              <mat-icon matListItemIcon>{{ getResultIcon(result.type) }}</mat-icon>
              <div matListItemTitle>{{ result.title }}</div>
              <div matListItemLine class="result-description">{{ result.description }}</div>
              <div matListItemLine class="result-source" *ngIf="result.source">
                来源: {{ result.source }}
              </div>
            </mat-list-item>
          </mat-list>
        </div>
      </div>

      <div class="no-results" *ngIf="searchQuery && results.length === 0 && !loading">
        <mat-icon>search_off</mat-icon>
        <p>未找到相关结果</p>
      </div>

      <div class="loading" *ngIf="loading">
        <mat-icon class="spin">refresh</mat-icon>
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
    }

    .search-input-wrapper {
      margin-bottom: 16px;
    }

    .search-field {
      width: 100%;
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
      cursor: pointer;
      border-radius: 8px;
      margin-bottom: 4px;
    }

    .result-item:hover {
      background: var(--hover-bg, rgba(0, 0, 0, 0.04));
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
    }

    .no-results mat-icon, .loading mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
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
    private tauriService: TauriService
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
      id: item.id
    }));
  }

  determineType(item: any): SearchResult['type'] {
    if (item.type === 'tutorial' || item.course_type) return 'tutorial';
    if (item.type === 'material' || item.material_type) return 'material';
    if (item.type === 'project') return 'project';
    if (item.type === 'hardware') return 'hardware';
    return 'tutorial';
  }

  getResultIcon(type: SearchResult['type']): string {
    const iconMap = {
      tutorial: 'menu_book',
      material: 'library_books',
      project: 'folder_special',
      hardware: 'memory'
    };
    return iconMap[type];
  }

  get groupedResults() {
    const groups: Record<string, { typeLabel: string; items: SearchResult[] }> = {
      tutorial: { typeLabel: '教程', items: [] },
      material: { typeLabel: '课件', items: [] },
      project: { typeLabel: '项目', items: [] },
      hardware: { typeLabel: '硬件', items: [] }
    };

    this.results.forEach(result => {
      groups[result.type].items.push(result);
    });

    return Object.values(groups).filter(g => g.items.length > 0);
  }

  close(): void {
    this.dialogRef.close();
  }
}
