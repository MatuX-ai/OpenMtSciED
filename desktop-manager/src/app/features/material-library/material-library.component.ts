import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';

import { TauriService } from '../../core/services';
import { ShortcutService } from '../../core/services/shortcut.service';
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
    MatCheckboxModule,
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
            <div class="batch-actions" *ngIf="selectedMaterials.length > 0">
              <span class="selected-count">已选择 {{ selectedMaterials.length }} 个课件</span>
              <button mat-button color="warn" (click)="batchDelete()">
                <mat-icon>delete</mat-icon>
                批量删除
              </button>
            </div>
            
            <div class="material-grid">
              <mat-card *ngFor="let material of materials" class="material-card" [class.selected]="isSelected(material.id!)">
                <div class="card-checkbox">
                  <mat-checkbox 
                    [checked]="isSelected(material.id!)" 
                    (change)="toggleSelection(material.id!)"
                    (click)="$event.stopPropagation()">
                  </mat-checkbox>
                </div>
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
                  <button mat-button color="primary" (click)="previewMaterial(material)">
                    <i class="ri-eye-line"></i> 预览
                  </button>
                  <button mat-button color="accent"><i class="ri-download-line"></i> 下载</button>
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

    <!-- 预览对话框模板 -->
    <ng-template #previewDialogTemplate>
      <div class="preview-dialog">
        <div class="preview-header">
          <h3>{{ previewMaterialName }}</h3>
          <button mat-icon-button (click)="closePreview()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        <div class="preview-content">
          <!-- PDF预览 -->
          <iframe *ngIf="previewType === 'pdf'" [src]="previewUrl" class="preview-frame"></iframe>
          
          <!-- 图片预览 -->
          <img *ngIf="previewType === 'image'" [src]="previewUrl" class="preview-image" />
          
          <!-- 视频预览 -->
          <video *ngIf="previewType === 'video'" [src]="previewUrl" controls class="preview-video"></video>
          
          <!-- 不支持的文件类型 -->
          <div *ngIf="previewType === 'unsupported'" class="unsupported-preview">
            <mat-icon class="large-icon">insert_drive_file</mat-icon>
            <p>此文件类型暂不支持预览</p>
            <button mat-raised-button color="primary" (click)="downloadCurrentMaterial()">
              <mat-icon>download</mat-icon>
              下载文件
            </button>
          </div>
        </div>
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
        position: relative;
      }

      .material-card.selected {
        border: 2px solid #667eea;
        background: #f5f7ff;
      }

      .card-checkbox {
        position: absolute;
        top: 12px;
        right: 12px;
        z-index: 10;
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

      .preview-dialog {
        width: 90vw;
        max-width: 1200px;
        height: 85vh;
        display: flex;
        flex-direction: column;
      }

      .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        border-bottom: 1px solid #e0e0e0;
      }

      .preview-header h3 {
        margin: 0;
        font-size: 18px;
        color: #333;
      }

      .preview-content {
        flex: 1;
        overflow: auto;
        padding: 24px;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #f5f5f5;
      }

      .preview-frame {
        width: 100%;
        height: 100%;
        border: none;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .preview-image {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .preview-video {
        max-width: 100%;
        max-height: 100%;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .unsupported-preview {
        text-align: center;
        padding: 40px;
      }

      .large-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #999;
        margin-bottom: 16px;
      }

      .unsupported-preview p {
        color: #666;
        margin: 16px 0;
      }

      .batch-actions {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 12px 16px;
        background: #fff3e0;
        border-radius: 8px;
        margin-bottom: 16px;
        border-left: 4px solid #ff9800;
      }

      .selected-count {
        flex: 1;
        font-weight: 500;
        color: #e65100;
      }
    `,
  ],
})
export class MaterialLibraryComponent implements OnInit {
  @ViewChild('uploadDialogTemplate') uploadDialogTemplate!: TemplateRef<unknown>;
  @ViewChild('previewDialogTemplate') previewDialogTemplate!: TemplateRef<unknown>;

  materials: Material[] = [];
  courses: Array<{ id: number; name: string }> = [];
  selectedCourseId = 0;
  currentMaterial: Partial<Material> = {};
  selectedFile: File | null = null;
  selectedFileName = '';
  selectedTabIndex = 0; // 标签页索引: 0=我的课件, 1=开源课件
  
  // 预览相关
  previewMaterialName = '';
  previewUrl = '';
  previewType: 'pdf' | 'image' | 'video' | 'unsupported' = 'unsupported';
  private previewDialogRef: any;
  
  // 批量操作
  selectedMaterials: number[] = [];

  constructor(
    private dialog: MatDialog,
    private tauriService: TauriService,
    private shortcutService: ShortcutService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    void this.loadCourses();
    void this.loadMaterials();
    this.registerShortcuts();
  }

  /**
   * 注册快捷键
   */
  private registerShortcuts(): void {
    // Ctrl+U - 上传课件
    this.shortcutService.register({
      key: 'u',
      ctrl: true,
      description: '上传课件',
      action: () => this.openUploadDialog()
    });

    // Delete - 批量删除选中
    this.shortcutService.register({
      key: 'Delete',
      description: '批量删除选中课件',
      action: () => {
        if (this.selectedMaterials.length > 0) {
          void this.batchDelete();
        }
      }
    });

    // Ctrl+A - 全选（待实现）
    this.shortcutService.register({
      key: 'a',
      ctrl: true,
      description: '全选课件',
      action: () => this.selectAll()
    });
  }

  selectAll(): void {
    // TODO: 全选所有课件
    this.selectedMaterials = this.materials.map(m => m.id!).filter(id => id !== undefined);
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

  previewMaterial(material: Material): void {
    this.previewMaterialName = material.name;
    const ext = material.filePath.split('.').pop()?.toLowerCase();
    
    // 判断文件类型
    if (ext === 'pdf') {
      this.previewType = 'pdf';
      this.previewUrl = this.getFilePath(material.filePath);
    } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext || '')) {
      this.previewType = 'image';
      this.previewUrl = this.getFilePath(material.filePath);
    } else if (['mp4', 'webm', 'avi', 'mov'].includes(ext || '')) {
      this.previewType = 'video';
      this.previewUrl = this.getFilePath(material.filePath);
    } else {
      this.previewType = 'unsupported';
      this.previewUrl = '';
    }
    
    this.previewDialogRef = this.dialog.open(this.previewDialogTemplate, {
      width: '95vw',
      maxWidth: '1400px',
      height: '90vh',
      panelClass: 'preview-dialog-panel'
    });
  }

  closePreview(): void {
    if (this.previewDialogRef) {
      this.previewDialogRef.close();
      this.previewUrl = '';
    }
  }

  downloadCurrentMaterial(): void {
    // TODO: 实现下载功能
    alert('下载功能开发中...');
  }

  private getFilePath(filePath: string): string {
    // 如果是相对路径，转换为绝对路径
    if (!filePath.startsWith('http') && !filePath.startsWith('file://')) {
      // 在Tauri环境中，使用本地文件协议
      return `file://${filePath}`;
    }
    return filePath;
  }

  // 批量操作相关方法
  isSelected(materialId: number): boolean {
    return this.selectedMaterials.includes(materialId);
  }

  toggleSelection(materialId: number): void {
    const index = this.selectedMaterials.indexOf(materialId);
    if (index > -1) {
      this.selectedMaterials.splice(index, 1);
    } else {
      this.selectedMaterials.push(materialId);
    }
  }

  async batchDelete(): Promise<void> {
    if (this.selectedMaterials.length === 0) return;
    
    if (!confirm(`确定要删除选中的 ${this.selectedMaterials.length} 个课件吗？`)) {
      return;
    }

    try {
      for (const id of this.selectedMaterials) {
        await this.tauriService.deleteMaterial(id);
      }
      
      this.snackBar.open(`成功删除 ${this.selectedMaterials.length} 个课件`, '关闭', { duration: 3000 });
      this.selectedMaterials = [];
      await this.loadMaterials();
    } catch (error) {
      console.error('批量删除失败:', error);
      this.snackBar.open('批量删除失败', '关闭', { duration: 3000 });
    }
  }
}
