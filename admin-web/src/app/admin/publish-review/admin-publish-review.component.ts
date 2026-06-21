import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { firstValueFrom } from 'rxjs';
import { PublishRequestItem, PublishReviewService } from '../../core/services/publish-review.service';

@Component({
  selector: 'app-admin-publish-review',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatChipsModule,
    MatCheckboxModule,
  ],
  template: `
    <div class="admin-page">
      <div class="header">
        <h2><mat-icon>fact_check</mat-icon> 发布审核队列</h2>
        <div class="actions">
          <button mat-stroked-button (click)="load()" [disabled]="loading()">
            <mat-icon>refresh</mat-icon> 刷新
          </button>
          <button mat-stroked-button color="primary" (click)="runPayouts()" [disabled]="loading()">
            执行 T+7 积分结算
          </button>
        </div>
      </div>

      <mat-card *ngIf="loading(); else content">
        <mat-card-content class="loading">
          <mat-progress-spinner diameter="36" mode="indeterminate"></mat-progress-spinner>
        </mat-card-content>
      </mat-card>

      <ng-template #content>
        <mat-card>
          <mat-card-content>
            <p *ngIf="items().length === 0" class="empty">暂无待审核发布</p>
            <table mat-table [dataSource]="items()" *ngIf="items().length > 0" class="review-table">
              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef>教学包</th>
                <td mat-cell *matCellDef="let row">
                  <strong>{{ row.package_title }}</strong>
                  <div class="sub">{{ row.author }} · {{ row.scope }}</div>
                </td>
              </ng-container>
              <ng-container matColumnDef="score">
                <th mat-header-cell *matHeaderCellDef>自动审核</th>
                <td mat-cell *matCellDef="let row">{{ row.auto_review_score ?? '—' }}</td>
              </ng-container>
              <ng-container matColumnDef="issues">
                <th mat-header-cell *matHeaderCellDef>问题</th>
                <td mat-cell *matCellDef="let row">
                  <span *ngFor="let issue of row.auto_review_notes?.issues || []" class="issue-chip">{{ issue }}</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>操作</th>
                <td mat-cell *matCellDef="let row">
                  <mat-checkbox [checked]="featuredMap[row.id]" (change)="featuredMap[row.id] = $event.checked">
                    精选
                  </mat-checkbox>
                  <button mat-button color="primary" (click)="review(row, 'approve')">通过</button>
                  <button mat-button color="warn" (click)="review(row, 'reject')">拒绝</button>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="columns"></tr>
              <tr mat-row *matRowDef="let row; columns: columns"></tr>
            </table>
          </mat-card-content>
        </mat-card>
      </ng-template>
    </div>
  `,
  styles: [
    `
      .admin-page { padding: 20px; }
      .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
      .header h2 { display: flex; align-items: center; gap: 8px; margin: 0; }
      .actions { display: flex; gap: 8px; }
      .loading { display: flex; justify-content: center; padding: 32px; }
      .empty { text-align: center; color: #888; padding: 24px; }
      .sub { font-size: 12px; color: #666; }
      .issue-chip { display: inline-block; margin: 2px 4px 2px 0; padding: 2px 8px; background: #fff3e0; border-radius: 999px; font-size: 12px; }
      .review-table { width: 100%; }
    `,
  ],
})
export class AdminPublishReviewComponent implements OnInit {
  private service = inject(PublishReviewService);
  private snackBar = inject(MatSnackBar);

  loading = signal(false);
  items = signal<PublishRequestItem[]>([]);
  columns = ['title', 'score', 'issues', 'actions'];
  featuredMap: Record<number, boolean> = {};

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const resp = await firstValueFrom(this.service.listPublishRequests('manual_review'));
      this.items.set(resp.items || []);
    } catch {
      this.snackBar.open('加载审核队列失败', '关闭', { duration: 3000 });
    } finally {
      this.loading.set(false);
    }
  }

  async review(row: PublishRequestItem, action: 'approve' | 'reject'): Promise<void> {
    const note =
      action === 'reject'
        ? prompt('拒绝原因（可选）') || undefined
        : undefined;
    try {
      await firstValueFrom(
        this.service.reviewPublishRequest(row.id, action, note, this.featuredMap[row.id])
      );
      this.snackBar.open(action === 'approve' ? '已通过' : '已拒绝', '关闭', { duration: 2000 });
      await this.load();
    } catch {
      this.snackBar.open('操作失败', '关闭', { duration: 3000 });
    }
  }

  async runPayouts(): Promise<void> {
    try {
      const resp = await firstValueFrom(this.service.processPayouts());
      this.snackBar.open(`已结算 ${resp.processed} 条`, '关闭', { duration: 2500 });
    } catch {
      this.snackBar.open('结算失败', '关闭', { duration: 3000 });
    }
  }
}
