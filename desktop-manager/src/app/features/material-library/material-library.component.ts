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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { TauriService } from '../../core/services';
import { ShortcutService } from '../../core/services/shortcut.service';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { ResourceAssociationsComponent } from '../../shared/components/resource-associations/resource-associations.component';

import { OpenMaterialBrowserComponent } from './open-material-browser/open-material-browser.component';

interface Material {
  id?: number;
  name: string;
  filePath: string;
  fileSize: number;
  courseId: number;
  createdAt?: string;
}

interface Course {
  id: number;
  name: string;
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
    MatSnackBarModule,
    OpenMaterialBrowserComponent,
    SearchBarComponent,
    ResourceAssociationsComponent,
    ScrollingModule,
  ],
  template: `
    <div class="material-library-container">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">
            <span class="title-icon">📁</span>
            课件库
          </h1>
          <p class="page-subtitle">管理您的教学课件和学习资料</p>
        </div>
        <button mat-raised-button class="upload-btn" (click)="openUploadDialog()" *ngIf="selectedTabIndex === 0">
          <mat-icon>cloud_upload</mat-icon>
          上传课件
        </button>
      </div>

      <!-- 搜索栏(仅在开源课件标签页显示) -->
      <app-search-bar *ngIf="selectedTabIndex === 1"></app-search-bar>

      <!-- 标签页切换 -->
      <mat-tab-group [(selectedIndex)]="selectedTabIndex" class="modern-tabs">
        <mat-tab label="我的课件">
          <ng-template matTabContent>
            <!-- 筛选栏 -->
            <div class="filter-bar">
              <div class="filter-group">
                <label class="filter-label">
                  <mat-icon>filter_list</mat-icon>
                  选择课程
                </label>
                <mat-form-field appearance="outline" class="course-filter full-width">
                  <mat-select [(ngModel)]="selectedCourseId" (selectionChange)="loadMaterials()">
                    <mat-option [value]="0">全部课程</mat-option>
                    <mat-option *ngFor="let course of courses" [value]="course.id">
                      {{ course.name }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </div>

            <!-- 批量操作栏 -->
            <div class="batch-actions" *ngIf="selectedMaterials.length > 0">
              <span class="selected-count">
                <mat-icon>check_circle</mat-icon>
                已选择 {{ selectedMaterials.length }} 个课件
              </span>
              <button mat-stroked-button class="action-btn btn-danger" (click)="batchDelete()">
                <mat-icon>delete</mat-icon>
                批量删除
              </button>
            </div>
            
            <!-- 课件列表 -->
            <cdk-virtual-scroll-viewport itemSize="180" class="material-viewport">
              <div class="material-grid">
                <mat-card *ngFor="let material of materials" class="material-card" [class.selected]="isSelected(material.id!)">
                  <div class="card-checkbox">
                    <mat-checkbox 
                      [checked]="isSelected(material.id!)" 
                      (change)="toggleSelection(material.id!)"
                      (click)="$event.stopPropagation()">
                    </mat-checkbox>
                  </div>
                  <div class="card-gradient"></div>
                  <mat-card-header>
                    <div class="file-icon">
                      <mat-icon>{{ getFileIcon(material.filePath) }}</mat-icon>
                    </div>
                    <div class="header-info">
                      <mat-card-title>{{ material.name }}</mat-card-title>
                      <mat-card-subtitle>
                        <mat-icon>storage</mat-icon>
                        {{ formatFileSize(material.fileSize) }}
                      </mat-card-subtitle>
                    </div>
                  </mat-card-header>
                  <mat-card-content>
                    <p class="file-path">{{ material.filePath }}</p>
                    <div class="material-meta" *ngIf="material.createdAt">
                      <mat-icon>schedule</mat-icon>
                      <span>{{ formatDate(material.createdAt) }}</span>
                    </div>
                  </mat-card-content>
                  <mat-card-actions class="card-actions">
                    <button mat-stroked-button class="action-btn btn-preview" (click)="previewMaterial(material)">
                      <mat-icon>visibility</mat-icon>
                      预览
                    </button>
                    <button mat-stroked-button class="action-btn btn-hardware" (click)="viewRequiredHardware(material)">
                      <mat-icon>build</mat-icon>
                      硬件
                    </button>
                    <button mat-stroked-button class="action-btn btn-delete" (click)="deleteMaterial(material.id!)">
                      <mat-icon>delete</mat-icon>
                      删除
                    </button>
                  </mat-card-actions>
                </mat-card>

                <!-- 空状态 -->
                <div *ngIf="materials.length === 0" class="empty-state">
                  <div class="empty-icon">
                    <mat-icon>folder_open</mat-icon>
                  </div>
                  <h3>暂无课件</h3>
                  <p>点击右上角"上传课件"按钮添加您的第一个课件</p>
                  <button mat-raised-button class="upload-btn" (click)="openUploadDialog()">
                    <mat-icon>cloud_upload</mat-icon>
                    上传课件
                  </button>
                </div>
              </div>
            </cdk-virtual-scroll-viewport>
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
      <div class="modern-dialog">
        <div class="dialog-header">
          <div class="header-icon">
            <mat-icon>cloud_upload</mat-icon>
          </div>
          <h2>上传课件</h2>
          <p>添加新的教学课件到课程中</p>
        </div>
        
        <div class="dialog-body">
          <form (ngSubmit)="uploadMaterial()">
            <div class="form-group">
              <label class="form-label">
                <mat-icon>label</mat-icon>
                课件名称
              </label>
              <input 
                matInput 
                [(ngModel)]="currentMaterial.name" 
                name="name" 
                required 
                placeholder="请输入课件名称"
                class="modern-input"
              />
            </div>

            <div class="form-group">
              <label class="form-label">
                <mat-icon>school</mat-icon>
                所属课程
              </label>
              <mat-form-field appearance="outline" class="full-width-select">
                <mat-select [(ngModel)]="currentMaterial.courseId" name="courseId">
                  <mat-option *ngFor="let course of courses" [value]="course.id">
                    {{ course.name }}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="form-group">
              <label class="form-label">
                <mat-icon>attach_file</mat-icon>
                选择文件
              </label>
              <div class="file-upload-area" (click)="fileInput.click()">
                <mat-icon class="upload-icon">upload_file</mat-icon>
                <p class="upload-text">点击或拖拽文件到此处</p>
                <p class="upload-hint">支持 PDF、PPT、DOC、图片、视频等格式</p>
                <input type="file" (change)="onFileSelected($event)" hidden #fileInput />
                <div class="selected-file" *ngIf="selectedFileName">
                  <mat-icon>insert_drive_file</mat-icon>
                  <span>{{ selectedFileName }}</span>
                </div>
              </div>
            </div>

            <div class="dialog-footer">
              <button mat-button type="button" (click)="closeDialog()" class="cancel-btn">
                取消
              </button>
              <button 
                mat-raised-button 
                type="submit" 
                [disabled]="!currentMaterial.name || !currentMaterial.courseId || !selectedFile"
                class="submit-btn"
              >
                <mat-icon>cloud_upload</mat-icon>
                上传课件
              </button>
            </div>
          </form>
        </div>
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

    <!-- 所需硬件对话框模板 -->
    <ng-template #hardwareDialogTemplate>
      <div class="hardware-dialog-content">
        <h2>🔧 所需硬件</h2>
        <p class="material-name">{{ selectedMaterial?.name }}</p>
        <app-resource-associations 
          [materialId]="selectedMaterial?.id?.toString() || ''"
          [showMaterials]="false"
          [showHardware]="true">
        </app-resource-associations>
        <div class="dialog-actions">
          <button mat-button (click)="closeHardwareDialog()">关闭</button>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    .material-library-container {
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

    .upload-btn {
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

    /* 现代标签页 */
    .modern-tabs {
      margin-top: 24px;

      ::ng-deep .mat-mdc-tab-group {
        border-radius: 12px;
        overflow: hidden;
      }
    }

    /* 筛选栏 */
    .filter-bar {
      margin-bottom: 24px;
    }

    .filter-group {
      max-width: 100%;
    }

    .filter-label {
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

    .course-filter {
      width: 100%;
      max-width: 100%;
    }

    .full-width-select {
      width: 100%;

      ::ng-deep .mat-mdc-form-field-flex {
        border-radius: 12px;
      }
    }

    /* 批量操作栏 */
    .batch-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: linear-gradient(135deg, #fff5f5 0%, #ffe0e0 100%);
      border: 1px solid #ffcdd2;
      border-radius: 12px;
      margin-bottom: 24px;
    }

    .selected-count {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #d32f2f;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .action-btn {
      border-radius: 10px;
      font-weight: 500;
      transition: all 0.2s ease;

      mat-icon {
        margin-right: 6px;
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      &.btn-danger {
        border-color: #d32f2f;
        color: #d32f2f;

        &:hover {
          background: rgba(211, 47, 47, 0.08);
        }
      }

      &.btn-preview {
        border-color: #667eea;
        color: #667eea;

        &:hover {
          background: rgba(102, 126, 234, 0.08);
        }
      }

      &.btn-hardware {
        border-color: #43e97b;
        color: #43e97b;

        &:hover {
          background: rgba(67, 233, 123, 0.08);
        }
      }

      &.btn-delete {
        border-color: #ff6b6b;
        color: #ff6b6b;

        &:hover {
          background: rgba(255, 107, 107, 0.08);
        }
      }
    }

    /* 课件网格 */
    .material-viewport {
      height: calc(100vh - 380px);
      min-height: 400px;
    }

    .material-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
      padding: 8px 0;
    }

    .material-card {
      position: relative;
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 2px solid #e9ecef;
      background: white;

      &:hover {
        transform: translateY(-6px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
        border-color: #667eea;

        .card-gradient {
          opacity: 1;
        }
      }

      &.selected {
        border-color: #667eea;
        background: rgba(102, 126, 234, 0.02);
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

    .card-checkbox {
      position: absolute;
      top: 16px;
      right: 16px;
      z-index: 10;
    }

    mat-card-header {
      padding: 24px 24px 16px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    .file-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      mat-icon {
        color: white;
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .header-info {
      flex: 1;
      min-width: 0;
    }

    mat-card-title {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a2e;
      margin: 0 0 8px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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

    .file-path {
      font-size: 13px;
      color: #495057;
      margin: 0 0 12px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .material-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #6c757d;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }

    .card-actions {
      padding: 16px 24px 24px;
      display: flex;
      gap: 8px;
      border-top: 1px solid #f0f0f0;

      .action-btn {
        flex: 1;
        font-size: 13px;
        padding: 8px 12px;
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

    .modern-input {
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

    .file-upload-area {
      border: 2px dashed #e9ecef;
      border-radius: 12px;
      padding: 32px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #f8f9fa;

      &:hover {
        border-color: #667eea;
        background: rgba(102, 126, 234, 0.02);
      }

      .upload-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #667eea;
        margin-bottom: 12px;
      }

      .upload-text {
        font-size: 15px;
        color: #1a1a2e;
        font-weight: 500;
        margin: 0 0 4px 0;
      }

      .upload-hint {
        font-size: 13px;
        color: #6c757d;
        margin: 0 0 16px 0;
      }

      .selected-file {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: white;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        font-size: 14px;
        color: #1a1a2e;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
          color: #667eea;
        }
      }
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

    /* 预览对话框 */
    .preview-dialog {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      max-width: 90vw;
      max-height: 90vh;
    }

    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #e9ecef;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #1a1a2e;
      }
    }

    .preview-content {
      padding: 24px;
      max-height: 70vh;
      overflow: auto;
    }

    .preview-frame {
      width: 100%;
      height: 70vh;
      border: none;
      border-radius: 8px;
    }

    .preview-image {
      max-width: 100%;
      max-height: 70vh;
      border-radius: 8px;
    }

    .preview-video {
      width: 100%;
      max-height: 70vh;
      border-radius: 8px;
    }

    .unsupported-preview {
      text-align: center;
      padding: 40px;

      .large-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #6c757d;
        margin-bottom: 16px;
      }

      p {
        font-size: 16px;
        color: #6c757d;
        margin: 0 0 24px 0;
      }
    }

    /* 硬件对话框 */
    .hardware-dialog-content {
      padding: 24px;
      min-width: 500px;

      h2 {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 600;
        color: #1a1a2e;
      }

      .material-name {
        font-size: 14px;
        color: #6c757d;
        margin: 0 0 24px 0;
      }

      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px solid #e9ecef;
      }
    }

    /* 响应式 */
    @media (max-width: 768px) {
      .material-library-container {
        padding: 16px;
      }

      .page-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .page-title {
        font-size: 24px;
      }

      .material-grid {
        grid-template-columns: 1fr;
      }

      .card-actions {
        flex-direction: column;
      }
    }
  `]
})
export class MaterialLibraryComponent implements OnInit {
  @ViewChild('uploadDialogTemplate') uploadDialogTemplate!: TemplateRef<unknown>;
  @ViewChild('previewDialogTemplate') previewDialogTemplate!: TemplateRef<unknown>;
  @ViewChild('hardwareDialogTemplate') hardwareDialogTemplate!: TemplateRef<unknown>;
  
  materials: Material[] = [];
  courses: Course[] = [];
  selectedCourseId: number = 0;
  selectedTabIndex: number = 0;
  selectedMaterials: number[] = [];
  
  currentMaterial: Partial<Material> = {};
  selectedFile: File | null = null;
  selectedFileName: string = '';
  
  previewMaterialName: string = '';
  previewUrl: string = '';
  previewType: string = '';
  selectedMaterial: Material | null = null;

  constructor(
    private tauriService: TauriService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadCourses();
    await this.loadMaterials();
  }

  async loadCourses(): Promise<void> {
    try {
      this.courses = await this.tauriService.getCourses() as Course[];
    } catch (error) {
      console.error('加载课程失败:', error);
    }
  }

  async loadMaterials(): Promise<void> {
    try {
      this.materials = await this.tauriService.getMaterials(this.selectedCourseId) as Material[];
    } catch (error) {
      console.error('加载课件失败:', error);
    }
  }

  openUploadDialog(): void {
    this.currentMaterial = { name: '', courseId: 0 };
    this.selectedFile = null;
    this.selectedFileName = '';
    this.dialog.open(this.uploadDialogTemplate, { 
      width: '600px',
      maxWidth: '90vw'
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
    }
  }

  async uploadMaterial(): Promise<void> {
    try {
      if (!this.selectedFile || !this.currentMaterial.name || !this.currentMaterial.courseId) {
        return;
      }

      // TODO: 实际文件上传逻辑
      // await this.tauriService.uploadMaterial(
      //   this.currentMaterial.name,
      //   this.selectedFile.path,
      //   this.selectedFile.size,
      //   this.currentMaterial.courseId
      // );
      
      this.closeDialog();
      await this.loadMaterials();
      this.snackBar.open('课件上传成功', '关闭', { duration: 3000 });
    } catch (error) {
      console.error('上传课件失败:', error);
      this.snackBar.open('上传失败', '关闭', { duration: 3000 });
    }
  }

  closeDialog(): void {
    this.dialog.closeAll();
  }

  toggleSelection(materialId: number): void {
    const index = this.selectedMaterials.indexOf(materialId);
    if (index > -1) {
      this.selectedMaterials.splice(index, 1);
    } else {
      this.selectedMaterials.push(materialId);
    }
  }

  isSelected(materialId: number): boolean {
    return this.selectedMaterials.includes(materialId);
  }

  async batchDelete(): Promise<void> {
    if (!confirm(`确定要删除选中的 ${this.selectedMaterials.length} 个课件吗？`)) {
      return;
    }

    try {
      for (const id of this.selectedMaterials) {
        await this.tauriService.deleteMaterial(id);
      }
      this.selectedMaterials = [];
      await this.loadMaterials();
      this.snackBar.open('批量删除成功', '关闭', { duration: 3000 });
    } catch (error) {
      console.error('批量删除失败:', error);
      this.snackBar.open('批量删除失败', '关闭', { duration: 3000 });
    }
  }

  async deleteMaterial(id: number): Promise<void> {
    if (!confirm('确定要删除这个课件吗？')) {
      return;
    }

    try {
      await this.tauriService.deleteMaterial(id);
      await this.loadMaterials();
      this.snackBar.open('课件已删除', '关闭', { duration: 3000 });
    } catch (error) {
      console.error('删除课件失败:', error);
      this.snackBar.open('删除失败', '关闭', { duration: 3000 });
    }
  }

  previewMaterial(material: Material): void {
    this.selectedMaterial = material;
    this.previewMaterialName = material.name;
    
    // 根据文件类型确定预览方式
    const ext = material.filePath.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(ext || '')) {
      this.previewType = 'pdf';
    } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext || '')) {
      this.previewType = 'image';
    } else if (['mp4', 'webm', 'ogg'].includes(ext || '')) {
      this.previewType = 'video';
    } else {
      this.previewType = 'unsupported';
    }

    // TODO: 生成实际的预览URL
    this.previewUrl = material.filePath;
    
    this.dialog.open(this.previewDialogTemplate, { 
      width: '90vw',
      maxWidth: '1200px',
      maxHeight: '90vh'
    });
  }

  closePreview(): void {
    this.dialog.closeAll();
  }

  downloadCurrentMaterial(): void {
    // TODO: 实现下载功能
    this.snackBar.open('下载功能开发中', '关闭', { duration: 3000 });
  }

  viewRequiredHardware(material: Material): void {
    this.selectedMaterial = material;
    this.dialog.open(this.hardwareDialogTemplate, { 
      width: '700px',
      maxWidth: '90vw'
    });
  }

  closeHardwareDialog(): void {
    this.dialog.closeAll();
  }

  getFileIcon(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const iconMap: { [key: string]: string } = {
      'pdf': 'picture_as_pdf',
      'doc': 'description',
      'docx': 'description',
      'ppt': 'slideshow',
      'pptx': 'slideshow',
      'xls': 'table_chart',
      'xlsx': 'table_chart',
      'jpg': 'image',
      'jpeg': 'image',
      'png': 'image',
      'gif': 'image',
      'mp4': 'videocam',
      'webm': 'videocam',
    };
    return iconMap[ext || ''] || 'insert_drive_file';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
