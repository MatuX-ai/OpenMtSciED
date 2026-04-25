import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { QuestionService, QuestionBank, Question } from '../../services/question.service';

@Component({
  selector: 'app-question-practice',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  animations: [
    trigger('fadeInOut', [
      state('void', style({ opacity: 0, transform: 'translateY(-10px)' })),
      transition(':enter', [
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ],
  template: `
    <div class="practice-container">
      <div class="page-header">
        <h2><mat-icon class="header-icon">quiz</mat-icon> STEM 题库练习</h2>
        <p class="subtitle">通过系统练习提升你的STEM知识掌握度</p>
      </div>
      
      <!-- 题库选择 -->
      <div class="bank-selector" *ngIf="!currentBank">
        <div class="section-header">
          <h3><mat-icon>library_books</mat-icon> 选择题库</h3>
          <span class="total-count">共 {{ banks.length }} 个题库</span>
        </div>
        <div class="bank-list">
          <div *ngFor="let bank of banks" 
               class="bank-card" 
               (click)="selectBank(bank)"
               [attr.aria-label]="'选择题库: ' + bank.name"
               tabindex="0"
               (keydown.enter)="selectBank(bank)"
               (keydown.space)="selectBank(bank)">
            <div class="card-content">
              <div class="card-icon" [style.background]="getBankColor(bank.subject)">
                <mat-icon>{{ getBankIcon(bank.subject) }}</mat-icon>
              </div>
              <div class="card-info">
                <h4>{{ bank.name }}</h4>
                <p class="description">{{ bank.description || '暂无描述' }}</p>
                <div class="meta-info">
                  <span class="badge level-badge" [class]="'level-' + bank.level">{{ getLevelText(bank.level) }}</span>
                  <span class="count"><mat-icon class="small-icon">format_list_numbered</mat-icon> {{ bank.total_questions }} 题</span>
                  <span class="subject-badge" *ngIf="bank.subject">{{ getSubjectText(bank.subject) }}</span>
                </div>
              </div>
            </div>
            <div class="card-arrow">
              <mat-icon>arrow_forward</mat-icon>
            </div>
          </div>
        </div>
        <div *ngIf="banks.length === 0" class="empty-state">
          <mat-icon class="empty-icon">inbox</mat-icon>
          <p>暂无可用题库，请联系管理员添加</p>
        </div>
      </div>

      <!-- 答题区域 -->
      <div class="question-area" *ngIf="currentBank && currentQuestion">
        <div class="question-header">
          <button (click)="backToBanks()" class="btn-back" mat-stroked-button>
            <mat-icon>arrow_back</mat-icon>
            <span>返回题库</span>
          </button>
          <div class="header-info">
            <span class="badge level-badge" [class]="'level-' + currentBank.level">{{ getLevelText(currentBank.level) }}</span>
            <div class="progress-indicator">
              <mat-progress-bar mode="determinate" [value]="((currentIndex + 1) / questions.length) * 100"></mat-progress-bar>
              <span class="progress-text">{{ currentIndex + 1 }} / {{ questions.length }}</span>
            </div>
            <span *ngIf="isAdaptiveMode" class="difficulty-badge">
              <mat-icon class="small-icon">trending_up</mat-icon>
              难度: {{ targetDifficulty | number:'1.1-1' }}
            </span>
          </div>
        </div>
        
        <div class="question-content">
          <div class="question-type-badge">
            <mat-icon>{{ getQuestionTypeIcon(currentQuestion.question_type) }}</mat-icon>
            <span>{{ getQuestionTypeText(currentQuestion.question_type) }}</span>
          </div>
          <p class="q-text">{{ currentQuestion.content }}</p>
          
          <!-- 选择题选项 -->
          <div *ngIf="currentQuestion.question_type === 'multiple_choice'" class="options">
            <div *ngFor="let opt of currentQuestion.options_json; let i = index" 
                 class="option-item" 
                 [class.selected]="selectedAnswer === opt"
                 [class.correct]="lastResult && lastResult.is_correct && selectedAnswer === opt"
                 [class.wrong]="lastResult && !lastResult.is_correct && selectedAnswer === opt"
                 (click)="selectOption(opt)"
                 [attr.aria-label]="'选项 ' + getOptionLabel(i) + ': ' + opt"
                 tabindex="0"
                 (keydown.enter)="selectOption(opt)"
                 (keydown.space)="selectOption(opt)">
              <span class="option-label">{{ getOptionLabel(i) }}</span>
              <span class="option-text">{{ opt }}</span>
              <mat-icon *ngIf="selectedAnswer === opt" class="check-icon">check_circle</mat-icon>
            </div>
          </div>

          <!-- 简答输入框 -->
          <div *ngIf="currentQuestion.question_type !== 'multiple_choice'" class="text-answer">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>请输入你的答案</mat-label>
              <textarea matInput 
                        [(ngModel)]="selectedAnswer" 
                        placeholder="在此输入答案..."
                        rows="4"
                        [disabled]="!!lastResult"></textarea>
            </mat-form-field>
          </div>
          
          <div class="action-buttons">
            <button (click)="submitAnswer()" 
                    [disabled]="!selectedAnswer || isSubmitting" 
                    class="btn-submit"
                    mat-raised-button
                    color="primary">
              <mat-icon *ngIf="!isSubmitting">send</mat-icon>
              <mat-spinner *ngIf="isSubmitting" diameter="20"></mat-spinner>
              <span>{{ isSubmitting ? '提交中...' : '提交答案' }}</span>
            </button>
          </div>
        </div>

        <!-- 结果反馈 -->
        <div *ngIf="lastResult" class="result-feedback" [class.correct]="lastResult.is_correct" [@fadeInOut]>
          <div class="result-header">
            <mat-icon class="result-icon">{{ lastResult.is_correct ? 'check_circle' : 'cancel' }}</mat-icon>
            <h4>{{ lastResult.is_correct ? '回答正确！' : '回答错误' }}</h4>
          </div>
          <div class="explanation">
            <p><strong>解析：</strong>{{ lastResult.explanation || '暂无解析' }}</p>
          </div>
          <div class="result-actions">
            <button *ngIf="currentIndex < questions.length - 1" 
                    (click)="nextQuestion()" 
                    class="btn-next"
                    mat-raised-button
                    color="accent">
              <mat-icon>arrow_forward</mat-icon>
              <span>下一题</span>
            </button>
            <button *ngIf="currentIndex >= questions.length - 1" 
                    (click)="backToBanks()" 
                    class="btn-finish"
                    mat-raised-button
                    color="primary">
              <mat-icon>library_books</mat-icon>
              <span>完成练习</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .practice-container { 
      max-width: 900px; 
      margin: 0 auto; 
      padding: 24px;
      min-height: calc(100vh - 100px);
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

    /* 题库选择区域 */
    .bank-selector {
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
      }
    }

    .bank-list { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
      gap: 20px; 
    }

    .bank-card { 
      border: 2px solid var(--border-color); 
      padding: 20px; 
      border-radius: 12px; 
      cursor: pointer; 
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      background: var(--card-bg);
      position: relative;
      overflow: hidden;

      &:hover { 
        box-shadow: 0 8px 24px rgba(0,0,0,0.12); 
        transform: translateY(-4px);
        border-color: var(--primary-color);

        .card-arrow {
          opacity: 1;
          transform: translateX(0);
        }
      }

      &:focus {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }

      .card-content {
        display: flex;
        gap: 16px;
        align-items: flex-start;
      }

      .card-icon {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        mat-icon {
          font-size: 28px;
          width: 28px;
          height: 28px;
          color: white;
        }
      }

      .card-info {
        flex: 1;
        min-width: 0;

        h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.4;
        }

        .description {
          margin: 0 0 12px 0;
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .meta-info {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
        }
      }

      .card-arrow {
        position: absolute;
        right: 16px;
        bottom: 16px;
        opacity: 0;
        transform: translateX(-10px);
        transition: all 0.3s ease;

        mat-icon {
          color: var(--primary-color);
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }
    }

    /* Badge 样式 */
    .badge { 
      padding: 4px 10px; 
      border-radius: 12px; 
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .level-badge {
      &.level-elementary { background: #e8f5e9; color: #2e7d32; }
      &.level-middle { background: #e3f2fd; color: #1565c0; }
      &.level-high { background: #fff3e0; color: #ef6c00; }
      &.level-university { background: #f3e5f5; color: #6a1b9a; }
    }

    .subject-badge {
      background: var(--bg-secondary);
      color: var(--text-secondary);
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
    }

    .count { 
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: var(--text-secondary);
      font-weight: 500;

      .small-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
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

    /* 答题区域 */
    .question-area {
      .question-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--border-color);
        flex-wrap: wrap;
        gap: 12px;
      }

      .btn-back {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .header-info {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;

        .progress-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 150px;

          mat-progress-bar {
            flex: 1;
            max-width: 120px;
          }

          .progress-text {
            font-size: 13px;
            color: var(--text-secondary);
            font-weight: 500;
            white-space: nowrap;
          }
        }
      }

      .difficulty-badge { 
        background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); 
        color: #2e7d32; 
        padding: 6px 12px; 
        border-radius: 16px; 
        font-size: 12px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 4px;

        .small-icon {
          font-size: 14px;
          width: 14px;
          height: 14px;
        }
      }
    }

    .question-content { 
      background: var(--card-bg); 
      padding: 28px; 
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      margin-top: 20px;

      .question-type-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: var(--bg-secondary);
        padding: 6px 12px;
        border-radius: 16px;
        font-size: 12px;
        font-weight: 600;
        color: var(--primary-color);
        margin-bottom: 16px;

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
      }

      .q-text {
        font-size: 18px;
        line-height: 1.6;
        color: var(--text-primary);
        margin: 0 0 24px 0;
        font-weight: 500;
      }
    }

    .options {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 20px;
    }

    .option-item { 
      padding: 16px; 
      background: var(--bg-secondary); 
      border: 2px solid var(--border-color); 
      cursor: pointer; 
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: all 0.2s ease;
      position: relative;

      &:hover:not(.selected):not(.correct):not(.wrong) {
        border-color: var(--primary-color);
        background: rgba(25, 118, 210, 0.05);
      }

      &.selected { 
        background: rgba(25, 118, 210, 0.1); 
        border-color: var(--primary-color); 
        color: var(--primary-color);
      }

      &.correct {
        background: rgba(76, 175, 80, 0.1);
        border-color: #4caf50;
        color: #2e7d32;
      }

      &.wrong {
        background: rgba(244, 67, 54, 0.1);
        border-color: #f44336;
        color: #c62828;
      }

      &:focus {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }

      .option-label {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--bg-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 14px;
        flex-shrink: 0;
      }

      &.selected .option-label {
        background: var(--primary-color);
        color: white;
      }

      &.correct .option-label {
        background: #4caf50;
        color: white;
      }

      &.wrong .option-label {
        background: #f44336;
        color: white;
      }

      .option-text {
        flex: 1;
        font-size: 15px;
        line-height: 1.5;
      }

      .check-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }
    }

    .text-answer {
      margin-bottom: 20px;

      .full-width {
        width: 100%;
      }
    }

    .action-buttons {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }

    .btn-submit {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 140px;
      justify-content: center;
    }

    /* 结果反馈 */
    .result-feedback { 
      margin-top: 24px; 
      padding: 24px; 
      border-radius: 12px;
      animation: fadeIn 0.3s;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);

      &.correct { 
        background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); 
        color: #2e7d32; 
        border-left: 4px solid #4caf50;
      }

      &:not(.correct) { 
        background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); 
        color: #c62828; 
        border-left: 4px solid #f44336;
      }

      .result-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;

        .result-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
        }

        h4 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
        }
      }

      .explanation {
        background: rgba(255, 255, 255, 0.7);
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 20px;

        p {
          margin: 0;
          font-size: 15px;
          line-height: 1.6;
        }
      }

      .result-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }

      .btn-next, .btn-finish {
        display: flex;
        align-items: center;
        gap: 6px;
      }
    }

    @keyframes fadeIn { 
      from { opacity: 0; transform: translateY(-10px); } 
      to { opacity: 1; transform: translateY(0); } 
    }

    /* 响应式设计 */
    @media (max-width: 768px) {
      .practice-container {
        padding: 16px;
      }

      .page-header h2 {
        font-size: 24px;
      }

      .bank-list {
        grid-template-columns: 1fr;
      }

      .question-header {
        flex-direction: column;
        align-items: stretch;
      }

      .header-info {
        justify-content: space-between;
      }

      .question-content {
        padding: 20px;
      }

      .q-text {
        font-size: 16px !important;
      }
    }
  `]
})
export class QuestionPracticeComponent implements OnInit {
  banks: QuestionBank[] = [];
  questions: Question[] = [];
  currentBank: QuestionBank | null = null;
  currentQuestion: Question | null = null;
  selectedAnswer: string = '';
  currentIndex: number = 0;
  lastResult: any = null;
  isSubmitting: boolean = false;
  isAdaptiveMode: boolean = false;
  targetDifficulty: number = 0.5;

  constructor(private questionService: QuestionService) {}

  ngOnInit() {
    this.loadBanks();
    // 检查是否为自适应模式
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'adaptive') {
      this.startAdaptiveMode();
    }
  }

  startAdaptiveMode() {
    this.isAdaptiveMode = true;
    this.loadNextAdaptiveQuestion();
  }

  loadNextAdaptiveQuestion() {
    this.questionService.getAdaptiveQuestion().subscribe(res => {
      if (res.data && res.data.length > 0) {
        this.questions = res.data;
        this.currentQuestion = res.data[0];
        this.targetDifficulty = res.target_difficulty;
      }
    });
  }

  loadBanks() {
    this.questionService.getQuestionBanks().subscribe(res => {
      this.banks = res.data;
    });
  }

  selectBank(bank: QuestionBank) {
    this.currentBank = bank;
    this.questionService.getQuestions(bank.id).subscribe(res => {
      this.questions = res.data;
      if (this.questions.length > 0) {
        this.currentIndex = 0;
        this.currentQuestion = this.questions[0];
      }
    });
  }

  selectOption(opt: string) {
    this.selectedAnswer = opt;
  }

  submitAnswer() {
    if (!this.currentQuestion) return;
    this.isSubmitting = true;
    this.questionService.submitAnswer(
      this.currentQuestion.id, 
      this.selectedAnswer, 
      0 // TODO: 计算实际耗时
    ).subscribe(res => {
      this.lastResult = res;
      this.isSubmitting = false;
      if (this.isAdaptiveMode) {
        // 自适应模式下，答完一题立即加载下一题
        setTimeout(() => {
          this.selectedAnswer = '';
          this.lastResult = null;
          this.loadNextAdaptiveQuestion();
        }, 2000);
      }
    });
  }

  nextQuestion() {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
      this.currentQuestion = this.questions[this.currentIndex];
      this.selectedAnswer = '';
      this.lastResult = null;
    }
  }

  backToBanks() {
    this.currentBank = null;
    this.questions = [];
    this.currentQuestion = null;
    this.lastResult = null;
  }

  // 辅助方法：获取题库颜色
  getBankColor(subject?: string): string {
    const colors: { [key: string]: string } = {
      'physics': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'biology': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'chemistry': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'mathematics': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'computer_science': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'engineering': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'general': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
    };
    return colors[subject || 'general'] || colors['general'];
  }

  // 辅助方法：获取题库图标
  getBankIcon(subject?: string): string {
    const icons: { [key: string]: string } = {
      'physics': 'science',
      'biology': 'biotech',
      'chemistry': 'experiment',
      'mathematics': 'functions',
      'computer_science': 'code',
      'engineering': 'build',
      'general': 'menu_book'
    };
    return icons[subject || 'general'] || 'menu_book';
  }

  // 辅助方法：获取难度级别文本
  getLevelText(level?: string): string {
    const levels: { [key: string]: string } = {
      'elementary': '小学',
      'middle': '初中',
      'high': '高中',
      'university': '大学'
    };
    return levels[level || ''] || level || '未知';
  }

  // 辅助方法：获取学科文本
  getSubjectText(subject?: string): string {
    const subjects: { [key: string]: string } = {
      'physics': '物理',
      'biology': '生物',
      'chemistry': '化学',
      'mathematics': '数学',
      'computer_science': '计算机',
      'engineering': '工程',
      'general': '综合'
    };
    return subjects[subject || ''] || subject || '';
  }

  // 辅助方法：获取问题类型图标
  getQuestionTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'multiple_choice': 'radio_button_checked',
      'true_false': 'check_circle_outline',
      'short_answer': 'edit',
      'essay': 'description'
    };
    return icons[type] || 'help';
  }

  // 辅助方法：获取问题类型文本
  getQuestionTypeText(type: string): string {
    const types: { [key: string]: string } = {
      'multiple_choice': '选择题',
      'true_false': '判断题',
      'short_answer': '简答题',
      'essay': '论述题'
    };
    return types[type] || type;
  }

  // 辅助方法：获取选项标签（A, B, C, D）
  getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index);
  }
}
