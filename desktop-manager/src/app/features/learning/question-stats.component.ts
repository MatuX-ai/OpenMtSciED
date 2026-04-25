import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { QuestionService } from '../../services/question.service';

@Component({
  selector: 'app-question-stats',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatChipsModule
  ],
  template: `
    <div class="stats-container">
      <div class="page-header">
        <h2><mat-icon class="header-icon">insights</mat-icon> 学习数据分析</h2>
        <p class="subtitle">追踪你的学习进度和知识掌握情况</p>
      </div>
      
      <!-- 总体准确率 -->
      <div class="stats-grid">
        <mat-card class="stat-card overall-card">
          <mat-card-content>
            <div class="card-header">
              <mat-icon class="card-icon">track_changes</mat-icon>
              <h3>总体正确率</h3>
            </div>
            <div class="accuracy-display">
              <div class="accuracy-circle" [style.background]="getAccuracyGradient(stats.overall_accuracy)">
                <div class="accuracy-value">{{ stats.overall_accuracy }}%</div>
                <div class="accuracy-label">正确率</div>
              </div>
            </div>
            <div class="accuracy-details">
              <div class="detail-item">
                <span class="label">总答题数</span>
                <span class="value">{{ stats.total_answers || 0 }}</span>
              </div>
              <div class="detail-item">
                <span class="label">正确数</span>
                <span class="value success">{{ stats.correct_answers || 0 }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- 学习趋势 -->
        <mat-card class="stat-card trend-card">
          <mat-card-content>
            <div class="card-header">
              <mat-icon class="card-icon">trending_up</mat-icon>
              <h3>最近表现</h3>
            </div>
            <div class="trend-info">
              <div class="trend-item">
                <span class="trend-label">今日答题</span>
                <span class="trend-value">{{ stats.today_answers || 0 }}</span>
              </div>
              <div class="trend-item">
                <span class="trend-label">本周正确率</span>
                <span class="trend-value">{{ stats.week_accuracy || 0 }}%</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- 知识点掌握度 -->
      <mat-card class="mastery-section">
        <mat-card-content>
          <div class="section-header">
            <h3><mat-icon>psychology</mat-icon> 知识点掌握度</h3>
            <span class="total-count">共 {{ masteryList.length }} 个知识点</span>
          </div>
          <div class="mastery-list">
            <div *ngFor="let item of masteryList" class="mastery-item">
              <div class="point-info">
                <span class="point-name">{{ item.key }}</span>
                <span class="percentage" [style.color]="getMasteryColor(item.value)">{{ item.value }}%</span>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" 
                     [style.width.%]="item.value"
                     [style.background]="getMasteryGradient(item.value)"></div>
              </div>
            </div>
          </div>
          <div *ngIf="masteryList.length === 0" class="empty-state">
            <mat-icon class="empty-icon">analytics</mat-icon>
            <p>暂无学习数据，开始答题后即可查看</p>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- 最近错题 -->
      <mat-card class="mistakes-section">
        <mat-card-content>
          <div class="section-header">
            <h3><mat-icon>error_outline</mat-icon> 最近错题回顾</h3>
            <button *ngIf="mistakes.length > 0" mat-stroked-button color="primary" class="review-btn">
              <mat-icon>refresh</mat-icon>
              <span>重新练习</span>
            </button>
          </div>
          <div *ngIf="mistakes.length === 0" class="empty-state">
            <mat-icon class="empty-icon">check_circle</mat-icon>
            <p>太棒了！目前没有错题记录。</p>
          </div>
          <div *ngFor="let m of mistakes" class="mistake-card">
            <div class="mistake-header">
              <span class="question-type">{{ getQuestionTypeText(m.question_type) }}</span>
              <span class="difficulty-badge" [class]="'level-' + m.difficulty_level">{{ getDifficultyText(m.difficulty_level) }}</span>
            </div>
            <p class="q-text">{{ m.question_content }}</p>
            <div class="tags">
              <mat-chip-set>
                <mat-chip *ngFor="let tag of m.knowledge_points">
                  <mat-icon>tag</mat-icon>
                  {{ tag }}
                </mat-chip>
              </mat-chip-set>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .stats-container { 
      max-width: 1200px; 
      margin: 0 auto; 
      padding: 24px;
    }

    .page-header {
      text-align: center;
      margin-bottom: 32px;
      padding-bottom: 20px;
      border-bottom: 2px solid var(--border-color);

      h2 {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        font-size: 28px;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 8px 0;
      }

      .header-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: var(--primary-color);
      }

      .subtitle {
        font-size: 16px;
        color: var(--text-secondary);
        margin: 0;
      }
    }

    /* 统计卡片网格 */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .stat-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      }

      .card-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;

        .card-icon {
          font-size: 28px;
          width: 28px;
          height: 28px;
          color: var(--primary-color);
        }

        h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
        }
      }
    }

    .overall-card {
      .accuracy-display {
        display: flex;
        justify-content: center;
        margin-bottom: 20px;
      }

      .accuracy-circle { 
        width: 140px; 
        height: 140px; 
        border-radius: 50%; 
        display: flex; 
        flex-direction: column;
        align-items: center; 
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);

        .accuracy-value {
          font-size: 32px;
          font-weight: 700;
          color: white;
          line-height: 1;
        }

        .accuracy-label {
          font-size: 14px;
          color: rgba(255,255,255,0.9);
          margin-top: 4px;
        }
      }

      .accuracy-details {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;

        .detail-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px;
          background: var(--bg-secondary);
          border-radius: 8px;

          .label {
            font-size: 12px;
            color: var(--text-secondary);
            margin-bottom: 4px;
          }

          .value {
            font-size: 24px;
            font-weight: 700;
            color: var(--text-primary);

            &.success {
              color: #4caf50;
            }
          }
        }
      }
    }

    .trend-card {
      .trend-info {
        display: flex;
        flex-direction: column;
        gap: 16px;

        .trend-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: var(--bg-secondary);
          border-radius: 8px;

          .trend-label {
            font-size: 14px;
            color: var(--text-secondary);
          }

          .trend-value {
            font-size: 20px;
            font-weight: 700;
            color: var(--primary-color);
          }
        }
      }
    }

    /* 知识点掌握度 */
    .mastery-section,
    .mistakes-section {
      margin-bottom: 24px;

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        h3 {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;

          mat-icon {
            color: var(--primary-color);
          }
        }

        .total-count {
          font-size: 14px;
          color: var(--text-secondary);
          background: var(--bg-secondary);
          padding: 6px 12px;
          border-radius: 16px;
        }

        .review-btn {
          display: flex;
          align-items: center;
          gap: 6px;
        }
      }
    }

    .mastery-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .mastery-item {
      .point-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .point-name {
          font-size: 15px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .percentage {
          font-size: 14px;
          font-weight: 600;
        }
      }

      .progress-bar-bg { 
        height: 12px; 
        background: var(--bg-secondary); 
        border-radius: 6px; 
        overflow: hidden;
        box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
      }

      .progress-bar-fill { 
        height: 100%; 
        transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 6px;
      }
    }

    /* 错题卡片 */
    .mistake-card { 
      background: linear-gradient(135deg, #fff5f5 0%, #ffebee 100%); 
      padding: 20px; 
      border-radius: 12px; 
      margin-bottom: 16px; 
      border-left: 4px solid #f44336;
      transition: transform 0.2s ease;

      &:hover {
        transform: translateX(4px);
      }

      .mistake-header {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;

        .question-type {
          font-size: 12px;
          font-weight: 600;
          color: #c62828;
          background: rgba(244, 67, 54, 0.1);
          padding: 4px 10px;
          border-radius: 12px;
        }

        .difficulty-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 12px;
          text-transform: uppercase;

          &.level-easy {
            background: #e8f5e9;
            color: #2e7d32;
          }

          &.level-medium {
            background: #fff3e0;
            color: #ef6c00;
          }

          &.level-hard {
            background: #ffebee;
            color: #c62828;
          }
        }
      }

      .q-text { 
        font-size: 15px;
        line-height: 1.6;
        color: var(--text-primary);
        margin: 0 0 12px 0;
      }

      .tags {
        mat-chip-set {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        mat-chip {
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;

          mat-icon {
            font-size: 14px;
            width: 14px;
            height: 14px;
          }
        }
      }
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--text-secondary);

      .empty-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: var(--border-color);
        margin-bottom: 16px;
      }

      p {
        font-size: 16px;
        margin: 0;
      }
    }

    /* 响应式设计 */
    @media (max-width: 768px) {
      .stats-container {
        padding: 16px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .page-header h2 {
        font-size: 24px;
      }

      .accuracy-circle {
        width: 120px !important;
        height: 120px !important;

        .accuracy-value {
          font-size: 28px !important;
        }
      }
    }
  `]
})
export class QuestionStatsComponent implements OnInit {
  stats: any = { overall_accuracy: 0 };
  masteryList: { key: string, value: number }[] = [];
  mistakes: any[] = [];

  constructor(private questionService: QuestionService) {}

  ngOnInit() {
    this.loadStats();
    this.loadHistory();
  }

  loadStats() {
    this.questionService.getStats().subscribe(res => {
      this.stats = res;
      if (res.knowledge_mastery) {
        this.masteryList = Object.entries(res.knowledge_mastery).map(([k, v]) => ({ key: k, value: v as number }));
      }
    });
  }

  loadHistory() {
    this.questionService.getHistory().subscribe(res => {
      this.mistakes = res.data.filter((item: any) => !item.is_correct).slice(0, 5);
    });
  }

  getAccuracyColor(accuracy: number): string {
    if (accuracy >= 80) return '#4caf50';
    if (accuracy >= 60) return '#ff9800';
    return '#f44336';
  }

  // 获取准确率渐变色
  getAccuracyGradient(accuracy: number): string {
    if (accuracy >= 80) {
      return 'linear-gradient(135deg, #66bb6a 0%, #43a047 100%)';
    } else if (accuracy >= 60) {
      return 'linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)';
    } else {
      return 'linear-gradient(135deg, #ef5350 0%, #e53935 100%)';
    }
  }

  // 获取掌握度颜色
  getMasteryColor(value: number): string {
    if (value >= 80) return '#2e7d32';
    if (value >= 60) return '#ef6c00';
    return '#c62828';
  }

  // 获取掌握度渐变色
  getMasteryGradient(value: number): string {
    if (value >= 80) {
      return 'linear-gradient(90deg, #66bb6a 0%, #43a047 100%)';
    } else if (value >= 60) {
      return 'linear-gradient(90deg, #ffa726 0%, #fb8c00 100%)';
    } else {
      return 'linear-gradient(90deg, #ef5350 0%, #e53935 100%)';
    }
  }

  // 获取问题类型文本
  getQuestionTypeText(type?: string): string {
    const types: { [key: string]: string } = {
      'multiple_choice': '选择题',
      'true_false': '判断题',
      'short_answer': '简答题',
      'essay': '论述题'
    };
    return types[type || ''] || type || '未知';
  }

  // 获取难度文本
  getDifficultyText(level?: string): string {
    const levels: { [key: string]: string } = {
      'easy': '简单',
      'medium': '中等',
      'hard': '困难'
    };
    return levels[level || ''] || level || '未知';
  }
}
