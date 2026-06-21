import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { TauriService } from '../../core/services/tauri.service';
import {
  TutorialResourceService,
  TutorialSuggestion,
} from '../../core/services/tutorial-resource.service';
import { CreatorService } from '../../core/services/creator.service';

export interface MaterialUploadDialogData {
  courseId: number;
  courseName: string;
  category?: string;
}

export interface MaterialUploadDialogResult {
  uploaded: boolean;
  materialName?: string;
}

@Component({
  selector: 'app-material-upload-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatSnackBarModule,
  ],
  template: `
    <h2 mat-dialog-title>上传课件</h2>
    <mat-dialog-content>
      <p class="course-hint">教程：{{ data.courseName }}</p>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>课件名称（可选）</mat-label>
        <input matInput [(ngModel)]="displayName" placeholder="留空则使用文件名" />
      </mat-form-field>

      <p class="hint" *ngIf="isDesktop">
        点击「选择文件并上传」打开系统文件选择器，文件将保存到本地课件库。
      </p>
      <p class="hint warn" *ngIf="!isDesktop">
        课件上传需在桌面客户端（Tauri）中使用；浏览器开发模式无法写入本地课件目录。
      </p>

      <mat-progress-bar *ngIf="uploading" mode="indeterminate"></mat-progress-bar>

      <div class="suggestions" *ngIf="uploadedName && otherSuggestions.length > 0">
        <p class="section-label">其他可能关联的教程</p>
        <div class="suggestion-row" *ngFor="let s of otherSuggestions">
          <div>
            <strong>{{ s.tutorial.name }}</strong>
            <span>{{ s.reason }}</span>
          </div>
          <button mat-button type="button" (click)="linkToSuggestion(s)">关联</button>
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button type="button" [disabled]="uploading" (click)="cancel()">
        {{ uploadedName ? '完成' : '取消' }}
      </button>
      <button
        *ngIf="!uploadedName"
        mat-raised-button
        color="primary"
        type="button"
        [disabled]="uploading || !isDesktop"
        (click)="upload()"
      >
        <i class="ri-upload-line"></i>
        选择文件并上传
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .course-hint {
        margin: 0 0 16px;
        color: #555;
      }

      .full-width {
        width: 100%;
      }

      .hint {
        margin: 8px 0 0;
        font-size: 13px;
        color: #666;
        line-height: 1.5;
      }

      .hint.warn {
        color: #b45309;
      }

      .suggestions {
        margin-top: 16px;
        padding-top: 12px;
        border-top: 1px solid #eee;
      }

      .section-label {
        font-size: 13px;
        color: #667eea;
        font-weight: 600;
        margin: 0 0 8px;
      }

      .suggestion-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 8px 0;
        border-bottom: 1px solid #f0f0f0;
      }

      .suggestion-row span {
        display: block;
        font-size: 12px;
        color: #666;
      }

      mat-dialog-actions button i {
        margin-right: 4px;
      }
    `,
  ],
})
export class MaterialUploadDialogComponent {
  displayName = '';
  uploading = false;
  isDesktop: boolean;
  uploadedName = '';
  otherSuggestions: TutorialSuggestion[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: MaterialUploadDialogData,
    private dialogRef: MatDialogRef<MaterialUploadDialogComponent, MaterialUploadDialogResult>,
    private tauriService: TauriService,
    private tutorialResourceService: TutorialResourceService,
    private creatorService: CreatorService,
    private snackBar: MatSnackBar
  ) {
    this.isDesktop = this.tauriService.isDesktopApp();
  }

  async upload(): Promise<void> {
    if (!this.isDesktop) {
      this.snackBar.open('请在桌面客户端中上传课件', '关闭', { duration: 4000 });
      return;
    }

    this.uploading = true;
    try {
      const result = (await this.tauriService.importMaterialForCourse(
        this.data.courseId,
        this.displayName.trim() || undefined
      )) as { name?: string };

      const materialName = result?.name || this.displayName || '课件';
      this.uploadedName = materialName;
      this.snackBar.open(`课件「${materialName}」已上传到「${this.data.courseName}」`, '关闭', {
        duration: 3000,
      });

      this.creatorService
        .award('upload_material', {
          refType: 'material',
          refId: `${this.data.courseId}-${materialName}`,
          note: `上传课件「${materialName}」`,
        })
        .subscribe();

      this.tutorialResourceService
        .suggestTutorialsForMaterial(materialName, this.data.category, this.data.courseId)
        .subscribe({
          next: (suggestions) => {
            this.otherSuggestions = suggestions;
            if (suggestions.length === 0) {
              this.dialogRef.close({ uploaded: true, materialName });
            }
          },
        });
    } catch (error) {
      const message = error instanceof Error ? error.message : '上传失败';
      if (message !== '未选择文件') {
        this.snackBar.open(message, '关闭', { duration: 4000 });
      }
    } finally {
      this.uploading = false;
    }
  }

  linkToSuggestion(suggestion: TutorialSuggestion): void {
    this.tutorialResourceService
      .linkResourceToTutorial(suggestion.tutorial.id, {
        title: this.uploadedName,
        type: 'material',
        source: '本地上传',
      })
      .subscribe({
        next: (added) => {
          if (added) {
            this.snackBar.open(`已关联到「${suggestion.tutorial.name}」`, '关闭', { duration: 2000 });
          }
          this.otherSuggestions = this.otherSuggestions.filter(
            (s) => s.tutorial.id !== suggestion.tutorial.id
          );
          if (this.otherSuggestions.length === 0) {
            this.dialogRef.close({ uploaded: true, materialName: this.uploadedName });
          }
        },
      });
  }

  cancel(): void {
    if (this.uploadedName) {
      this.dialogRef.close({ uploaded: true, materialName: this.uploadedName });
      return;
    }
    this.dialogRef.close({ uploaded: false });
  }
}
