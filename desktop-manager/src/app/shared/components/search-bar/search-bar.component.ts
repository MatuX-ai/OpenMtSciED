import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

import { SearchFilters, SearchService, TauriService } from '../../../core/services';
import { AddToTutorialDialogService } from '../../../core/services/add-to-tutorial-dialog.service';
import { LinkableResource } from '../../../core/services/tutorial-resource.service';

export interface SmartSearchResult {
  title: string;
  description?: string;
  source?: string;
  url?: string;
  type?: string;
}

export interface SmartSearchPayload {
  keyword: string;
  results: SmartSearchResult[];
}

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
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="search-bar-container">
      <!-- 搜索输入框 -->
      <div class="search-input-section">
        <mat-form-field appearance="outline" class="search-field smart-search-field">
          <i matPrefix class="ri-search-line search-prefix"></i>
          <mat-label>搜索教程和课件</mat-label>
          <input
            matInput
            [(ngModel)]="searchKeyword"
            (keyup.enter)="onSearch()"
            [placeholder]="isSmartSearch ? '输入关键词（开启智能全网后可搜索 STEM 资源）...' : '输入关键词...'"
          />
          <button
            *ngIf="searchKeyword"
            matSuffix
            mat-icon-button
            aria-label="Clear"
            (click)="clearSearch()"
          >
            <i class="ri-close-line"></i>
          </button>
          <button matSuffix mat-icon-button (click)="onSearch()" [disabled]="smartSearchLoading">
            <mat-progress-spinner *ngIf="smartSearchLoading" diameter="18" mode="indeterminate"></mat-progress-spinner>
            <i *ngIf="!smartSearchLoading" [class]="isSmartSearch ? 'ri-global-line' : 'ri-search-line'"></i>
          </button>
          <mat-hint align="end">{{ isSmartSearch ? '智能全网模式已开启 · 按 Enter 搜索' : '按 Enter 搜索' }}</mat-hint>
        </mat-form-field>

        <!-- 智能全网搜索开关 -->
        <div class="smart-search-toggle">
          <mat-slide-toggle [(ngModel)]="isSmartSearch" (change)="onSearchModeChange()">
            <span class="toggle-content">
              <i class="ri-global-line"></i>
              智能全网搜索
              <span class="stem-badge">STEM</span>
            </span>
          </mat-slide-toggle>
          <span *ngIf="isSmartSearch && smartSearchLoading" class="search-indicator">
            <mat-progress-spinner diameter="14" mode="indeterminate"></mat-progress-spinner>
            <span>正在全网检索...</span>
          </span>
        </div>

        <!-- 智能搜索结果下拉面板（仅在智能全网模式时显示） -->
        <div *ngIf="isSmartSearchPanelOpen && isSmartSearch" class="smart-search-panel">
          <div class="panel-header">
            <i class="ri-search-eye-line"></i>
            <span>全网 STEM 资源</span>
            <span class="result-count">{{ smartSearchResults.length }} 条结果</span>
            <button mat-icon-button (click)="closeSmartSearchPanel()" aria-label="关闭">
              <i class="ri-close-line"></i>
            </button>
          </div>
          <div *ngIf="smartSearchLoading" class="panel-loading">
            <mat-progress-spinner diameter="32" mode="indeterminate"></mat-progress-spinner>
            <p>正在检索全网资源...</p>
          </div>
          <div *ngIf="!smartSearchLoading && smartSearchResults.length === 0" class="panel-empty">
            <i class="ri-file-search-line"></i>
            <p>暂无相关结果</p>
          </div>
          <ul *ngIf="!smartSearchLoading && smartSearchResults.length > 0" class="result-list">
            <li *ngFor="let r of smartSearchResults" class="result-item">
              <i class="ri-links-line"></i>
              <div class="result-body" (click)="openSmartResult(r)">
                <div class="result-title">{{ r.title }}</div>
                <div class="result-desc" *ngIf="r.description">{{ r.description }}</div>
                <div class="result-meta" *ngIf="r.source">来源：{{ r.source }}</div>
              </div>
              <button mat-stroked-button color="primary" type="button" class="add-btn" (click)="addSmartResultToTutorial($event, r)">
                加入教程
              </button>
            </li>
          </ul>
        </div>

        <!-- 热门搜索标签 -->
        <div class="popular-tags" *ngIf="!hasActiveFilters && !isSmartSearch">
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
              <mat-option value="all">全部STEM</mat-option>
              <mat-option value="programming">编程开发</mat-option>
              <mat-option value="robotics">机器人</mat-option>
              <mat-option value="electronics">电子制作</mat-option>
              <mat-option value="ai">人工智能</mat-option>
              <mat-option value="iot">物联网</mat-option>
              <mat-option value="3d_printing">3D打印</mat-option>
              <mat-option value="maker">创客项目</mat-option>
              <mat-option value="engineering">工程设计</mat-option>
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
            <i [class]="showFilters ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"></i>
            {{ showFilters ? '收起筛选' : '更多筛选' }}
          </button>

          <button mat-button color="warn" (click)="resetFilters()" *ngIf="hasActiveFilters">
            <i class="ri-delete-bin-2-line"></i>
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
              <i class="ri-close-circle-line"></i>
            </button>
          </mat-chip>
          <mat-chip
            *ngIf="filters.subject && filters.subject !== 'all'"
            (removed)="removeFilter('subject')"
          >
            {{ getSubjectName(filters.subject) }}
            <button matChipRemove>
              <i class="ri-close-circle-line"></i>
            </button>
          </mat-chip>
          <mat-chip
            *ngIf="filters.level && filters.level !== 'all'"
            (removed)="removeFilter('level')"
          >
            {{ getLevelName(filters.level) }}
            <button matChipRemove>
              <i class="ri-close-circle-line"></i>
            </button>
          </mat-chip>
          <mat-chip *ngIf="filters.difficulty" (removed)="removeFilter('difficulty')">
            难度≤{{ filters.difficulty }}
            <button matChipRemove>
              <i class="ri-close-circle-line"></i>
            </button>
          </mat-chip>
          <mat-chip
            *ngIf="filters.source && filters.source !== 'all'"
            (removed)="removeFilter('source')"
          >
            {{ getSourceName(filters.source) }}
            <button matChipRemove>
              <i class="ri-close-circle-line"></i>
            </button>
          </mat-chip>
          <mat-chip *ngIf="filters.maxBudget" (removed)="removeFilter('maxBudget')">
            预算≤{{ filters.maxBudget }}元
            <button matChipRemove>
              <i class="ri-close-circle-line"></i>
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

      .search-field.smart-search-field {
        transition: box-shadow 0.2s ease;
      }

      .search-field.smart-search-field:focus-within {
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.18);
      }

      .search-prefix {
        color: #999;
        margin-right: 6px;
        font-size: 18px;
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

      .smart-search-toggle {
        margin-top: 8px;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .toggle-content {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      .toggle-content i {
        font-size: 16px;
      }

      .stem-badge {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 600;
        letter-spacing: 0.5px;
      }

      .search-indicator {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: #667eea;
        font-weight: 500;
      }

      .smart-search-panel {
        background: #fafbff;
        border: 1px solid rgba(102, 126, 234, 0.25);
        border-radius: 10px;
        margin-top: 12px;
        padding: 12px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        max-height: 360px;
        overflow-y: auto;
      }

      .panel-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        padding-bottom: 10px;
        border-bottom: 1px solid rgba(102, 126, 234, 0.15);
        color: #333;
      }

      .panel-header i {
        color: #667eea;
        font-size: 18px;
      }

      .result-count {
        font-size: 12px;
        color: #999;
        font-weight: normal;
        margin-left: auto;
        margin-right: 8px;
      }

      .panel-loading,
      .panel-empty {
        text-align: center;
        padding: 24px;
        color: #999;
      }

      .panel-loading p,
      .panel-empty p {
        margin: 8px 0 0 0;
        font-size: 13px;
      }

      .panel-empty i {
        font-size: 36px;
        opacity: 0.5;
      }

      .result-list {
        list-style: none;
        padding: 0;
        margin: 10px 0 0 0;
      }

      .result-item {
        display: flex;
        gap: 10px;
        padding: 10px;
        border-radius: 8px;
        transition: background 0.2s;
        align-items: center;
      }

      .result-item:hover {
        background: rgba(102, 126, 234, 0.08);
      }

      .result-item > i {
        color: #667eea;
        font-size: 18px;
        margin-top: 2px;
        flex-shrink: 0;
      }

      .result-body {
        flex: 1;
        min-width: 0;
        cursor: pointer;
      }

      .add-btn {
        flex-shrink: 0;
        font-size: 12px;
      }

      .result-title {
        font-weight: 600;
        color: #333;
        font-size: 14px;
        line-height: 1.4;
      }

      .result-desc {
        font-size: 12px;
        color: #666;
        margin-top: 4px;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .result-meta {
        font-size: 11px;
        color: #1976d2;
        margin-top: 4px;
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
  @Output() smartSearchTriggered = new EventEmitter<SmartSearchPayload>();

  searchKeyword = '';
  isSmartSearch = false;
  showFilters = false;
  filters: SearchFilters = {};
  popularSearches: string[] = [];
  private subscription?: Subscription;

  // 智能全网搜索状态
  smartSearchLoading = false;
  smartSearchResults: SmartSearchResult[] = [];
  isSmartSearchPanelOpen = false;

  constructor(
    private searchService: SearchService,
    private tauriService: TauriService,
    private snackBar: MatSnackBar,
    private addToTutorialDialog: AddToTutorialDialogService
  ) {}

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
    const keyword = this.searchKeyword.trim();
    if (!keyword) {
      return;
    }

    if (this.isSmartSearch) {
      // 智能全网搜索：调用 Rust 智能搜索命令
      void this.performSmartSearch(keyword);
    } else {
      // 普通搜索：走原有前端过滤流程
      this.searchService.updateFilters({ keyword });
      this.searchService.saveSearchHistory(keyword);
      this.smartSearchResults = [];
      this.isSmartSearchPanelOpen = false;
    }
  }

  onSearchModeChange(): void {
    // 切换开关时若已有搜索词立即触发
    if (this.searchKeyword.trim()) {
      this.onSearch();
    } else {
      // 关闭智能搜索时清空结果
      if (!this.isSmartSearch) {
        this.smartSearchResults = [];
        this.isSmartSearchPanelOpen = false;
      }
    }
  }

  private async performSmartSearch(keyword: string): Promise<void> {
    this.smartSearchLoading = true;
    this.isSmartSearchPanelOpen = true;
    this.searchService.saveSearchHistory(keyword);

    try {
      const response: any = await this.tauriService.smartSearch(keyword, 20);

      let items: any[] = [];
      if (response?.data && Array.isArray(response.data)) {
        items = response.data;
      } else if (response?.success && response?.data) {
        items = response.data;
      }

      this.smartSearchResults = items.map((item) => ({
        title: item.title || item.name || '未命名资源',
        description: item.description || item.summary,
        source: item.source || '全网',
        url: item.url || item.link,
        type: item.type,
      }));

      this.smartSearchTriggered.emit({
        keyword,
        results: this.smartSearchResults,
      });

      if (this.smartSearchResults.length === 0) {
        this.snackBar.open('全网搜索未找到相关结果', '关闭', { duration: 2000 });
      }
    } catch (error) {
      console.error('智能搜索失败:', error);
      this.snackBar.open(
        '智能搜索失败：' + ((error as Error)?.message || '请检查网络或后端服务'),
        '关闭',
        { duration: 3000 }
      );
      this.smartSearchResults = [];
    } finally {
      this.smartSearchLoading = false;
    }
  }

  closeSmartSearchPanel(): void {
    this.isSmartSearchPanelOpen = false;
  }

  openSmartResult(result: SmartSearchResult): void {
    if (result.url) {
      window.open(result.url, '_blank');
    }
  }

  addSmartResultToTutorial(event: Event, result: SmartSearchResult): void {
    event.stopPropagation();
    const resource: LinkableResource = {
      title: result.title,
      description: result.description,
      source: result.source,
      url: result.url,
      type: result.type === 'hardware' ? 'hardware' : 'external',
    };
    this.addToTutorialDialog.open(resource).subscribe();
  }

  clearSearch(): void {
    this.searchKeyword = '';
    this.searchService.updateFilters({ keyword: undefined });
    this.smartSearchResults = [];
    this.isSmartSearchPanelOpen = false;
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
    this.smartSearchResults = [];
    this.isSmartSearchPanelOpen = false;
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
