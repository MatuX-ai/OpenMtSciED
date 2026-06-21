import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';

import { PublicPackageItem, PublishService } from '../../core/services/publish.service';

@Component({
  selector: 'app-public-library',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
  ],
  template: `
    <div class="public-library-page">
      <div class="page-header">
        <div>
          <h1><i class="ri-global-line"></i> 公开资源库</h1>
          <p>浏览已通过审核、公开发布的教学包</p>
        </div>
      </div>

      <div class="search-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>搜索标题或学科</mat-label>
          <input matInput [(ngModel)]="query" (keyup.enter)="search()" />
        </mat-form-field>
        <button mat-raised-button color="primary" (click)="search()" [disabled]="loading">搜索</button>
      </div>

      <div class="loading-block" *ngIf="loading">
        <mat-progress-spinner diameter="36" mode="indeterminate"></mat-progress-spinner>
      </div>

      <div class="empty-state" *ngIf="!loading && items.length === 0">
        <i class="ri-inbox-line"></i>
        <p>暂无公开教学包</p>
      </div>

      <div class="package-grid" *ngIf="!loading && items.length > 0">
        <mat-card class="package-card" *ngFor="let item of items">
          <mat-card-header>
            <mat-card-title>{{ item.title }}</mat-card-title>
            <mat-card-subtitle>{{ item.subject || '未分类' }} · {{ item.author || '匿名' }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <mat-chip-set>
              <mat-chip *ngIf="item.is_featured" color="accent">精选</mat-chip>
              <mat-chip *ngIf="item.grade_level">{{ item.grade_level }}</mat-chip>
            </mat-chip-set>
            <p class="published-at" *ngIf="item.published_at">
              发布于 {{ item.published_at | date: 'yyyy-MM-dd' }}
            </p>
          </mat-card-content>
          <mat-card-actions align="end">
            <button mat-button color="warn" (click)="reportItem(item)">举报</button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [
    `
      .public-library-page {
        padding: 20px;
        height: 100%;
        overflow: auto;
      }

      .page-header h1 {
        margin: 0 0 4px;
        font-size: 22px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .page-header p {
        margin: 0;
        color: #666;
        font-size: 14px;
      }

      .search-bar {
        display: flex;
        gap: 12px;
        align-items: center;
        margin: 20px 0;
      }

      .search-field {
        flex: 1;
        max-width: 480px;
      }

      .package-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 16px;
      }

      .published-at {
        margin: 8px 0 0;
        font-size: 12px;
        color: #888;
      }

      .loading-block,
      .empty-state {
        text-align: center;
        padding: 48px;
        color: #888;
      }

      .empty-state i {
        font-size: 40px;
        display: block;
        margin-bottom: 8px;
      }
    `,
  ],
})
export class PublicLibraryComponent implements OnInit {
  query = '';
  loading = false;
  items: PublicPackageItem[] = [];

  constructor(
    private publishService: PublishService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.search();
  }

  search(): void {
    this.loading = true;
    this.publishService.searchPublicLibrary(this.query.trim()).subscribe({
      next: (items) => {
        this.items = items;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  reportItem(item: PublicPackageItem): void {
    const reason = prompt('请描述举报原因（抄袭/未授权引用等）');
    if (!reason?.trim()) return;

    this.publishService
      .reportPlagiarism({
        targetUserId: item.user_id || 0,
        packageId: item.id,
        reason: reason.trim(),
      })
      .subscribe({
        next: (ok) => {
          this.snackBar.open(ok ? '举报已提交' : '请先登录后再举报', '关闭', { duration: 3000 });
        },
      });
  }
}
