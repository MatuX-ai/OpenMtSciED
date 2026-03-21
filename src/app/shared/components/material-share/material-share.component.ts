/**
 * 课件分享与权限管理组件
 * 
 * 提供生成分享链接、权限控制、分享统计功能
 */

import { Component, Input, Output, EventEmitter, inject, ChangeDetectionStrategy, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  ShareLink,
  SharePermissions,
  CreateShareLinkRequest,
  UpdateShareLinkRequest,
  ShareStatistics,
  SharePermissionPreset
} from '../../../models/material-share.models';
import { MaterialShareService } from '../../../core/services/material-share.service';
import { Observable, Subject, take, switchMap } from 'rxjs';

@Component({
  selector: 'app-material-share',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  template: `
    <div class="material-share">
      <!-- 分享统计 -->
      @if (shareStats()) {
        <div class="share-statistics">
          <div class="stat-item">
            <mat-icon>share</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ shareStats()!.total_links }}</span>
              <span class="stat-label">分享链接</span>
            </div>
          </div>
          <div class="stat-item">
            <mat-icon>people</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ shareStats()!.total_accesses }}</span>
              <span class="stat-label">总访问</span>
            </div>
          </div>
          <div class="stat-item">
            <mat-icon>download</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ shareStats()!.total_downloads }}</span>
              <span class="stat-label">总下载</span>
            </div>
          </div>
          <div class="stat-item">
            <mat-icon>visibility</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ shareStats()!.total_views }}</span>
              <span class="stat-label">总查看</span>
            </div>
          </div>
        </div>
      }

      <!-- 创建分享链接 -->
      <mat-card class="share-card">
        <mat-card-header>
          <mat-card-title>创建分享链接</mat-card-title>
          <mat-card-subtitle>生成分享链接并发送给其他用户</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="onSubmitShareForm()">
            <!-- 权限预设 -->
            <div class="permission-presets">
              <h3>快速设置权限</h3>
              <div class="presets-grid">
                @for (preset of permissionPresets(); track preset.name) {
                  <mat-chip 
                    [color]="selectedPreset() === preset.name ? 'accent' : 'primary'"
                    [selected]="selectedPreset() === preset.name"
                    (click)="selectPreset(preset.name)">
                    <mat-icon>{{ preset.icon }}</mat-icon>
                    {{ preset.label }}
                  </mat-chip>
                }
              </div>
            </div>

            <!-- 权限详细设置 -->
            <div class="permission-details">
              <h3>权限设置</h3>
              
              <mat-checkbox [(ngModel)]="permissions.can_view">
                允许查看
              </mat-checkbox>
              
              <mat-checkbox [(ngModel)]="permissions.can_download">
                允许下载
              </mat-checkbox>
              
              <mat-checkbox [(ngModel)]="permissions.can_comment">
                允许评论
              </mat-checkbox>
              
              <mat-checkbox [(ngModel)]="permissions.can_edit">
                允许编辑
              </mat-checkbox>
              
              <mat-checkbox [(ngModel)]="permissions.can_share">
                允许再次分享
              </mat-checkbox>
            </div>

            <!-- 过期设置 -->
            <div class="expiration-settings">
              <h3>过期设置</h3>
              
              <mat-form-field appearance="outline">
                <mat-label>过期类型</mat-label>
                <mat-select [(value)]="shareRequest.expiration_type">
                  <mat-option value="never">永不过期</mat-option>
                  <mat-option value="days">天数</mat-option>
                  <mat-option value="hours">小时数</mat-option>
                  <mat-option value="count">访问次数</mat-option>
                </mat-select>
              </mat-form-field>

              @if (shareRequest.expiration_type !== 'never') {
                <mat-form-field appearance="outline">
                  <mat-label>
                    {{ shareRequest.expiration_type === 'days' ? '天数' : 
                         shareRequest.expiration_type === 'hours' ? '小时数' : '最大访问次数' }}
                  </mat-label>
                  <input matInput type="number" [(ngModel)]="shareRequest.expiration_value" min="1">
                </mat-form-field>

                @if (shareRequest.expiration_type === 'count') {
                  <mat-form-field appearance="outline">
                    <mat-label>最大下载次数</mat-label>
                    <input matInput type="number" [(ngModel)]="maxDownloadCount" min="1">
                  </mat-form-field>
                }
              }
            </div>

            <!-- 密码保护 -->
            <div class="password-settings">
              <h3>密码保护</h3>
              
              <mat-checkbox [(ngModel)]="isPasswordProtected">
                使用密码保护
              </mat-checkbox>

              @if (isPasswordProtected) {
                <mat-form-field appearance="outline">
                  <mat-label>访问密码</mat-label>
                  <input matInput type="password" [(ngModel)]="shareRequest.password">
                </mat-form-field>
              }
            </div>

            <!-- 标题和描述 -->
            <div class="metadata-settings">
              <mat-form-field appearance="outline">
                <mat-label>自定义标题 (可选)</mat-label>
                <input matInput [(ngModel)]="shareRequest.title" placeholder="例如: 机器人课程课件">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>自定义描述 (可选)</mat-label>
                <textarea matInput [(ngModel)]="shareRequest.description" rows="3" 
                          placeholder="添加一些描述信息..."></textarea>
              </mat-form-field>
            </div>

            <!-- 操作按钮 -->
            <div class="form-actions">
              <button mat-button type="button" (click)="resetForm()">
                <mat-icon>refresh</mat-icon>
                重置
              </button>
              <div class="action-buttons">
                <button mat-button (click)="loadShareLinks()">
                  <mat-icon>list</mat-icon>
                  查看分享链接
                </button>
                <button mat-raised-button color="primary" type="submit" 
                          [disabled]="!canSubmitForm()">
                  <mat-icon>share</mat-icon>
                  生成分享链接
                </button>
              </div>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- 分享链接列表 -->
      @if (shareLinks().length > 0) {
        <mat-card class="links-card">
          <mat-card-header>
            <mat-card-title>我的分享链接</mat-card-title>
            <mat-card-subtitle>{{ shareLinks().length }} 个链接</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="links-list">
              @for (link of shareLinks(); track link.id) {
                <div class="link-item" [class.inactive]="!link.is_active">
                  <div class="link-header">
                    <div class="link-info">
                      <span class="link-title">{{ link.title || '未命名分享' }}</span>
                      <span class="link-date">{{ formatDate(link.created_at) }}</span>
                    </div>
                    <mat-chip [color]="link.is_active ? 'accent' : 'primary'" selected>
                      {{ link.is_active ? '有效' : '已失效' }}
                    </mat-chip>
                  </div>

                  <div class="link-permissions">
                    <mat-chip *ngIf="link.permissions.can_view" color="primary" selected>
                      <mat-icon>visibility</mat-icon>
                      查看
                    </mat-chip>
                    <mat-chip *ngIf="link.permissions.can_download" color="primary" selected>
                      <mat-icon>download</mat-icon>
                      下载
                    </mat-chip>
                  </div>

                  <div class="link-stats">
                    <span class="stat">
                      <mat-icon>people</mat-icon>
                      访问: {{ link.access_count }}
                    </span>
                    <span class="stat">
                      <mat-icon>download</mat-icon>
                      下载: {{ link.download_count }}
                    </span>
                    <span class="stat">
                      <mat-icon>visibility</mat-icon>
                      查看: {{ link.view_count }}
                    </span>
                  </div>

                  <div class="link-actions">
                    <button mat-button (click)="copyShareLink(link)" matTooltip="复制链接">
                      <mat-icon>content_copy</mat-icon>
                    </button>
                    <button mat-button (click)="editShareLink(link)" matTooltip="编辑">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-button color="warn" (click)="deleteShareLink(link.id)" matTooltip="删除">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .material-share {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* 分享统计 */
    .share-statistics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      padding: 20px;
      background: var(--mat-sys-surface-container);
      border-radius: var(--mat-sys-shape-corner-medium);
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: white;
      border-radius: var(--mat-sys-shape-corner-small);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .stat-item mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: var(--mat-sys-primary);
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: var(--mat-sys-on-surface);
    }

    .stat-label {
      font-size: 13px;
      color: var(--mat-sys-on-surface-variant);
    }

    /* 分享卡片 */
    .share-card,
    .links-card {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .permission-presets {
      margin-bottom: 24px;
    }

    .permission-presets h3 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
    }

    .presets-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .permission-details,
    .expiration-settings,
    .password-settings,
    .metadata-settings {
      margin-bottom: 24px;
    }

    .permission-details h3,
    .expiration-settings h3,
    .password-settings h3,
    .metadata-settings h3 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
    }

    .permission-details mat-checkbox {
      display: block;
      margin-bottom: 12px;
    }

    .form-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid var(--mat-sys-outline-variant);
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }

    /* 分享链接列表 */
    .links-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .link-item {
      border: 2px solid transparent;
      border-radius: var(--mat-sys-shape-corner-medium);
      padding: 20px;
      background: white;
      transition: all 0.2s ease;
    }

    .link-item:hover {
      border-color: var(--mat-sys-primary);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      transform: translateY(-2px);
    }

    .link-item.inactive {
      opacity: 0.6;
      background: var(--mat-sys-surface-container);
    }

    .link-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .link-info {
      flex: 1;
    }

    .link-title {
      display: block;
      font-weight: 600;
      color: var(--mat-sys-on-surface);
      margin-bottom: 4px;
    }

    .link-date {
      font-size: 13px;
      color: var(--mat-sys-on-surface-variant);
    }

    .link-permissions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
    }

    .link-permissions mat-chip {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .link-permissions mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .link-stats {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 12px;
    }

    .link-stats .stat {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: var(--mat-sys-on-surface-variant);
    }

    .link-stats .stat mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .link-actions {
      display: flex;
      gap: 8px;
      padding-top: 12px;
      border-top: 1px solid var(--mat-sys-outline-variant);
    }

    @media (max-width: 768px) {
      .share-statistics {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }

      .action-buttons {
        width: 100%;
      }

      .action-buttons button {
        flex: 1;
      }

      .link-permissions {
        flex-direction: column;
      }

      .link-stats {
        flex-direction: column;
      }
    }
  `
})
export class MaterialShareComponent implements OnInit {
  @Input() materialId: number = 0;

  isLoading = signal<boolean>(false);
  shareStats = signal<ShareStatistics | null>(null);
  shareLinks = signal<ShareLink[]>([]);

  shareRequest: CreateShareLinkRequest = {
    material_id: 0,
    permissions: {
      can_view: true,
      can_download: true,
      can_comment: true,
      can_edit: false,
      can_share: false
    },
    expiration_type: 'days',
    expiration_value: 7
  };

  permissions: SharePermissions = {
    can_view: true,
    can_download: true,
    can_comment: true,
    can_edit: false,
    can_share: false
  };

  selectedPreset = signal<string>('public');
  isPasswordProtected = false;
  maxAccessCount = 10;
  maxDownloadCount = 5;

  private shareService = inject(MaterialShareService);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    if (this.materialId) {
      this.shareRequest.material_id = this.materialId;
      this.loadShareStatistics();
      this.loadShareLinks();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadShareStatistics(): void {
    this.shareService.getShareStatistics(this.materialId).pipe(
      take(1)
    ).subscribe({
      next: (stats) => {
        this.shareStats.set(stats);
      },
      error: (error) => {
        console.error('加载分享统计失败:', error);
        this.snackBar.open('加载分享统计失败', '关闭', { duration: 3000 });
      }
    });
  }

  loadShareLinks(): void {
    this.shareService.getShareLinks(this.materialId).pipe(
      take(1)
    ).subscribe({
      next: (links) => {
        this.shareLinks.set(links);
      },
      error: (error) => {
        console.error('加载分享链接失败:', error);
        this.snackBar.open('加载分享链接失败', '关闭', { duration: 3000 });
      }
    });
  }

  selectPreset(presetName: string): void {
    this.selectedPreset.set(presetName);
    const preset = this.permissionPresets().find(p => p.name === presetName);
    if (preset) {
      this.permissions = { ...preset.permissions };
    }
  }

  permissionPresets(): SharePermissionPreset[] {
    return [
      {
        name: 'public',
        label: '公开访问',
        description: '所有人都可以查看和下载课件',
        icon: 'public',
        permissions: {
          can_view: true,
          can_download: true,
          can_comment: true,
          can_edit: false,
          can_share: false
        }
      },
      {
        name: 'readonly',
        label: '只读访问',
        description: '所有人都可以查看，但不能下载',
        icon: 'visibility',
        permissions: {
          can_view: true,
          can_download: false,
          can_comment: true,
          can_edit: false,
          can_share: false
        }
      },
      {
        name: 'restricted',
        label: '受限访问',
        description: '需要密码才能访问课件',
        icon: 'lock',
        permissions: {
          can_view: true,
          can_download: true,
          can_comment: true,
          can_edit: false,
          can_share: false
        }
      },
      {
        name: 'collaboration',
        label: '协作访问',
        description: '可以查看和评论，不支持下载和编辑',
        icon: 'groups',
        permissions: {
          can_view: true,
          can_download: false,
          can_comment: true,
          can_edit: true,
          can_share: true
        }
      }
    ];
  }

  onSubmitShareForm(): void {
    if (!this.canSubmitForm()) return;

    this.isLoading.set(true);

    this.shareService.createShareLink(this.shareRequest).pipe(
      take(1)
    ).subscribe({
      next: (response) => {
        this.isLoading.set(false);

        if (response.success) {
          this.snackBar.open('分享链接创建成功', '关闭', { duration: 3000 });
          this.copyShareLink(response.share_link);
          this.resetForm();
        } else {
          this.snackBar.open(response.message, '关闭', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('创建分享链接失败:', error);
        this.snackBar.open('创建分享链接失败', '关闭', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  canSubmitForm(): boolean {
    return this.shareRequest.material_id > 0 &&
           (this.shareRequest.expiration_type !== 'never' || this.shareRequest.expiration_value > 0);
  }

  resetForm(): void {
    this.selectedPreset.set('public');
    this.isPasswordProtected = false;
    this.shareRequest = {
      material_id: this.materialId,
      permissions: {
        can_view: true,
        can_download: true,
        can_comment: true,
        can_edit: false,
        can_share: false
      },
      expiration_type: 'days',
      expiration_value: 7
    };
  }

  copyShareLink(link: ShareLink): void {
    navigator.clipboard.writeText(link.share_url);
    this.snackBar.open('链接已复制到剪贴板', '关闭', { duration: 2000 });
  }

  editShareLink(link: ShareLink): void {
    // TODO: 打开编辑对话框
    console.log('编辑分享链接:', link.id);
  }

  deleteShareLink(linkId: number): void {
    if (!confirm('确定要删除这个分享链接吗？')) return;

    this.shareService.deleteShareLink(linkId).pipe(
      take(1)
    ).subscribe({
      next: () => {
        this.snackBar.open('分享链接已删除', '关闭', { duration: 3000 });
        this.loadShareLinks();
      },
      error: (error) => {
        console.error('删除分享链接失败:', error);
        this.snackBar.open('删除分享链接失败', '关闭', { duration: 3000 });
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;

    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
}
