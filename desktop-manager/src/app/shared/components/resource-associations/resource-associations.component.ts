import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { ResourceAssociationService } from '../../../services/resource-association.service';
import { RelatedMaterial, RequiredHardware, LearningPath } from '../../../models/resource-association.models';

@Component({
  selector: 'app-resource-associations',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="resource-associations">
      <!-- 加载状态 -->
      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
        <p>正在加载关联资源...</p>
        <small>请稍候，正在为您查找相关教程、课件和硬件</small>
      </div>

      <!-- 错误状态 -->
      <div *ngIf="error && !loading" class="error-container">
        <mat-icon color="warn" class="error-icon">error_outline</mat-icon>
        <h3>加载失败</h3>
        <p>{{ error }}</p>
        <div class="error-actions">
          <button mat-stroked-button color="primary" (click)="loadAssociations()">
            <mat-icon>refresh</mat-icon>
            重试
          </button>
        </div>
      </div>

      <!-- 关联内容 -->
      <div *ngIf="!loading && !error" class="associations-content">
        
        <!-- 相关课件部分 -->
        <div *ngIf="showMaterials && relatedMaterials.length > 0" class="section">
          <h3>
            <mat-icon>menu_book</mat-icon>
            相关课件 ({{ relatedMaterials.length }})
          </h3>
          <div class="cards-grid">
            <mat-card *ngFor="let material of relatedMaterials" class="association-card">
              <mat-card-header>
                <mat-card-title>
                  {{ material.title }}
                  <span *ngIf="material.relevance_score" class="relevance-badge">
                    关联度: {{ (material.relevance_score * 100).toFixed(0) }}%
                  </span>
                </mat-card-title>
                <mat-card-subtitle>
                  <span [style.color]="getSubjectColor(material.subject)">●</span>
                  {{ material.textbook }} | {{ material.subject }} | {{ material.grade_level }}
                </mat-card-subtitle>
              </mat-card-header>
              <mat-card-actions>
                <button mat-button color="primary" (click)="viewMaterial(material)">
                  <mat-icon>visibility</mat-icon>
                  查看
                </button>
                <button mat-button *ngIf="material.pdf_download_url" (click)="downloadMaterial(material)">
                  <mat-icon>download</mat-icon>
                  下载
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </div>

        <!-- 所需硬件部分 -->
        <div *ngIf="showHardware && requiredHardware.length > 0" class="section">
          <h3>
            <mat-icon>build</mat-icon>
            所需硬件 ({{ requiredHardware.length }})
          </h3>
          <div class="cards-grid">
            <mat-card *ngFor="let hardware of requiredHardware" class="association-card">
              <mat-card-header>
                <mat-card-title>
                  {{ hardware.title }}
                  <span *ngIf="hardware.relevance_score" class="relevance-badge">
                    关联度: {{ (hardware.relevance_score * 100).toFixed(0) }}%
                  </span>
                </mat-card-title>
                <mat-card-subtitle>
                  <span [style.color]="getSubjectColor(hardware.subject)">●</span>
                  {{ hardware.subject }} | 难度: {{ getDifficultyStars(hardware.difficulty) }} | {{ formatCost(hardware.total_cost) }}
                </mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <p>{{ hardware.description }}</p>
                <div *ngIf="hardware.estimated_time_hours" class="meta-info">
                  <mat-icon>schedule</mat-icon>
                  <span>预计耗时: {{ hardware.estimated_time_hours }}小时</span>
                </div>
              </mat-card-content>
              <mat-card-actions>
                <button mat-button color="accent" (click)="viewHardware(hardware)">
                  <mat-icon>visibility</mat-icon>
                  查看详情
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </div>

        <!-- 空状态 -->
        <div *ngIf="!relatedMaterials.length && !requiredHardware.length" class="empty-state">
          <mat-icon class="empty-icon">info_outline</mat-icon>
          <h3>暂无关联资源</h3>
          <p>当前资源暂未建立关联关系</p>
          <div class="empty-hints">
            <small>💡 提示：</small>
            <ul>
              <li>管理员可以在后台为此资源添加关联</li>
              <li>您可以使用搜索功能查找相关资源</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .resource-associations {
      padding: 16px 0;
    }

    .loading-container, .error-container, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
      color: #666;
    }

    .loading-container mat-spinner {
      margin-bottom: 16px;
    }

    .loading-container small {
      margin-top: 8px;
      color: #999;
      font-size: 13px;
    }

    .error-container {
      background: #fff5f5;
      border-radius: 12px;
      border: 1px solid #fed7d7;
    }

    .error-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      margin-bottom: 16px;
    }

    .error-container h3 {
      margin: 0 0 8px 0;
      color: #c53030;
      font-size: 18px;
    }

    .error-container p {
      margin: 0 0 20px 0;
      color: #742a2a;
    }

    .error-actions {
      display: flex;
      gap: 12px;
    }

    .empty-state {
      background: #f7fafc;
      border-radius: 12px;
      border: 2px dashed #cbd5e0;
    }

    .empty-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      margin-bottom: 16px;
      opacity: 0.4;
      color: #a0aec0;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      color: #4a5568;
      font-size: 18px;
    }

    .empty-state p {
      margin: 0 0 20px 0;
      color: #718096;
    }

    .empty-hints {
      text-align: left;
      background: white;
      padding: 16px 20px;
      border-radius: 8px;
      border-left: 4px solid #667eea;
      max-width: 400px;
    }

    .empty-hints small {
      display: block;
      margin-bottom: 8px;
      color: #667eea;
      font-weight: 600;
    }

    .empty-hints ul {
      margin: 0;
      padding-left: 20px;
      color: #4a5568;
      font-size: 14px;
      line-height: 1.8;
    }

    .empty-hints li {
      margin-bottom: 4px;
    }

    .section {
      margin-bottom: 32px;
    }

    .section h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 16px 0;
      color: #333;
      font-size: 18px;
    }

    .section h3 mat-icon {
      color: #667eea;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    @media (max-width: 768px) {
      .cards-grid {
        grid-template-columns: 1fr;
      }

      .section h3 {
        font-size: 16px;
      }

      mat-card-title {
        font-size: 15px;
      }

      mat-card-subtitle {
        font-size: 12px;
      }

      .loading-container, .error-container, .empty-state {
        padding: 40px 16px;
      }

      .empty-hints {
        max-width: 100%;
      }
    }

    @media (max-width: 480px) {
      .association-card {
        margin: 0 -8px;
      }

      mat-card-actions {
        flex-wrap: wrap;
      }

      mat-card-actions button {
        flex: 1;
        min-width: 120px;
      }
    }

    .association-card {
      transition: all 0.3s ease;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .association-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    mat-card-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .relevance-badge {
      display: inline-block;
      padding: 2px 8px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;
    }

    mat-card-subtitle {
      color: #667eea;
      font-weight: 500;
      font-size: 13px;
    }

    mat-card-content p {
      color: #666;
      line-height: 1.6;
      margin: 12px 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .meta-info {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 8px;
      font-size: 13px;
      color: #999;
    }

    .meta-info mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    mat-card-actions {
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid #f0f0f0;
    }

    mat-card-actions button mat-icon {
      margin-right: 4px;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    @media (max-width: 768px) {
      .cards-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ResourceAssociationsComponent implements OnInit, OnDestroy {
  @Input() tutorialId: string = '';
  @Input() materialId: string = '';
  @Input() showMaterials: boolean = true;
  @Input() showHardware: boolean = true;

  loading = false;
  error: string | null = null;
  relatedMaterials: RelatedMaterial[] = [];
  requiredHardware: RequiredHardware[] = [];
  
  private subscriptions = new Subscription();

  constructor(
    private associationService: ResourceAssociationService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAssociations();
  }

  ngOnDestroy(): void {
    // 取消订阅，防止内存泄漏
    this.subscriptions.unsubscribe();
  }

  loadAssociations(): void {
    if (!this.tutorialId && !this.materialId) {
      this.error = '缺少必要的ID参数';
      return;
    }

    this.loading = true;
    this.error = null;

    // 如果有教程ID，获取完整学习路径
    if (this.tutorialId) {
      const sub = this.associationService.getLearningPath(this.tutorialId).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.relatedMaterials = response.data.related_materials || [];
            this.requiredHardware = response.data.required_hardware || [];
          } else {
            this.error = '获取学习路径失败';
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('获取学习路径失败:', err);
          this.error = '网络请求失败，请检查后端服务';
          this.loading = false;
        }
      });
      this.subscriptions.add(sub);
    } 
    // 如果只有课件ID，获取所需硬件
    else if (this.materialId) {
      const sub = this.associationService.getRequiredHardware(this.materialId).subscribe({
        next: (response) => {
          if (response.success) {
            this.requiredHardware = response.data || [];
          } else {
            this.error = '获取所需硬件失败';
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('获取所需硬件失败:', err);
          this.error = '网络请求失败，请检查后端服务';
          this.loading = false;
        }
      });
      this.subscriptions.add(sub);
    }
  }

  viewMaterial(material: RelatedMaterial): void {
    this.snackBar.open(`正在跳转到课件: ${material.title}`, '关闭', { duration: 2000 });
    // 导航到课件库，并传递搜索参数
    this.router.navigate(['/material-library'], {
      queryParams: { search: material.title, subject: material.subject }
    });
  }

  downloadMaterial(material: RelatedMaterial): void {
    if (material.pdf_download_url) {
      window.open(material.pdf_download_url, '_blank');
    }
  }

  viewHardware(hardware: RequiredHardware): void {
    this.snackBar.open(`正在跳转到硬件项目: ${hardware.title}`, '关闭', { duration: 2000 });
    // 导航到硬件项目列表
    this.router.navigate(['/hardware-projects'], {
      queryParams: { search: hardware.title, subject: hardware.subject }
    });
  }

  getDifficultyStars(difficulty: number): string {
    return this.associationService.getDifficultyStars(difficulty);
  }

  getSubjectColor(subject: string): string {
    return this.associationService.getSubjectColor(subject);
  }

  formatCost(cost: number): string {
    return this.associationService.formatCost(cost);
  }
}
