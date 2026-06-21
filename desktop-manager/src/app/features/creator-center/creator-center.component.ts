import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';

import {
  CreatorOverview,
  CreatorService,
  CreditLedgerEntry,
  CREDIT_RULES,
} from '../../core/services/creator.service';
import { LeaderboardEntry, PublishService } from '../../core/services/publish.service';

@Component({
  selector: 'app-creator-center',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTableModule,
    RouterLink,
  ],
  template: `
    <div class="creator-center-page">
      <div class="page-header">
        <div>
          <h1><i class="ri-medal-line"></i> 创作者中心</h1>
          <p>创课分（CC）记录你的课件编排与原创贡献</p>
        </div>
        <button mat-stroked-button routerLink="/topic-studio">前往课题工作室</button>
        <button mat-stroked-button routerLink="/public-library">公开资源库</button>
      </div>

      <div class="loading-block" *ngIf="loading">
        <mat-progress-spinner diameter="36" mode="indeterminate"></mat-progress-spinner>
      </div>

      <ng-container *ngIf="!loading && overview">
        <div class="stats-grid">
          <mat-card class="stat-card primary">
            <mat-card-content>
              <div class="stat-label">累计创课分</div>
              <div class="stat-value">{{ overview.profile.cc_total }} <span>CC</span></div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-label">当前等级</div>
              <div class="stat-value level">L{{ overview.profile.level }}</div>
              <div class="stat-sub">{{ overview.profile.level_name }}</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card" *ngIf="overview.next_level">
            <mat-card-content>
              <div class="stat-label">距离下一级</div>
              <div class="stat-value">{{ overview.next_level.cc_needed }} CC</div>
              <div class="stat-sub">{{ overview.next_level.name }}</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-label">图谱挂接</div>
              <div class="stat-value">{{ overview.stats?.graph_links ?? 0 }}</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-label">待审核发布</div>
              <div class="stat-value">{{ overview.stats?.pending_publish ?? 0 }}</div>
            </mat-card-content>
          </mat-card>
        </div>

        <mat-card class="leaderboard-card" *ngIf="leaderboard.length > 0">
          <mat-card-header>
            <mat-card-title>创课榜 Top {{ leaderboard.length }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="leaderboard-row" *ngFor="let entry of leaderboard">
              <span class="rank">#{{ entry.rank }}</span>
              <span class="name">{{ entry.display_name }}</span>
              <span class="score">{{ entry.cc_total ?? entry.cc_earned ?? 0 }} CC</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="rules-card">
          <mat-card-header>
            <mat-card-title>计分规则</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="rule-item" *ngFor="let rule of creditRules">
              <span>{{ creatorService.actionLabel(rule.action) }}</span>
              <strong>{{ rule.points > 0 ? '+' : '' }}{{ rule.points }} CC</strong>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="ledger-card">
          <mat-card-header>
            <mat-card-title>积分流水</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p class="empty" *ngIf="ledger.length === 0">暂无积分记录，完成课题或上传课件即可获得 CC</p>
            <table mat-table [dataSource]="ledger" *ngIf="ledger.length > 0" class="ledger-table">
              <ng-container matColumnDef="time">
                <th mat-header-cell *matHeaderCellDef>时间</th>
                <td mat-cell *matCellDef="let row">{{ row.created_at | date: 'MM-dd HH:mm' }}</td>
              </ng-container>
              <ng-container matColumnDef="action">
                <th mat-header-cell *matHeaderCellDef>行为</th>
                <td mat-cell *matCellDef="let row">{{ creatorService.actionLabel(row.action) }}</td>
              </ng-container>
              <ng-container matColumnDef="delta">
                <th mat-header-cell *matHeaderCellDef>变动</th>
                <td mat-cell *matCellDef="let row" [class.positive]="row.cc_delta > 0">
                  {{ row.cc_delta > 0 ? '+' : '' }}{{ row.cc_delta }}
                </td>
              </ng-container>
              <ng-container matColumnDef="note">
                <th mat-header-cell *matHeaderCellDef>说明</th>
                <td mat-cell *matCellDef="let row">{{ row.note || '—' }}</td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>
          </mat-card-content>
        </mat-card>
      </ng-container>
    </div>
  `,
  styles: [
    `
      .creator-center-page {
        padding: 20px;
        height: 100%;
        overflow: auto;
      }

      .page-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 20px;
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

      .loading-block {
        text-align: center;
        padding: 48px;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 20px;
      }

      .stat-card.primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .stat-label {
        font-size: 13px;
        opacity: 0.85;
      }

      .stat-value {
        font-size: 28px;
        font-weight: 700;
        margin-top: 8px;
      }

      .stat-value span {
        font-size: 14px;
        font-weight: 500;
      }

      .stat-value.level {
        font-size: 32px;
      }

      .stat-sub {
        margin-top: 4px;
        font-size: 13px;
        opacity: 0.85;
      }

      .rules-card,
      .ledger-card,
      .leaderboard-card {
        margin-bottom: 20px;
      }

      .leaderboard-row {
        display: grid;
        grid-template-columns: 48px 1fr auto;
        gap: 12px;
        padding: 8px 0;
        border-bottom: 1px solid #f0f0f0;
      }

      .leaderboard-row .rank {
        color: #667eea;
        font-weight: 700;
      }

      .leaderboard-row .score {
        font-weight: 600;
      }

      .rule-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #f0f0f0;
      }

      .rule-item:last-child {
        border-bottom: none;
      }

      .ledger-table {
        width: 100%;
      }

      .positive {
        color: #2e7d32;
        font-weight: 600;
      }

      .empty {
        color: #888;
        text-align: center;
        padding: 24px;
      }
    `,
  ],
})
export class CreatorCenterComponent implements OnInit {
  loading = true;
  overview: CreatorOverview | null = null;
  ledger: CreditLedgerEntry[] = [];
  leaderboard: LeaderboardEntry[] = [];
  displayedColumns = ['time', 'action', 'delta', 'note'];
  creditRules = Object.entries(CREDIT_RULES).map(([action, points]) => ({ action, points }));

  constructor(
    public creatorService: CreatorService,
    private publishService: PublishService
  ) {}

  ngOnInit(): void {
    this.creatorService.getOverview().subscribe({
      next: (overview) => {
        this.overview = overview;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });

    this.creatorService.getLedger(30).subscribe({
      next: (items) => {
        this.ledger = items;
      },
    });

    this.publishService.getLeaderboard(8).subscribe({
      next: (resp) => {
        this.leaderboard = resp.all_time || [];
      },
    });
  }
}
