import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ResourceTreeNode } from '../../../models/resource-tree.models';
import { AppTreeNodeComponent } from './tree-node.component';

@Component({
  selector: 'app-resource-tree-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatTooltipModule,
    AppTreeNodeComponent,
  ],
  template: `
    <div class="tree-panel">
      <!-- 面板头部 -->
      <div class="panel-header">
        <h2>
          <i class="ri-archive-line header-icon"></i>
          全部资源
        </h2>
        <div class="header-actions">
          <button
            mat-icon-button
            (click)="collapseAll()"
            matTooltip="全部折叠"
            [disabled]="!hasExpandedNodes"
          >
            <i class="ri-fold-line"></i>
          </button>
          <button mat-icon-button (click)="refresh.emit()" matTooltip="刷新">
            <i class="ri-refresh-line"></i>
          </button>
        </div>
      </div>

      <!-- 搜索框 -->
      <div class="search-bar">
        <i class="ri-search-line search-icon"></i>
        <input
          [(ngModel)]="localKeyword"
          (input)="onSearchInput()"
          placeholder="搜索资源..."
          class="search-input"
        />
        <button
          *ngIf="localKeyword"
          class="clear-btn"
          (click)="onClearSearch()"
          mat-icon-button
        >
          <i class="ri-close-line"></i>
        </button>
      </div>

      <!-- 树内容区域 -->
      <div class="tree-content">
        <app-tree-node
          *ngIf="treeData"
          [node]="treeData"
          [depth]="0"
          [selectedNodeId]="selectedNodeId"
          [searchKeyword]="searchKeyword"
          (nodeSelect)="onNodeSelect($event)"
          (nodeToggle)="onNodeToggle($event)"
        >
        </app-tree-node>

        <!-- 空状态 -->
        <div *ngIf="!treeData" class="empty-state">
          <i class="ri-inbox-line empty-icon"></i>
          <p>暂无数据</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .tree-panel {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: #fff;
      }

      .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 16px 12px;
        border-bottom: 1px solid #f0f0f0;
      }

      .panel-header h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        color: #1a1a2e;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .header-icon {
        color: #667eea;
        font-size: 22px;
      }

      .header-actions {
        display: flex;
        gap: 4px;
      }

      .header-actions button {
        width: 32px;
        height: 32px;
        line-height: 32px;
      }

      .header-actions button i {
        font-size: 18px;
        color: #888;
      }

      .search-bar {
        position: relative;
        padding: 12px 16px;
      }

      .search-icon {
        position: absolute;
        left: 24px;
        top: 50%;
        transform: translateY(-50%);
        color: #aaa;
        font-size: 16px;
        pointer-events: none;
      }

      .search-input {
        width: 100%;
        padding: 8px 32px 8px 32px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s;
        box-sizing: border-box;
        font-family: inherit;
      }

      .search-input:focus {
        border-color: #667eea;
      }

      .search-input::placeholder {
        color: #bbb;
      }

      .clear-btn {
        position: absolute;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        width: 24px;
        height: 24px;
        line-height: 24px;
        color: #888;
      }

      .tree-content {
        flex: 1;
        overflow-y: auto;
        padding: 8px 0;
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        color: #999;
      }

      .empty-icon {
        font-size: 48px;
        margin-bottom: 12px;
        opacity: 0.3;
      }

      .empty-state p {
        margin: 0;
        font-size: 14px;
      }
    `,
  ],
})
export class ResourceTreePanelComponent {
  @Input() treeData: ResourceTreeNode | null = null;
  @Input() selectedNodeId: string | null = null;
  @Input() searchKeyword = '';

  @Output() nodeSelect = new EventEmitter<ResourceTreeNode>();
  @Output() nodeToggle = new EventEmitter<ResourceTreeNode>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() refresh = new EventEmitter<void>();

  localKeyword = '';

  get hasExpandedNodes(): boolean {
    return this.treeData?.isExpanded || false;
  }

  onSearchInput(): void {
    this.searchChange.emit(this.localKeyword);
  }

  onClearSearch(): void {
    this.localKeyword = '';
    this.searchChange.emit('');
  }

  onNodeSelect(node: ResourceTreeNode): void {
    this.nodeSelect.emit(node);
  }

  onNodeToggle(node: ResourceTreeNode): void {
    this.nodeToggle.emit(node);
  }

  collapseAll(): void {
    if (this.treeData) {
      this.collapseNode(this.treeData);
    }
  }

  private collapseNode(node: ResourceTreeNode): void {
    node.isExpanded = false;
    if (node.children) {
      for (const child of node.children) {
        this.collapseNode(child);
      }
    }
  }
}
