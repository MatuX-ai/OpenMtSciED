import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';

import { TauriService } from '../../../core/services';

interface OpenResource {
  id: string;
  title: string;
  description: string;
  source: 'openscied' | 'gewustan' | 'stemcloud';
  subject: string;
  level: 'elementary' | 'middle' | 'high';
  difficulty: number; // 1-5
  hasHardware: boolean;
  hardwareBudget?: number;
  downloadUrl?: string;
  thumbnail?: string;
  tags?: string[];
}

@Component({
  selector: 'app-resource-browser',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    MatSelectModule,
  ],
  template: `
    <div class="resource-browser">
      <!-- 资源源选择器 -->
      <div class="source-selector">
        <mat-tab-group
          [(selectedIndex)]="selectedSourceIndex"
          (selectedIndexChange)="onSourceChange()"
        >
          <mat-tab label="🔬 OpenSciEd">
            <ng-template matTabContent>
              <div class="tab-content">
                <h3>K-12 现象驱动教程</h3>
                <p class="source-desc">基于现实现象的STEM单元制教程，符合NGSS标准</p>
              </div>
            </ng-template>
          </mat-tab>
          <mat-tab label="⚙️ 格物斯坦">
            <ng-template matTabContent>
              <div class="tab-content">
                <h3>开源硬件教程</h3>
                <p class="source-desc">金属十合一教程，涵盖机械、电子、编程</p>
              </div>
            </ng-template>
          </mat-tab>
          <mat-tab label="🌐 stemcloud.cn">
            <ng-template matTabContent>
              <div class="tab-content">
                <h3>全学科项目式教程</h3>
                <p class="source-desc">6大学科、15子学科、100+教程</p>
              </div>
            </ng-template>
          </mat-tab>
        </mat-tab-group>
      </div>

      <!-- 加载状态 -->
      <div *ngIf="loading" class="loading-container">
        <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
        <p>正在获取开源资源...</p>
      </div>

      <!-- 筛选器 -->
      <div *ngIf="!loading && resources.length > 0" class="filter-bar">
        <div class="filter-group">
          <label>学科：</label>
          <mat-select
            [(value)]="selectedSubject"
            (selectionChange)="onFilterChange()"
            style="min-width: 120px;"
          >
            <mat-option value="">全部</mat-option>
            <mat-option value="biology">生物</mat-option>
            <mat-option value="physics">物理</mat-option>
            <mat-option value="chemistry">化学</mat-option>
            <mat-option value="engineering">工程</mat-option>
            <mat-option value="computer_science">计算机</mat-option>
            <mat-option value="math">数学</mat-option>
          </mat-select>
        </div>

        <div class="filter-group">
          <label>学段：</label>
          <mat-select
            [(value)]="selectedLevel"
            (selectionChange)="onFilterChange()"
            style="min-width: 120px;"
          >
            <mat-option value="">全部</mat-option>
            <mat-option value="elementary">小学</mat-option>
            <mat-option value="middle">初中</mat-option>
            <mat-option value="high">高中</mat-option>
          </mat-select>
        </div>

        <div class="filter-group" *ngIf="selectedTag">
          <label>标签：</label>
          <mat-chip-set>
            <mat-chip class="selected-tag-chip" (removed)="clearTag()">
              {{ selectedTag }}
              <button matChipRemove>
                <mat-icon>cancel</mat-icon>
              </button>
            </mat-chip>
          </mat-chip-set>
        </div>

        <div class="filter-group search-group">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>搜索资源</mat-label>
            <input
              matInput
              [(ngModel)]="searchKeyword"
              (keyup.enter)="onFilterChange()"
              placeholder="输入关键词..."
            />
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
        </div>

        <div class="filter-info">
          <span
            >共找到 <strong>{{ totalResources }}</strong> 个资源</span
          >
        </div>
      </div>

      <!-- 资源列表 -->
      <div *ngIf="!loading" class="resource-grid">
        <mat-card *ngFor="let resource of resources" class="resource-card">
          <mat-card-header>
            <mat-card-title>{{ resource.title }}</mat-card-title>
            <mat-card-subtitle>
              <span class="source-badge" [class]="getSourceClass(resource.source)">
                {{ getSourceName(resource.source) }}
              </span>
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <p class="description">{{ resource.description }}</p>

            <!-- 标签显示 -->
            <div *ngIf="resource.tags && resource.tags.length > 0" class="tags-container">
              <mat-chip-set>
                <mat-chip
                  *ngFor="let tag of resource.tags"
                  class="tag-chip"
                  (click)="onTagClick(tag)"
                >
                  {{ tag }}
                </mat-chip>
              </mat-chip-set>
            </div>

            <div class="meta-info">
              <div class="meta-item">
                <mat-icon>school</mat-icon>
                <span>{{ getSubjectName(resource.subject) }}</span>
              </div>
              <div class="meta-item">
                <mat-icon>trending_up</mat-icon>
                <span>{{ getLevelName(resource.level) }}</span>
              </div>
              <div class="meta-item">
                <mat-icon>star</mat-icon>
                <span>难度: {{ resource.difficulty }}/5</span>
              </div>
              <div class="meta-item" *ngIf="resource.hasHardware && resource.hardwareBudget">
                <mat-icon>build</mat-icon>
                <span class="budget-badge">硬件预算: ¥{{ resource.hardwareBudget }}</span>
              </div>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button
              mat-raised-button
              color="primary"
              (click)="downloadResource(resource)"
              [disabled]="downloadingIds.has(resource.id)"
            >
              <mat-icon *ngIf="!downloadingIds.has(resource.id)">download</mat-icon>
              <mat-progress-spinner
                *ngIf="downloadingIds.has(resource.id)"
                mode="indeterminate"
                diameter="20"
              ></mat-progress-spinner>
              {{ downloadingIds.has(resource.id) ? '下载中...' : '下载到本地' }}
            </button>
            <button mat-button (click)="viewDetails(resource)">
              <mat-icon>info</mat-icon>
              查看详情
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- 空状态 -->
        <div *ngIf="resources.length === 0" class="empty-state">
          <mat-icon>search_off</mat-icon>
          <p>暂无可用资源</p>
          <button mat-button color="primary" (click)="loadResources()">
            <mat-icon>refresh</mat-icon>
            重新加载
          </button>
        </div>
      </div>

      <!-- 分页控件 -->
      <div *ngIf="!loading && totalPages > 1" class="pagination">
        <button
          mat-icon-button
          (click)="onPageChange(currentPage - 1)"
          [disabled]="currentPage === 1"
        >
          <mat-icon>chevron_left</mat-icon>
        </button>

        <span class="page-info"> 第 {{ currentPage }} / {{ totalPages }} 页 </span>

        <button
          mat-icon-button
          (click)="onPageChange(currentPage + 1)"
          [disabled]="currentPage === totalPages"
        >
          <mat-icon>chevron_right</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .resource-browser {
        padding: 20px;
      }

      .source-selector {
        margin-bottom: 24px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .tab-content {
        padding: 16px;
      }

      .tab-content h3 {
        margin: 0 0 8px 0;
        color: #333;
        font-size: 18px;
      }

      .source-desc {
        margin: 0;
        color: #666;
        font-size: 14px;
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        color: #666;
      }

      .filter-bar {
        display: flex;
        gap: 16px;
        align-items: center;
        margin-bottom: 24px;
        padding: 16px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .filter-group {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .filter-group label {
        font-size: 14px;
        color: #666;
        white-space: nowrap;
      }

      .search-group {
        flex: 1;
        min-width: 200px;
      }

      .search-field {
        width: 100%;
      }

      .search-field ::ng-deep .mat-mdc-text-field-wrapper {
        padding: 0;
      }

      .search-field ::ng-deep .mat-mdc-form-field-infix {
        min-height: 40px;
        padding-top: 8px;
        padding-bottom: 8px;
      }

      .filter-info {
        margin-left: auto;
        font-size: 14px;
        color: #666;
      }

      .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 16px;
        margin-top: 24px;
        padding: 16px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .page-info {
        font-size: 14px;
        color: #666;
      }

      .resource-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 20px;
      }

      .resource-card {
        transition:
          transform 0.2s,
          box-shadow 0.2s;
      }

      .resource-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }

      .source-badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;

        &.openscied {
          background: #e3f2fd;
          color: #1565c0;
        }

        &.gewustan {
          background: #fff3e0;
          color: #ef6c00;
        }

        &.stemcloud {
          background: #e8f5e9;
          color: #2e7d32;
        }
      }

      .description {
        color: #555;
        line-height: 1.6;
        margin: 12px 0;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .tags-container {
        margin: 12px 0;
      }

      .tag-chip {
        font-size: 12px;
        background: #f0f0f0;
        color: #666;
      }

      .tag-chip:hover {
        background: #e0e0e0;
        cursor: pointer;
      }

      .selected-tag-chip {
        background: #e3f2fd;
        color: #1565c0;
        font-weight: 500;
      }

      .meta-info {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 12px;
      }

      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: #666;
      }

      .meta-item mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .budget-badge {
        background: #fff8e1;
        color: #f57f17;
        padding: 2px 8px;
        border-radius: 12px;
        font-weight: 500;
      }

      .empty-state {
        grid-column: 1 / -1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        color: #999;
      }

      .empty-state mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        margin-bottom: 16px;
      }

      ::ng-deep .mat-mdc-tab-body-wrapper {
        overflow: visible !important;
      }
    `,
  ],
})
export class ResourceBrowserComponent implements OnInit {
  loading = false;
  resources: OpenResource[] = [];
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  totalResources = 0;

  // 筛选条件
  selectedSubject = '';
  selectedLevel = '';
  searchKeyword = '';
  selectedSourceIndex = 0;
  selectedTag = '';
  downloadingIds = new Set<string>();

  private sources = ['openscied', 'gewustan', 'stemcloud'];

  constructor(
    private tauriService: TauriService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    void this.loadResources();
  }

  async loadResources(): Promise<void> {
    this.loading = true;
    const source = this.sources[this.selectedSourceIndex];

    try {
      // 调用 Rust 后端获取开源资源（支持分页和筛选）
      const result = await this.tauriService.browseOpenResources({
        source,
        subject: this.selectedSubject || undefined,
        level: this.selectedLevel || undefined,
        keyword: this.searchKeyword || undefined,
        page: this.currentPage,
        page_size: this.pageSize,
      });

      const paginatedResult = result as {
        items: OpenResource[];
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
      };

      // 为每个资源加载标签
      const resourcesWithTags = await Promise.all(
        paginatedResult.items.map(async (resource) => {
          try {
            const tags = await this.tauriService.getResourceTags(resource.id);
            return { ...resource, tags };
          } catch (error) {
            console.warn(`Failed to load tags for resource ${resource.id}:`, error);
            return { ...resource, tags: [] };
          }
        })
      );

      this.resources = resourcesWithTags;
      this.totalResources = paginatedResult.total;
      this.totalPages = paginatedResult.total_pages;
    } catch (error) {
      console.error('加载资源失败:', error);
      this.snackBar.open('加载资源失败，请重试', '关闭', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  onSourceChange(): void {
    this.currentPage = 1;
    void this.loadResources();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    void this.loadResources();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    void this.loadResources();
  }

  async downloadResource(resource: OpenResource): Promise<void> {
    if (this.downloadingIds.has(resource.id)) {
      return;
    }

    this.downloadingIds.add(resource.id);

    try {
      // 获取用户数据目录
      const appDataDir = this.getAppDataDir();
      const saveDir = `${appDataDir}/resources`;

      // 调用 Rust 后端下载资源
      await this.tauriService.downloadOpenResource(resource.id, saveDir);

      this.snackBar.open(`✅ "${resource.title}" 已下载到本地`, '查看', {
        duration: 5000,
        panelClass: ['success-snackbar'],
      });
    } catch (error) {
      this.snackBar.open('❌ 下载失败，请重试', '关闭', { duration: 3000 });
    } finally {
      this.downloadingIds.delete(resource.id);
    }
  }

  private getAppDataDir(): string {
    // TODO: 调用 Tauri path API 获取应用数据目录
    // 这里暂时返回一个默认路径
    return 'C:/Users/Public/OpenMTSciEd';
  }

  viewDetails(resource: OpenResource): void {
    // TODO: 打开详情对话框或导航到详情页
    this.snackBar.open(`查看 "${resource.title}" 详情`, '关闭', { duration: 3000 });
  }

  onTagClick(tag: string): void {
    this.selectedTag = tag;
    this.currentPage = 1;
    void this.loadResourcesByTag();
  }

  clearTag(): void {
    this.selectedTag = '';
    this.currentPage = 1;
    void this.loadResources();
  }

  async loadResourcesByTag(): Promise<void> {
    if (!this.selectedTag) {
      return;
    }

    this.loading = true;

    try {
      const result = await this.tauriService.browseResourcesByTag(
        this.selectedTag,
        this.currentPage,
        this.pageSize
      );

      const paginatedResult = result as {
        items: OpenResource[];
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
      };

      // 为每个资源加载标签
      const resourcesWithTags = await Promise.all(
        paginatedResult.items.map(async (resource) => {
          try {
            const tags = await this.tauriService.getResourceTags(resource.id);
            return { ...resource, tags };
          } catch (error) {
            console.warn(`Failed to load tags for resource ${resource.id}:`, error);
            return { ...resource, tags: [] };
          }
        })
      );

      this.resources = resourcesWithTags;
      this.totalResources = paginatedResult.total;
      this.totalPages = paginatedResult.total_pages;
    } catch (error) {
      console.error('按标签加载资源失败:', error);
      this.snackBar.open('加载资源失败，请重试', '关闭', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  getSourceName(source: string): string {
    const names: Record<string, string> = {
      openscied: 'OpenSciEd',
      gewustan: '格物斯坦',
      stemcloud: 'stemcloud.cn',
    };
    return names[source] ?? source;
  }

  getSourceClass(source: string): string {
    return source;
  }

  getSubjectName(subject: string): string {
    const names: Record<string, string> = {
      physics: '物理',
      chemistry: '化学',
      biology: '生物',
      engineering: '工程',
      computer_science: '计算机科学',
      math: '数学',
    };
    return names[subject] ?? subject;
  }

  getLevelName(level: string): string {
    const names: Record<string, string> = {
      elementary: '小学',
      middle: '初中',
      high: '高中',
    };
    return names[level] ?? level;
  }
}
