import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  MaterialCategory,
  MaterialFilter,
  MaterialType,
  MaterialVisibility,
} from '../../../models/unified-material.models';

@Component({
  selector: 'app-material-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  template: `
    <div class="material-filter">
      <!-- 搜索框 -->
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>搜索课件</mat-label>
        <input matInput [(ngModel)]="searchText" (keyup.enter)="applyFilter()" />
        <mat-icon matPrefix>search</mat-icon>
        <mat-icon matSuffix (click)="clearSearch()" *ngIf="searchText">clear</mat-icon>
      </mat-form-field>

      <!-- 课件类型 -->
      <mat-form-field appearance="outline">
        <mat-label>课件类型</mat-label>
        <mat-select [(value)]="selectedTypes" multiple>
          @for (typeGroup of typeGroups; track typeGroup.label) {
            <mat-optgroup [label]="typeGroup.label">
              @for (type of typeGroup.types; track type.value) {
                <mat-option [value]="type.value">{{ type.label }}</mat-option>
              }
            </mat-optgroup>
          }
        </mat-select>
        <mat-icon matPrefix>category</mat-icon>
      </mat-form-field>

      <!-- 分类 -->
      <mat-form-field appearance="outline">
        <mat-label>分类</mat-label>
        <mat-select [(value)]="selectedCategory">
          <mat-option [value]="null">全部</mat-option>
          @for (category of categories; track category) {
            <mat-option [value]="category">{{ category }}</mat-option>
          }
        </mat-select>
        <mat-icon matPrefix>folder</mat-icon>
      </mat-form-field>

      <!-- 可见性 -->
      <mat-form-field appearance="outline">
        <mat-label>可见性</mat-label>
        <mat-select [(value)]="selectedVisibility">
          <mat-option [value]="null">全部</mat-option>
          @for (visibility of visibilityOptions; track visibility.value) {
            <mat-option [value]="visibility.value">{{ visibility.label }}</mat-option>
          }
        </mat-select>
        <mat-icon matPrefix>visibility</mat-icon>
      </mat-form-field>

      <!-- 授权状态 -->
      <mat-form-field appearance="outline">
        <mat-label>下载权限</mat-label>
        <mat-select [(value)]="selectedDownloadPermission">
          <mat-option [value]="null">全部</mat-option>
          <mat-option [value]="true">允许下载</mat-option>
          <mat-option [value]="false">禁止下载</mat-option>
        </mat-select>
        <mat-icon matPrefix>download</mat-icon>
      </mat-form-field>

      <!-- 已选标签 -->
      @if (activeFiltersCount() > 0) {
        <div class="active-filters">
          @for (tag of selectedTypes; track tag) {
            <mat-chip (removed)="removeType(tag)">
              {{ getTypeLabel(tag) }}
              <mat-icon matChipRemove>cancel</mat-icon>
            </mat-chip>
          }
          @if (selectedCategory) {
            <mat-chip (removed)="selectedCategory = null">
              {{ selectedCategory }}
              <mat-icon matChipRemove>cancel</mat-icon>
            </mat-chip>
          }
          @if (selectedVisibility) {
            <mat-chip (removed)="selectedVisibility = null">
              {{ getVisibilityLabel(selectedVisibility) }}
              <mat-icon matChipRemove>cancel</mat-icon>
            </mat-chip>
          }
        </div>
      }

      <!-- 操作按钮 -->
      <div class="filter-actions">
        <button mat-button (click)="applyFilter()">
          <mat-icon>filter_list</mat-icon>
          应用筛选
        </button>
        <button mat-button (click)="resetFilter()" color="warn">
          <mat-icon>refresh</mat-icon>
          重置
        </button>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .material-filter {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      padding: 16px;
      background: var(--mat-sys-surface);
      border-radius: var(--mat-sys-shape-corner-medium);
    }

    .search-field {
      flex: 1 1 300px;
      min-width: 200px;
    }

    .mat-mdc-form-field {
      flex: 0 1 200px;
      min-width: 180px;
    }

    .active-filters {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }

    .mat-mdc-chip {
      background: var(--mat-sys-secondary-container);
      color: var(--mat-sys-on-secondary-container);
    }

    .filter-actions {
      width: 100%;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--mat-sys-outline-variant);
    }

    .filter-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaterialFilterComponent {
  searchText = '';
  selectedTypes: MaterialType[] = [];
  selectedCategory: MaterialCategory | null = null;
  selectedVisibility: MaterialVisibility | null = null;
  selectedDownloadPermission: boolean | null = null;

  typeGroups = [
    {
      label: '文档类',
      types: [
        { value: 'document_pdf', label: 'PDF文档' },
        { value: 'document_word', label: 'Word文档' },
        { value: 'document_ppt', label: 'PPT演示' },
        { value: 'document_excel', label: 'Excel表格' },
      ],
    },
    {
      label: '视频类',
      types: [
        { value: 'video_teaching', label: '教学视频' },
        { value: 'video_screen', label: '录屏视频' },
        { value: 'video_live', label: '直播视频' },
      ],
    },
    {
      label: '音频类',
      types: [
        { value: 'audio_teaching', label: '教学音频' },
        { value: 'audio_recording', label: '录音文件' },
      ],
    },
    {
      label: '图片类',
      types: [{ value: 'image', label: '图片' }],
    },
    {
      label: '代码类',
      types: [
        { value: 'code_source', label: '源代码' },
        { value: 'code_example', label: '代码示例' },
        { value: 'code_project', label: '代码项目' },
      ],
    },
    {
      label: '游戏类',
      types: [
        { value: 'game_interactive', label: '交互游戏' },
        { value: 'game_simulation', label: '模拟游戏' },
      ],
    },
    {
      label: '动画类',
      types: [
        { value: 'animation_2d', label: '2D动画' },
        { value: 'animation_3d', label: '3D动画' },
      ],
    },
    {
      label: 'AR/VR类',
      types: [
        { value: 'ar_model', label: 'AR模型' },
        { value: 'vr_experience', label: 'VR体验' },
        { value: 'arvr_scene', label: 'AR/VR场景' },
      ],
    },
    {
      label: '模型类',
      types: [
        { value: 'model_3d', label: '3D模型' },
        { value: 'model_robot', label: '机器人模型' },
      ],
    },
    {
      label: '实验类',
      types: [
        { value: 'experiment_config', label: '实验配置' },
        { value: 'experiment_template', label: '实验模板' },
      ],
    },
    {
      label: '其他',
      types: [
        { value: 'archive', label: '归档文件' },
        { value: 'external_link', label: '外部链接' },
      ],
    },
  ];

  categories: MaterialCategory[] = [
    'course_material',
    'reference_material',
    'assignment_material',
    'exam_material',
    'project_template',
    'tutorial',
    'resource_library',
  ];

  visibilityOptions = [
    { value: 'public' as MaterialVisibility, label: '公开' },
    { value: 'organization' as MaterialVisibility, label: '机构内' },
    { value: 'school' as MaterialVisibility, label: '校内' },
    { value: 'private' as MaterialVisibility, label: '私有' },
  ];

  activeFiltersCount = computed(() => {
    let count = this.selectedTypes.length;
    if (this.selectedCategory) count++;
    if (this.selectedVisibility) count++;
    if (this.selectedDownloadPermission !== null) count++;
    return count;
  });

  applyFilter(): MaterialFilter {
    return {
      search: this.searchText || undefined,
      type: this.selectedTypes.length > 0 ? this.selectedTypes : undefined,
      category: this.selectedCategory ? [this.selectedCategory] : undefined,
      visibility: this.selectedVisibility ? [this.selectedVisibility] : undefined,
    };
  }

  resetFilter(): void {
    this.searchText = '';
    this.selectedTypes = [];
    this.selectedCategory = null;
    this.selectedVisibility = null;
    this.selectedDownloadPermission = null;
  }

  removeType(type: MaterialType): void {
    this.selectedTypes = this.selectedTypes.filter((t) => t !== type);
  }

  clearSearch(): void {
    this.searchText = '';
  }

  getTypeLabel(type: MaterialType): string {
    for (const group of this.typeGroups) {
      const found = group.types.find((t) => t.value === type);
      if (found) return found.label;
    }
    return type;
  }

  getVisibilityLabel(visibility: MaterialVisibility): string {
    const option = this.visibilityOptions.find((v) => v.value === visibility);
    return option ? option.label : visibility;
  }
}
