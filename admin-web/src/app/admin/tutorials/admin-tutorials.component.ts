import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface Tutorial {
  tutorial_id: string;
  title: string;
  source: string;
  age_range?: string;
  subject: string;
  category?: string;
  difficulty?: number;
  duration_hours?: number;
  description: string;
  modules?: any[];
  hardware_list?: any[];
  knowledge_points?: string[];
  experiments?: any[];
  cross_discipline?: string[];
  tutorial_url?: string;
}

@Component({
  selector: 'app-admin-tutorials',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatChipsModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <div class="admin-tutorials">
      <!-- 头部 -->
      <div class="header">
        <h2>
          <mat-icon>menu_book</mat-icon>
          教程库管理
        </h2>
        <div class="header-actions">
          <button mat-stroked-button color="primary" (click)="refreshData()">
            <mat-icon>refresh</mat-icon>
            刷新
          </button>
          <button mat-flat-button color="primary" (click)="importTutorial()">
            <mat-icon>upload</mat-icon>
            导入教程
          </button>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-grid" *ngIf="!loading(); else loadingTemplate">
        <mat-card class="stat-card total-tutorials">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>menu_book</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats().totalTutorials }}</div>
              <div class="stat-label">教程总数</div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card sources">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>source</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats().sources }}</div>
              <div class="stat-label">来源平台</div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card subjects">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>category</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats().subjects }}</div>
              <div class="stat-label">学科领域</div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card categories">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>folder</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats().categories }}</div>
              <div class="stat-label">分类数量</div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <ng-template #loadingTemplate>
        <div class="loading-container">
          <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
          <p>加载教程数据...</p>
        </div>
      </ng-template>

      <!-- 教程列表 -->
      <div class="tutorials-container" *ngIf="!loading()">
        <mat-card class="tutorials-card">
          <mat-card-header>
            <mat-card-title>教程列表</mat-card-title>
            <mat-card-subtitle>管理和浏览所有STEM教程资源</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <!-- 搜索和筛选 -->
            <div class="filter-section">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>搜索教程</mat-label>
                <input matInput [(ngModel)]="searchQuery" (ngModelChange)="applyFilters()"
                       placeholder="输入教程名称或描述">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>来源平台</mat-label>
                <mat-select [(ngModel)]="selectedSource" (ngModelChange)="applyFilters()">
                  <mat-option value="all">全部来源</mat-option>
                  <mat-option *ngFor="let source of availableSources()" [value]="source">
                    {{ source }}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>学科领域</mat-label>
                <mat-select [(ngModel)]="selectedSubject" (ngModelChange)="applyFilters()">
                  <mat-option value="all">全部学科</mat-option>
                  <mat-option *ngFor="let subject of availableSubjects()" [value]="subject">
                    {{ subject }}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>难度级别</mat-label>
                <mat-select [(ngModel)]="selectedDifficulty" (ngModelChange)="applyFilters()">
                  <mat-option value="all">全部级别</mat-option>
                  <mat-option value="1">入门</mat-option>
                  <mat-option value="2">初级</mat-option>
                  <mat-option value="3">中级</mat-option>
                  <mat-option value="4">高级</mat-option>
                  <mat-option value="5">专家</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <!-- 教程表格 -->
            <table mat-table [dataSource]="filteredTutorials()" class="tutorials-table">
              <!-- 教程名称列 -->
              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef>教程名称</th>
                <td mat-cell *matCellDef="let tutorial">
                  <div class="tutorial-title">
                    <strong>{{ tutorial.title }}</strong>
                    <div class="tutorial-meta">
                      <mat-chip-set class="meta-chips">
                        <mat-chip *ngIf="tutorial.source">{{ tutorial.source }}</mat-chip>
                        <mat-chip *ngIf="tutorial.subject">{{ getSubjectName(tutorial.subject) }}</mat-chip>
                        <mat-chip *ngIf="tutorial.category">{{ tutorial.category }}</mat-chip>
                      </mat-chip-set>
                    </div>
                    <div class="tutorial-description">{{ tutorial.description | slice:0:80 }}{{ tutorial.description.length > 80 ? '...' : '' }}</div>
                  </div>
                </td>
              </ng-container>

              <!-- 难度列 -->
              <ng-container matColumnDef="difficulty">
                <th mat-header-cell *matHeaderCellDef>难度</th>
                <td mat-cell *matCellDef="let tutorial">
                  <mat-chip-set>
                    <mat-chip [color]="getDifficultyColor(tutorial.difficulty)" highlighted>
                      {{ getDifficultyName(tutorial.difficulty) }}
                    </mat-chip>
                  </mat-chip-set>
                </td>
              </ng-container>

              <!-- 时长列 -->
              <ng-container matColumnDef="duration">
                <th mat-header-cell *matHeaderCellDef>时长</th>
                <td mat-cell *matCellDef="let tutorial">
                  {{ tutorial.duration_hours || 0 }} 小时
                </td>
              </ng-container>

              <!-- 知识点列 -->
              <ng-container matColumnDef="knowledgePoints">
                <th mat-header-cell *matHeaderCellDef>知识点</th>
                <td mat-cell *matCellDef="let tutorial">
                  {{ getKnowledgePointCount(tutorial) }} 个
                </td>
              </ng-container>

              <!-- 操作列 -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>操作</th>
                <td mat-cell *matCellDef="let tutorial">
                  <div class="action-buttons">
                    <button mat-icon-button color="primary" (click)="viewTutorial(tutorial)" matTooltip="查看详情">
                      <mat-icon>visibility</mat-icon>
                    </button>
                    <button mat-icon-button color="accent" (click)="editTutorial(tutorial)" matTooltip="编辑教程">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="deleteTutorial(tutorial)" matTooltip="删除教程">
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
                    <mat-icon>menu_book</mat-icon>
                    <p>暂无教程数据</p>
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
    .admin-tutorials {
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

    .total-tutorials { border-left: 4px solid #2196F3; }
    .sources { border-left: 4px solid #4CAF50; }
    .subjects { border-left: 4px solid #FF9800; }
    .categories { border-left: 4px solid #9C27B0; }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #666;
    }

    .tutorials-container {
      margin-top: 20px;
    }

    .tutorials-card {
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

    .tutorials-table {
      width: 100%;
    }

    .tutorial-title {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .tutorial-meta {
      margin: 4px 0;
    }

    .meta-chips {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }

    .meta-chips mat-chip {
      font-size: 0.75em;
      height: 20px;
    }

    .tutorial-description {
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

      .tutorials-table {
        display: block;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }

      .action-buttons button {
        width: 36px;
        height: 36px;
        line-height: 36px;
      }
    }
  `],
})
export class AdminTutorialsComponent implements OnInit {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);

  readonly loading = signal<boolean>(true);
  readonly tutorials = signal<Tutorial[]>([]);
  readonly filteredTutorials = signal<Tutorial[]>([]);

  readonly stats = signal({
    totalTutorials: 0,
    sources: 0,
    subjects: 0,
    categories: 0
  });

  readonly searchQuery = signal<string>('');
  readonly selectedSource = signal<string>('all');
  readonly selectedSubject = signal<string>('all');
  readonly selectedDifficulty = signal<string>('all');

  readonly availableSources = signal<string[]>([]);
  readonly availableSubjects = signal<string[]>([]);

  readonly displayedColumns: string[] = ['title', 'difficulty', 'duration', 'knowledgePoints', 'actions'];

  ngOnInit(): void {
    this.loadTutorials();
  }

  async loadTutorials(): Promise<void> {
    this.loading.set(true);
    try {
      // 从新的教程库API获取数据
      const response: any = await firstValueFrom(
        this.http.get('http://localhost:8000/api/v1/libraries/tutorials', {
          params: { skip: 0, limit: 1000 }
        })
      );

      if (response.success && response.data) {
        const allTutorials = response.data.map((item: any) => ({
          tutorial_id: item.tutorial_id || item.unit_id || item.course_id || '',
          title: item.title,
          source: item.source || '未知来源',
          subject: item.subject || '未分类',
          category: item.category || item.subject || '',
          difficulty: item.difficulty || item.complexity ? this.mapComplexity(item.complexity) : 2,
          duration_hours: item.duration_hours || (item.duration_minutes ? item.duration_minutes / 60 : 0),
          description: item.description || '',
          knowledge_points: item.knowledge_points || []
        }));

        this.tutorials.set(allTutorials);
        this.filteredTutorials.set(allTutorials);

        this.updateAvailableOptions(allTutorials);
        this.updateStats(allTutorials);
      } else {
        this.tutorials.set([]);
        this.filteredTutorials.set([]);
      }
    } catch (error) {
      console.error('加载教程失败:', error);
      this.snackBar.open('加载教程数据失败', '关闭', { duration: 3000 });
      this.tutorials.set([]);
      this.filteredTutorials.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  updateAvailableOptions(tutorials: Tutorial[]): void {
    const sources = new Set(tutorials.map(t => t.source).filter(Boolean));
    const subjects = new Set(tutorials.map(t => t.subject).filter(Boolean));

    this.availableSources.set(Array.from(sources).sort());
    this.availableSubjects.set(Array.from(subjects).sort());
  }

  updateStats(tutorials: Tutorial[]): void {
    const sources = new Set(tutorials.map(t => t.source).filter(Boolean));
    const subjects = new Set(tutorials.map(t => t.subject).filter(Boolean));
    const categories = new Set(tutorials.map(t => t.category).filter(Boolean));

    this.stats.set({
      totalTutorials: tutorials.length,
      sources: sources.size,
      subjects: subjects.size,
      categories: categories.size
    });
  }

  applyFilters(): void {
    let filtered = this.tutorials();

    // 搜索过滤
    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(
        (tutorial) =>
          tutorial.title.toLowerCase().includes(query) ||
          tutorial.description.toLowerCase().includes(query)
      );
    }

    // 来源过滤
    const source = this.selectedSource();
    if (source && source !== 'all') {
      filtered = filtered.filter((tutorial) => tutorial.source === source);
    }

    // 学科过滤
    const subject = this.selectedSubject();
    if (subject && subject !== 'all') {
      filtered = filtered.filter((tutorial) => tutorial.subject === subject);
    }

    // 难度过滤
    const difficulty = this.selectedDifficulty();
    if (difficulty && difficulty !== 'all') {
      filtered = filtered.filter((tutorial) => tutorial.difficulty === parseInt(difficulty));
    }

    this.filteredTutorials.set(filtered);
  }

  refreshData(): void {
    this.loadTutorials();
    this.snackBar.open('数据已刷新', '关闭', { duration: 2000 });
  }

  importTutorial(): void {
    this.snackBar.open('导入教程功能待实现', '关闭', { duration: 2000 });
  }

  viewTutorial(tutorial: Tutorial): void {
    this.snackBar.open(`查看教程详情: ${tutorial.title}`, '关闭', { duration: 2000 });
  }

  editTutorial(tutorial: Tutorial): void {
    this.snackBar.open(`编辑教程: ${tutorial.title}`, '关闭', { duration: 2000 });
  }

  deleteTutorial(tutorial: Tutorial): void {
    if (confirm(`确定要删除教程 "${tutorial.title}" 吗？`)) {
      this.snackBar.open(`删除教程: ${tutorial.title}`, '关闭', { duration: 2000 });
    }
  }

  getDifficultyName(difficulty?: number): string {
    const nameMap: Record<number, string> = {
      1: '入门',
      2: '初级',
      3: '中级',
      4: '高级',
      5: '专家'
    };
    return difficulty ? (nameMap[difficulty] || '未知') : '未设置';
  }

  getDifficultyColor(difficulty?: number): string {
    const colorMap: Record<number, string> = {
      1: 'primary',
      2: 'accent',
      3: 'warn',
      4: 'primary',
      5: 'accent'
    };
    return difficulty ? (colorMap[difficulty] || '') : '';
  }

  getSubjectName(subject: string): string {
    const nameMap: Record<string, string> = {
      physics: '物理',
      chemistry: '化学',
      biology: '生物',
      earth: '地球科学',
      engineering: '工程',
      programming: '编程',
      robotics: '机器人',
      electronics: '电子'
    };
    return nameMap[subject] || subject;
  }

  getKnowledgePointCount(tutorial: Tutorial): number {
    if (tutorial.knowledge_points && Array.isArray(tutorial.knowledge_points)) {
      return tutorial.knowledge_points.length;
    }
    return 0;
  }

  mapComplexity(complexity: string): number {
    const map: Record<string, number> = {
      '入门': 1,
      '初级': 2,
      '中级': 3,
      '高级': 4,
      '专家': 5
    };
    return map[complexity] || 2;
  }
}
