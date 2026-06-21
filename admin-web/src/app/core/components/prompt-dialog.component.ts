import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

/**
 * 输入对话框数据接口
 */
export interface PromptDialogData {
  title: string;
  message?: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
  inputType?: 'text' | 'number' | 'url' | 'email';
}

/**
 * 通用输入对话框组件
 * 替代浏览器原生 prompt()，使用 MatDialog 提供一致的 UI 体验
 */
@Component({
  selector: 'app-prompt-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      {{ data.title }}
    </h2>
    <mat-dialog-content class="dialog-content">
      <p *ngIf="data.message" class="message">{{ data.message }}</p>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>{{ data.label }}</mat-label>
        <input
          matInput
          [type]="data.inputType || 'text'"
          [(ngModel)]="inputValue"
          [placeholder]="data.placeholder || ''"
          (keyup.enter)="onConfirm()"
          cdkFocusInitial>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="null">
        {{ data.cancelText || '取消' }}
      </button>
      <button mat-flat-button color="primary" [mat-dialog-close]="inputValue" [disabled]="!inputValue">
        {{ data.confirmText || '确认' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title {
      margin: 0;
      font-size: 18px;
    }
    .message {
      color: #666;
      margin-bottom: 12px;
    }
    .full-width {
      width: 100%;
    }
    .dialog-content {
      min-width: 320px;
    }
  `],
})
export class PromptDialogComponent implements OnInit {
  readonly data: PromptDialogData = inject(MAT_DIALOG_DATA);
  inputValue = '';

  ngOnInit(): void {
    if (this.data.defaultValue) {
      this.inputValue = this.data.defaultValue;
    }
  }

  onConfirm(): void {
    // 由 [mat-dialog-close]="inputValue" 处理
  }
}
