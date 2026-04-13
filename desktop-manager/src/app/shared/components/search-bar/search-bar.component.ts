import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Subscription } from 'rxjs';

import { SearchFilters, SearchService } from '../../../core/services';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <div class="search-bar-container">
      <!-- 搜索输入框 -->
      <div class="search-input-section">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>搜索教程和课件</mat-label>
          <input
            matInput
            [(ngModel)]="searchKeyword"
            (keyup.enter)="onSearch()"
            placeholder="输入关键词..."
          />
          <button
            *ngIf="searchKeyword"
            matSuffix
            mat-icon-button
            aria-label="Clear"
            (click)="clearSearch()"
          >
            <mat-icon>close</mat-icon>
          </button>
          <button matSuffix mat-icon-button (click)="onSearch()">
            <mat-icon>search</mat-icon>
          </button>
        </mat-form-field>

        <!-- 热门搜索标签 -->
        <div class="popular-tags" *ngIf="!hasActiveFilters">
          <span class="tag-label">热门搜索:</span>
          <mat-chip-set>
            <mat-chip
              *ngFor="let tag of popularSearches"
              (click)="searchByTag(tag)"
              class="popular-chip"
            >
              {{ tag }}
            </mat-chip>
          </mat-chip-set>
        </div>
      </div>

      <!-- 筛选器区域 -->
      <div class="filters-section" [class.expanded]="showFilters">
        <div class="filter-row">
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>学科</mat-label>
            <mat-select [(ngModel)]="filters.subject" (selectionChange)="onFilterChange()">
              <mat-option value="all">全部学科</mat-option>
              <mat-option value="physics">物理</mat-option>
              <mat-option value="chemistry">化学</mat-option>
              <mat-option value="biology">生物</mat-option>
              <mat-option value="math">数学</mat-option>
              <mat-option value="engineering">工程</mat-option>
              <mat-option value="computer_science">计算机科学</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>学段</mat-label>
            <mat-select [(ngModel)]="filters.level" (selectionChange)="onFilterChange()">
              <mat-option value="all">全部学段</mat-option>
              <mat-option value="elementary">小学</mat-option>
              <mat-option value="middle">初中</mat-option>
              <mat-option value="high">高中</mat-option>
              <mat-option value="university">大学</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>难度</mat-label>
            <mat-select [(ngModel)]="filters.difficulty" (selectionChange)="onFilterChange()">
              <mat-option [value]="undefined">不限</mat-option>
              <mat-option [value]="1">⭐ 入门</mat-option>
              <mat-option [value]="2">⭐⭐ 基础</mat-option>
              <mat-option [value]="3">⭐⭐⭐ 进阶</mat-option>
              <mat-option [value]="4">⭐⭐⭐⭐ 高级</mat-option>
              <mat-option [value]="5">⭐⭐⭐⭐⭐ 专家</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>来源</mat-label>
            <mat-select [(ngModel)]="filters.source" (selectionChange)="onFilterChange()">
              <mat-option value="all">全部来源</mat-option>
              <mat-option value="openscied">OpenSciEd</mat-option>
              <mat-option value="gewustan">格物斯坦</mat-option>
              <mat-option value="stemcloud">stemcloud.cn</mat-option>
              <mat-option value="openstax">OpenStax</mat-option>
              <mat-option value="ted-ed">TED-Ed</mat-option>
              <mat-option value="phetsim">PhET</mat-option>
              <mat-option value="local">本地资源</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="filter-row">
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>硬件预算上限</mat-label>
            <input
              matInput
              type="number"
              [(ngModel)]="filters.maxBudget"
              (input)="onFilterChange()"
              placeholder="例如: 50"
              min="0"
              max="100"
            />
            <span matSuffix>元</span>
          </mat-form-field>

          <div class="hardware-toggle">
            <mat-checkbox [(ngModel)]="filters.hasHardware" (change)="onFilterChange()">
              仅显示含硬件项目
            </mat-checkbox>
          </div>

          <button mat-stroked-button color="primary" (click)="toggleFilters()">
            <mat-icon>{{ showFilters ? 'expand_less' : 'expand_more' }}</mat-icon>
            {{ showFilters ? '收起筛选' : '更多筛选' }}
          </button>

          <button mat-button color="warn" (click)="resetFilters()" *ngIf="hasActiveFilters">
            <mat-icon>clear_all</mat-icon>
            清除筛选
          </button>
        </div>
      </div>

      <!-- 活跃过滤器标签 -->
      <div class="active-filters" *ngIf="hasActiveFilters">
        <span class="active-label">当前筛选:</span>
        <mat-chip-set>
          <mat-chip *ngIf="filters.keyword" (removed)="removeFilter('keyword')">
            关键词: {{ filters.keyword }}
            <button matChipRemove>
              <mat-icon>cancel</mat-icon>
            </button>
          </mat-chip>
          <mat-chip
            *ngIf="filters.subject && filters.subject !== 'all'"
            (removed)="removeFilter('subject')"
          >
            {{ getSubjectName(filters.subject) }}
            <button matChipRemove>
              <mat-icon>cancel</mat-icon>
            </button>
          </mat-chip>
          <mat-chip
            *ngIf="filters.level && filters.level !== 'all'"
            (removed)="removeFilter('level')"
          >
            {{ getLevelName(filters.level) }}
            <button matChipRemove>
              <mat-icon>cancel</mat-icon>
            </button>
          </mat-chip>
          <mat-chip *ngIf="filters.difficulty" (removed)="removeFilter('difficulty')">
            难度≤{{ filters.difficulty }}
            <button matChipRemove>
              <mat-icon>cancel</mat-icon>
            </button>
          </mat-chip>
          <mat-chip
            *ngIf="filters.source && filters.source !== 'all'"
            (removed)="removeFilter('source')"
          >
            {{ getSourceName(filters.source) }}
            <button matChipRemove>
              <mat-icon>cancel</mat-icon>
            </button>
          </mat-chip>
          <mat-chip *ngIf="filters.maxBudget" (removed)="removeFilter('maxBudget')">
            预算≤{{ filters.maxBudget }}元
            <button matChipRemove>
              <mat-icon>cancel</mat-icon>
            </button>
          </mat-chip>
        </mat-chip-set>
      </div>
    </div>
  `,
  styles: [
    `
      .search-bar-container {
        background: white;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .search-input-section {
        margin-bottom: 12px;
      }

      .search-field {
        width: 100%;
      }

      .popular-tags {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 8px;
        flex-wrap: wrap;
      }

      .tag-label {
        font-size: 13px;
        color: #999;
      }

      .popular-chip {
        cursor: pointer;
        transition: all 0.2s;
      }

      .popular-chip:hover {
        background: #667eea;
        color: white;
      }

      .filters-section {
        overflow: hidden;
        max-height: 0;
        transition: max-height 0.3s ease;
      }

      .filters-section.expanded {
        max-height: 300px;
      }

      .filter-row {
        display: flex;
        gap: 12px;
        margin-bottom: 12px;
        flex-wrap: wrap;
        align-items: center;
      }

      .filter-field {
        flex: 1;
        min-width: 150px;
      }

      .hardware-toggle {
        display: flex;
        align-items: center;
      }

      .active-filters {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #e0e0e0;
        flex-wrap: wrap;
      }

      .active-label {
        font-size: 13px;
        color: #666;
        font-weight: 500;
      }
    `,
  ],
})
export class SearchBarComponent implements OnInit, OnDestroy {
  searchKeyword = '';
  showFilters = false;
  filters: SearchFilters = {};
  popularSearches: string[] = [];
  private subscription?: Subscription;

  constructor(private searchService: SearchService) {}

  ngOnInit(): void {
    this.popularSearches = this.searchService.getPopularSearches();

    // 订阅过滤器变化
    this.subscription = this.searchService.filters$.subscribe((filters) => {
      this.filters = filters;
      this.searchKeyword = filters.keyword ?? '';
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  get hasActiveFilters(): boolean {
    return !!(
      this.filters.keyword ??
      (this.filters.subject && this.filters.subject !== 'all') ??
      (this.filters.level && this.filters.level !== 'all') ??
      this.filters.difficulty ??
      (this.filters.source && this.filters.source !== 'all') ??
      this.filters.maxBudget ??
      this.filters.hasHardware
    );
  }

  onSearch(): void {
    if (this.searchKeyword.trim()) {
      this.searchService.updateFilters({ keyword: this.searchKeyword.trim() });
      this.searchService.saveSearchHistory(this.searchKeyword.trim());
    }
  }

  clearSearch(): void {
    this.searchKeyword = '';
    this.searchService.updateFilters({ keyword: undefined });
  }

  onFilterChange(): void {
    this.searchService.updateFilters(this.filters);
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  resetFilters(): void {
    this.searchService.resetFilters();
    this.searchKeyword = '';
    this.showFilters = false;
  }

  searchByTag(tag: string): void {
    this.searchKeyword = tag;
    this.onSearch();
  }

  removeFilter(field: keyof SearchFilters): void {
    const updatedFilters = { ...this.filters };
    delete updatedFilters[field];
    this.searchService.updateFilters(updatedFilters);
  }

  getSubjectName(subject: string): string {
    const names: Record<string, string> = {
      physics: '物理',
      chemistry: '化学',
      biology: '生物',
      math: '数学',
      engineering: '工程',
      computer_science: '计算机',
    };
    return names[subject] ?? subject;
  }

  getLevelName(level: string): string {
    const names: Record<string, string> = {
      elementary: '小学',
      middle: '初中',
      high: '高中',
      university: '大学',
    };
    return names[level] ?? level;
  }

  getSourceName(source: string): string {
    const names: Record<string, string> = {
      openscied: 'OpenSciEd',
      gewustan: '格物斯坦',
      stemcloud: 'stemcloud.cn',
      openstax: 'OpenStax',
      'ted-ed': 'TED-Ed',
      phetsim: 'PhET',
      local: '本地',
    };
    return names[source] ?? source;
  }
}
