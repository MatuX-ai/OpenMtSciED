import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';

import { TauriService } from '../../core/services';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';

import { OpenMaterialBrowserComponent } from './open-material-browser/open-material-browser.component';

interface Material {
  id?: number;
  name: string;
  filePath: string;
  fileSize: number;
  courseId: number;
  createdAt?: string;
}

@Component({
  selector: 'app-material-library',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatTabsModule,
    OpenMaterialBrowserComponent,
    SearchBarComponent,
  ],
  template: `
    <div class="material-library-container">
      <!-- 顶部操作栏 -->
      <div class="toolbar">
        <h1>📁 课件库</h1>
        <button
          mat-raised-button
          color="primary"
          (click)="openUploadDialog()"
          *ngIf="selectedTabIndex === 0"
        >
          <i class="ri-upload-cloud-line"></i> 上传课件
        </button>
      </div>

      <!-- 搜索栏(仅在开源课件标签页显示) -->
      <app-search-bar *ngIf="selectedTabIndex === 1"></app-search-bar>

      <!-- 标签页切换 -->
      <mat-tab-group [(selectedIndex)]="selectedTabIndex">
        <mat-tab label="我的课件">
          <ng-template matTabContent>
            <!-- 筛选栏 -->
            <div class="filter-bar">
              <mat-form-field appearance="outline" class="course-filter">
                <mat-label>选择课程</mat-label>
                <mat-select [(ngModel)]="selectedCourseId" (selectionChange)="loadMaterials()">
                  <mat-option [value]="0">全部课程</mat-option>
                  <mat-option *ngFor="let course of courses" [value]="course.id">
                    {{ course.name }}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <!-- 课件列表 -->
            <div class="material-grid">
              <mat-card *ngFor="let material of materials" class="material-card">
                <mat-card-header>
                  <div mat-card-avatar class="file-icon">
                    <i class="{{ getFileIcon(material.filePath) }}"></i>
                  </div>
                  <mat-card-title>{{ material.name }}</mat-card-title>
                  <mat-card-subtitle>{{ formatFileSize(material.fileSize) }}</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <p class="file-path">{{ material.filePath }}</p>
                  <div class="material-meta">
                    <span *ngIf="material.createdAt">
                      <i class="ri-time-line"></i> {{ formatDate(material.createdAt) }}
                    </span>
                  </div>
                </mat-card-content>
                <mat-card-actions>
                  <button mat-button color="primary"><i class="ri-download-line"></i> 下载</button>
                  <button mat-button color="warn" (click)="deleteMaterial(material.id!)">
                    <i class="ri-delete-bin-line"></i> 删除
                  </button>
                </mat-card-actions>
              </mat-card>

              <!-- 空状态 -->
              <div *ngIf="materials.length === 0" class="empty-state">
                <i class="ri-folder-2-line"></i>
                <p>暂无课件，点击右上角按钮上传第一个课件</p>
              </div>
            </div>
          </ng-template>
        </mat-tab>

        <mat-tab label="🌐 开源课件">
          <ng-template matTabContent>
            <app-open-material-browser></app-open-material-browser>
          </ng-template>
        </mat-tab>
      </mat-tab-group>
    </div>

    <!-- 上传对话框模板 -->
    <ng-template #uploadDialogTemplate>
      <div class="dialog-content">
        <h2>上传课件</h2>
        <form (ngSubmit)="uploadMaterial()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>课件名称</mat-label>
            <input
              matInput
              [(ngModel)]="currentMaterial.name"
              name="name"
              required
              placeholder="请输入课件名称"
            />
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>所属课程</mat-label>
            <mat-select [(ngModel)]="currentMaterial.courseId" name="courseId">
              <mat-option *ngFor="let course of courses" [value]="course.id">
                {{ course.name }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <div class="file-upload-area">
            <i class="ri-file-upload-line"></i>
            <p>点击或拖拽文件到此处</p>
            <input type="file" (change)="onFileSelected($event)" hidden #fileInput />
            <button mat-button type="button" (click)="fileInput.click()">选择文件</button>
            <p *ngIf="selectedFileName" class="selected-file">{{ selectedFileName }}</p>
          </div>

          <div class="dialog-actions">
            <button mat-button type="button" (click)="closeDialog()">取消</button>
            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="!currentMaterial.name || !currentMaterial.courseId || !selectedFile"
            >
              上传
            </button>
          </div>
        </form>
      </div>
    </ng-template>
  `,
  styles: [
    `
      .material-library-container {
        padding: 24px;
        max-width: 1400px;
        margin: 0 auto;
      }

      .toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 2px solid #e0e0e0;
      }

      .toolbar h1 {
        margin: 0;
        font-size: 28px;
        color: #333;
      }

      .toolbar button i {
        margin-right: 8px;
      }

      .filter-bar {
        margin-bottom: 24px;
      }

      .course-filter {
        width: 300px;
      }

      .material-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
      }

      .material-card {
        transition: all 0.3s ease;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      .material-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      }

      .file-icon {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
      }

      mat-card-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }

      mat-card-subtitle {
        color: #667eea;
        font-weight: 500;
      }

      .file-path {
        color: #999;
        font-size: 13px;
        margin: 12px 0;
        word-break: break-all;
      }

      .material-meta {
        display: flex;
        gap: 16px;
        margin-top: 12px;
        font-size: 13px;
        color: #999;
      }

      .material-meta i {
        margin-right: 4px;
      }

      mat-card-actions {
        display: flex;
        gap: 8px;
        padding: 12px 16px;
        border-top: 1px solid #f0f0f0;
      }

      mat-card-actions button i {
        margin-right: 6px;
      }

      .empty-state {
        grid-column: 1 / -1;
        text-align: center;
        padding: 80px 20px;
        color: #999;
      }

      .empty-state i {
        font-size: 64px;
        margin-bottom: 16px;
        opacity: 0.3;
      }

      .empty-state p {
        font-size: 16px;
      }

      .dialog-content {
        padding: 24px;
        min-width: 450px;
      }

      .dialog-content h2 {
        margin: 0 0 24px 0;
        color: #333;
        font-size: 22px;
      }

      .full-width {
        width: 100%;
        margin-bottom: 16px;
      }

      .file-upload-area {
        border: 2px dashed #d0d0d0;
        border-radius: 8px;
        padding: 40px 20px;
        text-align: center;
        margin: 20px 0;
        transition: all 0.3s ease;
      }

      .file-upload-area:hover {
        border-color: #667eea;
        background: #f5f7ff;
      }

      .file-upload-area i {
        font-size: 48px;
        color: #667eea;
        margin-bottom: 12px;
      }

      .file-upload-area p {
        color: #666;
        margin: 8px 0;
      }

      .selected-file {
        color: #667eea;
        font-weight: 500;
        margin-top: 12px;
      }

      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 24px;
      }
    `,
  ],
})
export class MaterialLibraryComponent implements OnInit {
  @ViewChild('uploadDialogTemplate') uploadDialogTemplate!: TemplateRef<unknown>;

  materials: Material[] = [];
  courses: Array<{ id: number; name: string }> = [];
  selectedCourseId = 0;
  currentMaterial: Partial<Material> = {};
  selectedFile: File | null = null;
  selectedFileName = '';
  selectedTabIndex = 0; // 标签页索引: 0=我的课件, 1=开源课件

  constructor(
    private dialog: MatDialog,
    private tauriService: TauriService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    void this.loadCourses();
    void this.loadMaterials();
  }

  async loadCourses(): Promise<void> {
    try {
      const courses = await this.tauriService.getCourses();
      this.courses = courses as Array<{ id: number; name: string }>;
    } catch (error) {
      console.error('Failed to load courses:', error);
      this.snackBar.open('加载课程列表失败', '关闭', { duration: 3000 });
    }
  }

  async loadMaterials(): Promise<void> {
    try {
      const courseId = this.selectedCourseId > 0 ? this.selectedCourseId : 0;
      const materials = await this.tauriService.getMaterials(courseId);
      this.materials = materials as Material[];
    } catch (error) {
      console.error('Failed to load materials:', error);
      this.snackBar.open('加载课件列表失败', '关闭', { duration: 3000 });
    }
  }

  openUploadDialog(): void {
    this.currentMaterial = {};
    this.selectedFile = null;
    this.selectedFileName = '';
    this.dialog.open(this.uploadDialogTemplate, { width: '500px' });
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
      if (!this.currentMaterial.name) {
        this.currentMaterial.name = file.name.replace(/\.[^/.]+$/, '');
      }
    }
  }

  async uploadMaterial(): Promise<void> {
    if (!this.selectedFile || !this.currentMaterial.name || !this.currentMaterial.courseId) {
      this.snackBar.open('请填写完整信息并选择文件', '关闭', { duration: 3000 });
      return;
    }

    try {
      // 这里需要实现文件上传逻辑
      // 由于 Tauri 的文件上传可能需要特殊处理，暂时使用模拟路径
      const filePath = `/uploads/${this.selectedFile.name}`;
      const fileSize = this.selectedFile.size;

      await this.tauriService.uploadMaterial(
        this.currentMaterial.name,
        filePath,
        fileSize,
        this.currentMaterial.courseId
      );

      this.snackBar.open('课件上传成功', '关闭', { duration: 3000 });
      this.closeDialog();
      await this.loadMaterials();
    } catch (error) {
      console.error('Failed to upload material:', error);
      this.snackBar.open('课件上传失败', '关闭', { duration: 3000 });
    }
  }

  async deleteMaterial(id: number): Promise<void> {
    if (!confirm('确定要删除这个课件吗？')) return;

    try {
      await this.tauriService.deleteMaterial(id);
      this.snackBar.open('课件删除成功', '关闭', { duration: 3000 });
      await this.loadMaterials();
    } catch (error) {
      console.error('Failed to delete material:', error);
      this.snackBar.open('课件删除失败', '关闭', { duration: 3000 });
    }
  }

  closeDialog(): void {
    this.dialog.closeAll();
  }

  getFileIcon(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const icons: { [key: string]: string } = {
      pdf: 'ri-file-pdf-line',
      ppt: 'ri-file-ppt-line',
      pptx: 'ri-file-ppt-line',
      doc: 'ri-file-word-line',
      docx: 'ri-file-word-line',
      xls: 'ri-file-excel-line',
      xlsx: 'ri-file-excel-line',
      mp4: 'ri-video-line',
      avi: 'ri-video-line',
      jpg: 'ri-image-line',
      png: 'ri-image-line',
    };
    return icons[ext ?? ''] ?? 'ri-file-line';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
  }
}
