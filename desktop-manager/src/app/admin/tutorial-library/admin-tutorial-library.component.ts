import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { Subject } from 'rxjs';

import { UnifiedCourseService } from '../../core/services/unified-course.service';
import { UnifiedCourse } from '../../models/unified-course.models';
import { PathMapComponent } from '../../shared/components/path-map/path-map.component';
import { UnifiedCourseCardComponent } from '../../shared/components/unified-course-card/unified-course-card.component';

/**
 * Admin教程库管理组件
 * 提供全局教程库的管理功能
 */
@Component({
  selector: 'app-admin-tutorial-library',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    UnifiedCourseCardComponent,
    PathMapComponent,
  ],
  templateUrl: './admin-tutorial-library.component.html',
  styleUrls: ['./admin-tutorial-library.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminTutorialLibraryComponent implements OnInit, OnDestroy {
  private courseService = inject(UnifiedCourseService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  private destroy$ = new Subject<void>();

  readonly loading = signal<boolean>(true);
  readonly courseStats = signal<{
    totalCourses: number;
    activeCourses: number;
    totalStudents: number;
    average_rating?: number;
    completion_rate?: number;
    total_courses?: number;
    total_enrollments?: number;
  } | null>(null);
  readonly selectedTab = signal<number>(0);
  readonly searchQuery = signal<string>('');
  readonly graphData = signal<{
    nodes: Array<{ id: string; label: string; type: string; [key: string]: unknown }>;
    edges: Array<{ source: string; target: string; [key: string]: unknown }>;
  } | null>(null);
  readonly showFilterPanel = signal<boolean>(false);
  readonly selectedPathStage = signal<string | null>(null);
  readonly selectedBudgetLevel = signal<string | null>(null);

  // 数据流 - 使用正确的参数格式
  readonly popularCourses$ = this.courseService.getCourses({ page_size: 12 });
  readonly newestCourses$ = this.courseService.getCourses({ page_size: 12 });
  allCourses$ = this.courseService.getCourses({ page: 1, page_size: 20 });

  readonly displayedColumns = [
    'id',
    'title',
    'category',
    'instructor',
    'enrollment',
    'rating',
    'status',
    'actions',
  ];

  readonly courseCategories = [
    { value: 'chinese', label: '语文' },
    { value: 'math', label: '数学' },
    { value: 'english', label: '英语' },
    { value: 'physics', label: '物理' },
    { value: 'chemistry', label: '化学' },
    { value: 'biology', label: '生物' },
  ];

  readonly courseStatuses = [
    { value: 'draft', label: '草稿' },
    { value: 'published', label: '已发布' },
    { value: 'ongoing', label: '进行中' },
    { value: 'completed', label: '已完成' },
    { value: 'archived', label: '已归档' },
  ];

  ngOnInit(): void {
    this.loadTutorialStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTutorialStats(): void {
    this.loading.set(true);

    // 模拟教程统计数据
    this.courseStats.set({
      totalCourses: 150,
      activeCourses: 85,
      totalStudents: 3250,
    });
    this.loading.set(false);
  }

  onTabChange(index: number): void {
    this.selectedTab.set(index);
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    // 触发搜索
    this.allCourses$ = this.courseService.getCourses({
      filter: {
        search_keyword: query,
        // 这里可以根据选中的阶段和预算进一步筛选
      },
      page: 1,
      page_size: 20,
    });
  }

  toggleFilterPanel(): void {
    this.showFilterPanel.update((v) => !v);
  }

  onRefresh(): void {
    this.loadTutorialStats();
    this.snackBar.open('数据已刷新', '关闭', { duration: 2000 });
  }

  exportTutorials(): void {
    this.snackBar.open('导出教程数据功能开发中...', '关闭', { duration: 2000 });
  }

  onTutorialDetail(_tutorialId: number): void {
    // 查看教程详情
    // TODO: 导航到教程详情页
  }

  onTutorialEdit(_tutorial: UnifiedCourse): void {
    // 编辑教程
    // TODO: 打开编辑对话框
  }

  onTutorialDelete(_tutorial: UnifiedCourse): void {
    // 删除教程
    this.snackBar.open('删除教程功能开发中...', '关闭', { duration: 3000 });
  }

  getOrganizationName(orgId: number): string {
    return `机构 ${orgId}`;
  }
}
