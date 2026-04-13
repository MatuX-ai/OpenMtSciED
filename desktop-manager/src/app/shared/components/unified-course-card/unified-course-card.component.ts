/**
 * 统一课程卡片组件
 * 用于展示课程信息，支持不同课程类型和状态
 * Dumb组件：仅负责展示，不包含业务逻辑
 */

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
  CourseLevel,
  CourseLevelLabels,
  CourseScenarioType,
  CourseScenarioTypeLabels,
  CourseStatus,
  CourseStatusLabels,
  HardwareBudgetLevel,
  UnifiedCourse,
} from '../../../models/unified-course.models';

/** 课程卡片配置接口 */
export interface CourseCardConfig {
  course: UnifiedCourse;
  showEnrollButton?: boolean;
  showProgress?: boolean;
  enrollmentStatus?: 'enrolled' | 'not_enrolled' | 'completed';
  enrollmentProgress?: number;
  showOrgName?: boolean;
  orgName?: string;
  compact?: boolean;
}

@Component({
  selector: 'app-unified-course-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatRippleModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card
      class="unified-course-card"
      [class.compact]="config.compact"
      [class.clickable]="config.showEnrollButton"
    >
      <mat-card-content class="card-content">
        <!-- 封面图片 -->
        <div class="cover-image" *ngIf="config.course.cover_image_url">
          <img [src]="config.course.cover_image_url" [alt]="config.course.title" />
          <div class="scenario-badge" [class]="'scenario-' + config.course.scenario_type">
            {{ getScenarioTypeLabel(config.course.scenario_type) }}
          </div>
          <div class="status-badge" [class]="'status-' + config.course.status">
            {{ getStatusLabel(config.course.status) }}
          </div>
        </div>

        <!-- 无封面图片时的占位符 -->
        <div class="cover-placeholder" *ngIf="!config.course.cover_image_url">
          <mat-icon class="placeholder-icon">school</mat-icon>
          <div class="scenario-badge" [class]="'scenario-' + config.course.scenario_type">
            {{ getScenarioTypeLabel(config.course.scenario_type) }}
          </div>
          <div class="status-badge" [class]="'status-' + config.course.status">
            {{ getStatusLabel(config.course.status) }}
          </div>
        </div>

        <!-- 课程信息 -->
        <div class="course-info">
          <h3 class="course-title" [title]="config.course.title">
            {{ config.course.title }}
          </h3>
          <p class="course-description" *ngIf="config.course.description && !config.compact">
            {{ config.course.description | slice: 0 : 80
            }}{{ (config.course.description.length || 0) > 80 ? '...' : '' }}
          </p>

          <!-- 标签 -->
          <div class="tags" *ngIf="config.course.tags && config.course.tags.length > 0">
            <span class="tag" *ngFor="let tag of config.course.tags.slice(0, 3)">
              {{ tag }}
            </span>
          </div>

          <!-- STEM 路径引擎标识 -->
          <div
            class="stem-badges"
            *ngIf="config.course.phenomenon_theme || config.course.budget_level"
          >
            <span class="stem-badge phenomenon" *ngIf="config.course.phenomenon_theme">
              <mat-icon>science</mat-icon> {{ config.course.phenomenon_theme }}
            </span>
            <span
              class="stem-badge budget"
              [class]="'budget-' + config.course.budget_level"
              *ngIf="config.course.budget_level"
            >
              <mat-icon>build</mat-icon> {{ getBudgetLabel(config.course.budget_level) }}
            </span>
          </div>

          <!-- 元数据 -->
          <div class="metadata">
            <div class="meta-item" *ngIf="config.orgName && config.showOrgName">
              <mat-icon class="meta-icon">business</mat-icon>
              <span class="meta-text">{{ config.orgName }}</span>
            </div>
            <div class="meta-item" *ngIf="config.course.level">
              <mat-icon class="meta-icon">trending_up</mat-icon>
              <span class="meta-text">{{ getLevelLabel(config.course.level) }}</span>
            </div>
            <div class="meta-item" *ngIf="config.course.estimated_duration_hours">
              <mat-icon class="meta-icon">schedule</mat-icon>
              <span class="meta-text">{{ config.course.estimated_duration_hours }}小时</span>
            </div>
            <div class="meta-item" *ngIf="config.course.is_free !== undefined">
              <mat-icon class="meta-icon">{{
                config.course.is_free ? 'check_circle' : 'payments'
              }}</mat-icon>
              <span class="meta-text">{{
                config.course.is_free ? '免费' : config.course.price || '付费'
              }}</span>
            </div>
          </div>

          <!-- 进度条（仅对已报名学员显示）-->
          <div
            class="progress-section"
            *ngIf="config.showProgress && config.enrollmentProgress !== undefined"
          >
            <div class="progress-header">
              <span class="progress-label">学习进度</span>
              <span class="progress-value">{{ config.enrollmentProgress }}%</span>
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill"
                [style.width.%]="config.enrollmentProgress"
                [class]="getProgressColorClass(config.enrollmentProgress)"
              ></div>
            </div>
          </div>

          <!-- 评分 -->
          <div
            class="rating-section"
            *ngIf="config.course.average_rating !== undefined && config.course.average_rating > 0"
          >
            <mat-icon
              class="rating-star"
              *ngFor="let star of [1, 2, 3, 4, 5]"
              [class.filled]="star <= roundRating(config.course.average_rating)"
            >
              star
            </mat-icon>
            <span class="rating-value">{{ config.course.average_rating.toFixed(1) }}</span>
            <span class="rating-count">({{ config.course.total_reviews || 0 }})</span>
          </div>
        </div>
      </mat-card-content>

      <!-- 底部操作栏 -->
      <mat-card-actions class="card-actions" *ngIf="config.showEnrollButton">
        <button
          mat-button
          color="primary"
          [disabled]="config.enrollmentStatus === 'enrolled'"
          (click)="onEnrollClick()"
          matRipple
        >
          <mat-icon *ngIf="config.enrollmentStatus !== 'enrolled'">school</mat-icon>
          {{ getButtonText() }}
        </button>
        <button mat-button (click)="onDetailClick()" *ngIf="!config.compact">详情</button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .unified-course-card {
        transition:
          transform 0.2s ease,
          box-shadow 0.2s ease;
        cursor: default;
        height: 100%;
        display: flex;
        flex-direction: column;

        &.clickable {
          cursor: pointer;

          &:hover {
            transform: translateY(-4px);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
          }
        }

        &.compact {
          .card-content {
            flex-direction: row;
          }

          .cover-image,
          .cover-placeholder {
            width: 120px;
            height: 90px;
            flex-shrink: 0;
          }

          .course-info {
            flex: 1;
            padding: 12px;
          }

          .course-description,
          .tags,
          .progress-section,
          .rating-section {
            display: none;
          }

          .metadata {
            gap: 8px;
          }

          .meta-item {
            font-size: 12px;
          }
        }

        mat-card-actions {
          padding: 8px 16px;
        }
      }

      .card-content {
        display: flex;
        flex-direction: column;
        padding: 16px;
        flex: 1;
        gap: 12px;
      }

      .cover-image,
      .cover-placeholder {
        position: relative;
        width: 100%;
        aspect-ratio: 16/9;
        border-radius: 8px;
        overflow: hidden;
        background: #f5f5f5;
      }

      .cover-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;

        &:hover {
          transform: scale(1.05);
        }
      }

      .cover-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .placeholder-icon {
        font-size: 48px;
        color: white;
        opacity: 0.5;
      }

      .scenario-badge,
      .status-badge {
        position: absolute;
        top: 8px;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
        color: white;
        white-space: nowrap;
      }

      .scenario-badge {
        left: 8px;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(4px);

        &.scenario-school_curriculum {
          background: rgba(33, 150, 243, 0.9);
        }

        &.scenario-school_interest {
          background: rgba(156, 39, 176, 0.9);
        }

        &.scenario-institution {
          background: rgba(76, 175, 80, 0.9);
        }

        &.scenario-online_platform {
          background: rgba(255, 152, 0, 0.9);
        }

        &.scenario-ai_generated {
          background: rgba(220, 53, 69, 0.9);
        }

        &.scenario-competition {
          background: rgba(142, 68, 173, 0.9);
        }
      }

      .status-badge {
        right: 8px;

        &.status-draft {
          background: rgba(158, 158, 158, 0.9);
        }

        &.status-pending {
          background: rgba(255, 193, 7, 0.9);
        }

        &.status-published {
          background: rgba(76, 175, 80, 0.9);
        }

        &.status-ongoing {
          background: rgba(33, 150, 243, 0.9);
        }

        &.status-completed {
          background: rgba(102, 187, 106, 0.9);
        }

        &.status-archived {
          background: rgba(158, 158, 158, 0.9);
        }
      }

      .course-info {
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex: 1;
      }

      .course-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        line-height: 1.4;
        color: #333;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .course-description {
        margin: 0;
        font-size: 14px;
        line-height: 1.5;
        color: #666;
        overflow: hidden;
      }

      .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .tag {
        padding: 4px 8px;
        background: #e3f2fd;
        color: #1565c0;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 500;
      }

      .stem-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 4px;
      }

      .stem-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;

        mat-icon {
          font-size: 14px;
          width: 14px;
          height: 14px;
        }

        &.phenomenon {
          background: #fff3e0;
          color: #ef6c00;
        }

        &.budget {
          background: #e8f5e9;
          color: #2e7d32;

          &.budget-entry {
            background: #e8f5e9;
            color: #2e7d32;
          }

          &.budget-intermediate {
            background: #fff8e1;
            color: #f57f17;
          }

          &.budget-advanced {
            background: #fce4ec;
            color: #c2185b;
          }
        }
      }

      .metadata {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 4px;
      }

      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: #757575;
      }

      .meta-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .progress-section {
        margin-top: 4px;
      }

      .progress-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 6px;
        font-size: 13px;
      }

      .progress-label {
        font-weight: 500;
        color: #666;
      }

      .progress-value {
        font-weight: 600;
        color: #333;
      }

      .progress-bar {
        height: 6px;
        background: #e0e0e0;
        border-radius: 3px;
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        transition: width 0.3s ease;
        border-radius: 3px;

        &.progress-low {
          background: #ff9800;
        }

        &.progress-medium {
          background: #ffeb3b;
        }

        &.progress-high {
          background: #4caf50;
        }

        &.progress-complete {
          background: #2196f3;
        }
      }

      .rating-section {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 4px;
      }

      .rating-star {
        font-size: 16px;
        color: #e0e0e0;

        &.filled {
          color: #ffc107;
        }
      }

      .rating-value {
        font-weight: 600;
        color: #333;
        font-size: 14px;
      }

      .rating-count {
        font-size: 12px;
        color: #999;
      }

      .card-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding: 12px 16px;
        border-top: 1px solid #e0e0e0;
      }

      /* 响应式设计 */
      @media (max-width: 768px) {
        .unified-course-card {
          &.compact {
            .cover-image,
            .cover-placeholder {
              width: 100px;
              height: 75px;
            }

            .course-info {
              padding: 8px;
            }

            .course-title {
              font-size: 14px;
              -webkit-line-clamp: 1;
            }

            .metadata {
              display: none;
            }
          }
        }

        .card-actions {
          flex-direction: column;
        }

        .mat-button {
          width: 100%;
        }
      }

      @media (max-width: 480px) {
        .card-content {
          padding: 12px;
        }

        .course-title {
          font-size: 16px;
        }

        .course-description {
          font-size: 13px;
        }
      }
    `,
  ],
})
export class UnifiedCourseCardComponent {
  @Input() config!: CourseCardConfig;

  @Output() enroll = new EventEmitter<number>();
  @Output() detail = new EventEmitter<number>();

  onEnrollClick(): void {
    this.enroll.emit(this.config.course.id);
  }

  onDetailClick(): void {
    this.detail.emit(this.config.course.id);
  }

  getScenarioTypeLabel(type: CourseScenarioType): string {
    return CourseScenarioTypeLabels[type] || type;
  }

  getStatusLabel(status: CourseStatus): string {
    return CourseStatusLabels[status] || status;
  }

  getLevelLabel(level: CourseLevel): string {
    return CourseLevelLabels[level] || level;
  }

  getButtonText(): string {
    if (this.config.enrollmentStatus === 'enrolled') {
      return '已报名';
    } else if (this.config.enrollmentStatus === 'completed') {
      return '已完成';
    } else if (this.config.course.status === 'draft' || this.config.course.status === 'pending') {
      return '即将开始';
    } else {
      return '立即报名';
    }
  }

  getProgressColorClass(progress: number): string {
    if (progress >= 100) {
      return 'progress-complete';
    } else if (progress >= 75) {
      return 'progress-high';
    } else if (progress >= 50) {
      return 'progress-medium';
    } else {
      return 'progress-low';
    }
  }

  formatDuration(hours: number): string {
    if (hours < 1) {
      return `${Math.round(hours * 60)}分钟`;
    } else if (hours < 24) {
      return `${hours}小时`;
    } else {
      return `${Math.round(hours / 24)}天`;
    }
  }

  roundRating(rating: number | undefined): number {
    return Math.round(rating ?? 0);
  }

  getBudgetLabel(level: HardwareBudgetLevel): string {
    const labels: Record<HardwareBudgetLevel, string> = {
      entry: '入门级 (≤50元)',
      intermediate: '进阶级 (50-200元)',
      advanced: '专业级 (>200元)',
    };
    return labels[level] || level;
  }
}
