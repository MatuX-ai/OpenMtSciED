/**
 * 课件列表组件
 *
 * 显示课件列表，支持网格/列表视图切换、筛选、排序、搜索、分页
 */

import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { UnifiedMaterialService } from '../../../core/services/unified-material.service';
import {
  MaterialCategory,
  MaterialFilter,
  MaterialQueryParams,
  MaterialSortOption,
  MaterialType,
  MaterialTypeLabels,
  UnifiedMaterial,
} from '../../../models/unified-material.models';
import { MaterialCardComponent } from '../material-card/material-card.component';

interface ViewMode {
  value: 'grid' | 'list';
  icon: string;
  label: string;
}

@Component({
  selector: 'app-material-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatInputModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MaterialCardComponent,
  ],
  template: `
    <div class="material-list">
      <!-- 筛选和搜索栏 -->
      <div class="filter-bar">
        <!-- 搜索框 -->
        <mat-form-field appearance="outline" class="search-field">
          <mat-icon matPrefix>search</mat-icon>
          <input
            matInput
            placeholder="搜索课件..."
            [value]="searchKeyword"
            (input)="onSearchInput($event)"
          />
        </mat-form-field>

        <!-- 视图切换 -->
        <mat-button-toggle-group class="view-toggle" [(value)]="viewMode.value">
          <mat-button-toggle *ngFor="let mode of viewModes" [value]="mode.value">
            <mat-icon [matTooltip]="mode.label">{{ mode.icon }}</mat-icon>
          </mat-button-toggle>
        </mat-button-toggle-group>

        <!-- 类型筛选 -->
        <mat-select
          class="filter-select"
          placeholder="课件类型"
          [(value)]="filter.type"
          (selectionChange)="onTypeFilterChange()"
          [multiple]="true"
        >
          <mat-option *ngFor="let type of materialTypes" [value]="type">
            {{ type.label }}
          </mat-option>
        </mat-select>

        <!-- 分类筛选 -->
        <mat-select
          class="filter-select"
          placeholder="分类"
          [(value)]="filter.category"
          (selectionChange)="onCategoryFilterChange()"
        >
          <mat-option *ngFor="let category of categories" [value]="category.value">
            {{ category.label }}
          </mat-option>
        </mat-select>

        <!-- 排序选择 -->
        <mat-select
          class="filter-select"
          placeholder="排序"
          [(value)]="sortOption"
          (selectionChange)="onSortChange()"
        >
          <mat-option *ngFor="let option of sortOptions" [value]="option.value">
            {{ option.label }}
          </mat-option>
        </mat-select>

        <!-- 清除筛选按钮 -->
        <button mat-button (click)="clearFilters()" [disabled]="!hasActiveFilters">
          <mat-icon>clear</mat-icon>
          清除筛选
        </button>
      </div>

      <!-- 标签栏 -->
      <div class="tags-bar" *ngIf="selectedTags.length > 0">
        <mat-chip-listbox class="tags-list">
          <mat-chip *ngFor="let tag of selectedTags" (removed)="removeTag(tag)" [removable]="true">
            {{ tag }}
          </mat-chip>
        </mat-chip-listbox>
        <button mat-button color="warn" (click)="clearTags()">清除标签</button>
      </div>

      <!-- 加载状态 -->
      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
        <p>加载课件中...</p>
      </div>

      <!-- 错误状态 -->
      <div *ngIf="error" class="error-container">
        <mat-icon color="warn">error</mat-icon>
        <p>{{ error }}</p>
        <button mat-raised-button color="primary" (click)="loadMaterials()">重新加载</button>
      </div>

      <!-- 空状态 -->
      <div *ngIf="!loading && !error && materials.length === 0" class="empty-state">
        <mat-icon>folder_open</mat-icon>
        <p>暂无课件</p>
        <button mat-raised-button color="primary" (click)="navigateToUpload()">
          <mat-icon>upload</mat-icon>
          上传第一个课件
        </button>
      </div>

      <!-- 课件列表 -->
      <div *ngIf="!loading && !error" class="materials-container">
        <div class="materials-count">共 {{ totalCount }} 个课件</div>

        <!-- 网格视图 -->
        <div class="materials-grid" *ngIf="viewMode.value === 'grid'">
          <app-material-card
            *ngFor="let material of materials"
            [material]="material"
            (detail)="onMaterialDetail(material.id)"
            (download)="onMaterialDownload(material.id)"
            (favorite)="onMaterialFavorite(material.id)"
            (share)="onMaterialShare(material.id)"
          >
          </app-material-card>
        </div>

        <!-- 列表视图 -->
        <div class="materials-list" *ngIf="viewMode.value === 'list'">
          <mat-card class="list-item" *ngFor="let material of materials">
            <mat-card-content class="list-content">
              <div class="list-header">
                <div class="list-main">
                  <div class="list-title">{{ material.title }}</div>
                  <div class="list-meta">
                    <mat-chip class="type-chip" [matTooltip]="getTypeLabel(material.type)">
                      <mat-icon [matTooltip]="'文件类型'">{{
                        getFileIcon(material.type)
                      }}</mat-icon>
                      {{ getTypeLabel(material.type) }}
                    </mat-chip>
                    <span class="file-size">{{ formatFileSize(material.file_size) }}</span>
                    <span class="view-count">
                      <mat-icon>visibility</mat-icon>
                      {{ material.view_count }}
                    </span>
                  </div>
                  <div class="list-tags">
                    <mat-chip *ngFor="let tag of material.tags" size="small">
                      {{ tag }}
                    </mat-chip>
                  </div>
                </div>
                <div class="list-actions">
                  <button
                    mat-icon-button
                    [matTooltip]="'下载'"
                    color="primary"
                    (click)="onMaterialDownload(material.id)"
                  >
                    <mat-icon>download</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    [matTooltip]="'预览'"
                    *ngIf="supportsPreview(material.type)"
                    (click)="onMaterialPreview(material)"
                  >
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    [matTooltip]="'收藏'"
                    (click)="onMaterialFavorite(material.id)"
                  >
                    <mat-icon>favorite_border</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    [matTooltip]="'分享'"
                    (click)="onMaterialShare(material.id)"
                  >
                    <mat-icon>share</mat-icon>
                  </button>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- 分页器 -->
        <mat-paginator
          *ngIf="totalPages > 1"
          [length]="totalCount"
          [pageSize]="pageSize"
          [pageIndex]="currentPage"
          [pageSizeOptions]="pageSizeOptions"
          [showFirstLastButtons]="true"
          (page)="onPageChange($event)"
        >
        </mat-paginator>
      </div>
    </div>
  `,
  styles: [
    `
      .material-list {
        padding: 24px;
        max-width: 1400px;
        margin: 0 auto;
      }

      .filter-bar {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        align-items: center;
        padding: 16px;
        background-color: #f5f5f5;
        border-radius: 8px;
        margin-bottom: 20px;
      }

      .search-field {
        flex: 1;
        min-width: 300px;
      }

      .view-toggle {
        display: flex;
        gap: 8px;
      }

      .filter-select {
        min-width: 150px;
      }

      .tags-bar {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background-color: #e3f2fd;
        border-radius: 6px;
        margin-bottom: 20px;
      }

      .tags-list {
        flex: 1;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .loading-container,
      .error-container,
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        text-align: center;

        mat-spinner {
          margin-bottom: 16px;
        }

        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          margin-bottom: 16px;
        }

        p {
          color: #666;
          margin-bottom: 16px;
        }

        .empty-state mat-icon {
          color: #ccc;
        }
      }

      .error-container mat-icon {
        color: #f44336;
      }

      .materials-count {
        font-size: 14px;
        color: #666;
        margin-bottom: 16px;
      }

      .materials-container {
        min-height: 400px;
      }

      .materials-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
      }

      .materials-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .list-item {
        transition: box-shadow 0.2s ease;
      }

      .list-item:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
      }

      .list-content {
        padding: 16px;
      }

      .list-header {
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex: 1;
      }

      .list-main {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
      }

      .list-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        flex: 1;
      }

      .list-meta {
        display: flex;
        flex-direction: column;
        gap: 4px;
        align-items: flex-start;
      }

      .type-chip {
        font-size: 11px;
        min-height: 24px;
        padding: 0 8px;
      }

      .file-size {
        font-size: 12px;
        color: #999;
      }

      .view-count {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: #666;
      }

      .list-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }

      .list-actions {
        display: flex;
        gap: 8px;
      }

      @media (max-width: 768px) {
        .filter-bar {
          flex-direction: column;
          align-items: stretch;
        }

        .search-field {
          min-width: auto;
        }

        .view-toggle {
          flex-wrap: wrap;
        }

        .filter-select {
          min-width: auto;
        }

        .materials-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 480px) {
        .list-header {
          flex-direction: column;
        }

        .list-main {
          flex-direction: column;
          align-items: flex-start;
        }

        .list-actions {
          width: 100%;
          justify-content: space-between;
          flex-wrap: wrap;
        }

        .list-actions .mat-icon-button {
          margin: 4px 8px 4px 8px;
        }
      }
    `,
  ],
})
export class MaterialListComponent implements OnInit, OnDestroy {
  @Input() config?: {
    filter?: Partial<MaterialFilter>;
    course_id?: number;
    chapter_id?: number;
    readonly?: boolean;
  };

  @Output() detail = new EventEmitter<number>();
  @Output() download = new EventEmitter<number>();
  @Output() favorite = new EventEmitter<number>();
  @Output() share = new EventEmitter<number>();

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // 数据
  materials: UnifiedMaterial[] = [];
  loading = false;
  error: string | null = null;
  totalCount = 0;
  currentPage = 0;
  pageSize = 20;
  searchKeyword = '';

  // 筛选和排序
  filter: MaterialFilter = {};
  selectedTags: string[] = [];
  sortOption: MaterialSortOption = 'newest';

  // 视图模式
  viewModes: Array<{ value: 'grid' | 'list'; icon: string; label: string }> = [
    { value: 'grid', icon: 'grid_view', label: '网格视图' },
    { value: 'list', icon: 'list', label: '列表视图' },
  ];
  viewMode: { value: 'grid' | 'list'; icon: string; label: string } = {
    value: 'grid',
    icon: 'grid_view',
    label: '网格视图',
  };

  // 课件类型
  materialTypes: Array<{ value: MaterialType; label: string }> = [];

  // 分类
  categories: Array<{ value: MaterialCategory; label: string }> = [];

  // 排序选项
  sortOptions: Array<{ value: MaterialSortOption; label: string }> = [
    { value: 'newest', label: '最新上传' },
    { value: 'oldest', label: '最早上传' },
    { value: 'most_downloaded', label: '最多下载' },
    { value: 'most_viewed', label: '最多查看' },
    { value: 'most_liked', label: '最多点赞' },
    { value: 'name_asc', label: '名称升序' },
    { value: 'name_desc', label: '名称降序' },
  ];

  pageSizeOptions = [10, 20, 50, 100];

  totalPages = 1;

  constructor(
    private materialService: UnifiedMaterialService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeMaterialTypes();
    this.initializeCategories();

    // 应用输入配置的筛选条件
    if (this.config?.filter) {
      this.filter = { ...this.filter, ...this.config.filter };
    }

    // 搜索防抖
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((keyword) => {
        this.filter.search = keyword || '';
        this.loadMaterials();
      });

    this.loadMaterials();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * 初始化课件类型
   */
  private initializeMaterialTypes(): void {
    const types: MaterialType[] = [
      'document_pdf',
      'document_word',
      'document_ppt',
      'document_excel',
      'video_teaching',
      'video_screen',
      'video_live',
      'audio_teaching',
      'audio_recording',
      'image',
      'code_source',
      'code_example',
      'code_project',
      'game_interactive',
      'game_simulation',
      'animation_2d',
      'animation_3d',
      'ar_model',
      'vr_experience',
      'arvr_scene',
      'model_3d',
      'model_robot',
      'experiment_config',
      'experiment_template',
      'archive',
      'external_link',
    ];

    this.materialTypes = types.map((type) => ({
      value: type,
      label: MaterialTypeLabels[type],
    }));
  }

  /**
   * 初始化分类
   */
  private initializeCategories(): void {
    const categories: MaterialCategory[] = [
      'course_material',
      'reference_material',
      'assignment_material',
      'exam_material',
      'project_template',
      'tutorial',
      'resource_library',
    ];

    this.categories = categories.map((category) => ({
      value: category,
      label: category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' '),
    }));
  }

  /**
   * 搜索输入
   */
  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  /**
   * 类型筛选变化
   */
  onTypeFilterChange(): void {
    this.loadMaterials();
  }

  /**
   * 分类筛选变化
   */
  onCategoryFilterChange(): void {
    this.loadMaterials();
  }

  /**
   * 排序变化
   */
  onSortChange(): void {
    this.loadMaterials();
  }

  /**
   * 切换视图模式
   */
  onViewModeChange(mode: ViewMode): void {
    this.viewMode = mode;
  }

  /**
   * 清除所有筛选
   */
  clearFilters(): void {
    this.filter = {};
    this.selectedTags = [];
    this.sortOption = 'newest';
    this.loadMaterials();
  }

  /**
   * 清除标签筛选
   */
  clearTags(): void {
    this.selectedTags = [];
    this.loadMaterials();
  }

  /**
   * 移除标签
   */
  removeTag(tag: string): void {
    this.selectedTags = this.selectedTags.filter((t) => t !== tag);
    this.loadMaterials();
  }

  /**
   * 加载课件列表
   */
  loadMaterials(): void {
    this.loading = true;
    this.error = null;

    const params: MaterialQueryParams = {
      filter: { ...this.filter },
      sort: this.sortOption,
      page: this.currentPage + 1,
      page_size: this.pageSize,
    };

    if (this.config?.course_id) {
      params.filter = { ...params.filter, course_id: [this.config.course_id] };
    }

    if (this.config?.chapter_id) {
      params.filter = { ...params.filter, chapter_id: [this.config.chapter_id] };
    }

    if (this.config?.readonly) {
      this.config.filter = { ...this.config.filter, visibility: ['public', 'org_private'] };
    }

    this.materialService
      .getMaterials(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.materials = response.items;
          this.totalCount = response.total;
          this.totalPages = response.total_pages;
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load materials:', err);
          this.error = '加载课件失败，请重试';
          this.loading = false;
        },
      });
  }

  /**
   * 获取类型标签
   */
  getTypeLabel(type: string): string {
    return this.materialTypes.find((t) => t.value === type)?.label ?? type;
  }

  /**
   * 分页变化
   */
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadMaterials();
  }

  /**
   * 查看课件详情
   */
  onMaterialDetail(materialId: number): void {
    this.detail.emit(materialId);
  }

  /**
   * 下载课件
   */
  onMaterialDownload(materialId: number): void {
    this.download.emit(materialId);
    this.snackBar.open('开始下载课件...', '关闭', { duration: 3000 });
  }

  /**
   * 收藏/取消收藏课件
   */
  onMaterialFavorite(materialId: number): void {
    this.favorite.emit(materialId);
    this.snackBar.open('收藏操作成功', '关闭', { duration: 3000 });
  }

  /**
   * 分享课件
   */
  onMaterialShare(materialId: number): void {
    this.share.emit(materialId);
    this.snackBar.open('分享功能即将上线', '关闭', { duration: 3000 });
  }

  /**
   * 预览课件
   */
  onMaterialPreview(material: UnifiedMaterial): void {
    // 导航到课件预览页面
    void this.router.navigate(['../materials', material.id], { relativeTo: null });
  }

  /**
   * 导航到上传页面
   */
  navigateToUpload(): void {
    // 导航到课件上传页面
    void this.router.navigate(['../materials/upload'], { relativeTo: null });
  }

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const f = (bytes / Math.pow(k, i)).toFixed(2);
    return `${parseFloat(f)} ${sizes[i]}`;
  }

  /**
   * 获取文件图标
   */
  getFileIcon(type: MaterialType): string {
    const icons: Record<MaterialType, string> = {
      document_pdf: 'picture_as_pdf',
      document_word: 'description',
      document_ppt: 'slideshow',
      document_excel: 'table_chart',
      video_teaching: 'videocam',
      video_screen: 'screen_share',
      video_live: 'live_tv',
      audio_teaching: 'audio_file',
      audio_recording: 'mic',
      image: 'image',
      code_source: 'code',
      code_example: 'integration_instructions',
      code_project: 'folder_zip',
      game_interactive: 'sports_esports',
      game_simulation: 'science',
      animation_2d: 'animation',
      animation_3d: 'view_in_ar',
      ar_model: 'view_in_ar',
      vr_experience: 'vrpano',
      arvr_scene: 'view_in_ar',
      model_3d: 'view_in_ar',
      model_robot: 'precision_manufacturing',
      experiment_config: 'settings',
      experiment_template: 'description',
      archive: 'archive',
      external_link: 'link',
    };
    return icons[type] || 'insert_drive_file';
  }

  /**
   * 检查是否支持预览
   */
  supportsPreview(type: MaterialType): boolean {
    const previewableTypes: MaterialType[] = [
      'document_pdf',
      'image',
      'video_teaching',
      'video_screen',
      'audio_teaching',
      'audio_recording',
      'ar_model',
      'vr_experience',
      'animation_2d',
      'animation_3d',
    ];
    return previewableTypes.includes(type);
  }

  /**
   * 检查是否有活动筛选
   */
  get hasActiveFilters(): boolean {
    return !!(
      this.filter.type?.length ??
      this.filter.category?.length ??
      this.filter.tags?.length ??
      this.filter.search
    );
  }
}
