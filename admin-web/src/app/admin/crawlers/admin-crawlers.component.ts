import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface CrawlerTask {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
  total_items: number;
  scraped_items: number;
  last_run: string | null;
  next_scheduled: string | null;
  error_message: string | null;
}

interface CrawlerStats {
  totalCrawlers: number;
  activeCrawlers: number;
  totalItemsScraped: number;
  lastRunTime: string | null;
}

interface ExecutionRecord {
  crawlerName: string;
  startTime: string;
  endTime: string | null;
  status: 'success' | 'failed' | 'running';
  itemsScraped: number;
  duration: number; // seconds
}

interface ErrorLog {
  crawlerName: string;
  timestamp: string;
  message: string;
  details?: string;
}

@Component({
  selector: 'app-admin-crawlers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatChipsModule,
    MatTabsModule,
  ],
  template: `
    <div class="admin-crawlers">
      <!-- 头部 -->
      <div class="header">
        <h2>
          <mat-icon>spider_web</mat-icon>
          爬虫管理
        </h2>
        <div class="header-actions">
          <button mat-stroked-button color="primary" (click)="refreshData()">
            <mat-icon>refresh</mat-icon>
            刷新
          </button>
          <button mat-flat-button color="accent" (click)="openAddDialog()">
            <mat-icon>add</mat-icon>
            新增数据源
          </button>
          <button mat-flat-button color="primary" (click)="runAllCrawlers()" [disabled]="hasRunningCrawler()">
            <mat-icon>play_arrow</mat-icon>
            运行全部
          </button>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-grid" *ngIf="!loading(); else loadingTemplate">
        <mat-card class="stat-card total-crawlers">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>spider_web</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats()?.totalCrawlers || 0 }}</div>
              <div class="stat-label">爬虫总数</div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card active-crawlers">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>play_circle</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats()?.activeCrawlers || 0 }}</div>
              <div class="stat-label">运行中</div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card total-items">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>database</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ formatNumber(stats()?.totalItemsScraped || 0) }}</div>
              <div class="stat-label">已爬取数据</div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card last-run">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>schedule</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ formatLastRun(stats()?.lastRunTime || null) }}</div>
              <div class="stat-label">最后运行</div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <ng-template #loadingTemplate>
        <div class="loading-container">
          <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
          <p>加载爬虫任务...</p>
        </div>
      </ng-template>

      <!-- 爬虫任务列表 -->
      <div class="crawlers-container" *ngIf="!loading()">
        <mat-tab-group>
          <!-- 所有爬虫 -->
          <mat-tab label="所有爬虫任务">
            <div class="tab-content">
              <mat-card class="crawlers-card">
                <mat-card-header>
                  <mat-card-title>爬虫任务列表</mat-card-title>
                  <mat-card-subtitle>管理和监控所有STEM教育资源爬取任务</mat-card-subtitle>
                </mat-card-header>

                <mat-card-content>
                  <table mat-table [dataSource]="crawlerTasks()" class="crawlers-table">
                    <!-- 名称列 -->
                    <ng-container matColumnDef="name">
                      <th mat-header-cell *matHeaderCellDef>爬虫名称</th>
                      <td mat-cell *matCellDef="let task">
                        <div class="task-name">
                          <strong>{{ task.name }}</strong>
                          <div class="task-description">{{ task.description }}</div>
                        </div>
                      </td>
                    </ng-container>

                    <!-- 状态列 -->
                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef>状态</th>
                      <td mat-cell *matCellDef="let task">
                        <mat-chip-set>
                          <mat-chip [color]="getStatusColor(task.status)" highlighted>
                            {{ getStatusText(task.status) }}
                          </mat-chip>
                        </mat-chip-set>
                      </td>
                    </ng-container>

                    <!-- 进度列 -->
                    <ng-container matColumnDef="progress">
                      <th mat-header-cell *matHeaderCellDef>进度</th>
                      <td mat-cell *matCellDef="let task">
                        <div class="progress-info">
                          <div class="progress-bar" [style.width.%]="task.progress">
                            {{ task.scraped_items }} / {{ task.total_items }}
                          </div>
                          <span class="progress-text">{{ task.progress }}%</span>
                        </div>
                      </td>
                    </ng-container>

                    <!-- 最后运行列 -->
                    <ng-container matColumnDef="lastRun">
                      <th mat-header-cell *matHeaderCellDef>最后运行</th>
                      <td mat-cell *matCellDef="let task">
                        {{ task.last_run ? formatDate(task.last_run) : '从未运行' }}
                      </td>
                    </ng-container>

                    <!-- 操作列 -->
                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef>操作</th>
                      <td mat-cell *matCellDef="let task">
                        <div class="action-buttons">
                          <button
                            mat-icon-button
                            color="primary"
                            (click)="runCrawler(task)"
                            [disabled]="task.status === 'running'"
                            matTooltip="运行爬虫">
                            <mat-icon>play_arrow</mat-icon>
                          </button>
                          <button
                            mat-icon-button
                            color="warn"
                            (click)="stopCrawler(task)"
                            [disabled]="task.status !== 'running'"
                            matTooltip="停止爬虫">
                            <mat-icon>stop</mat-icon>
                          </button>
                          <button
                            mat-icon-button
                            color="primary"
                            (click)="setSchedule(task)"
                            matTooltip="设置周期">
                            <mat-icon>schedule</mat-icon>
                          </button>
                          <button
                            mat-icon-button
                            color="warn"
                            (click)="deleteCrawler(task)"
                            matTooltip="删除数据源">
                            <mat-icon>delete</mat-icon>
                          </button>
                          <button
                            mat-icon-button
                            color="accent"
                            (click)="viewLogs(task)"
                            matTooltip="查看日志">
                            <mat-icon>list_alt</mat-icon>
                          </button>
                        </div>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

                    <!-- 空数据提示 -->
                    <tr class="empty-row" *matNoDataRow>
                      <td [attr.colspan]="displayedColumns.length">
                        <div class="empty-state">
                          <mat-icon>spider_web</mat-icon>
                          <p>暂无爬虫任务</p>
                        </div>
                      </td>
                    </tr>
                  </table>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- 运行历史 -->
          <mat-tab label="运行历史">
            <div class="tab-content">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>爬虫运行历史记录</mat-card-title>
                  <mat-card-subtitle>查看最近30天的爬虫执行记录</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <table mat-table [dataSource]="executionHistory()" class="history-table">
                    <!-- 爬虫名称列 -->
                    <ng-container matColumnDef="crawlerName">
                      <th mat-header-cell *matHeaderCellDef>爬虫名称</th>
                      <td mat-cell *matCellDef="let record">{{ record.crawlerName }}</td>
                    </ng-container>

                    <!-- 开始时间列 -->
                    <ng-container matColumnDef="startTime">
                      <th mat-header-cell *matHeaderCellDef>开始时间</th>
                      <td mat-cell *matCellDef="let record">{{ formatDate(record.startTime) }}</td>
                    </ng-container>

                    <!-- 结束时间列 -->
                    <ng-container matColumnDef="endTime">
                      <th mat-header-cell *matHeaderCellDef>结束时间</th>
                      <td mat-cell *matCellDef="let record">{{ record.endTime ? formatDate(record.endTime) : '运行中' }}</td>
                    </ng-container>

                    <!-- 状态列 -->
                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef>状态</th>
                      <td mat-cell *matCellDef="let record">
                        <mat-chip-set>
                          <mat-chip [color]="getHistoryStatusColor(record.status)" highlighted>
                            {{ getHistoryStatusText(record.status) }}
                          </mat-chip>
                        </mat-chip-set>
                      </td>
                    </ng-container>

                    <!-- 爬取数量列 -->
                    <ng-container matColumnDef="itemsScraped">
                      <th mat-header-cell *matHeaderCellDef>爬取数量</th>
                      <td mat-cell *matCellDef="let record">{{ record.itemsScraped }}</td>
                    </ng-container>

                    <!-- 耗时列 -->
                    <ng-container matColumnDef="duration">
                      <th mat-header-cell *matHeaderCellDef>耗时</th>
                      <td mat-cell *matCellDef="let record">{{ formatDuration(record.duration) }}</td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="historyColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: historyColumns;"></tr>

                    <tr class="empty-row" *matNoDataRow>
                      <td [attr.colspan]="historyColumns.length">
                        <div class="empty-state">
                          <mat-icon>history</mat-icon>
                          <p>暂无运行历史记录</p>
                        </div>
                      </td>
                    </tr>
                  </table>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- 错误日志 -->
          <mat-tab label="错误日志">
            <div class="tab-content">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>错误日志</mat-card-title>
                  <mat-card-subtitle>查看爬虫执行过程中的错误信息</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="error-logs" *ngIf="errorLogs().length > 0; else noErrors">
                    <div class="error-log-item" *ngFor="let log of errorLogs()">
                      <div class="log-header">
                        <mat-icon color="warn">error</mat-icon>
                        <strong>{{ log.crawlerName }}</strong>
                        <span class="log-time">{{ formatDate(log.timestamp) }}</span>
                      </div>
                      <div class="log-message">{{ log.message }}</div>
                      <div class="log-details" *ngIf="log.details">
                        <pre>{{ log.details }}</pre>
                      </div>
                    </div>
                  </div>
                  <ng-template #noErrors>
                    <div class="no-errors">
                      <mat-icon color="accent">check_circle</mat-icon>
                      <p>暂无错误日志</p>
                    </div>
                  </ng-template>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .admin-crawlers {
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

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }

    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      padding: 20px;
    }

    .stat-icon {
      margin-right: 16px;
    }

    .stat-icon mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
    }

    .stat-info {
      flex: 1;
    }

    .stat-number {
      font-size: 24px;
      font-weight: bold;
      color: #333;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 14px;
      color: #666;
    }

    .total-crawlers { border-left: 4px solid #2196F3; }
    .active-crawlers { border-left: 4px solid #4CAF50; }
    .total-items { border-left: 4px solid #FF9800; }
    .last-run { border-left: 4px solid #9C27B0; }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #666;
    }

    .crawlers-container {
      margin-top: 20px;
    }

    .tab-content {
      padding: 20px 0;
    }

    .crawlers-card {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .crawlers-table {
      width: 100%;
    }

    .task-name {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .task-description {
      font-size: 0.85em;
      color: #666;
    }

    .progress-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .progress-bar {
      flex: 1;
      height: 20px;
      background: #e0e0e0;
      border-radius: 10px;
      overflow: hidden;
      position: relative;
      background: linear-gradient(90deg, #4CAF50 0%, #4CAF50 var(--progress), #e0e0e0 var(--progress), #e0e0e0 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.75em;
      font-weight: bold;
    }

    .progress-text {
      font-size: 0.85em;
      color: #666;
      min-width: 45px;
    }

    .action-buttons {
      display: flex;
      gap: 5px;
    }

    .empty-row td {
      padding: 60px 20px;
      text-align: center;
      color: #999;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }

    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #ccc;
    }

    .placeholder-text {
      text-align: center;
      padding: 40px;
      color: #999;
    }

    .history-table {
      width: 100%;
    }

    .error-logs {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .error-log-item {
      border-left: 4px solid #f44336;
      background: #ffebee;
      padding: 15px;
      border-radius: 4px;
    }

    .log-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }

    .log-time {
      margin-left: auto;
      font-size: 0.85em;
      color: #666;
    }

    .log-message {
      color: #d32f2f;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .log-details pre {
      background: #fff;
      padding: 10px;
      border-radius: 4px;
      font-size: 0.8em;
      overflow-x: auto;
      color: #333;
      margin: 0;
    }

    .no-errors {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      padding: 60px 20px;
      color: #4CAF50;
    }

    .no-errors mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
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

      /* 移动端表格优化 */
      .crawlers-table,
      .history-table {
        display: block;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }

      /* 移动端操作按钮优化 */
      .action-buttons button {
        width: 36px;
        height: 36px;
        line-height: 36px;
      }

      .task-name strong {
        font-size: 14px;
      }

      .task-description {
        font-size: 12px;
      }

      /* 错误日志移动端优化 */
      .log-header {
        flex-wrap: wrap;
      }

      .log-time {
        width: 100%;
        margin-left: 28px;
        margin-top: 4px;
      }
    }

    @media (max-width: 480px) {
      .admin-crawlers {
        padding: 10px;
      }

      .header h2 {
        font-size: 18px;
      }

      .stat-number {
        font-size: 20px;
      }

      .stat-label {
        font-size: 12px;
      }

      .progress-bar {
        font-size: 0.65em;
      }
    }
  `],
})
export class AdminCrawlersComponent implements OnInit {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  readonly loading = signal<boolean>(true);
  readonly crawlerTasks = signal<CrawlerTask[]>([]);
  readonly stats = signal<CrawlerStats | null>(null);
  readonly executionHistory = signal<ExecutionRecord[]>([]);
  readonly errorLogs = signal<ErrorLog[]>([]);

  readonly displayedColumns: string[] = ['name', 'status', 'progress', 'lastRun', 'actions'];
  readonly historyColumns: string[] = ['crawlerName', 'startTime', 'endTime', 'status', 'itemsScraped', 'duration'];

  async ngOnInit(): Promise<void> {
    await this.loadCrawlerTasks();
    this.loadStats();
    this.loadExecutionHistory();
    this.loadErrorLogs();
  }

  async loadCrawlerTasks(): Promise<void> {
    this.loading.set(true);
    try {
      const response: any = await firstValueFrom(this.http.get('/api/v1/admin/crawler'));
      if (response.success) {
        this.crawlerTasks.set(response.data);
        // 数据加载完成后更新统计
        this.loadStats();
      }
    } catch (error) {
      console.error('加载爬虫任务失败:', error);
      this.snackBar.open('加载爬虫任务失败', '关闭', { duration: 3000 });
    } finally {
      this.loading.set(false);
    }
  }

  async loadStats(): Promise<void> {
    try {
      const tasks = this.crawlerTasks();
      this.stats.set({
        totalCrawlers: tasks.length,
        activeCrawlers: tasks.filter(t => t.status === 'running').length,
        totalItemsScraped: tasks.reduce((sum, t) => sum + t.scraped_items, 0),
        lastRunTime: tasks.length > 0 ? tasks[0].last_run : null
      });
    } catch (error) {
      console.error('加载统计失败:', error);
    }
  }

  async loadExecutionHistory(): Promise<void> {
    try {
      // 模拟运行历史数据
      const mockHistory: ExecutionRecord[] = [
        {
          crawlerName: '北师大K-12课程爬虫',
          startTime: '2024-03-15T10:30:00Z',
          endTime: '2024-03-15T11:15:00Z',
          status: 'success',
          itemsScraped: 150,
          duration: 2700
        },
        {
          crawlerName: 'OpenSciEd资源爬虫',
          startTime: '2024-03-14T09:00:00Z',
          endTime: '2024-03-14T10:30:00Z',
          status: 'success',
          itemsScraped: 280,
          duration: 5400
        },
        {
          crawlerName: '上海STEM课程爬虫',
          startTime: '2024-03-13T14:20:00Z',
          endTime: '2024-03-13T14:50:00Z',
          status: 'failed',
          itemsScraped: 45,
          duration: 1800
        },
        {
          crawlerName: 'OpenStax教材爬虫',
          startTime: '2024-03-12T16:45:00Z',
          endTime: '2024-03-12T17:30:00Z',
          status: 'success',
          itemsScraped: 95,
          duration: 2700
        }
      ];
      this.executionHistory.set(mockHistory);
    } catch (error) {
      console.error('加载运行历史失败:', error);
    }
  }

  async loadErrorLogs(): Promise<void> {
    try {
      // 模拟错误日志数据
      const mockErrors: ErrorLog[] = [
        {
          crawlerName: 'OpenStax教材爬虫',
          timestamp: '2024-03-18T16:45:00Z',
          message: '连接超时：目标网站响应缓慢',
          details: 'TimeoutError: Connection to openstax.org timed out after 30 seconds\n  at HttpClient.request (http-client.js:45)\n  at Crawler.fetchPage (crawler.js:123)'
        },
        {
          crawlerName: '上海STEM课程爬虫',
          timestamp: '2024-03-13T14:35:00Z',
          message: '页面解析失败：HTML结构发生变化',
          details: 'ParseError: Cannot find element with selector ".course-list"\n  at HTMLParser.parse (parser.js:78)\n  at Crawler.extractData (crawler.js:156)'
        }
      ];
      this.errorLogs.set(mockErrors);
    } catch (error) {
      console.error('加载错误日志失败:', error);
    }
  }

  refreshData(): void {
    this.loadCrawlerTasks();
    this.loadStats();
    this.snackBar.open('数据已刷新', '关闭', { duration: 2000 });
  }

  hasRunningCrawler(): boolean {
    return this.crawlerTasks().some(t => t.status === 'running');
  }

  async runAllCrawlers(): Promise<void> {
    if (confirm('确定要运行所有爬虫任务吗？')) {
      this.snackBar.open('开始运行所有爬虫任务...', '关闭', { duration: 2000 });
      // TODO: 调用API运行所有爬虫
    }
  }

  setSchedule(task: CrawlerTask): void {
    const hours = prompt('请输入抓取间隔（小时）：', '24');
    if (!hours) return;

    this.http.post(`/api/v1/admin/crawler/${task.id}/schedule?interval_hours=${hours}`, {}).subscribe({
      next: () => this.snackBar.open('定时任务设置成功', '关闭', { duration: 2000 }),
      error: () => this.snackBar.open('设置失败', '关闭', { duration: 3000 })
    });
  }

  async deleteCrawler(task: CrawlerTask): Promise<void> {
    if (confirm(`确定要删除爬虫 "${task.name}" 吗？`)) {
      try {
        await firstValueFrom(this.http.delete(`/api/v1/admin/crawler/${task.id}`));
        this.snackBar.open('删除成功', '关闭', { duration: 2000 });
        this.loadCrawlerTasks();
      } catch (error) {
        this.snackBar.open('删除失败', '关闭', { duration: 3000 });
      }
    }
  }

  openAddDialog(): void {
    const name = prompt('请输入数据源名称：');
    if (!name) return;
    const url = prompt('请输入目标网站地址：');
    if (!url) return;
    const type = confirm('是教程吗？(点击“取消”则为课件)') ? 'course' : 'textbook';

    const newCrawler = {
      id: `crawler-${Date.now()}`,
      name: name,
      description: `爬取 ${name} 的资源`,
      target_url: url,
      type: type,
      status: 'idle',
      progress: 0,
      total_items: 0,
      scraped_items: 0,
      last_run: null,
      error_message: null
    };

    this.http.post('/api/v1/admin/crawler', newCrawler).subscribe({
      next: () => {
        this.snackBar.open('添加成功', '关闭', { duration: 2000 });
        this.loadCrawlerTasks();
      },
      error: (err) => {
        this.snackBar.open('添加失败', '关闭', { duration: 3000 });
      }
    });
  }

  async runCrawler(task: CrawlerTask): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`/api/v1/admin/crawler/${task.id}/run`, {}));
      this.snackBar.open(`启动爬虫: ${task.name}`, '关闭', { duration: 2000 });
      setTimeout(() => this.loadCrawlerTasks(), 1000);
    } catch (error) {
      this.snackBar.open('启动失败', '关闭', { duration: 3000 });
    }
  }

  async stopCrawler(task: CrawlerTask): Promise<void> {
    if (confirm(`确定要停止爬虫 "${task.name}" 吗？`)) {
      this.snackBar.open(`停止爬虫: ${task.name}`, '关闭', { duration: 2000 });
      // TODO: 调用API停止爬虫
    }
  }

  viewLogs(task: CrawlerTask): void {
    this.snackBar.open(`查看日志: ${task.name}`, '关闭', { duration: 2000 });
    // TODO: 打开日志查看对话框
  }

  getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      idle: '',
      running: 'primary',
      completed: 'accent',
      failed: 'warn'
    };
    return colorMap[status] || '';
  }

  getStatusText(status: string): string {
    const textMap: Record<string, string> = {
      idle: '待运行',
      running: '运行中',
      completed: '已完成',
      failed: '失败'
    };
    return textMap[status] || status;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatLastRun(dateString: string | null): string {
    if (!dateString) return '从未';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return '刚刚';
    if (hours < 24) return `${hours}小时前`;
    return `${Math.floor(hours / 24)}天前`;
  }

  formatNumber(num: number): string {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万';
    }
    return num.toString();
  }

  getHistoryStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      success: 'accent',
      failed: 'warn',
      running: 'primary'
    };
    return colorMap[status] || '';
  }

  getHistoryStatusText(status: string): string {
    const textMap: Record<string, string> = {
      success: '成功',
      failed: '失败',
      running: '运行中'
    };
    return textMap[status] || status;
  }

  formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}秒`;
    }
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes}分钟`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}小时${remainingMinutes}分钟` : `${hours}小时`;
  }
}
