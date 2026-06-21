import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ResourceTreeNode, getMaterialIcon } from '../../../models/resource-tree.models';
import { ResourceAssociationsComponent } from '../../../shared/components/resource-associations/resource-associations.component';

@Component({
  selector: 'app-resource-detail-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatSnackBarModule,
    MatTooltipModule,
    ResourceAssociationsComponent,
  ],
  template: `
    <div class="detail-panel">
      <!-- 空状态 -->
      <div *ngIf="!node" class="empty-state">
        <div class="empty-content">
          <i class="ri-arrow-left-s-line guide-icon"></i>
          <h3>选择一个资源</h3>
          <p>从左侧树形列表中选择教程或课件查看详情</p>
          <div class="hint-cards">
            <div class="hint-card">
              <i class="ri-folder-2-line"></i>
              <span>来源组</span>
              <small>按来源浏览教程</small>
            </div>
            <div class="hint-card">
              <i class="ri-book-open-line"></i>
              <span>教程</span>
              <small>查看教程详情和关联课件</small>
            </div>
            <div class="hint-card">
              <i class="ri-file-line"></i>
              <span>课件</span>
              <small>预览和下载课件</small>
            </div>
          </div>
        </div>
      </div>

      <!-- 来源组详情 -->
      <div *ngIf="node?.type === 'source_group' || node?.type === 'source_subgroup'" class="source-detail">
        <div class="detail-header">
          <div class="header-icon-wrapper" [class]="'source-' + node?.source">
            <i [class]="node?.icon || 'ri-folder-2-line'"></i>
          </div>
          <div>
            <h2>{{ node?.label }}</h2>
            <p class="subtitle">
              {{ node?.type === 'source_subgroup' ? '课件来源' : '教程来源' }}
            </p>
          </div>
        </div>
        <div class="source-stats">
          <div class="stat-card">
            <span class="stat-value">{{ node?.children?.length || 0 }}</span>
            <span class="stat-label">
              {{ node?.type === 'source_subgroup' ? '课件数量' : '教程数量' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 教程详情 -->
      <div *ngIf="node?.type === 'tutorial'" class="tutorial-detail">
        <div class="detail-header">
          <div class="header-icon-wrapper tutorial-icon">
            <i class="ri-book-open-line"></i>
          </div>
          <div class="header-info">
            <h2>{{ node?.label }}</h2>
            <span class="source-badge">{{ getSourceLabel(node?.source) }}</span>
          </div>
        </div>

        <div class="detail-body">
          <!-- 描述 -->
          <div class="section" *ngIf="getRaw(node, 'description')">
            <h3>
              <i class="ri-information-line"></i>
              简介
            </h3>
            <p class="description">{{ getRaw(node, 'description') }}</p>
          </div>

          <!-- 元数据 -->
          <div class="section" *ngIf="hasMetaData(node)">
            <h3>
              <i class="ri-list-check"></i>
              基本信息
            </h3>
            <div class="meta-grid">
              <div class="meta-item" *ngIf="getRaw(node, 'subject')">
                <span class="meta-label">学科</span>
                <span class="meta-value">{{ getRaw(node, 'subject') }}</span>
              </div>
              <div class="meta-item" *ngIf="getRaw(node, 'level') || getRaw(node, 'grade_level')">
                <span class="meta-label">学段</span>
                <span class="meta-value">{{ getRaw(node, 'level') || getRaw(node, 'grade_level') }}</span>
              </div>
              <div class="meta-item" *ngIf="getRaw(node, 'difficulty')">
                <span class="meta-label">难度</span>
                <span class="meta-value">{{ renderDifficulty(getRaw(node, 'difficulty')) }}</span>
              </div>
              <div class="meta-item" *ngIf="getRaw(node, 'duration_minutes')">
                <span class="meta-label">时长</span>
                <span class="meta-value">{{ getRaw(node, 'duration_minutes') }} 分钟</span>
              </div>
            </div>
          </div>

          <!-- 关联课件列表 -->
          <div class="section" *ngIf="node?.children && node?.children!.length > 0">
            <h3>
              <i class="ri-book-shelf-line"></i>
              关联课件 ({{ node?.children?.length }})
            </h3>
            <div class="materials-list">
              <div
                *ngFor="let mat of node?.children"
                class="material-item"
                (click)="onMaterialSelect(mat)"
              >
                <i [class]="getMaterialIcon(mat)" class="mat-icon"></i>
                <div class="mat-info">
                  <span class="mat-title">{{ mat.label }}</span>
                  <span class="mat-source" *ngIf="mat.source">{{ mat.source }}</span>
                </div>
                <button
                  mat-icon-button
                  (click)="onMaterialSelect(mat); $event.stopPropagation()"
                  matTooltip="查看详情"
                >
                  <i class="ri-eye-line"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- 空课件提示 -->
          <div
            class="section"
            *ngIf="node?.isExpanded && (!node?.children || node?.children!.length === 0)"
          >
            <div class="empty-materials">
              <i class="ri-inbox-line"></i>
              <p>暂无关联课件</p>
            </div>
          </div>

          <!-- 本地教程的操作按钮 -->
          <div class="action-bar" *ngIf="node?.source === 'local'">
            <button mat-raised-button color="primary" (click)="onEdit.emit(node!)">
              <i class="ri-edit-line"></i>
              编辑教程
            </button>
            <button mat-stroked-button (click)="onUploadMaterial.emit(node!)">
              <i class="ri-upload-line"></i>
              上传课件
            </button>
            <button mat-stroked-button color="warn" (click)="onDelete.emit(node!)">
              <i class="ri-delete-bin-line"></i>
              删除
            </button>
          </div>
        </div>
      </div>

      <!-- 课件详情 -->
      <div *ngIf="node?.type === 'material'" class="material-detail">
        <div class="detail-header">
          <div class="header-icon-wrapper material-icon">
            <i [class]="getMaterialIcon(node!)"></i>
          </div>
          <div class="header-info">
            <h2>{{ node?.label }}</h2>
            <span class="source-badge">{{ getSourceLabel(node?.source) }}</span>
          </div>
        </div>

        <div class="detail-body">
          <!-- 描述 -->
          <div class="section" *ngIf="getRaw(node, 'description')">
            <h3>
              <i class="ri-information-line"></i>
              简介
            </h3>
            <p class="description">{{ getRaw(node, 'description') }}</p>
          </div>

          <!-- 文件信息 -->
          <div class="section">
            <h3>
              <i class="ri-file-info-line"></i>
              文件信息
            </h3>
            <div class="meta-grid">
              <div class="meta-item" *ngIf="getRaw(node, 'fileSize') || getRaw(node, 'file_size')">
                <span class="meta-label">大小</span>
                <span class="meta-value">{{ formatFileSize(getRaw(node, 'fileSize') || getRaw(node, 'file_size')) }}</span>
              </div>
              <div class="meta-item" *ngIf="getRaw(node, 'type')">
                <span class="meta-label">类型</span>
                <span class="meta-value">{{ getRaw(node, 'type') }}</span>
              </div>
              <div class="meta-item" *ngIf="getRaw(node, 'subject')">
                <span class="meta-label">学科</span>
                <span class="meta-value">{{ getRaw(node, 'subject') }}</span>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="action-bar">
            <button mat-raised-button color="primary" (click)="onPreview.emit(node!)">
              <i class="ri-eye-line"></i>
              预览
            </button>
            <button mat-stroked-button (click)="onDownload.emit(node!)">
              <i class="ri-download-2-line"></i>
              下载
            </button>
            <button
              mat-stroked-button
              color="warn"
              *ngIf="node?.source === 'local'"
              (click)="onDelete.emit(node!)"
            >
              <i class="ri-delete-bin-line"></i>
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .detail-panel {
        height: 100%;
        overflow-y: auto;
        padding: 32px;
      }

      /* 空状态 */
      .empty-state {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
      }

      .empty-content {
        text-align: center;
        max-width: 400px;
      }

      .guide-icon {
        font-size: 64px;
        color: #667eea;
        opacity: 0.3;
        margin-bottom: 16px;
      }

      .empty-content h3 {
        margin: 0 0 8px 0;
        font-size: 22px;
        color: #333;
      }

      .empty-content p {
        margin: 0 0 32px 0;
        color: #999;
        font-size: 15px;
      }

      .hint-cards {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
      }

      .hint-card {
        padding: 20px 12px;
        background: #f8f9fa;
        border-radius: 12px;
        border: 1px solid #e9ecef;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }

      .hint-card i {
        font-size: 28px;
        color: #667eea;
      }

      .hint-card span {
        font-size: 14px;
        font-weight: 600;
        color: #333;
      }

      .hint-card small {
        font-size: 12px;
        color: #999;
      }

      /* 头部 */
      .detail-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 24px;
        padding-bottom: 20px;
        border-bottom: 1px solid #f0f0f0;
      }

      .header-icon-wrapper {
        width: 56px;
        height: 56px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .header-icon-wrapper i {
        font-size: 28px;
        color: white;
      }

      .header-icon-wrapper.source-local {
        background: linear-gradient(135deg, #667eea, #764ba2);
      }
      .header-icon-wrapper.source-openscied {
        background: linear-gradient(135deg, #2196f3, #1565c0);
      }
      .header-icon-wrapper.source-gewustan {
        background: linear-gradient(135deg, #ff9800, #ef6c00);
      }
      .header-icon-wrapper.source-stemcloud {
        background: linear-gradient(135deg, #4caf50, #2e7d32);
      }
      .header-icon-wrapper.tutorial-icon {
        background: linear-gradient(135deg, #667eea, #764ba2);
      }
      .header-icon-wrapper.material-icon {
        background: linear-gradient(135deg, #10b981, #059669);
      }

      .header-info {
        flex: 1;
      }

      .header-info h2 {
        margin: 0 0 6px 0;
        font-size: 22px;
        font-weight: 700;
        color: #1a1a2e;
      }

      .subtitle {
        margin: 4px 0 0;
        color: #888;
        font-size: 14px;
      }

      .source-badge {
        display: inline-block;
        padding: 3px 10px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        background: #f0f0f0;
        color: #666;
      }

      /* 详情区域 */
      .detail-body {
        max-width: 800px;
      }

      .section {
        margin-bottom: 28px;
      }

      .section h3 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 12px 0;
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }

      .section h3 i {
        color: #667eea;
        font-size: 18px;
      }

      .description {
        color: #555;
        line-height: 1.7;
        font-size: 14px;
        margin: 0;
        white-space: pre-wrap;
      }

      .meta-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 12px;
      }

      .meta-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 12px 16px;
        background: #f8f9fa;
        border-radius: 10px;
        border: 1px solid #e9ecef;
      }

      .meta-label {
        font-size: 12px;
        color: #999;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .meta-value {
        font-size: 14px;
        color: #333;
        font-weight: 600;
      }

      /* 课件列表 */
      .materials-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .material-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .material-item:hover {
        background: rgba(102, 126, 234, 0.05);
        border-color: #667eea;
      }

      .mat-icon {
        font-size: 24px;
        color: #10b981;
        flex-shrink: 0;
      }

      .mat-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .mat-title {
        font-size: 14px;
        font-weight: 500;
        color: #333;
      }

      .mat-source {
        font-size: 12px;
        color: #999;
      }

      .empty-materials {
        text-align: center;
        padding: 24px;
        color: #bbb;
      }

      .empty-materials i {
        font-size: 32px;
        margin-bottom: 8px;
      }

      .empty-materials p {
        margin: 0;
        font-size: 14px;
      }

      /* 来源统计 */
      .source-stats {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 16px;
      }

      .stat-card {
        padding: 24px;
        background: #f8f9fa;
        border-radius: 12px;
        text-align: center;
        border: 1px solid #e9ecef;
      }

      .stat-value {
        display: block;
        font-size: 36px;
        font-weight: 700;
        color: #667eea;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 13px;
        color: #888;
      }

      /* 操作按钮 */
      .action-bar {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-top: 24px;
        padding-top: 20px;
        border-top: 1px solid #f0f0f0;
      }

      .action-bar button i {
        margin-right: 6px;
      }

      @media (max-width: 768px) {
        .detail-panel {
          padding: 16px;
        }

        .hint-cards {
          grid-template-columns: 1fr;
        }

        .meta-grid {
          grid-template-columns: 1fr 1fr;
        }
      }
    `,
  ],
})
export class ResourceDetailPanelComponent {
  @Input() node: ResourceTreeNode | null = null;

  @Output() onEdit = new EventEmitter<ResourceTreeNode>();
  @Output() onDelete = new EventEmitter<ResourceTreeNode>();
  @Output() onUploadMaterial = new EventEmitter<ResourceTreeNode>();
  @Output() onPreview = new EventEmitter<ResourceTreeNode>();
  @Output() onDownload = new EventEmitter<ResourceTreeNode>();
  @Output() onMaterialSelectEvent = new EventEmitter<ResourceTreeNode>();

  constructor(private snackBar: MatSnackBar) {}

  /** 安全获取 raw 中指定键的值 */
  getRaw(node: ResourceTreeNode | null, key: string): unknown {
    return node?.data?.raw?.[key];
  }
  
  getSourceLabel(source?: string): string {
    const labels: Record<string, string> = {
      local: '本地教程',
      openscied: 'OpenSciEd',
      gewustan: '格物斯坦',
      stemcloud: 'stemcloud.cn',
      openstax: 'OpenStax',
      'ted-ed': 'TED-Ed',
      phetsim: 'PhET',
    };
    return labels[source || ''] || source || '未知来源';
  }

  getMaterialIcon(node: ResourceTreeNode): string {
    return getMaterialIcon(node.data?.raw);
  }

  hasMetaData(node: ResourceTreeNode | null): boolean {
    if (!node?.data?.raw) return false;
    const raw = node.data.raw;
    return !!(
      raw['subject'] ||
      raw['level'] ||
      raw['grade_level'] ||
      raw['difficulty'] ||
      raw['duration_minutes']
    );
  }

  renderDifficulty(difficulty: unknown): string {
    if (typeof difficulty === 'number') {
      return '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
    }
    return String(difficulty || '未知');
  }

  formatFileSize(bytes: unknown): string {
    if (!bytes) return '未知';
    const num = typeof bytes === 'string' ? parseFloat(bytes) : (bytes as number);
    if (isNaN(num)) return String(bytes);
    if (num === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(num) / Math.log(k));
    return parseFloat((num / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onMaterialSelect(node: ResourceTreeNode): void {
    this.onMaterialSelectEvent.emit(node);
  }
}
