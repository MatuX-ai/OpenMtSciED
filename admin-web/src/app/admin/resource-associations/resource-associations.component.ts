import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';

interface ResourceItem {
  id: string;
  title: string;
  subject: string;
  type: 'tutorial' | 'material' | 'hardware';
}

interface Association {
  id: string;
  source_id: string;
  source_type: string;
  target_id: string;
  target_type: string;
  relevance_score: number;
}

@Component({
  selector: 'app-resource-associations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTabsModule,
    MatTableModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="admin-associations">
      <h1>🔗 资源关联管理</h1>
      <p class="subtitle">管理教程、课件、硬件之间的关联关系</p>

      <!-- 统计卡片 -->
      <div class="stats-grid" *ngIf="!loading">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-number">{{ stats.totalAssociations }}</div>
            <div class="stat-label">总关联数</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-number">{{ stats.tutorialMaterialLinks }}</div>
            <div class="stat-label">教程-课件关联</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-number">{{ stats.materialHardwareLinks }}</div>
            <div class="stat-label">课件-硬件关联</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-number">{{ stats.avgRelevance.toFixed(0) }}%</div>
            <div class="stat-label">平均关联度</div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- 标签页 -->
      <mat-tab-group [(selectedIndex)]="selectedTab">
        <!-- 查看关联 -->
        <mat-tab label="查看关联">
          <div class="tab-content">
            <div class="toolbar">
              <mat-form-field appearance="outline">
                <mat-label>筛选类型</mat-label>
                <mat-select [(ngModel)]="filterType" (selectionChange)="loadAssociations()">
                  <mat-option value="all">全部</mat-option>
                  <mat-option value="tutorial-material">教程 → 课件</mat-option>
                  <mat-option value="material-hardware">课件 → 硬件</mat-option>
                </mat-select>
              </mat-form-field>
              <button mat-raised-button color="primary" (click)="loadAssociations()">
                <mat-icon>refresh</mat-icon>
                刷新
              </button>
            </div>

            <div *ngIf="loading" class="loading-state">
              <mat-spinner diameter="40"></mat-spinner>
              <p>加载关联数据...</p>
            </div>

            <table *ngIf="!loading" mat-table [dataSource]="associations" class="associations-table">
              <ng-container matColumnDef="source">
                <th mat-header-cell *matHeaderCellDef>源资源</th>
                <td mat-cell *matCellDef="let assoc">
                  <span class="resource-type" [class]="assoc.source_type">{{ getSourceTypeName(assoc.source_type) }}</span>
                  {{ assoc.source_id }}
                </td>
              </ng-container>

              <ng-container matColumnDef="arrow">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let assoc">
                  <mat-icon>arrow_forward</mat-icon>
                </td>
              </ng-container>

              <ng-container matColumnDef="target">
                <th mat-header-cell *matHeaderCellDef>目标资源</th>
                <td mat-cell *matCellDef="let assoc">
                  <span class="resource-type" [class]="assoc.target_type">{{ getTargetTypeName(assoc.target_type) }}</span>
                  {{ assoc.target_id }}
                </td>
              </ng-container>

              <ng-container matColumnDef="relevance">
                <th mat-header-cell *matHeaderCellDef>关联度</th>
                <td mat-cell *matCellDef="let assoc">
                  <div class="relevance-bar">
                    <div class="relevance-fill" [style.width.%]="assoc.relevance_score * 100"></div>
                    <span>{{ (assoc.relevance_score * 100).toFixed(0) }}%</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>操作</th>
                <td mat-cell *matCellDef="let assoc">
                  <button mat-icon-button color="warn" (click)="deleteAssociation(assoc)" matTooltip="删除关联">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            <div *ngIf="!loading && associations.length === 0" class="empty-state">
              <mat-icon>link_off</mat-icon>
              <p>暂无关联数据</p>
            </div>
          </div>
        </mat-tab>

        <!-- 添加关联 -->
        <mat-tab label="添加关联">
          <div class="tab-content">
            <mat-card class="form-card">
              <mat-card-header>
                <mat-card-title>创建新的关联关系</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <form (ngSubmit)="createAssociation()" #associationForm="ngForm">
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>源资源类型</mat-label>
                      <mat-select [(ngModel)]="newAssoc.source_type" name="source_type" required>
                        <mat-option value="tutorial">教程</mat-option>
                        <mat-option value="material">课件</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>

                  <div class="form-row">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>源资源ID</mat-label>
                      <input matInput [(ngModel)]="newAssoc.source_id" name="source_id" required
                             placeholder="例如: OS-Unit-001">
                    </mat-form-field>
                  </div>

                  <div class="form-row">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>目标资源类型</mat-label>
                      <mat-select [(ngModel)]="newAssoc.target_type" name="target_type" required>
                        <mat-option value="material">课件</mat-option>
                        <mat-option value="hardware">硬件</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>

                  <div class="form-row">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>目标资源ID</mat-label>
                      <input matInput [(ngModel)]="newAssoc.target_id" name="target_id" required
                             placeholder="例如: OST-Bio-Ch5">
                    </mat-form-field>
                  </div>

                  <div class="form-row">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>关联度 (0-1)</mat-label>
                      <input matInput type="number" [(ngModel)]="newAssoc.relevance_score"
                             name="relevance_score" min="0" max="1" step="0.1" required>
                      <mat-hint>建议值: 0.7-0.9</mat-hint>
                    </mat-form-field>
                  </div>

                  <div class="form-actions">
                    <button mat-raised-button color="primary" type="submit"
                            [disabled]="!associationForm.valid">
                      <mat-icon>add</mat-icon>
                      创建关联
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- 批量操作 -->
        <mat-tab label="批量操作">
          <div class="tab-content">
            <mat-card class="info-card">
              <mat-card-content>
                <h3>🚧 功能开发中</h3>
                <p>批量导入和自动关联功能将在下一版本提供</p>
                <ul>
                  <li>从CSV文件批量导入关联关系</li>
                  <li>基于学科自动匹配关联</li>
                  <li>基于关键词相似度推荐关联</li>
                </ul>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .admin-associations {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    h1 {
      margin: 0 0 8px 0;
      font-size: 28px;
      color: #333;
    }

    .subtitle {
      margin: 0 0 24px 0;
      color: #666;
      font-size: 14px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .toolbar {
        flex-direction: column;
        align-items: stretch;
      }

      .associations-table {
        font-size: 13px;
      }

      .form-card {
        margin: 0 -16px;
      }
    }

    @media (max-width: 480px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .stat-number {
        font-size: 24px;
      }

      h1 {
        font-size: 22px;
      }
    }

    .stat-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .stat-number {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 14px;
      opacity: 0.9;
    }

    .tab-content {
      padding: 24px 0;
    }

    .toolbar {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
      align-items: center;
    }

    .loading-state, .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #999;
    }

    .loading-state mat-spinner {
      margin: 0 auto 16px;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.3;
    }

    .associations-table {
      width: 100%;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .resource-type {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      margin-right: 8px;
    }

    .resource-type.tutorial {
      background: #e3f2fd;
      color: #1565c0;
    }

    .resource-type.material {
      background: #f3e5f5;
      color: #7b1fa2;
    }

    .resource-type.hardware {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .relevance-bar {
      position: relative;
      height: 24px;
      background: #f0f0f0;
      border-radius: 12px;
      overflow: hidden;
    }

    .relevance-fill {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      transition: width 0.3s ease;
    }

    .relevance-bar span {
      position: relative;
      z-index: 1;
      line-height: 24px;
      padding: 0 8px;
      font-size: 12px;
      font-weight: 600;
      color: #333;
    }

    .form-card {
      max-width: 600px;
      margin: 0 auto;
    }

    .form-row {
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
    }

    .form-actions {
      margin-top: 24px;
      text-align: right;
    }

    .info-card {
      background: #fff9e6;
      border-left: 4px solid #ffa726;
    }

    .info-card h3 {
      margin: 0 0 12px 0;
      color: #f57c00;
    }

    .info-card ul {
      margin: 12px 0 0 0;
      padding-left: 20px;
      color: #666;
    }

    .info-card li {
      margin-bottom: 8px;
    }
  `]
})
export class ResourceAssociationsComponent implements OnInit {
  loading = false;
  selectedTab = 0;
  filterType = 'all';

  stats = {
    totalAssociations: 0,
    tutorialMaterialLinks: 0,
    materialHardwareLinks: 0,
    avgRelevance: 0
  };

  associations: Association[] = [];
  displayedColumns: string[] = ['source', 'arrow', 'target', 'relevance', 'actions'];

  newAssoc = {
    source_type: 'tutorial',
    source_id: '',
    target_type: 'material',
    target_id: '',
    relevance_score: 0.8
  };

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAssociations();
  }

  loadStats(): void {
    this.http.get<any>('/api/v1/resources/associations/stats').subscribe({
      next: (response) => {
        if (response.success) {
          this.stats = response.data;
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('加载统计数据失败:', error);
        this.snackBar.open('加载统计数据失败', '关闭', { duration: 3000 });
      }
    });
  }

  loadAssociations(): void {
    this.loading = true;
    this.cdr.detectChanges(); // 立即更新UI显示loading状态

    const filterParam = this.filterType === 'all' ? 'all' : this.filterType;

    this.http.get<any>(`/api/v1/resources/associations?filter_type=${filterParam}`).subscribe({
      next: (response) => {
        if (response.success) {
          this.associations = response.data;
          this.loading = false;
          this.cdr.detectChanges(); // 更新UI
          this.loadStats();
        }
      },
      error: (error) => {
        console.error('加载关联数据失败:', error);
        this.snackBar.open('加载关联数据失败', '关闭', { duration: 3000 });
        this.loading = false;
        this.cdr.detectChanges(); // 更新UI
      }
    });
  }

  createAssociation(): void {
    this.http.post<any>('/api/v1/resources/associations', this.newAssoc).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('关联创建成功', '关闭', { duration: 3000 });

          // 重置表单
          this.newAssoc = {
            source_type: 'tutorial',
            source_id: '',
            target_type: 'material',
            target_id: '',
            relevance_score: 0.8
          };

          // 刷新列表（使用setTimeout避免NG0100错误）
          setTimeout(() => {
            this.loadAssociations();
          });
        }
      },
      error: (error) => {
        console.error('创建关联失败:', error);
        this.snackBar.open('创建关联失败', '关闭', { duration: 3000 });
      }
    });
  }

  deleteAssociation(assoc: Association): void {
    if (!confirm(`确定要删除此关联吗？\n${assoc.source_id} → ${assoc.target_id}`)) {
      return;
    }

    this.http.delete<any>(`/api/v1/resources/associations/${assoc.id}`).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('关联已删除', '关闭', { duration: 3000 });
          // 使用setTimeout避免NG0100错误
          setTimeout(() => {
            this.loadAssociations();
          });
        }
      },
      error: (error) => {
        console.error('删除关联失败:', error);
        this.snackBar.open('删除关联失败', '关闭', { duration: 3000 });
      }
    });
  }

  getSourceTypeName(type: string): string {
    const map: Record<string, string> = {
      'tutorial': '教程',
      'material': '课件',
      'hardware': '硬件'
    };
    return map[type] || type;
  }

  getTargetTypeName(type: string): string {
    return this.getSourceTypeName(type);
  }
}
