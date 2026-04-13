import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';

import { TauriService } from '../../core/services';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';

import { ResourceBrowserComponent } from './resource-browser/resource-browser.component';

interface Tutorial {
  id?: number;
  name: string;
  description: string;
  category: string;
  createdAt?: string;
}

@Component({
  selector: 'app-tutorial-library',
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
    MatTabsModule,
    ResourceBrowserComponent,
    SearchBarComponent,
  ],
  template: `
    <div class="tutorial-library-container">
      <!-- 顶部操作栏 -->
      <div class="toolbar">
        <h1>📚 教程库</h1>
        <button
          mat-raised-button
          color="primary"
          (click)="openCreateDialog()"
          *ngIf="selectedTabIndex === 0"
        >
          <i class="ri-add-line"></i> 新建教程
        </button>
      </div>

      <!-- 搜索栏(仅在开源资源标签页显示) -->
      <app-search-bar *ngIf="selectedTabIndex === 1"></app-search-bar>

      <!-- 标签页切换 -->
      <mat-tab-group [(selectedIndex)]="selectedTabIndex">
        <mat-tab label="我的教程">
          <ng-template matTabContent>
            <!-- 教程列表 -->
            <div class="tutorial-grid">
              <mat-card *ngFor="let tutorial of tutorials" class="tutorial-card">
                <mat-card-header>
                  <mat-card-title>{{ tutorial.name }}</mat-card-title>
                  <mat-card-subtitle>{{ getCategoryName(tutorial.category) }}</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <p>{{ tutorial.description }}</p>
                  <div class="tutorial-meta">
                    <span *ngIf="tutorial.createdAt">
                      <i class="ri-time-line"></i> {{ formatDate(tutorial.createdAt) }}
                    </span>
                  </div>
                </mat-card-content>
                <mat-card-actions>
                  <button mat-button color="primary" (click)="editTutorial(tutorial)">
                    <i class="ri-edit-line"></i> 编辑
                  </button>
                  <button mat-button color="warn" (click)="deleteTutorial(tutorial.id!)">
                    <i class="ri-delete-bin-line"></i> 删除
                  </button>
                </mat-card-actions>
              </mat-card>

              <!-- 空状态 -->
              <div *ngIf="tutorials.length === 0" class="empty-state">
                <i class="ri-book-open-line"></i>
                <p>暂无教程，点击右上角按钮创建第一个教程</p>
              </div>
            </div>
          </ng-template>
        </mat-tab>

        <mat-tab label="🌐 开源资源">
          <ng-template matTabContent>
            <app-resource-browser></app-resource-browser>
          </ng-template>
        </mat-tab>
      </mat-tab-group>
    </div>

    <!-- 创建/编辑对话框模板 -->
    <ng-template #dialogTemplate>
      <div class="dialog-content">
        <h2>{{ isEditMode ? '编辑教程' : '新建教程' }}</h2>
        <form (ngSubmit)="saveTutorial()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>教程名称</mat-label>
            <input
              matInput
              [(ngModel)]="currentTutorial.name"
              name="name"
              required
              placeholder="请输入教程名称"
            />
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>教程描述</mat-label>
            <textarea
              matInput
              [(ngModel)]="currentTutorial.description"
              name="description"
              rows="3"
              placeholder="请输入教程描述"
            ></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>教程分类</mat-label>
            <mat-select [(ngModel)]="currentTutorial.category" name="category">
              <mat-option value="physics">物理</mat-option>
              <mat-option value="chemistry">化学</mat-option>
              <mat-option value="biology">生物</mat-option>
              <mat-option value="math">数学</mat-option>
              <mat-option value="computer">计算机</mat-option>
              <mat-option value="other">其他</mat-option>
            </mat-select>
          </mat-form-field>

          <div class="dialog-actions">
            <button mat-button type="button" (click)="closeDialog()">取消</button>
            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="!currentTutorial.name || !currentTutorial.category"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </ng-template>
  `,
  styles: [
    `
      .tutorial-library-container {
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

      .tutorial-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 20px;
      }

      .tutorial-card {
        transition: all 0.3s ease;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      .tutorial-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      }

      mat-card-header {
        margin-bottom: 12px;
      }

      mat-card-title {
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }

      mat-card-subtitle {
        color: #667eea;
        font-weight: 500;
      }

      mat-card-content p {
        color: #666;
        line-height: 1.6;
        margin: 12px 0;
      }

      .tutorial-meta {
        display: flex;
        gap: 16px;
        margin-top: 12px;
        font-size: 13px;
        color: #999;
      }

      .tutorial-meta i {
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
        min-width: 400px;
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

      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 24px;
      }
    `,
  ],
})
export class TutorialLibraryComponent implements OnInit {
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<unknown>;

  tutorials: Tutorial[] = [];
  currentTutorial: Tutorial = { name: '', description: '', category: '' };
  isEditMode = false;
  editingTutorialId?: number;
  selectedTabIndex = 0; // 标签页索引: 0=我的教程, 1=开源资源

  constructor(
    private tauriService: TauriService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    void this.loadTutorials();
  }

  async loadTutorials(): Promise<void> {
    try {
      const result = await this.tauriService.getCourses();
      this.tutorials = (Array.isArray(result) ? result : []) as Tutorial[];
    } catch (error) {
      console.error('加载教程失败:', error);
      // 使用模拟数据
      this.tutorials = [
        {
          id: 1,
          name: '高中物理基础',
          description: '力学、热学、电磁学等基础知识',
          category: 'physics',
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          name: '化学反应原理',
          description: '化学反应速率、平衡、电化学等内容',
          category: 'chemistry',
          createdAt: new Date().toISOString(),
        },
      ];
    }
  }

  openCreateDialog(): void {
    this.isEditMode = false;
    this.currentTutorial = { name: '', description: '', category: '' };
    this.dialog.open(this.dialogTemplate, { width: '500px' });
  }

  editTutorial(tutorial: Tutorial): void {
    this.isEditMode = true;
    this.editingTutorialId = tutorial.id;
    this.currentTutorial = { ...tutorial };
    this.dialog.open(this.dialogTemplate, { width: '500px' });
  }

  async saveTutorial(): Promise<void> {
    try {
      if (this.isEditMode && this.editingTutorialId) {
        await this.tauriService.updateCourse(
          this.editingTutorialId,
          this.currentTutorial.name,
          this.currentTutorial.description,
          this.currentTutorial.category
        );
      } else {
        await this.tauriService.createCourse(
          this.currentTutorial.name,
          this.currentTutorial.description,
          this.currentTutorial.category
        );
      }
      this.closeDialog();
      void this.loadTutorials();
    } catch (error) {
      console.error('保存教程失败:', error);
      alert('保存失败，请重试');
    }
  }

  async deleteTutorial(id: number): Promise<void> {
    if (!confirm('确定要删除这个教程吗？')) return;

    try {
      await this.tauriService.deleteCourse(id);
      void this.loadTutorials();
    } catch (error) {
      console.error('删除教程失败:', error);
      alert('删除失败，请重试');
    }
  }

  closeDialog(): void {
    this.dialog.closeAll();
  }

  getCategoryName(category: string): string {
    const categories: { [key: string]: string } = {
      physics: '物理',
      chemistry: '化学',
      biology: '生物',
      math: '数学',
      computer: '计算机',
      other: '其他',
    };
    return categories[category] || category;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
  }
}
