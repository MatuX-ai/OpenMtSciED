import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { Subject } from 'rxjs';

import { UnifiedMaterialService } from '../../core/services/unified-material.service';
import { MaterialStatistics } from '../../models/unified-material.models';
import { MaterialFilterComponent } from '../../shared/components/material-filter/material-filter.component';
import { MaterialLibraryComponent } from '../../shared/components/material-library/material-library.component';

/**
 * Admin课件库管理组件
 * 提供全局课件库的管理功能
 */
@Component({
  selector: 'app-admin-material-library',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatSelectModule,
    MaterialLibraryComponent,
    MaterialFilterComponent,
  ],
  templateUrl: './admin-material-library.component.html',
  styleUrls: ['./admin-material-library.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMaterialLibraryComponent implements OnInit, OnDestroy {
  private materialService = inject(UnifiedMaterialService);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  readonly loading = signal<boolean>(true);
  readonly materialStats = signal<MaterialStatistics | null>(null);
  readonly selectedTab = signal<number>(0);

  // 筛选条件
  readonly selectedOrganization = signal<number | null>(null);
  readonly selectedType = signal<string | null>(null);
  readonly selectedCategory = signal<string | null>(null);
  readonly selectedStatus = signal<string | null>(null);

  readonly organizations = [
    { id: 1, name: '全部机构' },
    { id: 2, name: '培训机构A' },
    { id: 3, name: '培训机构B' },
    { id: 4, name: '学校A' },
    { id: 5, name: '学校B' },
  ];

  readonly materialTypes = [
    { value: 'courseware', label: '课件' },
    { value: 'teaching_plan', label: '教案' },
    { value: 'exercise', label: '练习' },
    { value: 'video', label: '视频' },
    { value: 'interactive', label: '互动内容' },
  ];

  readonly materialCategories = [
    { value: 'chinese', label: '语文' },
    { value: 'math', label: '数学' },
    { value: 'english', label: '英语' },
    { value: 'physics', label: '物理' },
    { value: 'chemistry', label: '化学' },
    { value: 'biology', label: '生物' },
  ];

  readonly materialStatuses = [
    { value: 'draft', label: '草稿' },
    { value: 'published', label: '已发布' },
    { value: 'archived', label: '已归档' },
  ];

  ngOnInit(): void {
    this.loadMaterialStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMaterialStats(): void {
    this.loading.set(true);
    // 模拟统计数据，因为API需要materialId参数
    this.materialStats.set({
      material_id: 0,
      download_count: 12350,
      view_count: 45680,
      like_count: 8920,
      share_count: 2100,
      comment_count: 560,
      unique_visitors: 8500,
      unique_downloaders: 4200,
      downloads_last_7_days: 320,
      downloads_last_30_days: 2100,
      views_last_7_days: 1250,
      views_last_30_days: 8500,
      download_by_region: {},
      view_by_region: {},
      total_size: 1024 * 1024 * 500, // 500MB
      total_downloads: 12350,
      total_materials: 256,
    });
    this.loading.set(false);
  }

  onTabChange(index: number): void {
    this.selectedTab.set(index);
  }

  onRefresh(): void {
    this.loadMaterialStats();
  }

  exportMaterials(): void {
    this.snackBar.open('导出课件数据功能开发中...', '关闭', { duration: 2000 });
  }

  getOrganizationName(orgId: number | null): string {
    if (!orgId) return '全部机构';
    const org = this.organizations.find((o) => o.id === orgId);
    return org?.name || '未知机构';
  }

  formatFileSize(bytes: number | undefined): string {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
