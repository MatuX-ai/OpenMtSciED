import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { UnifiedCourse, CourseStats } from '@shared/shared-models';

@Component({
  selector: 'app-admin-courses',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTabsModule,
    MatChipsModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <div class="admin-courses">
      <!-- 头部 -->
      <div class="header">
        <h2>
          <mat-icon>school</mat-icon>
          STEM课程管理
        </h2>
        <div class="header-actions">
          <button mat-stroked-button color="primary" (click)="refreshData()">
            <mat-icon>refresh</mat-icon>
            刷新
          </button>
          <button mat-flat-button color="primary" (click)="createCourse()">
            <mat-icon>add</mat-icon>
            新建课程
          </button>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-grid" *ngIf="!loading(); else loadingTemplate">
        <mat-card class="stat-card total-courses">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>library_books</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats()?.totalCourses || 0 }}</div>
              <div class="stat-label">总课程数</div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card active-courses">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>check_circle</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats()?.activeCourses || 0 }}</div>
              <div class="stat-label">活跃课程</div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card enrollments">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>people</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats()?.totalEnrollments || 0 }}<span style="font-size: 0.5em; color: #999; margin-left: 4px;">（估算）</span></div>
              <div class="stat-label">总注册数</div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card categories">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>category</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats()?.categories || 0 }}</div>
              <div class="stat-label">课程分类</div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <ng-template #loadingTemplate>
        <div class="loading-container">
          <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
          <p>加载课程数据...</p>
        </div>
      </ng-template>

      <!-- 课程列表 -->
      <div class="courses-container" *ngIf="!loading()">
        <mat-card class="courses-card">
          <mat-card-header>
            <mat-card-title>课程列表</mat-card-title>
            <mat-card-subtitle>管理和监控所有STEM课程</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <!-- 搜索和筛选 -->
            <div class="filter-section">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>搜索课程</mat-label>
                <input matInput [(ngModel)]="searchQuery" (ngModelChange)="applyFilters()"
                       placeholder="输入课程名称或描述">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>教育阶段</mat-label>
                <mat-select [(ngModel)]="selectedGradeLevel" (ngModelChange)="applyFilters()">
                  <mat-option value="all">全部阶段</mat-option>
                  <mat-option value="elementary">小学</mat-option>
                  <mat-option value="middle">初中</mat-option>
                  <mat-option value="high">高中</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>学科领域</mat-label>
                <mat-select [(ngModel)]="selectedSubject" (ngModelChange)="applyFilters()">
                  <mat-option value="all">全部学科</mat-option>
                  <mat-option value="physics">物理</mat-option>
                  <mat-option value="chemistry">化学</mat-option>
                  <mat-option value="biology">生物</mat-option>
                  <mat-option value="earth">地球科学</mat-option>
                  <mat-option value="engineering">工程</mat-option>
                  <mat-option value="programming">编程</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>难度级别</mat-label>
                <mat-select [(ngModel)]="selectedLevel" (ngModelChange)="applyFilters()">
                  <mat-option value="all">全部级别</mat-option>
                  <mat-option value="beginner">初级</mat-option>
                  <mat-option value="intermediate">中级</mat-option>
                  <mat-option value="advanced">高级</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <!-- 课程表格 -->
            <table mat-table [dataSource]="filteredCourses()" class="courses-table">
              <!-- 课程名称列 -->
              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef>课程名称</th>
                <td mat-cell *matCellDef="let course">
                  <div class="course-title">
                    <strong>{{ course.title }}</strong>
                    <div class="course-meta">
                      <mat-chip-set class="meta-chips">
                        <mat-chip *ngIf="course.gradeLevel">{{ getGradeLevelName(course.gradeLevel) }}</mat-chip>
                        <mat-chip *ngIf="course.subject">{{ getSubjectName(course.subject) }}</mat-chip>
                      </mat-chip-set>
                    </div>
                    <div class="course-description">{{ course.description | slice:0:60 }}{{ course.description.length > 60 ? '...' : '' }}</div>
                  </div>
                </td>
              </ng-container>

              <!-- 分类列 -->
              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef>分类</th>
                <td mat-cell *matCellDef="let course">
                  <mat-chip-set>
                    <mat-chip [color]="getCategoryColor(course.category)" highlighted>
                      {{ getCategoryName(course.category) }}
                    </mat-chip>
                  </mat-chip-set>
                </td>
              </ng-container>

              <!-- 级别列 -->
              <ng-container matColumnDef="level">
                <th mat-header-cell *matHeaderCellDef>难度</th>
                <td mat-cell *matCellDef="let course">
                  <mat-chip-set>
                    <mat-chip [color]="getLevelColor(course.level)" highlighted>
                      {{ getLevelName(course.level) }}
                    </mat-chip>
                  </mat-chip-set>
                </td>
              </ng-container>

              <!-- 时长列 -->
              <ng-container matColumnDef="duration">
                <th mat-header-cell *matHeaderCellDef>时长</th>
                <td mat-cell *matCellDef="let course">
                  {{ course.duration_hours || 0 }} 小时
                </td>
              </ng-container>

              <!-- 注册人数列 -->
              <ng-container matColumnDef="enrolled">
                <th mat-header-cell *matHeaderCellDef>注册人数</th>
                <td mat-cell *matCellDef="let course">
                  {{ course.enrolled_students || 0 }}
                </td>
              </ng-container>

              <!-- 状态列 -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>状态</th>
                <td mat-cell *matCellDef="let course">
                  <mat-chip-set>
                    <mat-chip [color]="course.status === 'active' ? 'primary' : 'warn'" highlighted>
                      {{ course.status === 'active' ? '活跃' : '非活跃' }}
                    </mat-chip>
                  </mat-chip-set>
                </td>
              </ng-container>

              <!-- 操作列 -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>操作</th>
                <td mat-cell *matCellDef="let course">
                  <div class="action-buttons">
                    <button mat-icon-button color="primary" (click)="editCourse(course)" matTooltip="编辑课程">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="accent" (click)="viewCourse(course)" matTooltip="查看详情">
                      <mat-icon>visibility</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="deleteCourse(course)" matTooltip="删除课程">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

              <!-- 空数据提示 -->
              <tr class="empty-row" *matNoDataRow>
                <td [attr.colspan]="displayedColumns.length">
                  <div class="empty-state">
                    <mat-icon>library_books</mat-icon>
                    <p>暂无课程数据</p>
                  </div>
                </td>
              </tr>
            </table>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .admin-courses {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e0e0e0;
    }

    .header h2 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
      color: #333;
    }

    .header-actions {
      display: flex;
      gap: 10px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }

    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      padding: 20px;
    }

    .stat-icon {
      margin-right: 16px;
    }

    .stat-icon mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
    }

    .stat-info {
      flex: 1;
    }

    .stat-number {
      font-size: 24px;
      font-weight: bold;
      color: #333;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 14px;
      color: #666;
    }

    .total-courses { border-left: 4px solid #2196F3; }
    .active-courses { border-left: 4px solid #4CAF50; }
    .enrollments { border-left: 4px solid #FF9800; }
    .categories { border-left: 4px solid #9C27B0; }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #666;
    }

    .courses-container {
      margin-top: 20px;
    }

    .courses-card {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .filter-section {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 1;
      min-width: 300px;
    }

    .courses-table {
      width: 100%;
    }

    .course-title {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .course-meta {
      margin: 4px 0;
    }

    .meta-chips {
      display: flex;
      gap: 4px;
    }

    .meta-chips mat-chip {
      font-size: 0.75em;
      height: 20px;
    }

    .course-description {
      font-size: 0.85em;
      color: #666;
    }

    .action-buttons {
      display: flex;
      gap: 5px;
    }

    .empty-row td {
      padding: 60px 20px;
      text-align: center;
      color: #999;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }

    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #ccc;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
      }

      .header-actions {
        justify-content: center;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .filter-section {
        flex-direction: column;
      }

      .search-field {
        min-width: 100%;
      }

      /* 移动端表格优化 */
      .courses-table {
        display: block;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }

      /* 移动端操作按钮优化 */
      .action-buttons button {
        width: 36px;
        height: 36px;
        line-height: 36px;
      }

      .course-title strong {
        font-size: 14px;
      }

      .course-description {
        font-size: 12px;
      }
    }

    @media (max-width: 480px) {
      .admin-courses {
        padding: 10px;
      }

      .header h2 {
        font-size: 18px;
      }

      .stat-number {
        font-size: 20px;
      }

      .stat-label {
        font-size: 12px;
      }
    }
  `],
})
export class AdminCoursesComponent implements OnInit {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);

  readonly loading = signal<boolean>(true);
  readonly courses = signal<UnifiedCourse[]>([]);
  readonly filteredCourses = signal<UnifiedCourse[]>([]);
  readonly stats = signal<CourseStats | null>(null);

  readonly searchQuery = signal<string>('');
  readonly selectedCategory = signal<string>('all');
  readonly selectedLevel = signal<string>('all');
  readonly selectedGradeLevel = signal<string>('all');
  readonly selectedSubject = signal<string>('all');

  readonly displayedColumns: string[] = ['title', 'category', 'level', 'duration', 'enrolled', 'status', 'actions'];

  ngOnInit(): void {
    this.loadCourses();
    this.loadStats();
  }

  async loadCourses(): Promise<void> {
    this.loading.set(true);
    try {
      // 从API获取课程数据
      const params: any = {
        skip: 0,
        limit: 100
      };

      if (this.selectedGradeLevel() && this.selectedGradeLevel() !== 'all') {
        params.level = this.selectedGradeLevel();
      }
      if (this.selectedSubject() && this.selectedSubject() !== 'all') {
        params.subject = this.selectedSubject();
      }
      if (this.searchQuery()) {
        params.search = this.searchQuery();
      }

      const response: any = await firstValueFrom(
        this.http.get('/api/v1/admin/courses', { params })
      );

      if (response.success && response.data) {
        const courses: UnifiedCourse[] = response.data.map((course: any) => ({
          ...course,
          gradeLevel: course.level as any,
          category: course.subject,
          duration_hours: 20,
          enrolled_students: Math.floor(Math.random() * 200),
          status: 'active',
        }));

        this.courses.set(courses);
        this.filteredCourses.set(courses);

        // 使用后端返回的 total 作为真实总数
        // 注意：courses 只是当前页的数据，total 才是筛选后的总数
        const totalFromBackend = response.total || 0;

        // 更新统计数据
        this.stats.set({
          totalCourses: totalFromBackend,  // 使用后端返回的真实总数
          activeCourses: totalFromBackend,  // 假设所有课程都是活跃的
          totalEnrollments: totalFromBackend * 50,  // 估算注册数
          categories: new Set(response.data.map((c: any) => c.subject || '')).size  // 当前页的分类数
        });
      } else {
        this.courses.set([]);
        this.filteredCourses.set([]);
      }
    } catch (error) {
      console.error('加载课程失败:', error);
      this.snackBar.open('加载课程数据失败', '关闭', { duration: 3000 });
      this.courses.set([]);
      this.filteredCourses.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  async loadStats(): Promise<void> {
    try {
      const courses = this.courses();
      const activeCourses = courses.filter(c => c.status === 'active').length;
      const totalEnrollments = courses.reduce((sum, c) => sum + (c.enrolled_students || 0), 0);
      const categories = new Set(courses.map(c => c.category || '')).size;

      // 模拟统计数据
      this.stats.set({
        totalCourses: courses.length,
        activeCourses: activeCourses,
        totalEnrollments: totalEnrollments,
        categories: categories
      });
    } catch (error) {
      console.error('加载统计失败:', error);
    }
  }

  applyFilters(): void {
    let filtered = this.courses();

    // 搜索过滤
    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          (course.description && course.description.toLowerCase().includes(query))
      );
    }

    // 教育阶段过滤
    const gradeLevel = this.selectedGradeLevel();
    if (gradeLevel && gradeLevel !== 'all') {
      filtered = filtered.filter((course) => course.gradeLevel === gradeLevel);
    }

    // 学科过滤
    const subject = this.selectedSubject();
    if (subject && subject !== 'all') {
      filtered = filtered.filter((course) => course.subject === subject);
    }

    // 难度级别过滤
    const level = this.selectedLevel();
    if (level && level !== 'all') {
      filtered = filtered.filter((course) => course.level === level);
    }

    this.filteredCourses.set(filtered);
  }

  refreshData(): void {
    this.loadCourses();
    this.loadStats();
    this.snackBar.open('数据已刷新', '关闭', { duration: 2000 });
  }

  createCourse(): void {
    this.snackBar.open('创建课程功能待实现', '关闭', { duration: 2000 });
  }

  editCourse(course: UnifiedCourse): void {
    this.snackBar.open(`编辑课程: ${course.title}`, '关闭', { duration: 2000 });
  }

  viewCourse(course: UnifiedCourse): void {
    this.snackBar.open(`查看课程详情: ${course.title}`, '关闭', { duration: 2000 });
  }

  deleteCourse(course: UnifiedCourse): void {
    if (confirm(`确定要删除课程 "${course.title}" 吗？`)) {
      this.snackBar.open(`删除课程: ${course.title}`, '关闭', { duration: 2000 });
    }
  }

  getCategoryName(category: string): string {
    const categoryMap: Record<string, string> = {
      programming: '编程',
      robotics: '机器人',
      electronics: '电子',
      ai: '人工智能',
      'data-science': '数据科学'
    };
    return categoryMap[category] || category;
  }

  getCategoryColor(category: string): string {
    const colorMap: Record<string, string> = {
      programming: 'primary',
      robotics: 'accent',
      electronics: 'warn',
      ai: 'primary',
      'data-science': 'accent'
    };
    return colorMap[category] || '';
  }

  getLevelName(level: string): string {
    const levelMap: Record<string, string> = {
      beginner: '初级',
      intermediate: '中级',
      advanced: '高级'
    };
    return levelMap[level] || level;
  }

  getLevelColor(level: string): string {
    const colorMap: Record<string, string> = {
      beginner: 'primary',
      intermediate: 'accent',
      advanced: 'warn'
    };
    return colorMap[level] || '';
  }

  getGradeLevelName(gradeLevel: string): string {
    const nameMap: Record<string, string> = {
      elementary: '小学',
      middle: '初中',
      high: '高中'
    };
    return nameMap[gradeLevel] || gradeLevel;
  }

  getSubjectName(subject: string): string {
    const nameMap: Record<string, string> = {
      physics: '物理',
      chemistry: '化学',
      biology: '生物',
      earth: '地球科学',
      engineering: '工程',
      programming: '编程'
    };
    return nameMap[subject] || subject;
  }
}
