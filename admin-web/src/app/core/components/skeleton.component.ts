import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

/**
 * 统计卡片骨架屏
 * 用作管理页 stat-card 的加载占位（icon + number + label 三段灰色块 + shimmer 动画）
 */
@Component({
  selector: 'app-skeleton-stat-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card class="skeleton-stat-card">
      <mat-card-content>
        <div class="sk-icon skeleton-block"></div>
        <div class="sk-info">
          <div class="sk-number skeleton-block"></div>
          <div class="sk-label skeleton-block"></div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    :host { display: block; }

    .skeleton-stat-card {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06) !important;
    }

    .skeleton-stat-card mat-card-content {
      display: flex;
      align-items: center;
      padding: 20px;
    }

    .sk-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-right: 16px;
    }

    .sk-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .sk-number {
      height: 24px;
      width: 60%;
    }

    .sk-label {
      height: 14px;
      width: 80%;
    }

    .skeleton-block {
      background: linear-gradient(
        90deg,
        rgba(0, 0, 0, 0.06) 0%,
        rgba(0, 0, 0, 0.12) 50%,
        rgba(0, 0, 0, 0.06) 100%
      );
      background-size: 200% 100%;
      border-radius: 4px;
      animation: skeleton-shimmer 1.4s ease-in-out infinite;
    }

    @keyframes skeleton-shimmer {
      0%   { background-position: 100% 0; }
      100% { background-position: -100% 0; }
    }

    @media (prefers-reduced-motion: reduce) {
      .skeleton-block { animation: none; }
    }
  `],
})
export class SkeletonStatCardComponent {
  @Input() label = '';
}

/**
 * 表格骨架屏
 * 用作管理页 mat-table 的加载占位（表头行 + N 行 × M 列的灰色块 + shimmer 动画）
 */
@Component({
  selector: 'app-skeleton-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="skeleton-table" role="status" aria-label="加载中">
      <div class="sk-header">
        <div
          *ngFor="let col of colWidths; let i = index"
          class="sk-cell sk-cell-header skeleton-block"
          [style.flex]="col"
        ></div>
      </div>
      <div *ngFor="let row of rowArray" class="sk-row">
        <div
          *ngFor="let col of colWidths; let i = index"
          class="sk-cell skeleton-block"
          [style.flex]="col"
        ></div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }

    .skeleton-table {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px 0;
    }

    .sk-header,
    .sk-row {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .sk-cell {
      height: 20px;
      min-width: 40px;
    }

    .sk-cell-header {
      height: 16px;
    }

    .skeleton-block {
      background: linear-gradient(
        90deg,
        rgba(0, 0, 0, 0.06) 0%,
        rgba(0, 0, 0, 0.12) 50%,
        rgba(0, 0, 0, 0.06) 100%
      );
      background-size: 200% 100%;
      border-radius: 4px;
      animation: skeleton-shimmer 1.4s ease-in-out infinite;
    }

    @keyframes skeleton-shimmer {
      0%   { background-position: 100% 0; }
      100% { background-position: -100% 0; }
    }

    @media (prefers-reduced-motion: reduce) {
      .skeleton-block { animation: none; }
    }

    @media (max-width: 768px) {
      .sk-header,
      .sk-row { gap: 8px; }
    }
  `],
})
export class SkeletonTableComponent {
  /** flex 比例数组，对应每列宽度（默认 4 列等宽） */
  @Input() colWidths: number[] = [1, 1, 1, 1];
  /** 占位行数 */
  @Input() rows = 5;

  get rowArray(): number[] {
    return Array.from({ length: this.rows }, (_, i) => i);
  }
}
