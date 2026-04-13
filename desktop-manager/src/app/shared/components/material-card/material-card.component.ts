/**
 * 课件卡片组件
 *
 * 显示单个课件的详细信息，支持网格和列表两种视图模式
 */

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  MaterialType,
  MaterialTypeLabels,
  UnifiedMaterial,
} from '../../../models/unified-material.models';

@Component({
  selector: 'app-material-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  template: `
    <mat-card
      class="material-card"
      [class]="'type-' + material.type"
      [class]="'category-' + material.category"
      [class.selected]="isSelected"
      (click)="onCardClick()"
    >
      <mat-card-content class="card-content">
        <!-- 课件类型图标 -->
        <div class="material-type-icon">
          <mat-icon [matTooltip]="MaterialTypeLabels[material.type]">
            {{ getFileIcon(material.type) }}
          </mat-icon>
        </div>

        <!-- 课件信息 -->
        <div class="material-info">
          <h3 class="material-title" [matTooltip]="'点击查看详情'">
            {{ material.title }}
          </h3>

          <!-- 描述 -->
          <p class="material-description" *ngIf="material.description && !compact">
            {{ material.description | slice: 0 : 100
            }}{{ material.description && material.description.length > 100 ? '...' : '' }}
          </p>

          <!-- 文件大小 -->
          <div class="material-meta">
            <span class="meta-item">
              <mat-icon>insert_drive_file</mat-icon>
              {{ formatFileSize(material.file_size) }}
            </span>
            <span class="meta-item" *ngIf="material.course_title">
              <mat-icon>school</mat-icon>
              {{ material.course_title }}
            </span>
            <span class="meta-item" *ngIf="material.chapter_title">
              <mat-icon>book</mat-icon>
              {{ material.chapter_title }}
            </span>
          </div>

          <!-- 标签 -->
          <div class="material-tags" *ngIf="material.tags && material.tags.length > 0">
            <mat-chip-listbox class="tags-list">
              <mat-chip *ngFor="let tag of material.tags.slice(0, 3)" size="small">
                {{ tag }}
              </mat-chip>
              <mat-chip *ngIf="material.tags.length > 3" size="small">
                +{{ material.tags.length - 3 }}
              </mat-chip>
            </mat-chip-listbox>
          </div>
        </div>

        <!-- 统计信息 -->
        <div class="material-stats" *ngIf="!compact">
          <span class="stat-item">
            <mat-icon>download</mat-icon>
            {{ material.download_count }}
          </span>
          <span class="stat-item">
            <mat-icon>visibility</mat-icon>
            {{ material.view_count }}
          </span>
          <span class="stat-item">
            <mat-icon>thumb_up</mat-icon>
            {{ material.like_count }}
          </span>
          <span class="stat-item">
            <mat-icon>share</mat-icon>
            {{ material.share_count }}
          </span>
        </div>

        <!-- AR/VR 特殊标识 -->
        <div
          class="special-badges"
          *ngIf="
            isARVRType(material.type) ||
            isGameType(material.type) ||
            isExperimentType(material.type)
          "
        >
          <mat-chip *ngIf="material.arvr_data?.ar_markers?.length" class="badge ar-badge">
            <mat-icon>view_in_ar</mat-icon>
            AR标记
          </mat-chip>
          <mat-chip
            *ngIf="material.game_data?.game_config?.scoring_enabled"
            class="badge game-badge"
          >
            <mat-icon>sports_esports</mat-icon>
            得分系统
          </mat-chip>
          <mat-chip
            *ngIf="material.animation_data?.supports_export_gif"
            class="badge animation-badge"
          >
            <mat-icon>gif</mat-icon>
            支持GIF
          </mat-chip>
          <mat-chip
            *ngIf="material.experiment_data?.auto_grading_enabled"
            class="badge experiment-badge"
          >
            <mat-icon>auto_awesome</mat-icon>
            自动评分
          </mat-chip>
        </div>

        <!-- 缩略图/预览区 -->
        <div class="thumbnail-area" *ngIf="material.thumbnail_url || material.file_url">
          <img
            [src]="material.thumbnail_url || material.file_url"
            [alt]="material.title"
            class="thumbnail"
            (error)="onThumbnailError()"
          />
          <div class="preview-overlay" *ngIf="supportsPreview(material.type)">
            <button mat-icon-button class="preview-button">
              <mat-icon>visibility</mat-icon>
            </button>
          </div>
        </div>

        <!-- 无缩略图的占位符 -->
        <div class="thumbnail-placeholder" *ngIf="!material.thumbnail_url && !material.file_url">
          <mat-icon class="placeholder-icon">
            {{ getFileIcon(material.type) }}
          </mat-icon>
        </div>
      </mat-card-content>

      <!-- 底部操作栏 -->
      <mat-card-actions class="card-actions" *ngIf="showActions">
        <button mat-button color="primary" [matTooltip]="'下载'" (click)="onDownload()">
          <mat-icon>download</mat-icon>
          下载
        </button>
        <button
          mat-button
          *ngIf="supportsPreview(material.type)"
          [matTooltip]="'预览'"
          (click)="onPreview()"
        >
          <mat-icon>visibility</mat-icon>
          预览
        </button>
        <button mat-button *ngIf="!compact" [matTooltip]="'收藏'" (click)="onFavorite()">
          <mat-icon>favorite_border</mat-icon>
          收藏
        </button>
        <button mat-button *ngIf="!compact" [matTooltip]="'分享'" (click)="onShare()">
          <mat-icon>share</mat-icon>
          分享
        </button>
        <button
          mat-button
          *ngIf="canDelete"
          color="warn"
          [matTooltip]="'删除'"
          (click)="onDelete()"
        >
          <mat-icon>delete</mat-icon>
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [
    `
      .material-card {
        transition:
          transform 0.2s ease,
          box-shadow 0.2s ease;
        cursor: pointer;
        height: 100%;
        display: flex;
        flex-direction: column;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        }

        &.selected {
          border: 2px solid #2196f3;
          box-shadow: 0 4px 12px rgba(33, 150, 243, 0.2);
        }
      }

      .card-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 16px;
        gap: 12px;
      }

      .material-type-icon {
        position: absolute;
        top: 16px;
        right: 16px;
        z-index: 10;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 50%;
        padding: 8px;

        mat-icon {
          color: #666;
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }

      .material-info {
        flex: 1;
      }

      .material-title {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #333;
        line-height: 1.4;
        padding-right: 40px; /* 给左侧图标留空间 */
      }

      .material-description {
        margin: 8px 0;
        font-size: 14px;
        color: #666;
        line-height: 1.5;
      }

      .material-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 8px;
        font-size: 13px;
        color: #999;
      }

      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .material-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 8px;
      }

      .tags-list {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }

      .material-stats {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 8px;
        font-size: 12px;
        color: #999;
        padding-top: 8px;
        border-top: 1px solid #e0e0e0;
      }

      .stat-item {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .special-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 8px;
      }

      .badge {
        font-size: 11px;
        min-height: 24px;
        padding: 0 8px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .ar-badge {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .game-badge {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      .animation-badge {
        background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%);
      }

      .experiment-badge {
        background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%);
      }

      .thumbnail-area {
        position: relative;
        width: 100%;
        aspect-ratio: 16/9;
        background: #f5f5f5;
        border-radius: 8px;
        overflow: hidden;
      }

      .thumbnail {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }

      .preview-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;

        &:hover {
          opacity: 1;
        }

        .preview-button {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          width: 48px;
          height: 48px;
        }
      }

      .thumbnail-placeholder {
        position: relative;
        width: 100%;
        aspect-ratio: 16/9;
        background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .placeholder-icon {
        font-size: 48px;
        color: white;
        opacity: 0.5;
      }

      .card-actions {
        padding: 12px 16px;
        gap: 8px;
        border-top: 1px solid #e0e0e0;
      }

      @media (max-width: 768px) {
        .material-info {
          padding-right: 20px;
        }

        .material-title {
          font-size: 14px;
        }

        .material-meta {
          flex-direction: column;
          gap: 4px;
        }

        .card-actions {
          flex-wrap: wrap;
        }

        .card-actions .mat-button {
          flex: 1;
          min-width: calc(50% - 8px);
        }
      }
    `,
  ],
})
export class MaterialCardComponent {
  @Input() material!: UnifiedMaterial;
  @Input() compact: boolean = false;
  @Input() showActions: boolean = true;
  @Input() canDelete: boolean = false;
  @Input() isSelected: boolean = false;

  readonly MaterialTypeLabels = MaterialTypeLabels;

  @Output() detail = new EventEmitter<number>();
  @Output() download = new EventEmitter<number>();
  @Output() preview = new EventEmitter<number>();
  @Output() favorite = new EventEmitter<number>();
  @Output() share = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();

  onCardClick(): void {
    this.detail.emit(this.material.id);
  }

  onDownload(): void {
    this.download.emit(this.material.id);
  }

  onPreview(): void {
    this.preview.emit(this.material.id);
  }

  onFavorite(): void {
    this.favorite.emit(this.material.id);
  }

  onShare(): void {
    this.share.emit(this.material.id);
  }

  onDelete(): void {
    if (this.canDelete) {
      this.delete.emit(this.material.id);
    }
  }

  onThumbnailError(): void {
    // 处理缩略图加载错误
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const f = (bytes / Math.pow(k, i)).toFixed(2);
    return `${parseFloat(f)} ${sizes[i]}`;
  }

  getFileIcon(type: MaterialType): string {
    const icons: Record<MaterialType, string> = {
      document_pdf: 'picture_as_pdf',
      document_word: 'description',
      document_ppt: 'slideshow',
      document_excel: 'table_chart',
      video_teaching: 'videocam',
      video_screen: 'screen_share',
      video_live: 'live_tv',
      audio_teaching: 'audio_file',
      audio_recording: 'mic',
      image: 'image',
      code_source: 'code',
      code_example: 'integration_instructions',
      code_project: 'folder_zip',
      game_interactive: 'sports_esports',
      game_simulation: 'science',
      animation_2d: 'animation',
      animation_3d: 'view_in_ar',
      ar_model: 'view_in_ar',
      vr_experience: 'vrpano',
      arvr_scene: 'view_in_ar',
      model_3d: 'view_in_ar',
      model_robot: 'precision_manufacturing',
      experiment_config: 'settings',
      experiment_template: 'description',
      archive: 'archive',
      external_link: 'link',
    };
    return icons[type] || 'insert_drive_file';
  }

  isARVRType(type: MaterialType): boolean {
    const arvrTypes: MaterialType[] = ['ar_model', 'vr_experience', 'arvr_scene'];
    return arvrTypes.includes(type);
  }

  isGameType(type: MaterialType): boolean {
    const gameTypes: MaterialType[] = ['game_interactive', 'game_simulation'];
    return gameTypes.includes(type);
  }

  isExperimentType(type: MaterialType): boolean {
    const experimentTypes: MaterialType[] = ['experiment_config', 'experiment_template'];
    return experimentTypes.includes(type);
  }

  supportsPreview(type: MaterialType): boolean {
    const previewableTypes: MaterialType[] = [
      'document_pdf',
      'image',
      'video_teaching',
      'video_screen',
      'audio_teaching',
      'audio_recording',
      'ar_model',
      'vr_experience',
      'animation_2d',
      'animation_3d',
    ];
    return previewableTypes.includes(type);
  }
}
