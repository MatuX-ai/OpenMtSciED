import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

import { TauriService } from '../../core/services';

interface UserProject {
  id?: number;
  name: string;
  description?: string;
  created_at: string;
}

@Component({
  selector: 'app-my-projects',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatIconModule,
  ],
  template: `
    <div class="my-projects-container">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">
            <span class="title-icon">🚀</span>
            我的项目
          </h1>
          <p class="page-subtitle">管理和组织您的个性化学习项目</p>
        </div>
        <button mat-raised-button class="create-btn" (click)="openCreateDialog()">
          <mat-icon>add_circle_outline</mat-icon>
          新建项目
        </button>
      </div>

      <!-- 项目网格 -->
      <div class="project-grid">
        <div *ngFor="let project of projects" class="project-card-wrapper">
          <mat-card class="project-card">
            <div class="card-gradient"></div>
            <mat-card-header>
              <div class="card-icon">
                <mat-icon>folder_special</mat-icon>
              </div>
              <mat-card-title>{{ project.name }}</mat-card-title>
              <mat-card-subtitle>
                <mat-icon>schedule</mat-icon>
                {{ formatDate(project.created_at) }}
              </mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p class="description">{{ project.description || '暂无描述' }}</p>
            </mat-card-content>
            <mat-card-actions class="card-actions">
              <button mat-stroked-button class="action-btn view-btn" (click)="viewResources(project)">
                <mat-icon>folder_open</mat-icon>
                查看资源
              </button>
              <button mat-stroked-button class="action-btn sync-btn" (click)="syncToCloud(project)">
                <mat-icon>cloud_upload</mat-icon>
                同步云端
              </button>
            </mat-card-actions>
          </mat-card>
        </div>

        <!-- 空状态 -->
        <div *ngIf="projects.length === 0" class="empty-state">
          <div class="empty-icon">
            <mat-icon>inbox</mat-icon>
          </div>
          <h3>还没有项目</h3>
          <p>点击右上角"新建项目"按钮创建您的第一个学习项目</p>
          <button mat-raised-button class="create-btn" (click)="openCreateDialog()">
            <mat-icon>add</mat-icon>
            创建项目
          </button>
        </div>
      </div>
    </div>

    <!-- 新建项目对话框 -->
    <ng-template #dialogTemplate>
      <div class="modern-dialog">
        <div class="dialog-header">
          <div class="header-icon">
            <mat-icon>create_new_folder</mat-icon>
          </div>
          <h2>新建项目</h2>
          <p>创建一个新的个性化学习项目</p>
        </div>
        
        <div class="dialog-body">
          <form (ngSubmit)="saveProject()">
            <div class="form-group">
              <label class="form-label">
                <mat-icon>label</mat-icon>
                项目名称
              </label>
              <input 
                matInput 
                [(ngModel)]="currentProject.name" 
                name="name" 
                required 
                placeholder="输入项目名称"
                class="modern-input"
              />
            </div>

            <div class="form-group">
              <label class="form-label">
                <mat-icon>description</mat-icon>
                项目描述
              </label>
              <textarea 
                matInput 
                [(ngModel)]="currentProject.description" 
                name="description" 
                rows="4"
                placeholder="简要描述项目内容（可选）"
                class="modern-textarea"
              ></textarea>
            </div>

            <div class="dialog-footer">
              <button mat-button type="button" (click)="closeDialog()" class="cancel-btn">
                取消
              </button>
              <button mat-raised-button type="submit" [disabled]="!currentProject.name" class="submit-btn">
                <mat-icon>check</mat-icon>
                创建项目
              </button>
            </div>
          </form>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    .my-projects-container {
      padding: 32px;
      max-width: 1400px;
      margin: 0 auto;
    }

    /* 页面头部 */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
      padding-bottom: 24px;
      border-bottom: 2px solid #f0f0f0;
    }

    .header-content {
      flex: 1;
    }

    .page-title {
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 8px 0;
      color: #1a1a2e;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .title-icon {
      font-size: 36px;
    }

    .page-subtitle {
      font-size: 15px;
      color: #6c757d;
      margin: 0;
    }

    .create-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      font-size: 15px;
      font-weight: 600;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
      }

      mat-icon {
        margin-right: 8px;
      }
    }

    /* 项目网格 */
    .project-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }

    .project-card-wrapper {
      animation: fadeInUp 0.4s ease;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .project-card {
      position: relative;
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid #e9ecef;
      background: white;

      &:hover {
        transform: translateY(-8px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
        border-color: #667eea;

        .card-gradient {
          opacity: 1;
        }
      }
    }

    .card-gradient {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    mat-card-header {
      padding: 24px 24px 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .card-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;

      mat-icon {
        color: white;
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    mat-card-title {
      font-size: 20px;
      font-weight: 600;
      color: #1a1a2e;
      margin: 0;
    }

    mat-card-subtitle {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #6c757d;
      margin: 0;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }

    mat-card-content {
      padding: 0 24px 16px;
    }

    .description {
      font-size: 14px;
      color: #495057;
      line-height: 1.6;
      margin: 0;
    }

    .card-actions {
      padding: 16px 24px 24px;
      display: flex;
      gap: 12px;
      border-top: 1px solid #f0f0f0;
    }

    .action-btn {
      flex: 1;
      border-radius: 10px;
      font-weight: 500;
      transition: all 0.2s ease;

      mat-icon {
        margin-right: 6px;
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    .view-btn {
      border-color: #667eea;
      color: #667eea;

      &:hover {
        background: rgba(102, 126, 234, 0.08);
      }
    }

    .sync-btn {
      border-color: #43e97b;
      color: #43e97b;

      &:hover {
        background: rgba(67, 233, 123, 0.08);
      }
    }

    /* 空状态 */
    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 80px 40px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 16px;
      border: 2px dashed #dee2e6;

      .empty-icon {
        width: 80px;
        height: 80px;
        margin: 0 auto 24px;
        border-radius: 50%;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

        mat-icon {
          font-size: 40px;
          width: 40px;
          height: 40px;
          color: #6c757d;
        }
      }

      h3 {
        font-size: 24px;
        font-weight: 600;
        color: #1a1a2e;
        margin: 0 0 12px 0;
      }

      p {
        font-size: 15px;
        color: #6c757d;
        margin: 0 0 24px 0;
      }
    }

    /* 现代化对话框 */
    .modern-dialog {
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .dialog-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 32px;
      text-align: center;
      color: white;

      .header-icon {
        width: 64px;
        height: 64px;
        margin: 0 auto 16px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;

        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
        }
      }

      h2 {
        font-size: 24px;
        font-weight: 700;
        margin: 0 0 8px 0;
      }

      p {
        font-size: 14px;
        opacity: 0.9;
        margin: 0;
      }
    }

    .dialog-body {
      padding: 32px;
    }

    .form-group {
      margin-bottom: 24px;
    }

    .form-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #1a1a2e;
      margin-bottom: 8px;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: #667eea;
      }
    }

    .modern-input,
    .modern-textarea {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e9ecef;
      border-radius: 12px;
      font-size: 15px;
      transition: all 0.3s ease;
      font-family: inherit;

      &:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
      }

      &::placeholder {
        color: #adb5bd;
      }
    }

    .modern-textarea {
      resize: vertical;
      min-height: 100px;
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #f0f0f0;
    }

    .cancel-btn {
      padding: 10px 24px;
      border-radius: 10px;
      font-weight: 500;
      color: #6c757d;

      &:hover {
        background: #f8f9fa;
      }
    }

    .submit-btn {
      padding: 10px 24px;
      border-radius: 10px;
      font-weight: 600;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      mat-icon {
        margin-right: 6px;
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }
  `]
})
export class MyProjectsComponent implements OnInit {
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<unknown>;
  
  projects: UserProject[] = [];
  currentProject: Partial<UserProject> = {};

  constructor(private tauriService: TauriService, private dialog: MatDialog, private snackBar: MatSnackBar) {}

  async ngOnInit(): Promise<void> {
    await this.loadProjects();
  }

  async loadProjects(): Promise<void> {
    try {
      this.projects = await this.tauriService.getUserProjects() as UserProject[];
    } catch (error) {
      console.error('加载项目失败:', error);
    }
  }

  openCreateDialog(): void {
    this.currentProject = { name: '', description: '' };
    this.dialog.open(this.dialogTemplate, { 
      width: '560px',
      maxWidth: '90vw',
      panelClass: 'modern-dialog-container'
    });
  }

  async saveProject(): Promise<void> {
    try {
      await this.tauriService.createUserProject(
        this.currentProject.name || '',
        this.currentProject.description
      );
      this.closeDialog();
      await this.loadProjects();
      this.snackBar.open('项目创建成功', '关闭', { 
        duration: 3000,
        panelClass: 'success-snackbar'
      });
    } catch (error) {
      console.error('保存项目失败:', error);
    }
  }

  closeDialog(): void {
    this.dialog.closeAll();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  viewResources(project: UserProject): void {
    // TODO: 跳转到项目详情页或打开资源管理弹窗
    this.snackBar.open(`查看项目 "${project.name}" 的资源`, '关闭', { duration: 3000 });
  }

  async syncToCloud(project: UserProject): Promise<void> {
    try {
      const config = await this.tauriService.getApiConfig();
      const result = await this.tauriService.syncProjectToCloud(
        project.id || 0,
        config?.apiUrl || 'http://localhost:3000',
        'user_123' // TODO: 从登录状态获取
      );
      this.snackBar.open(result, '关闭', { duration: 3000 });
    } catch (error) {
      console.error('同步失败:', error);
      this.snackBar.open('同步到云端失败', '关闭', { duration: 3000 });
    }
  }
}
