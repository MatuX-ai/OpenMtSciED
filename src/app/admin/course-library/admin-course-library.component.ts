import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';

import { UnifiedCourseService } from '../../core/services/unified-course.service';
import { UnifiedCourseCardComponent } from '../../shared/components/unified-course-card/unified-course-card.component';
import {
  UnifiedCourse,
  CourseFilter,
  CourseStats
} from '../../models/unified-course.models';

/**
 * Admin课程库管理组件
 * 提供全局课程库的管理功能
 */
@Component({
  selector: 'app-admin-course-library',
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
    MatTableModule,
    UnifiedCourseCardComponent
  ],
  templateUrl: './admin-course-library.component.html',
  styleUrls: ['./admin-course-library.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminCourseLibraryComponent implements OnInit, OnDestroy {
  private courseService = inject(UnifiedCourseService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  private destroy$ = new Subject<void>();

  readonly loading = signal<boolean>(true);
  readonly courseStats = signal<CourseStats | null>(null);
  readonly selectedTab = signal<number>(0);
  readonly searchQuery = signal<string>('');

  // 数据流
  readonly popularCourses$ = this.courseService.getPopularCourses(undefined, 12);
  readonly newestCourses$ = this.courseService.getNewestCourses(12);
  readonly allCourses$ = this.courseService.getCourses({}, 1, 20);

  readonly displayedColumns = ['id', 'title', 'category', 'instructor', 'enrollment', 'rating', 'status', 'actions'];

  readonly courseCategories = [
    { value: 'chinese', label: '语文' },
    { value: 'math', label: '数学' },
    { value: 'english', label: '英语' },
    { value: 'physics', label: '物理' },
    { value: 'chemistry', label: '化学' },
    { value: 'biology', label: '生物' }
  ];

  readonly courseStatuses = [
    { value: 'draft', label: '草稿' },
    { value: 'published', label: '已发布' },
    { value: 'ongoing', label: '进行中' },
    { value: 'completed', label: '已完成' },
    { value: 'archived', label: '已归档' }
  ];

  ngOnInit(): void {
    this.loadCourseStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCourseStats(): void {
    this.loading.set(true);
    
    this.courseService.getCourseStatistics().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (stats: CourseStats) => {
        this.courseStats.set(stats);
        this.loading.set(false);
      },
      error: (error: Error) => {
        console.error('[AdminCourseLibrary] 加载课程统计失败:', error);
        this.snackBar.open('加载课程统计失败', '关闭', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  onTabChange(index: number): void {
    this.selectedTab.set(index);
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    // 触发搜索
    this.allCourses$ = this.courseService.getCourses(
      { search: query },
      1,
      20
    );
  }

  onRefresh(): void {
    this.loadCourseStats();
    this.snackBar.open('数据已刷新', '关闭', { duration: 2000 });
  }

  onCourseDetail(courseId: number): void {
    console.log('查看课程详情:', courseId);
    // 导航到课程详情页
  }

  onEditCourse(courseId: number): void {
    console.log('编辑课程:', courseId);
    // 打开编辑对话框
  }

  onDeleteCourse(courseId: number): void {
    if (confirm('确定要删除此课程吗？')) {
      this.courseService.deleteCourse(courseId).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.snackBar.open('课程已删除', '关闭', { duration: 2000 });
          this.loadCourseStats();
        },
        error: (error: Error) => {
          console.error('[AdminCourseLibrary] 删除课程失败:', error);
          this.snackBar.open('删除失败', '关闭', { duration: 3000 });
        }
      });
    }
  }

  exportCourses(): void {
    this.snackBar.open('导出课程数据功能开发中...', '关闭', { duration: 2000 });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  getCategoryLabel(category: string): string {
    const cat = this.courseCategories.find(c => c.value === category);
    return cat?.label || category;
  }

  getStatusLabel(status: string): string {
    const st = this.courseStatuses.find(s => s.value === status);
    return st?.label || status;
  }

  getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      'draft': 'basic',
      'published': 'primary',
      'ongoing': 'accent',
      'completed': 'warn',
      'archived': 'basic'
    };
    return colorMap[status] || 'basic';
  }
}
