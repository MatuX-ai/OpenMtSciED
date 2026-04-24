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
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

import { TauriService } from '../../core/services';
import { CategoryService, Category } from '../../core/services/category.service';
import { SearchService } from '../../core/services/search.service';
import { ShortcutService } from '../../core/services/shortcut.service';
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
    MatChipsModule,
    MatIconModule,
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
            <!-- 分类筛选 -->
            <div class="category-filter" *ngIf="categories.length > 0">
              <mat-chip-listbox>
                <mat-chip-option [value]="null" [selected]="selectedCategoryId === null" (click)="filterByCategory(null)">
                  全部
                </mat-chip-option>
                <mat-chip-option *ngFor="let cat of categories" [value]="cat.id" [selected]="selectedCategoryId === cat.id" (click)="filterByCategory(cat.id)">
                  {{ cat.name }}
                </mat-chip-option>
              </mat-chip-listbox>
            </div>
            
            <!-- 教程列表 -->
            <div class="tutorial-grid">
              <mat-card *ngFor="let tutorial of filteredTutorials" class="tutorial-card">
                <div class="card-category-bar" [style.background-color]="getCategoryColor(tutorial.category)"></div>
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
              <mat-option *ngFor="let cat of categories" [value]="cat.name">
                <span [style.color]="cat.color">●</span> {{ cat.name }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-stroked-button color="primary" (click)="openCategoryManager()" type="button" class="manage-categories-btn">
            <mat-icon>folder</mat-icon>
            管理分类
          </button>

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

      .category-filter {
        margin-bottom: 20px;
        padding: 12px 0;
      }

      .card-category-bar {
        height: 4px;
        width: 100%;
        border-radius: 12px 12px 0 0;
      }

      .manage-categories-btn {
        width: 100%;
        margin-bottom: 16px;
      }
    `,
  ],
})
export class TutorialLibraryComponent implements OnInit {
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<unknown>;

  tutorials: Tutorial[] = [];
  categories: Category[] = [];
  filteredTutorials: Tutorial[] = [];
  selectedCategoryId: number | null = null;
  currentTutorial: Tutorial = { name: '', description: '', category: '' };
  isEditMode = false;
  editingTutorialId?: number;
  selectedTabIndex = 0; // 标签页索引: 0=我的教程, 1=开源资源

  constructor(
    private tauriService: TauriService,
    private categoryService: CategoryService,
    private searchService: SearchService,
    private shortcutService: ShortcutService,
    private dialog: MatDialog
  ) {}

  async ngOnInit(): Promise<void> {
    await Promise.all([this.loadTutorials(), this.loadCategories()]);
    this.registerShortcuts();
  }

  /**
   * 注册快捷键
   */
  private registerShortcuts(): void {
    // Ctrl+N - 新建教程
    this.shortcutService.register({
      key: 'n',
      ctrl: true,
      description: '新建教程',
      action: () => this.openCreateDialog()
    });

    // Ctrl+F - 聚焦搜索框
    this.shortcutService.register({
      key: 'f',
      ctrl: true,
      description: '搜索教程',
      action: () => this.focusSearch()
    });

    // Delete - 删除选中（待实现）
    this.shortcutService.register({
      key: 'Delete',
      description: '删除选中项',
      action: () => this.deleteSelected()
    });
  }

  focusSearch(): void {
    // TODO: 聚焦到搜索框
    console.log('聚焦搜索框');
  }

  deleteSelected(): void {
    // TODO: 删除选中的教程
    console.log('删除选中项');
  }

  async loadCategories(): Promise<void> {
    try {
      this.categories = await this.categoryService.getCategories();
      // 如果没有分类，创建默认分类
      if (this.categories.length === 0) {
        const defaultCategories = [
          { name: '物理', color: '#3b82f6', icon: 'science', sort_order: 1 },
          { name: '化学', color: '#10b981', icon: 'science', sort_order: 2 },
          { name: '生物', color: '#f59e0b', icon: 'science', sort_order: 3 },
          { name: '数学', color: '#ef4444', icon: 'calculate', sort_order: 4 },
          { name: '计算机', color: '#8b5cf6', icon: 'computer', sort_order: 5 },
        ];
        for (const cat of defaultCategories) {
          await this.categoryService.createCategory(cat);
        }
        this.categories = await this.categoryService.getCategories();
      }
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  }

  async loadTutorials(): Promise<void> {
    try {
      const result = await this.tauriService.getCourses();
      this.tutorials = (Array.isArray(result) ? result : []) as Tutorial[];
      this.filterByCategory(this.selectedCategoryId);
    } catch (error) {
      console.error('加载教程失败:', error);
      // 使用模拟数据
      this.tutorials = [
        {
          id: 1,
          name: '高中物理基础',
          description: '力学、热学、电磁学等基础知识',
          category: '物理',
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          name: '化学反应原理',
          description: '化学反应速率、平衡、电化学等内容',
          category: '化学',
          createdAt: new Date().toISOString(),
        },
      ];
      this.filterByCategory(this.selectedCategoryId);
    }
  }

  filterByCategory(categoryId: number | null): void {
    this.selectedCategoryId = categoryId;
    
    // 更新搜索服务
    this.searchService.updateFilters({ categoryId });
    
    if (categoryId === null) {
      this.filteredTutorials = [...this.tutorials];
    } else {
      const category = this.categories.find(c => c.id === categoryId);
      if (category) {
        this.filteredTutorials = this.tutorials.filter(t => t.category === category.name);
      } else {
        this.filteredTutorials = [...this.tutorials];
      }
    }
  }

  getCategoryColor(categoryName: string): string {
    const category = this.categories.find(c => c.name === categoryName);
    return category?.color || '#6366f1';
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
      // 查找分类ID
      const category = this.categories.find(c => c.name === this.currentTutorial.category);
      const categoryId = category?.id || null;

      if (this.isEditMode && this.editingTutorialId) {
        await this.tauriService.updateCourse(
          this.editingTutorialId,
          this.currentTutorial.name,
          this.currentTutorial.description,
          this.currentTutorial.category,
          categoryId
        );
      } else {
        await this.tauriService.createCourse(
          this.currentTutorial.name,
          this.currentTutorial.description,
          this.currentTutorial.category,
          categoryId
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
    return category || '未分类';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
  }

  openCategoryManager(): void {
    // 简单版：使用浏览器原生prompt
    const action = prompt('选择操作:\n1 - 创建分类\n2 - 删除分类\n3 - 查看所有分类\n输入数字：');
    
    if (action === '1') {
      const name = prompt('分类名称：');
      if (name) {
        const color = prompt('分类颜色（十六进制，如#3b82f6）：') || '#6366f1';
        this.categoryService.createCategory({ name, color })
          .then(() => {
            this.loadCategories();
            alert('分类创建成功！');
          })
          .catch(err => alert('创建失败：' + err));
      }
    } else if (action === '2') {
      const idStr = prompt('要删除的分类ID：');
      if (idStr) {
        const id = parseInt(idStr);
        if (confirm('确定要删除这个分类吗？')) {
          this.categoryService.deleteCategory(id)
            .then(() => {
              this.loadCategories();
              this.loadTutorials();
              alert('分类删除成功！');
            })
            .catch(err => alert('删除失败：' + err));
        }
      }
    } else if (action === '3') {
      const list = this.categories.map(c => `${c.id}: ${c.name} (${c.color})`).join('\n');
      alert('所有分类:\n' + list);
    }
  }
}

// 颜色配置
const CATEGORY_COLORS = [
  '#3b82f6', // 蓝
  '#10b981', // 绿
  '#f59e0b', // 黄
  '#ef4444', // 红
  '#8b5cf6', // 紫
  '#ec4899', // 粉
  '#06b6d4', // 青
  '#f97316', // 橙
];

export { CATEGORY_COLORS };
