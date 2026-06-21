import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

/**
 * 确认对话框数据接口
 */
export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  color?: 'primary' | 'accent' | 'warn';
  icon?: string;
}

/**
 * 通用确认对话框组件
 * 替代浏览器原生 confirm()，使用 MatDialog 提供一致的 UI 体验
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatIconModule],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon *ngIf="data.icon" [color]="data.color || 'warn'">{{ data.icon }}</mat-icon>
      {{ data.title }}
    </h2>
    <mat-dialog-content class="dialog-content">
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">
        {{ data.cancelText || '取消' }}
      </button>
      <button mat-flat-button [color]="data.color || 'warn'" [mat-dialog-close]="true">
        {{ data.confirmText || '确认' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      font-size: 18px;
    }
    .dialog-content p {
      color: #555;
      line-height: 1.6;
      margin: 0;
    }
  `],
})
export class ConfirmDialogComponent {
  readonly data: ConfirmDialogData = inject(MAT_DIALOG_DATA);
}
