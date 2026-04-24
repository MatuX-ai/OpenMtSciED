import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface PlatformStatus {
  platform_name: string;
  registered: boolean;
  schedule: {
    interval: string;
    day: string;
    time: string;
  };
  data_file_exists: boolean;
  last_updated: string | null;
  file_size: number | null;
}

interface PlatformInfo {
  name: string;
  schedule_config: {
    interval: string;
    day: string;
    time: string;
  };
}

@Component({
  selector: 'app-admin-education-platforms',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTabsModule,
    MatChipsModule,
  ],
  template: `
    <div class="admin-education-platforms">
      <!-- 头部 -->
      <div class="header">
        <h2>
          <mat-icon>school</mat-icon>
          教育平台数据管理
        </h2>
        <div class="header-actions">
          <button mat-stroked-button color="primary" (click)="refreshStatus()">
            <mat-icon>refresh</mat-icon>
            刷新状态
          </button>
          <button mat-flat-button color="primary" (click)="generateAllPlatforms()">
            <mat-icon>play_arrow</mat-icon>
            生成所有平台
          </button>
          <button mat-stroked-button color="accent" (click)="toggleSchedule()">
            <mat-icon>{{ scheduleActive() ? 'pause' : 'play_circle' }}</mat-icon>
            {{ scheduleActive() ? '停止定时任务' : '启动定时任务' }}
          </button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div *ngIf="loading()" class="loading-container">
        <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
        <p>加载中...</p>
      </div>

      <!-- 平台列表 -->
      <div *ngIf="!loading()" class="platforms-container">
        <mat-card class="platforms-card">
          <mat-card-header>
            <mat-card-title>已注册的教育平台</mat-card-title>
            <mat-card-subtitle>管理和监控各教育平台的数据生成状态</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <table mat-table [dataSource]="platforms()" class="platforms-table">

              <!-- 平台名称列 -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>平台名称</th>
                <td mat-cell *matCellDef="let platform">
                  <div class="platform-name">
                    <mat-icon color="primary">school</mat-icon>
                    <span>{{ platform.platform_name }}</span>
                  </div>
                </td>
              </ng-container>

              <!-- 调度配置列 -->
              <ng-container matColumnDef="schedule">
                <th mat-header-cell *matHeaderCellDef>调度配置</th>
                <td mat-cell *matCellDef="let platform">
                  <div class="schedule-info">
                    <mat-chip-set>
                      <mat-chip>{{ platform.schedule.interval }}</mat-chip>
                      <mat-chip>{{ platform.schedule.day }}</mat-chip>
                      <mat-chip>{{ platform.schedule.time }}</mat-chip>
                    </mat-chip-set>
                  </div>
                </td>
              </ng-container>

              <!-- 数据文件状态列 -->
              <ng-container matColumnDef="dataFile">
                <th mat-header-cell *matHeaderCellDef>数据文件</th>
                <td mat-cell *matCellDef="let platform">
                  <div class="file-status">
                    <mat-icon
                      [color]="platform.data_file_exists ? 'primary' : 'warn'">
                      {{ platform.data_file_exists ? 'check_circle' : 'error' }}
                    </mat-icon>
                    <span>{{ platform.data_file_exists ? '存在' : '不存在' }}</span>
                  </div>
                </td>
              </ng-container>

              <!-- 最后更新时间列 -->
              <ng-container matColumnDef="lastUpdated">
                <th mat-header-cell *matHeaderCellDef>最后更新</th>
                <td mat-cell *matCellDef="let platform">
                  <div class="update-time">
                    {{ platform.last_updated ? (platform.last_updated | date:'yyyy-MM-dd HH:mm:ss') : '从未更新' }}
                  </div>
                </td>
              </ng-container>

              <!-- 操作列 -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>操作</th>
                <td mat-cell *matCellDef="let platform">
                  <div class="action-buttons">
                    <button
                      mat-icon-button
                      color="primary"
                      (click)="generatePlatform(platform.platform_name)"
                      matTooltip="生成此平台数据">
                      <mat-icon>play_arrow</mat-icon>
                    </button>
                    <button
                      mat-icon-button
                      color="accent"
                      (click)="viewPlatformDetails(platform.platform_name)"
                      matTooltip="查看详情">
                      <mat-icon>info</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </mat-card-content>
        </mat-card>

        <!-- 统计信息卡片 -->
        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-number">{{ platforms().length }}</div>
              <div class="stat-label">已注册平台</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-number">{{ activePlatformsCount() }}</div>
              <div class="stat-label">活跃平台</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-number">{{ updatedPlatformsCount() }}</div>
              <div class="stat-label">已更新平台</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-number">{{ scheduleActive() ? '运行中' : '已停止' }}</div>
              <div class="stat-label">定时任务状态</div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-education-platforms {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e0e0e0;
    }

    .header h2 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
      color: #333;
    }

    .header-actions {
      display: flex;
      gap: 10px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #666;
    }

    .platforms-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .platforms-card {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .platforms-table {
      width: 100%;
    }

    .platform-name {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }

    .schedule-info {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }

    .file-status {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .update-time {
      font-size: 0.9em;
      color: #666;
    }

    .action-buttons {
      display: flex;
      gap: 5px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 20px;
    }

    .stat-card {
      text-align: center;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .stat-number {
      font-size: 2em;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .stat-label {
      font-size: 0.9em;
      opacity: 0.9;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
      }

      .header-actions {
        justify-content: center;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminEducationPlatformsComponent implements OnInit {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);

  readonly loading = signal<boolean>(true);
  readonly platforms = signal<PlatformStatus[]>([]);
  readonly scheduleActive = signal<boolean>(false);

  readonly displayedColumns: string[] = ['name', 'schedule', 'dataFile', 'lastUpdated', 'actions'];

  ngOnInit(): void {
    this.loadPlatformStatus();
  }

  async loadPlatformStatus(): Promise<void> {
    this.loading.set(true);
    try {
      const response: any = await firstValueFrom(
        this.http.get('/api/v1/admin/education-platforms/status')
      );

      if (response.success && response.data) {
        // 将对象转换为数组
        const platformsArray = Object.values(response.data);
        this.platforms.set(platformsArray as PlatformStatus[]);
      }

    } catch (error) {
      console.error('加载平台状态失败:', error);
      this.snackBar.open('加载平台状态失败', '关闭', { duration: 3000 });
    } finally {
      this.loading.set(false);
    }
  }

  async refreshStatus(): Promise<void> {
    await this.loadPlatformStatus();
    this.snackBar.open('状态已刷新', '关闭', { duration: 2000 });
  }

  async generateAllPlatforms(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post('/api/v1/education-platforms/generate', {})
      );
      this.snackBar.open('已开始生成所有平台数据', '关闭', { duration: 3000 });
    } catch (error) {
      console.error('生成平台数据失败:', error);
      this.snackBar.open('生成平台数据失败', '关闭', { duration: 3000 });
    }
  }

  async generatePlatform(platformName: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post('/api/v1/education-platforms/generate', { platform_name: platformName })
      );
      this.snackBar.open(`已开始生成 ${platformName} 平台数据`, '关闭', { duration: 3000 });
    } catch (error) {
      console.error(`生成 ${platformName} 平台数据失败:`, error);
      this.snackBar.open(`生成 ${platformName} 平台数据失败`, '关闭', { duration: 3000 });
    }
  }

  async toggleSchedule(): Promise<void> {
    // 简化版本，仅切换本地状态
    this.scheduleActive.set(!this.scheduleActive());
    const status = this.scheduleActive() ? '已启动' : '已停止';
    this.snackBar.open(`定时任务${status}（演示模式）`, '关闭', { duration: 2000 });
  }

  viewPlatformDetails(platformName: string): void {
    // 这里可以打开详情对话框或导航到详情页
    this.snackBar.open(`查看 ${platformName} 详情功能待实现`, '关闭', { duration: 2000 });
  }

  get activePlatformsCount(): () => number {
    return () => this.platforms().filter(p => p.registered).length;
  }

  get updatedPlatformsCount(): () => number {
    return () => this.platforms().filter(p => p.data_file_exists).length;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
