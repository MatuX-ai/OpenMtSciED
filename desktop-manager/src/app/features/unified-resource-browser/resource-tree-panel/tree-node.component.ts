import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ResourceTreeNode, getMaterialIcon } from '../../../models/resource-tree.models';

@Component({
  selector: 'app-tree-node',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    AppTreeNodeComponent,
  ],
  template: `
    <div class="tree-node-wrapper">
      <!-- 当前节点 -->
      <div
        class="tree-node"
        [class.is-selected]="selectedNodeId === node.id"
        [class.is-source]="node.type === 'source_group' || node.type === 'source_subgroup'"
        [class.is-tutorial]="node.type === 'tutorial'"
        [class.is-material]="node.type === 'material'"
        [class.is-highlighted]="isHighlighted"
        [style.padding-left.px]="depth * 20 + 8"
        (click)="onSelect()"
      >
        <!-- 展开/折叠按钮 -->
        <button
          class="toggle-btn"
          [class.invisible]="!hasChildren && node.type !== 'source_group' && node.type !== 'source_subgroup'"
          (click)="onToggle(); $event.stopPropagation()"
          mat-icon-button
        >
          <i
            class="toggle-icon"
            [class]="node.isExpanded ? 'ri-arrow-down-s-line' : 'ri-arrow-right-s-line'"
          ></i>
        </button>

        <!-- 加载中 -->
        <mat-progress-spinner
          *ngIf="node.isLoading"
          diameter="16"
          mode="indeterminate"
          class="node-spinner"
        ></mat-progress-spinner>

        <!-- 节点图标 -->
        <i *ngIf="!node.isLoading" [class]="getIcon()" class="node-icon"></i>

        <!-- 标签 -->
        <span class="node-label" [title]="node.label">{{ node.label }}</span>

        <!-- 徽标 -->
        <span class="node-badge" *ngIf="node.badge">{{ node.badge }}</span>
      </div>

      <!-- 子节点（递归） -->
      <div class="children-container" *ngIf="node.isExpanded && node.children && node.children.length > 0">
        <app-tree-node
          *ngFor="let child of node.children"
          [node]="child"
          [depth]="depth + 1"
          [selectedNodeId]="selectedNodeId"
          [searchKeyword]="searchKeyword"
          (nodeSelect)="onChildSelect($event)"
          (nodeToggle)="onChildToggle($event)"
        >
        </app-tree-node>
      </div>

      <!-- 展开后无子节点提示 -->
      <div
        class="empty-children"
        *ngIf="node.isExpanded && (!node.children || node.children.length === 0) && !node.isLoading"
        [style.padding-left.px]="(depth + 1) * 20 + 8"
      >
        <span class="empty-hint">暂无内容</span>
      </div>
    </div>
  `,
  styles: [
    `
      .tree-node-wrapper {
        user-select: none;
      }

      .tree-node {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 12px 6px 8px;
        cursor: pointer;
        border-radius: 6px;
        transition: all 0.15s ease;
        min-height: 36px;
      }

      .tree-node:hover {
        background: rgba(102, 126, 234, 0.08);
      }

      .tree-node.is-selected {
        background: rgba(102, 126, 234, 0.15);
        color: #667eea;
        font-weight: 600;
      }

      .tree-node.is-highlighted {
        background: rgba(255, 193, 7, 0.15);
      }

      .toggle-btn {
        width: 24px;
        height: 24px;
        line-height: 24px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 0;
        color: #888;
      }

      .toggle-btn:hover {
        color: #333;
      }

      .toggle-btn.invisible {
        visibility: hidden;
      }

      .toggle-icon {
        font-size: 18px;
        transition: transform 0.2s ease;
      }

      .node-spinner {
        flex-shrink: 0;
        margin: 0 4px;
      }

      .node-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        flex-shrink: 0;
        margin-right: 4px;
      }

      .is-source .node-icon {
        color: #f59e0b;
      }

      .is-tutorial .node-icon {
        color: #667eea;
      }

      .is-material .node-icon {
        color: #10b981;
      }

      .node-label {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 14px;
        color: #333;
      }

      .is-selected .node-label {
        color: #667eea;
      }

      .node-badge {
        flex-shrink: 0;
        font-size: 11px;
        padding: 1px 6px;
        border-radius: 10px;
        background: #f0f0f0;
        color: #888;
      }

      .children-container {
        overflow: hidden;
      }

      .empty-children {
        padding: 8px 16px;
      }

      .empty-hint {
        font-size: 12px;
        color: #bbb;
        font-style: italic;
      }
    `,
  ],
})
export class AppTreeNodeComponent {
  @Input() node!: ResourceTreeNode;
  @Input() depth = 0;
  @Input() selectedNodeId: string | null = null;
  @Input() searchKeyword = '';

  @Output() nodeSelect = new EventEmitter<ResourceTreeNode>();
  @Output() nodeToggle = new EventEmitter<ResourceTreeNode>();

  get hasChildren(): boolean {
    return (this.node.children && this.node.children.length > 0) || false;
  }

  get isHighlighted(): boolean {
    if (!this.searchKeyword) return false;
    return this.node.label.toLowerCase().includes(this.searchKeyword.toLowerCase());
  }

  getIcon(): string {
    if (this.node.icon) return this.node.icon;
    switch (this.node.type) {
      case 'root':
        return 'ri-archive-line';
      case 'source_group':
        return 'ri-folder-2-line';
      case 'source_subgroup':
        return 'ri-folder-3-line';
      case 'tutorial':
        return 'ri-book-open-line';
      case 'material':
        return getMaterialIcon(this.node.data?.raw);
      default:
        return 'ri-file-line';
    }
  }

  onSelect(): void {
    this.nodeSelect.emit(this.node);
  }

  onToggle(): void {
    this.nodeToggle.emit(this.node);
  }

  onChildSelect(node: ResourceTreeNode): void {
    this.nodeSelect.emit(node);
  }

  onChildToggle(node: ResourceTreeNode): void {
    this.nodeToggle.emit(node);
  }
}
