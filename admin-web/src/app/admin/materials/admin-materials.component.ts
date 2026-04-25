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

interface TextbookChapter {
  chapter_id: string;
  title: string;
  textbook: string;
  source: string;
  grade_level: string;
  subject: string;
  chapter_url?: string;
  pdf_download_url?: string;
  prerequisites?: string[];
  key_concepts?: any[];
  exercises?: any[];
}

@Component({
  selector: 'app-admin-materials',
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
    <div class="admin-materials">
      <div class="header">
        <h2>
          <mat-icon>description</mat-icon>
          课件库管理
        </h2>
        <div class="header-actions">
          <button mat-stroked-button color="primary" (click)="refreshData()">
            <mat-icon>refresh</mat-icon>
            刷新
          </button>
          <button mat-flat-button color="primary" (click)="uploadMaterial()">
            <mat-icon>upload</mat-icon>
            上传课件
          </button>
        </div>
      </div>

      <div class="stats-grid" *ngIf="!loading(); else loadingTemplate">
        <mat-card class="stat-card total-materials">
          <mat-card-content>
            <div class="stat-icon"><mat-icon>description</mat-icon></div>
            <div class="stat-info">
              <div class="stat-number">{{ stats().totalMaterials }}</div>
              <div class="stat-label">课件总数</div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card textbooks">
          <mat-card-content>
            <div class="stat-icon"><mat-icon>library_books</mat-icon></div>
            <div class="stat-info">
              <div class="stat-number">{{ stats().textbooks }}</div>
              <div class="stat-label">教材来源</div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card subjects">
          <mat-card-content>
            <div class="stat-icon"><mat-icon>category</mat-icon></div>
            <div class="stat-info">
              <div class="stat-number">{{ stats().subjects }}</div>
              <div class="stat-label">学科领域</div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card downloads">
          <mat-card-content>
            <div class="stat-icon"><mat-icon>download</mat-icon></div>
            <div class="stat-info">
              <div class="stat-number">{{ stats().withDownloads }}</div>
              <div class="stat-label">可下载课件</div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <ng-template #loadingTemplate>
        <div class="loading-container">
          <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
          <p>加载课件数据...</p>
        </div>
      </ng-template>

      <div class="materials-container" *ngIf="!loading()">
        <mat-card class="materials-card">
          <mat-card-header>
            <mat-card-title>课件列表</mat-card-title>
            <mat-card-subtitle>管理和浏览所有STEM课件资源</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <div class="filter-section">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>搜索课件</mat-label>
                <input matInput [(ngModel)]="searchQuery" (ngModelChange)="applyFilters()"
                       placeholder="输入课件名称或教材">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>教材来源</mat-label>
                <mat-select [(ngModel)]="selectedSource" (ngModelChange)="applyFilters()">
                  <mat-option value="all">全部来源</mat-option>
                  <mat-option *ngFor="let source of availableSources()" [value]="source">{{ source }}</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>学科领域</mat-label>
                <mat-select [(ngModel)]="selectedSubject" (ngModelChange)="applyFilters()">
                  <mat-option value="all">全部学科</mat-option>
                  <mat-option *ngFor="let subject of availableSubjects()" [value]="subject">{{ subject }}</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>教育阶段</mat-label>
                <mat-select [(ngModel)]="selectedGradeLevel" (ngModelChange)="applyFilters()">
                  <mat-option value="all">全部阶段</mat-option>
                  <mat-option value="elementary">小学</mat-option>
                  <mat-option value="middle">初中</mat-option>
                  <mat-option value="high">高中</mat-option>
                  <mat-option value="university">大学</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <table mat-table [dataSource]="filteredMaterials()" class="materials-table">
              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef>课件名称</th>
                <td mat-cell *matCellDef="let material">
                  <div class="material-title">
                    <strong>{{ material.title }}</strong>
                    <div class="material-meta">
                      <mat-chip-set class="meta-chips">
                        <mat-chip *ngIf="material.textbook">{{ material.textbook }}</mat-chip>
                        <mat-chip *ngIf="material.source">{{ material.source }}</mat-chip>
                      </mat-chip-set>
                    </div>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="subject">
                <th mat-header-cell *matHeaderCellDef>学科</th>
                <td mat-cell *matCellDef="let material">
                  <mat-chip-set>
                    <mat-chip color="primary" highlighted>{{ getSubjectName(material.subject) }}</mat-chip>
                  </mat-chip-set>
                </td>
              </ng-container>

              <ng-container matColumnDef="gradeLevel">
                <th mat-header-cell *matHeaderCellDef>教育阶段</th>
                <td mat-cell *matCellDef="let material">
                  <mat-chip-set>
                    <mat-chip color="accent" highlighted>{{ getGradeLevelName(material.grade_level) }}</mat-chip>
                  </mat-chip-set>
                </td>
              </ng-container>

              <ng-container matColumnDef="concepts">
                <th mat-header-cell *matHeaderCellDef>核心概念</th>
                <td mat-cell *matCellDef="let material">{{ getKeyConceptCount(material) }} 个</td>
              </ng-container>

              <ng-container matColumnDef="download">
                <th mat-header-cell *matHeaderCellDef>下载</th>
                <td mat-cell *matCellDef="let material">
                  <button *ngIf="material.pdf_download_url" mat-icon-button color="primary"
                          (click)="downloadMaterial(material)" matTooltip="下载PDF">
                    <mat-icon>download</mat-icon>
                  </button>
                  <span *ngIf="!material.pdf_download_url" class="no-download">暂无</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>操作</th>
                <td mat-cell *matCellDef="let material">
                  <div class="action-buttons">
                    <button mat-icon-button color="primary" (click)="viewMaterial(material)" matTooltip="查看详情">
                      <mat-icon>visibility</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="deleteMaterial(material)" matTooltip="删除课件">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

              <tr class="empty-row" *matNoDataRow>
                <td [attr.colspan]="displayedColumns.length">
                  <div class="empty-state">
                    <mat-icon>description</mat-icon>
                    <p>暂无课件数据</p>
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
    .admin-materials { padding: 20px; max-width: 1400px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #e0e0e0; }
    .header h2 { display: flex; align-items: center; gap: 10px; margin: 0; color: #333; }
    .header-actions { display: flex; gap: 10px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .stat-card { transition: transform 0.2s, box-shadow 0.2s; }
    .stat-card:hover { transform: translateY(-4px); box-shadow: 0 8px 16px rgba(0,0,0,0.1); }
    .stat-card mat-card-content { display: flex; align-items: center; padding: 20px; }
    .stat-icon { margin-right: 16px; }
    .stat-icon mat-icon { font-size: 40px; width: 40px; height: 40px; }
    .stat-info { flex: 1; }
    .stat-number { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 4px; }
    .stat-label { font-size: 14px; color: #666; }
    .total-materials { border-left: 4px solid #2196F3; }
    .textbooks { border-left: 4px solid #4CAF50; }
    .subjects { border-left: 4px solid #FF9800; }
    .downloads { border-left: 4px solid #9C27B0; }
    .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; color: #666; }
    .materials-container { margin-top: 20px; }
    .materials-card { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .filter-section { display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap; }
    .search-field { flex: 1; min-width: 300px; }
    .materials-table { width: 100%; }
    .material-title { display: flex; flex-direction: column; gap: 4px; }
    .material-meta { margin: 4px 0; }
    .meta-chips { display: flex; gap: 4px; flex-wrap: wrap; }
    .meta-chips mat-chip { font-size: 0.75em; height: 20px; }
    .action-buttons { display: flex; gap: 5px; }
    .no-download { color: #999; font-size: 0.85em; }
    .empty-row td { padding: 60px 20px; text-align: center; color: #999; }
    .empty-state { display: flex; flex-direction: column; align-items: center; gap: 10px; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; color: #ccc; }
    @media (max-width: 768px) {
      .header { flex-direction: column; gap: 15px; align-items: stretch; }
      .header-actions { justify-content: center; }
      .stats-grid { grid-template-columns: 1fr; }
      .filter-section { flex-direction: column; }
      .search-field { min-width: 100%; }
      .materials-table { display: block; overflow-x: auto; }
    }
  `],
})
export class AdminMaterialsComponent implements OnInit {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);

  readonly loading = signal<boolean>(true);
  readonly materials = signal<TextbookChapter[]>([]);
  readonly filteredMaterials = signal<TextbookChapter[]>([]);

  readonly stats = signal({ totalMaterials: 0, textbooks: 0, subjects: 0, withDownloads: 0 });

  readonly searchQuery = signal<string>('');
  readonly selectedSource = signal<string>('all');
  readonly selectedSubject = signal<string>('all');
  readonly selectedGradeLevel = signal<string>('all');

  readonly availableSources = signal<string[]>([]);
  readonly availableSubjects = signal<string[]>([]);

  readonly displayedColumns: string[] = ['title', 'subject', 'gradeLevel', 'concepts', 'download', 'actions'];

  ngOnInit(): void {
    this.loadMaterials();
  }

  async loadMaterials(): Promise<void> {
    this.loading.set(true);
    try {
      const response: any = await firstValueFrom(
        this.http.get('http://localhost:8000/api/v1/libraries/materials', {
          params: { skip: 0, limit: 1000 }
        })
      );

      if (response.success && response.data) {
        const allMaterials = response.data.map((item: any) => ({
          chapter_id: item.chapter_id || '',
          title: item.title,
          textbook: item.textbook || item.source,
          source: item.source || '未知来源',
          grade_level: item.grade_level || 'university',
          subject: item.subject || '未分类',
          chapter_url: item.chapter_url,
          pdf_download_url: item.pdf_download_url,
          key_concepts: item.key_concepts || []
        }));

        this.materials.set(allMaterials);
        this.filteredMaterials.set(allMaterials);
        this.updateAvailableOptions(allMaterials);
        this.updateStats(allMaterials);
      } else {
        this.materials.set([]);
        this.filteredMaterials.set([]);
      }
    } catch (error) {
      console.error('加载课件失败:', error);
      this.snackBar.open('加载课件数据失败', '关闭', { duration: 3000 });
      this.materials.set([]);
      this.filteredMaterials.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  updateAvailableOptions(materials: TextbookChapter[]): void {
    const sources = new Set(materials.map(m => m.source).filter(Boolean));
    const subjects = new Set(materials.map(m => m.subject).filter(Boolean));
    this.availableSources.set(Array.from(sources).sort());
    this.availableSubjects.set(Array.from(subjects).sort());
  }

  updateStats(materials: TextbookChapter[]): void {
    const textbooks = new Set(materials.map(m => m.textbook).filter(Boolean));
    const subjects = new Set(materials.map(m => m.subject).filter(Boolean));
    const withDownloads = materials.filter(m => m.pdf_download_url).length;
    this.stats.set({
      totalMaterials: materials.length,
      textbooks: textbooks.size,
      subjects: subjects.size,
      withDownloads
    });
  }

  applyFilters(): void {
    let filtered = this.materials();
    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(m =>
        m.title.toLowerCase().includes(query) || m.textbook.toLowerCase().includes(query)
      );
    }
    const source = this.selectedSource();
    if (source && source !== 'all') filtered = filtered.filter(m => m.source === source);
    const subject = this.selectedSubject();
    if (subject && subject !== 'all') filtered = filtered.filter(m => m.subject === subject);
    const gradeLevel = this.selectedGradeLevel();
    if (gradeLevel && gradeLevel !== 'all') filtered = filtered.filter(m => m.grade_level === gradeLevel);
    this.filteredMaterials.set(filtered);
  }

  refreshData(): void {
    this.loadMaterials();
    this.snackBar.open('数据已刷新', '关闭', { duration: 2000 });
  }

  uploadMaterial(): void {
    this.snackBar.open('上传课件功能待实现', '关闭', { duration: 2000 });
  }

  viewMaterial(material: TextbookChapter): void {
    this.snackBar.open(`查看课件详情: ${material.title}`, '关闭', { duration: 2000 });
  }

  deleteMaterial(material: TextbookChapter): void {
    if (confirm(`确定要删除课件 "${material.title}" 吗？`)) {
      this.snackBar.open(`删除课件: ${material.title}`, '关闭', { duration: 2000 });
    }
  }

  downloadMaterial(material: TextbookChapter): void {
    if (material.pdf_download_url) window.open(material.pdf_download_url, '_blank');
  }

  getSubjectName(subject: string): string {
    const map: Record<string, string> = { physics: '物理', chemistry: '化学', biology: '生物', mathematics: '数学' };
    return map[subject] || subject;
  }

  getGradeLevelName(level: string): string {
    const map: Record<string, string> = { elementary: '小学', middle: '初中', high: '高中', university: '大学' };
    return map[level] || level;
  }

  getKeyConceptCount(material: TextbookChapter): number {
    return material.key_concepts?.length || 0;
  }
}
