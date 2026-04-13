/**
 * 课件上传组件
 *
 * 支持单文件/批量上传，拖拽上传，进度显示
 */

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { UnifiedMaterialService } from '../../../core/services/unified-material.service';
import {
  MaterialCategory,
  MaterialDownloadPermission,
  MaterialType,
  MaterialVisibility,
} from '../../../models/unified-material.models';

@Component({
  selector: 'app-material-upload',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatChipsModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  template: `
    <mat-card class="upload-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>upload_file</mat-icon>
          上传课件
        </mat-card-title>
      </mat-card-header>

      <mat-card-content class="card-content">
        <!-- 上传区域 -->
        <div
          class="upload-area"
          [class.drag-over]="isDragOver"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)"
          #dropZone
        >
          <!-- 文件选择按钮 -->
          <button
            class="file-select-button"
            mat-raised-button
            color="primary"
            (click)="fileInput.click()"
          >
            <mat-icon>add</mat-icon>
            选择文件
          </button>

          <!-- 隐藏的文件输入 -->
          <input
            #fileInput
            type="file"
            [accept]="getAcceptedFileTypes()"
            [multiple]="multiple"
            (change)="onFileSelected($event)"
            class="hidden-input"
          />

          <!-- 拖拽提示 -->
          <div class="drag-hint" *ngIf="files.length === 0 && !isDragOver">
            <mat-icon>cloud_upload</mat-icon>
            <p>拖拽文件到此处</p>
            <p>或</p>
          </div>
        </div>

        <!-- 文件列表 -->
        <div class="files-list" *ngIf="files.length > 0">
          <h3 class="section-title">已选择 {{ files.length }} 个文件</h3>

          <div class="files-grid">
            <div
              *ngFor="let file of files; let i = index"
              class="file-item"
              [class]="'type-' + getFileCategory(file.name)"
            >
              <mat-icon class="file-icon">{{ getFileIcon(file.name) }}</mat-icon>
              <div class="file-info">
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size">{{ formatFileSize(file.size) }}</span>
              </div>
              <button
                mat-icon-button
                class="remove-button"
                [matTooltip]="'删除'"
                color="warn"
                (click)="removeFile(i)"
              >
                <mat-icon>close</mat-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- 元数据表单 -->
        <div class="metadata-form" [class.disabled]="files.length === 0">
          <mat-form-field appearance="outline">
            <mat-label>课件标题 *</mat-label>
            <input
              matInput
              placeholder="输入课件标题"
              [(ngModel)]="materialTitle"
              [disabled]="uploading"
            />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>课件描述</mat-label>
            <textarea
              matInput
              placeholder="输入课件描述（可选）"
              [(ngModel)]="materialDescription"
              [rows]="3"
              [disabled]="uploading"
            >
            </textarea>
          </mat-form-field>

          <div class="form-row">
            <mat-form-field appearance="outline" class="field-half">
              <mat-label>课件类型 *</mat-label>
              <mat-select [(ngModel)]="materialType" [disabled]="uploading">
                <mat-option *ngFor="let type of materialTypes" [value]="type">
                  {{ type.label }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="field-half">
              <mat-label>课件分类 *</mat-label>
              <mat-select [(ngModel)]="materialCategory" [disabled]="uploading">
                <mat-option *ngFor="let category of categories" [value]="category">
                  {{ category.label }}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline">
            <mat-label>课件标签</mat-label>
            <input
              matInput
              placeholder="输入标签，逗号分隔"
              [(ngModel)]="materialTags"
              [disabled]="uploading"
            />
          </mat-form-field>

          <div class="form-row">
            <mat-form-field appearance="outline" class="field-half">
              <mat-label>关联课程</mat-label>
              <mat-select [(ngModel)]="courseId" [disabled]="uploading">
                <mat-option [value]="undefined">不关联课程</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="field-half">
              <mat-label>关联章节</mat-label>
              <mat-select [(ngModel)]="chapterId" [disabled]="uploading">
                <mat-option [value]="undefined">不关联章节</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- 权限设置 -->
          <mat-form-field appearance="outline" class="field-half">
            <mat-label>可见性</mat-label>
            <mat-select [(ngModel)]="visibility" [disabled]="uploading">
              <mat-option value="course_private">课程私有</mat-option>
              <mat-option value="org_private">机构私有</mat-option>
              <mat-option value="public">公开</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="field-half">
            <mat-label>下载权限</mat-label>
            <mat-select [(ngModel)]="downloadPermission" [disabled]="uploading">
              <mat-option value="enrolled">已报名学员</mat-option>
              <mat-option value="teacher">教师</mat-option>
              <mat-option value="all">所有人</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <!-- 上传进度 -->
        <div class="upload-progress" *ngIf="uploading">
          <h3 class="section-title">上传中...</h3>

          <div class="progress-item" *ngFor="let progress of uploadProgress">
            <div class="progress-info">
              <span class="file-name">{{ progress.fileName }}</span>
              <mat-progress-bar
                mode="determinate"
                [value]="progress.progress"
                [color]="getProgressColor(progress.progress)"
              >
              </mat-progress-bar>
              <span class="progress-text">{{ roundProgress(progress.progress) }}%</span>
            </div>
            <mat-icon
              *ngIf="progress.completed"
              class="status-icon success"
              [matTooltip]="'上传完成'"
            >
              check_circle
            </mat-icon>
            <mat-icon *ngIf="progress.error" class="status-icon error" [matTooltip]="'上传失败'">
              error
            </mat-icon>
          </div>

          <div class="progress-summary">
            <span>已上传: {{ uploadedFilesCount }}/{{ totalFilesCount }}</span>
            <span>成功: {{ successFilesCount }}/{{ totalFilesCount }}</span>
            <span>失败: {{ failedFilesCount }}</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-bar" [class.disabled]="files.length === 0 || uploading">
          <button mat-raised-button color="warn" (click)="clearFiles()" [disabled]="uploading">
            <mat-icon>clear</mat-icon>
            清除文件
          </button>
          <button
            mat-raised-button
            color="primary"
            (click)="startUpload()"
            [disabled]="!canUpload()"
          >
            <mat-icon>cloud_upload</mat-icon>
            开始上传
          </button>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      .upload-card {
        max-width: 800px;
        margin: 0 auto;
      }

      .card-content {
        padding: 24px;
      }

      .upload-area {
        border: 2px dashed #2196f3;
        border-radius: 8px;
        padding: 40px;
        text-align: center;
        background: #fafafa;
        transition: border-color 0.3s ease;
        position: relative;
        min-height: 200px;

        &.drag-over {
          border-color: #2196f3;
          background: #e3f2fd;
          border-style: solid;
        }
      }

      .file-select-button {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        min-width: 200px;
        z-index: 10;
      }

      .hidden-input {
        display: none;
      }

      .drag-hint {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        color: #666;

        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          color: #ccc;
        }

        p {
          margin: 0;
          font-size: 14px;
        }
      }

      .section-title {
        font-size: 18px;
        font-weight: 600;
        color: #333;
        margin: 24px 0 12px;
      }

      .files-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 12px;
        margin-bottom: 24px;
      }

      .file-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        transition: all 0.2s ease;

        &:hover {
          background: #f5f5f5;
        }
      }

      .file-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
        color: #666;
      }

      .file-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .file-name {
        font-size: 14px;
        font-weight: 500;
        color: #333;
        word-break: break-all;
      }

      .file-size {
        font-size: 12px;
        color: #999;
      }

      .remove-button {
        color: #f44336;
      }

      .metadata-form {
        margin-bottom: 24px;
      }

      .form-row {
        display: flex;
        gap: 16px;
      }

      .field-half {
        flex: 1;
      }

      .action-bar {
        display: flex;
        gap: 12px;
        margin-top: 24px;
        padding-top: 24px;
        border-top: 1px solid #e0e0e0;
      }

      .action-bar.disabled {
        opacity: 0.5;
        pointer-events: none;
      }

      .upload-progress {
        margin-bottom: 24px;
      }

      .progress-item {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
      }

      .progress-info {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .file-name {
        font-size: 14px;
        color: #333;
        min-width: 200px;
      }

      .progress-text {
        font-size: 12px;
        color: #666;
        font-weight: 600;
        min-width: 40px;
      }

      .status-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .status-icon.success {
        color: #4caf50;
      }

      .status-icon.error {
        color: #f44336;
      }

      .progress-summary {
        display: flex;
        gap: 24px;
        justify-content: center;
        font-size: 14px;
        color: #666;
      }

      @media (max-width: 768px) {
        .form-row {
          flex-direction: column;
        }

        .action-bar {
          flex-direction: column;
        }

        .action-bar .mat-raised-button {
          width: 100%;
        }
      }
    `,
  ],
})
export class MaterialUploadComponent {
  @Output() uploadComplete = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  files: File[] = [];
  materialTitle = '';
  materialDescription = '';
  materialType: MaterialType = 'document_pdf';
  materialCategory: MaterialCategory = 'course_material';
  materialTags = '';
  courseId: number | undefined;
  chapterId: number | undefined;
  visibility: MaterialVisibility = 'course_private';
  downloadPermission: MaterialDownloadPermission = 'enrolled';

  uploading = false;
  uploadProgress: Array<{
    fileName: string;
    progress: number;
    completed: boolean;
    error: boolean;
  }> = [];
  uploadedFilesCount = 0;
  totalFilesCount = 0;
  successFilesCount = 0;
  failedFilesCount = 0;
  isDragOver = false;
  multiple = false;

  // 课件类型列表
  materialTypes: Array<{ value: MaterialType; label: string }> = [];

  // 分类列表
  categories: Array<{ value: MaterialCategory; label: string }> = [];

  constructor(
    private materialService: UnifiedMaterialService,
    private snackBar: MatSnackBar
  ) {
    this.initializeMaterialTypes();
    this.initializeCategories();
  }

  private initializeMaterialTypes(): void {
    const types: Array<{ value: MaterialType; label: string }> = [
      { value: 'document_pdf', label: 'PDF文档' },
      { value: 'document_word', label: 'Word文档' },
      { value: 'document_ppt', label: 'PPT演示' },
      { value: 'document_excel', label: 'Excel表格' },
      { value: 'video_teaching', label: '教学视频' },
      { value: 'video_screen', label: '录屏视频' },
      { value: 'video_live', label: '课程直播' },
      { value: 'audio_teaching', label: '音频课件' },
      { value: 'audio_recording', label: '录音内容' },
      { value: 'image', label: '图片资料' },
      { value: 'code_source', label: '源代码' },
      { value: 'code_example', label: '代码示例' },
      { value: 'code_project', label: '项目文件' },
      { value: 'game_interactive', label: '交互游戏' },
      { value: 'game_simulation', label: '仿真模拟' },
      { value: 'animation_2d', label: '2D动画' },
      { value: 'animation_3d', label: '3D动画' },
      { value: 'ar_model', label: 'AR模型' },
      { value: 'vr_experience', label: 'VR体验' },
      { value: 'arvr_scene', label: 'AR/VR场景' },
      { value: 'model_3d', label: '3D模型' },
      { value: 'model_robot', label: '机器人模型' },
      { value: 'experiment_config', label: '实验配置' },
      { value: 'experiment_template', label: '实验模板' },
      { value: 'archive', label: '压缩包' },
    ];
    this.materialTypes = types;
  }

  private initializeCategories(): void {
    const categories: Array<{ value: MaterialCategory; label: string }> = [
      { value: 'course_material', label: '课程资料' },
      { value: 'reference_material', label: '参考资料' },
      { value: 'assignment_material', label: '作业材料' },
      { value: 'exam_material', label: '考试材料' },
      { value: 'project_template', label: '项目模板' },
      { value: 'tutorial', label: '教程' },
      { value: 'resource_library', label: '资源库' },
    ];
    this.categories = categories;
  }

  /**
   * 获取接受的文件类型
   */
  getAcceptedFileTypes(): string {
    return this.materialTypes.map((t) => t.value).join(',');
  }

  /**
   * 文件选择处理
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const newFiles = Array.from(input.files);
      this.files = [...this.files, ...newFiles];
    }
  }

  /**
   * 拖拽开始
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  /**
   * 拖拽离开
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  /**
   * 文件拖放
   */
  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;

    if (event.dataTransfer && event.dataTransfer.files) {
      const newFiles = Array.from(event.dataTransfer.files);
      this.files = [...this.files, ...newFiles];
    }
  }

  /**
   * 移除文件
   */
  removeFile(index: number): void {
    this.files.splice(index, 1);
  }

  /**
   * 清除所有文件
   */
  clearFiles(): void {
    this.files = [];
    this.materialTitle = '';
    this.materialDescription = '';
    this.materialTags = '';
    this.courseId = undefined;
    this.chapterId = undefined;
  }

  /**
   * 检查是否可以上传
   */
  canUpload(): boolean {
    return this.files.length > 0 && this.materialTitle.trim().length > 0 && !this.uploading;
  }

  /**
   * 开始上传
   */
  startUpload(): void {
    if (!this.canUpload()) {
      return;
    }

    this.uploading = true;
    this.uploadProgress = this.files.map((file) => ({
      fileName: file.name,
      progress: 0,
      completed: false,
      error: false,
    }));

    this.totalFilesCount = this.files.length;
    this.uploadedFilesCount = 0;
    this.successFilesCount = 0;
    this.failedFilesCount = 0;

    // 上传每个文件
    this.files.forEach((file, index) => {
      this.uploadFile(file, index);
    });
  }

  /**
   * 上传单个文件
   */
  private uploadFile(file: File, index: number): void {
    this.materialService
      .uploadMaterial(new FormData(), (percent: number) => {
        // 设置表单数据
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', this.materialTitle);
        if (this.materialDescription) {
          formData.append('description', this.materialDescription);
        }
        formData.append('type', this.materialType);
        formData.append('category', this.materialCategory);
        if (this.materialTags.trim()) {
          formData.append('tags', this.materialTags);
        }
        if (this.courseId) {
          formData.append('course_id', this.courseId.toString());
        }
        if (this.chapterId) {
          formData.append('chapter_id', this.chapterId.toString());
        }
        formData.append('visibility', this.visibility);
        formData.append('download_permission', this.downloadPermission);

        // 更新进度
        this.updateUploadProgress(index, percent);
      })
      .subscribe({
        next: (response) => {
          this.updateUploadProgress(index, 100);
          this.updateUploadProgress(index, 100, true, false);
          this.uploadedFilesCount++;
          this.successFilesCount++;
          this.checkAllFilesUploaded();
        },
        error: (error) => {
          console.error(`上传文件 ${file.name} 失败:`, error);
          this.updateUploadProgress(index, 0, false, true);
          this.failedFilesCount++;
          this.checkAllFilesUploaded();
          this.snackBar.open(`上传${file.name}失败: ${error.message || '未知错误'}`, '关闭', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
        },
      });
  }

  /**
   * 更新上传进度
   */
  private updateUploadProgress(
    index: number,
    progress: number,
    completed: boolean = false,
    error: boolean = false
  ): void {
    this.uploadProgress[index] = {
      ...this.uploadProgress[index],
      progress,
      completed,
      error,
    };
  }

  /**
   * 检查所有文件是否上传完成
   */
  private checkAllFilesUploaded(): void {
    const allCompleted = this.uploadProgress.every((p) => p.completed || p.error);

    if (allCompleted) {
      this.uploading = false;
      this.snackBar.open(
        `上传完成！成功: ${this.successFilesCount}/${this.totalFilesCount}`,
        '关闭',
        {
          duration: 3000,
          panelClass: ['success-snackbar'],
        }
      );

      setTimeout(() => {
        this.uploadComplete.emit();
        this.clearFiles();
      }, 1000);
    }
  }

  /**
   * 取消上传
   */
  onCancelUpload(): void {
    this.uploading = false;
    this.uploadProgress = [];
    this.uploadedFilesCount = 0;
    this.totalFilesCount = 0;
    this.successFilesCount = 0;
    this.failedFilesCount = 0;
    this.snackBar.open('已取消上传', '关闭', { duration: 3000 });
    this.cancel.emit();
  }

  /**
   * 获取进度颜色
   */
  getProgressColor(progress: number): string {
    if (progress >= 100) return 'primary';
    if (progress >= 75) return 'accent';
    if (progress >= 50) return 'warn';
    return 'primary';
  }

  /**
   * 四舍五入进度值
   */
  roundProgress(progress: number): number {
    return Math.round(progress);
  }

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const f = (bytes / Math.pow(k, i)).toFixed(2);
    return `${parseFloat(f)} ${sizes[i]}`;
  }

  /**
   * 根据文件名推断课件类型分类
   */
  getFileCategory(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() || '';

    // 文档类
    if (['pdf'].includes(ext)) return 'document';
    if (['doc', 'docx'].includes(ext)) return 'document';
    if (['ppt', 'pptx'].includes(ext)) return 'document';
    if (['xls', 'xlsx'].includes(ext)) return 'document';

    // 视频类
    if (['mp4', 'mov', 'avi'].includes(ext)) return 'video';
    if (['webm'].includes(ext)) return 'video';

    // 音频类
    if (['mp3', 'wav'].includes(ext)) return 'audio';

    // 图片类
    if (['jpg', 'png', 'gif', 'svg'].includes(ext)) return 'image';

    // 代码类
    if (['py', 'js', 'ts', 'java', 'cpp', 'go', 'rs'].includes(ext)) return 'code';

    // 压缩包
    if (['zip', 'rar', '7z'].includes(ext)) return 'archive';

    return 'other';
  }

  /**
   * 获取文件图标
   */
  getFileIcon(filename: string): string {
    const category = this.getFileCategory(filename);

    const icons: Record<string, string> = {
      document: 'description',
      video: 'videocam',
      audio: 'audio_file',
      image: 'image',
      code: 'code',
      archive: 'archive',
      other: 'insert_drive_file',
    };

    return icons[category] || 'insert_drive_file';
  }
}
