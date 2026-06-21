import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ResourceTreeNode } from '../../models/resource-tree.models';
import { ResourceTreeService } from '../../core/services/resource-tree.service';
import { TauriService } from '../../core/services/tauri.service';
import { ResourceTreePanelComponent } from './resource-tree-panel/resource-tree-panel.component';
import { ResourceDetailPanelComponent } from './resource-detail-panel/resource-detail-panel.component';
import {
  MaterialUploadDialogComponent,
  MaterialUploadDialogData,
} from './material-upload-dialog.component';

interface EditTutorialForm {
  name: string;
  description: string;
  category: string;
}

@Component({
  selector: 'app-unified-resource-browser',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ResourceTreePanelComponent,
    ResourceDetailPanelComponent,
  ],
  template: `
    <div class="unified-resource-browser">
      <div class="browser-layout">
        <!-- 左侧树面板 -->
        <div class="tree-panel-container">
          <app-resource-tree-panel
            [treeData]="treeRoot"
            [selectedNodeId]="selectedNode?.id || null"
            [searchKeyword]="searchKeyword"
            (nodeSelect)="onNodeSelect($event)"
            (nodeToggle)="onNodeToggle($event)"
            (searchChange)="onSearchChange($event)"
            (refresh)="refreshTree()"
          >
          </app-resource-tree-panel>

          <!-- 新建教程按钮（固定在底部） -->
          <div class="tree-footer">
            <button mat-raised-button color="primary" class="create-btn" (click)="openCreateDialog()">
              <i class="ri-add-line"></i>
              新建教程
            </button>
          </div>
        </div>

        <!-- 右侧详情面板 -->
        <div class="detail-panel-container">
          <app-resource-detail-panel
            [node]="selectedNode"
            (onEdit)="openEditDialog($event)"
            (onDelete)="confirmDelete($event)"
            (onUploadMaterial)="onUploadMaterial($event)"
            (onPreview)="onPreviewMaterial($event)"
            (onDownload)="onDownloadMaterial($event)"
            (onMaterialSelectEvent)="onSelectTreeNode($event)"
          >
          </app-resource-detail-panel>
        </div>
      </div>
    </div>

    <!-- 创建/编辑教程对话框 -->
    <ng-template #dialogTemplate>
      <div class="dialog-content">
        <h2>{{ isEditMode ? '编辑教程' : '新建教程' }}</h2>
        <form (ngSubmit)="saveTutorial()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>教程名称</mat-label>
            <input
              matInput
              [(ngModel)]="editForm.name"
              name="name"
              required
              placeholder="请输入教程名称"
            />
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>教程描述</mat-label>
            <textarea
              matInput
              [(ngModel)]="editForm.description"
              name="description"
              rows="3"
              placeholder="请输入教程描述"
            ></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>教程分类</mat-label>
            <mat-select [(ngModel)]="editForm.category" name="category">
              <mat-option value="编程开发">编程开发</mat-option>
              <mat-option value="机器人">机器人</mat-option>
              <mat-option value="电子制作">电子制作</mat-option>
              <mat-option value="人工智能">人工智能</mat-option>
              <mat-option value="物联网">物联网</mat-option>
              <mat-option value="3D打印">3D打印</mat-option>
              <mat-option value="创客项目">创客项目</mat-option>
              <mat-option value="科学探索">科学探索</mat-option>
            </mat-select>
          </mat-form-field>

          <div class="dialog-actions">
            <button mat-button type="button" (click)="closeDialog()">取消</button>
            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="!editForm.name || !editForm.category"
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
      .unified-resource-browser {
        height: 100%;
        overflow: hidden;
      }

      .browser-layout {
        display: flex;
        height: 100%;
      }

      .tree-panel-container {
        width: 360px;
        min-width: 300px;
        border-right: 1px solid #e0e0e0;
        display: flex;
        flex-direction: column;
        background: #fff;
        position: relative;
      }

      .tree-footer {
        padding: 12px 16px;
        border-top: 1px solid #f0f0f0;
      }

      .create-btn {
        width: 100%;
        border-radius: 8px;
      }

      .create-btn i {
        margin-right: 6px;
      }

      .detail-panel-container {
        flex: 1;
        overflow: hidden;
        background: #f5f7fa;
      }

      .dialog-content {
        padding: 24px;
        min-width: 420px;
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
export class UnifiedResourceBrowserComponent implements OnInit {
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<unknown>;

  treeRoot: ResourceTreeNode | null = null;
  selectedNode: ResourceTreeNode | null = null;
  searchKeyword = '';

  // 编辑表单
  isEditMode = false;
  editingTutorialId: number | null = null;
  editForm: EditTutorialForm = { name: '', description: '', category: '' };

  constructor(
    private treeService: ResourceTreeService,
    private tauriService: TauriService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.refreshTree();
    await this.applyDeepLinkFromQuery();
  }

  async refreshTree(): Promise<void> {
    this.treeRoot = await this.treeService.buildTree();
    this.selectedNode = null;
  }

  async onNodeSelect(node: ResourceTreeNode): Promise<void> {
    this.selectedNode = node;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { nodeId: node.id },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  async onNodeToggle(node: ResourceTreeNode): Promise<void> {
    if (node.isLoading) return;

    // 如果还没有加载子节点，惰性加载
    if (!node.children && this.shouldLazyLoad(node)) {
      node.isLoading = true;
      try {
        const children = await this.lazyLoadChildren(node);
        node.children = children;
        node.isExpanded = true;
      } catch (error) {
        console.error('加载子节点失败:', error);
        node.children = [];
      } finally {
        node.isLoading = false;
      }
    } else {
      node.isExpanded = !node.isExpanded;
    }
  }

  async onSearchChange(keyword: string): Promise<void> {
    this.searchKeyword = keyword;
    if (!this.treeRoot) return;

    if (!keyword.trim()) {
      // 清空搜索：重置树
      this.treeRoot = await this.treeService.buildTree();
      return;
    }

    const filtered = await this.treeService.searchTree(this.treeRoot, keyword);
    this.treeRoot = filtered;
  }

  onSelectTreeNode(node: ResourceTreeNode): void {
    this.selectedNode = node;
  }

  // ─── CRUD 操作 ───

  openCreateDialog(): void {
    this.isEditMode = false;
    this.editingTutorialId = null;
    this.editForm = { name: '', description: '', category: '' };
    this.dialog.open(this.dialogTemplate, { width: '500px' });
  }

  openEditDialog(node: ResourceTreeNode): void {
    this.isEditMode = true;
    this.editingTutorialId = node.data?.id as number;
    this.editForm = {
      name: node.label,
      description: (node.data?.raw?.['description'] as string) || '',
      category: (node.data?.raw?.['category'] as string) || '',
    };
    this.dialog.open(this.dialogTemplate, { width: '500px' });
  }

  async saveTutorial(): Promise<void> {
    try {
      if (this.isEditMode && this.editingTutorialId) {
        await this.tauriService.updateCourse(
          this.editingTutorialId,
          this.editForm.name,
          this.editForm.description,
          this.editForm.category
        );
        this.snackBar.open('教程更新成功', '关闭', { duration: 3000 });
      } else {
        await this.tauriService.createCourse(
          this.editForm.name,
          this.editForm.description,
          this.editForm.category
        );
        this.snackBar.open('教程创建成功', '关闭', { duration: 3000 });
      }
      this.closeDialog();
      await this.refreshTree();
    } catch (error) {
      console.error('保存教程失败:', error);
      this.snackBar.open('保存失败，请重试', '关闭', { duration: 3000 });
    }
  }

  async confirmDelete(node: ResourceTreeNode): Promise<void> {
    if (!confirm(`确定要删除"${node.label}"吗？此操作不可恢复。`)) return;

    try {
      if (node.type === 'tutorial' && node.data?.id) {
        await this.tauriService.deleteCourse(node.data.id as number);
        this.snackBar.open('教程已删除', '关闭', { duration: 3000 });
      } else if (node.type === 'material' && node.data?.id && node.source === 'local') {
        await this.tauriService.deleteMaterial(node.data.id as number);
        this.snackBar.open('课件已删除', '关闭', { duration: 3000 });
      } else {
        this.snackBar.open('只支持删除本地资源', '关闭', { duration: 3000 });
        return;
      }
      this.selectedNode = null;
      await this.refreshTree();
    } catch (error) {
      console.error('删除失败:', error);
      this.snackBar.open('删除失败，请重试', '关闭', { duration: 3000 });
    }
  }

  onUploadMaterial(node: ResourceTreeNode): void {
    const courseId = node.data?.id;
    if (!courseId || node.source !== 'local') {
      this.snackBar.open('只能为本地教程上传课件', '关闭', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(MaterialUploadDialogComponent, {
      width: '480px',
      data: {
        courseId: courseId as number,
        courseName: node.label,
        category: (node.data?.raw?.['category'] as string) || undefined,
      } satisfies MaterialUploadDialogData,
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (!result?.uploaded) return;
      if (node.isExpanded) {
        node.children = await this.treeService.expandTutorial(node);
      }
      await this.refreshTree();
      this.selectedNode = node;
    });
  }

  onPreviewMaterial(node: ResourceTreeNode): void {
    const raw = node.data?.raw;
    const fileUrl = (raw?.['fileUrl'] || raw?.['file_url'] || raw?.['downloadUrl'] || '') as string;
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    } else {
      this.snackBar.open('预览地址不可用', '关闭', { duration: 3000 });
    }
  }

  onDownloadMaterial(node: ResourceTreeNode): void {
    const raw = node.data?.raw;
    const downloadUrl = (raw?.['downloadUrl'] || raw?.['download_url'] || '') as string;
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    } else {
      this.snackBar.open('下载地址不可用', '关闭', { duration: 3000 });
    }
  }

  closeDialog(): void {
    this.dialog.closeAll();
  }

  // ─── 私有方法 ───

  private shouldLazyLoad(node: ResourceTreeNode): boolean {
    return (
      node.type === 'source_group' ||
      node.type === 'source_subgroup' ||
      node.type === 'tutorial'
    );
  }

  private async lazyLoadChildren(node: ResourceTreeNode): Promise<ResourceTreeNode[]> {
    if (node.type === 'tutorial') {
      return this.treeService.expandTutorial(node);
    }
    // source_group 或 source_subgroup
    return this.treeService.expandSourceGroup(
      node.source || node.id.replace('source:', '')
    );
  }

  private async applyDeepLinkFromQuery(): Promise<void> {
    const params = this.route.snapshot.queryParamMap;
    const nodeId = params.get('nodeId');
    const search = params.get('search');
    const type = params.get('type') as 'tutorial' | 'material' | null;

    if (search) {
      this.searchKeyword = search;
      await this.onSearchChange(search);
    } else if (nodeId && this.treeRoot) {
      const { tree, node } = await this.treeService.expandPathToNode(this.treeRoot, nodeId);
      this.treeRoot = tree;
      if (node) {
        this.selectedNode = node;
      }
    } else if (type && this.treeRoot) {
      this.treeRoot = await this.treeService.expandDefaultGroup(this.treeRoot, type);
    }
  }
}
