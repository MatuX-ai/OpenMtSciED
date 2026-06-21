import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { firstValueFrom } from 'rxjs';
import { PlagiarismReportItem, PublishReviewService } from '../../core/services/publish-review.service';

@Component({
  selector: 'app-admin-plagiarism',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
  ],
  template: `
    <div class="admin-page">
      <div class="header">
        <h2><mat-icon>report</mat-icon> 抄袭举报</h2>
        <button mat-stroked-button (click)="load()" [disabled]="loading()">
          <mat-icon>refresh</mat-icon> 刷新
        </button>
      </div>

      <mat-card *ngIf="loading(); else content">
        <mat-card-content class="loading">
          <mat-progress-spinner diameter="36" mode="indeterminate"></mat-progress-spinner>
        </mat-card-content>
      </mat-card>

      <ng-template #content>
        <mat-card>
          <mat-card-content>
            <p *ngIf="items().length === 0" class="empty">暂无待处理举报</p>
            <table mat-table [dataSource]="items()" *ngIf="items().length > 0" class="report-table">
              <ng-container matColumnDef="target">
                <th mat-header-cell *matHeaderCellDef>被举报人</th>
                <td mat-cell *matCellDef="let row">{{ row.target_user }}</td>
              </ng-container>
              <ng-container matColumnDef="package">
                <th mat-header-cell *matHeaderCellDef>教学包</th>
                <td mat-cell *matCellDef="let row">{{ row.package_title || '—' }}</td>
              </ng-container>
              <ng-container matColumnDef="reason">
                <th mat-header-cell *matHeaderCellDef>原因</th>
                <td mat-cell *matCellDef="let row">{{ row.reason }}</td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>操作</th>
                <td mat-cell *matCellDef="let row">
                  <button mat-button color="warn" (click)="resolve(row, true)">核实扣罚</button>
                  <button mat-button (click)="resolve(row, false)">驳回</button>
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
      .loading, .empty { text-align: center; padding: 32px; color: #888; }
      .report-table { width: 100%; }
    `,
  ],
})
export class AdminPlagiarismComponent implements OnInit {
  private service = inject(PublishReviewService);
  private snackBar = inject(MatSnackBar);

  loading = signal(false);
  items = signal<PlagiarismReportItem[]>([]);
  columns = ['target', 'package', 'reason', 'actions'];

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const resp = await firstValueFrom(this.service.listPlagiarismReports('pending'));
      this.items.set(resp.items || []);
    } catch {
      this.snackBar.open('加载举报列表失败', '关闭', { duration: 3000 });
    } finally {
      this.loading.set(false);
    }
  }

  async resolve(row: PlagiarismReportItem, confirmed: boolean): Promise<void> {
    const adminNote = prompt(confirmed ? '扣罚说明（可选）' : '驳回说明（可选）') || undefined;
    try {
      await firstValueFrom(this.service.resolvePlagiarism(row.id, confirmed, adminNote));
      this.snackBar.open(confirmed ? '已核实并扣罚' : '已驳回举报', '关闭', { duration: 2500 });
      await this.load();
    } catch {
      this.snackBar.open('处理失败', '关闭', { duration: 3000 });
    }
  }
}
