/**
 * 课件库Dashboard模块
 *
 * 为不同角色提供课件库访问和管理功能
 */

import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';

import { UnifiedMaterialService } from '../../../core/services/unified-material.service';
import {
  MaterialCategory,
  MaterialFilter,
  MaterialType,
  UnifiedMaterial,
} from '../../../models/unified-material.models';
import { MaterialFilterComponent } from '../material-filter/material-filter.component';
import { MaterialListComponent } from '../material-list/material-list.component';
import { MaterialUploadComponent } from '../material-upload/material-upload.component';

export interface MaterialLibraryConfig {
  viewMode: 'all' | 'my' | 'shared';
  allowedTypes?: MaterialType[];
  allowedCategories?: MaterialCategory[];
  showUpload?: boolean;
  showStatistics?: boolean;
}

@Component({
  selector: 'app-material-library',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MaterialListComponent,
    MaterialFilterComponent,
  ],
  template: `
    <div class="material-library">
      <!-- 页面头部 -->
      <div class="library-header">
        <div class="header-content">
          <h1>
            <mat-icon>folder_special</mat-icon>
            课件库
          </h1>
          <div class="header-actions">
            @if (config.showUpload) {
              <button mat-raised-button color="primary" (click)="openUploadDialog()">
                <mat-icon>upload_file</mat-icon>
                上传课件
              </button>
            }
            <button mat-button (click)="refreshData()">
              <mat-icon>refresh</mat-icon>
              刷新
            </button>
          </div>
        </div>
      </div>

      <!-- 统计信息 -->
      @if (config.showStatistics && materialStats()) {
        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon" style="color: #2196f3;">
                <mat-icon>insert_drive_file</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ materialStats()!.total_materials }}</h3>
                <p>课件总数</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon" style="color: #4caf50;">
                <mat-icon>people</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ materialStats()!.total_downloads }}</h3>
                <p>下载次数</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon" style="color: #ff9800;">
                <mat-icon>favorite</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ materialStats()!.total_likes }}</h3>
                <p>收藏次数</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon" style="color: #9c27b0;">
                <mat-icon>storage</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ formatFileSize(materialStats()!.total_size) }}</h3>
                <p>总大小</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      }

      <!-- 筛选和搜索 -->
      <mat-card class="filter-card">
        <mat-card-content>
          <app-material-filter (filterChange)="onFilterChange($any($event))"></app-material-filter>
        </mat-card-content>
      </mat-card>

      <!-- 课件列表 -->
      <mat-card class="materials-card">
        <mat-card-content>
          @if (isLoading()) {
            <div class="loading-container">
              <mat-spinner diameter="50"></mat-spinner>
              <p>加载课件中...</p>
            </div>
          } @else if (error()) {
            <div class="error-container">
              <mat-icon class="error-icon">error_outline</mat-icon>
              <p>{{ error() }}</p>
              <button mat-raised-button color="primary" (click)="refreshData()">重新加载</button>
            </div>
          } @else {
            <app-material-list
              [config]="{
                filter: currentFilter(),
              }"
              (materialSelect)="onMaterialSelect($any($event))"
              (materialPreview)="onMaterialPreview($any($event))"
            >
            </app-material-list>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .material-library {
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px;
    }

    .library-header {
      margin-bottom: 32px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .header-content h1 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      font-size: 32px;
      font-weight: 700;
      color: var(--mat-sys-on-surface);
    }

    .header-content h1 mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: var(--mat-sys-primary);
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .stat-card {
      transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
    }

    .stat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .stat-info h3 {
      margin: 0 0 4px 0;
      font-size: 28px;
      font-weight: 700;
      color: var(--mat-sys-on-surface);
    }

    .stat-info p {
      margin: 0;
      font-size: 14px;
      color: var(--mat-sys-on-surface-variant);
    }

    .filter-card,
    .materials-card {
      margin-bottom: 24px;
    }

    .filter-card mat-card-content {
      padding: 16px;
    }

    .materials-card mat-card-content {
      padding: 24px;
      min-height: 400px;
    }

    .loading-container,
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      gap: 16px;
      color: var(--mat-sys-on-surface-variant);
    }

    .error-icon {
      font-size: 64px;
      color: var(--mat-sys-error);
    }

    @media (max-width: 768px) {
      .material-library {
        padding: 16px;
      }

      .header-content {
        flex-direction: column;
        align-items: flex-start;
      }

      .header-actions {
        width: 100%;
      }

      .header-actions button {
        flex: 1;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class MaterialLibraryComponent implements OnInit, OnDestroy {
  @Input() config: MaterialLibraryConfig = {
    viewMode: 'all',
    showUpload: true,
    showStatistics: true,
  };

  private materialService = inject(UnifiedMaterialService);
  private dialog = inject(MatDialog);

  isLoading = signal<boolean>(true);
  error = signal<string>('');
  materialStats = signal<any>(null);
  currentFilter = signal<MaterialFilter>({});

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadMaterialStats();
    this.loadMaterials();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMaterialStats(): void {
    this.materialService
      .getMaterialStatistics(1)
      .pipe(
        // 默认传 orgId
        takeUntil(this.destroy$),
        catchError((err) => {
          console.error('加载课件统计失败:', err);
          return of(null);
        })
      )
      .subscribe((stats) => {
        this.materialStats.set(stats);
      });
  }

  loadMaterials(): void {
    this.isLoading.set(true);
    this.error.set('');

    const filter = this.buildFilter();
    this.currentFilter.set(filter);
    this.isLoading.set(false);
  }

  buildFilter(): MaterialFilter {
    const filter: MaterialFilter = {};

    if (this.config.viewMode === 'my') {
      filter.created_by = [1]; // 当前用户ID
    } else if (this.config.viewMode === 'shared') {
      filter.visibility = ['public', 'org_private'];
    }

    if (this.config.allowedTypes && this.config.allowedTypes.length > 0) {
      filter.type = this.config.allowedTypes;
    }

    if (this.config.allowedCategories && this.config.allowedCategories.length > 0) {
      filter.category = this.config.allowedCategories;
    }

    return filter;
  }

  onFilterChange(filter: MaterialFilter): void {
    this.currentFilter.set(filter);
  }

  onMaterialSelect(material: UnifiedMaterial): void {
    console.log('选中课件:', material);
  }

  onMaterialPreview(material: UnifiedMaterial): void {
    console.log('预览课件:', material);
  }

  openUploadDialog(): void {
    const dialogRef = this.dialog.open(MaterialUploadComponent, {
      width: '90vw',
      maxWidth: '800px',
      maxHeight: '90vh',
      data: {
        allowedTypes: this.config.allowedTypes,
        allowedCategories: this.config.allowedCategories,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadMaterialStats();
        this.loadMaterials();
      }
    });
  }

  refreshData(): void {
    this.loadMaterialStats();
    this.loadMaterials();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
