import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MarketingNavComponent } from '../../shared/marketing-nav/marketing-nav.component';

interface LearningPathNode {
  node_type: string;
  node_id: string;
  title: string;
  difficulty: number;
  estimated_hours: number;
  description?: string;
}

interface UserProfile {
  user_id: string;
  age: number;
  grade_level: string;
  average_score: number;
  completed_units_count: number;
  test_scores_count: number;
  recommended_starting_unit: string;
}

@Component({
  selector: 'app-learning-path-visualizer',
  standalone: true,
  imports: [CommonModule, FormsModule, MarketingNavComponent],
  template: `
    <app-marketing-nav></app-marketing-nav>

    <div class="container">
      <!-- 用户信息面板 -->
      <div class="user-panel" *ngIf="currentUser">
        <h2>👤 用户画像</h2>
        <div class="user-info">
          <div class="info-item">
            <span class="label">年龄:</span>
            <span class="value">{{ currentUser.age }}岁</span>
          </div>
          <div class="info-item">
            <span class="label">年级:</span>
            <span class="value">{{ currentUser.grade_level }}</span>
          </div>
          <div class="info-item">
            <span class="label">平均分:</span>
            <span class="value">{{ currentUser.average_score | number:'1.0-1' }}</span>
          </div>
          <div class="info-item">
            <span class="label">推荐起点:</span>
            <span class="value highlight">{{ currentUser.recommended_starting_unit }}</span>
          </div>
        </div>
      </div>

      <!-- 控制面板 -->
      <div class="control-panel">
        <h3>⚙️ 生成学习路径</h3>
        
        <div class="form-group" *ngIf="!currentUser">
          <label>用户ID:</label>
          <input type="text" [(ngModel)]="userId" placeholder="输入用户ID" />
        </div>

        <div class="form-group" *ngIf="!currentUser">
          <label>年龄:</label>
          <input type="number" [(ngModel)]="userAge" min="6" max="25" placeholder="6-25" />
        </div>

        <div class="form-group" *ngIf="!currentUser">
          <label>年级:</label>
          <select [(ngModel)]="userGrade">
            <option value="小学">小学</option>
            <option value="初中">初中</option>
            <option value="高中">高中</option>
            <option value="大学">大学</option>
          </select>
        </div>

        <div class="form-group">
          <label>最大节点数:</label>
          <input type="number" [(ngModel)]="maxNodes" min="5" max="50" />
        </div>

        <button (click)="generatePath()" [disabled]="loading">
          {{ loading ? '生成中...' : '生成路径' }}
        </button>

        <button (click)="createUser()" *ngIf="!currentUser" [disabled]="loading">
          创建用户
        </button>
      </div>

      <!-- 加载状态 -->
      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
        <p>正在从Neo4j知识图谱生成学习路径...</p>
      </div>

      <!-- 错误提示 -->
      <div class="error" *ngIf="error">
        <p>❌ {{ error }}</p>
      </div>

      <!-- 路径可视化 -->
      <div class="path-visualization" *ngIf="pathNodes.length > 0">
        <h3>📊 学习路径图谱 ({{ pathNodes.length }} 个节点)</h3>
        
        <!-- 路径摘要 -->
        <div class="path-summary" *ngIf="pathSummary">
          <div class="summary-item">
            <span class="summary-label">总学习时长:</span>
            <span class="summary-value">{{ pathSummary.total_hours | number:'1.0-1' }} 小时</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">平均难度:</span>
            <span class="summary-value">{{ pathSummary.avg_difficulty | number:'1.0-1' }}</span>
          </div>
        </div>

        <!-- 节点列表 -->
        <div class="nodes-container">
          <div 
            *ngFor="let node of pathNodes; let i = index" 
            class="node-card"
            [class.course-unit]="node.node_type === 'course_unit'"
            [class.knowledge-point]="node.node_type === 'knowledge_point'"
            [class.textbook-chapter]="node.node_type === 'textbook_chapter'"
            [class.hardware-project]="node.node_type === 'hardware_project'"
          >
            <div class="node-header">
              <span class="node-type-badge">{{ getNodeTypeLabel(node.node_type) }}</span>
              <span class="node-index">#{{ i + 1 }}</span>
            </div>
            
            <h4 class="node-title">{{ node.title }}</h4>
            
            <div class="node-meta">
              <div class="meta-item">
                <span class="meta-icon">📊</span>
                <span>难度: {{ node.difficulty }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">⏱️</span>
                <span>{{ node.estimated_hours }} 小时</span>
              </div>
            </div>

            <div class="node-id" *ngIf="node.node_id">
              ID: {{ node.node_id }}
            </div>
          </div>
        </div>

        <!-- 动态调整 -->
        <div class="adjustment-panel">
          <h4>🔄 动态调整路径</h4>
          <p>根据学习反馈调整难度:</p>
          <div class="feedback-buttons">
            <button (click)="adjustPath('too_hard')" class="btn-hard">
              😰 太难了
            </button>
            <button (click)="adjustPath('too_easy')" class="btn-easy">
              😎 太简单
            </button>
            <button (click)="adjustPath('bored')" class="btn-bored">
              😴 有点无聊
            </button>
            <button (click)="adjustPath('perfect')" class="btn-perfect">
              👍 刚刚好
            </button>
          </div>
          <p class="adjustment-reason" *ngIf="adjustmentReason">
            {{ adjustmentReason }}
          </p>
        </div>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" *ngIf="!loading && !error && pathNodes.length === 0">
        <p>🎯 点击"生成路径"开始探索你的STEM学习之旅</p>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .user-panel {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .user-panel h2 {
      margin: 0 0 1rem 0;
      font-size: 1.5rem;
    }

    .user-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .label {
      opacity: 0.9;
    }

    .value {
      font-weight: bold;
      font-size: 1.1rem;
    }

    .value.highlight {
      background: rgba(255, 255, 255, 0.2);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }

    .control-panel {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .control-panel h3 {
      margin: 0 0 1rem 0;
      color: #333;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #555;
      font-weight: 500;
    }

    .form-group input,
    .form-group select {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
    }

    button {
      background: #667eea;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 500;
      margin-right: 0.5rem;
      transition: all 0.3s ease;
    }

    button:hover:not(:disabled) {
      background: #5568d3;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .loading {
      text-align: center;
      padding: 3rem;
      color: #667eea;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error {
      background: #fee;
      color: #c33;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      border-left: 4px solid #c33;
    }

    .path-visualization {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .path-visualization h3 {
      margin: 0 0 1.5rem 0;
      color: #333;
    }

    .path-summary {
      display: flex;
      gap: 2rem;
      margin-bottom: 2rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
    }

    .summary-label {
      font-size: 0.875rem;
      color: #666;
      margin-bottom: 0.25rem;
    }

    .summary-value {
      font-size: 1.25rem;
      font-weight: bold;
      color: #667eea;
    }

    .nodes-container {
      display: grid;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .node-card {
      background: linear-gradient(to right, #f8f9fa, #ffffff);
      border: 2px solid #e9ecef;
      border-radius: 8px;
      padding: 1.25rem;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .node-card::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: #667eea;
    }

    .node-card:hover {
      transform: translateX(4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .node-card.course-unit::before {
      background: #667eea;
    }

    .node-card.knowledge-point::before {
      background: #f093fb;
    }

    .node-card.textbook-chapter::before {
      background: #4facfe;
    }

    .node-card.hardware-project::before {
      background: #43e97b;
    }

    .node-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .node-type-badge {
      background: #667eea;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .node-index {
      color: #999;
      font-size: 0.875rem;
    }

    .node-title {
      margin: 0 0 0.75rem 0;
      color: #333;
      font-size: 1.1rem;
    }

    .node-meta {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 0.5rem;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #666;
      font-size: 0.875rem;
    }

    .meta-icon {
      font-size: 1rem;
    }

    .node-id {
      color: #999;
      font-size: 0.75rem;
      font-family: monospace;
    }

    .adjustment-panel {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 2px solid #e9ecef;
    }

    .adjustment-panel h4 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .feedback-buttons {
      display: flex;
      gap: 0.75rem;
      margin: 1rem 0;
      flex-wrap: wrap;
    }

    .feedback-buttons button {
      flex: 1;
      min-width: 120px;
    }

    .btn-hard {
      background: #ff6b6b;
    }

    .btn-hard:hover {
      background: #ee5a5a;
    }

    .btn-easy {
      background: #51cf66;
    }

    .btn-easy:hover {
      background: #40c057;
    }

    .btn-bored {
      background: #ffd43b;
      color: #333;
    }

    .btn-bored:hover {
      background: #fcc419;
    }

    .btn-perfect {
      background: #339af0;
    }

    .btn-perfect:hover {
      background: #228be6;
    }

    .adjustment-reason {
      margin-top: 1rem;
      padding: 0.75rem;
      background: #e7f5ff;
      border-left: 4px solid #339af0;
      border-radius: 4px;
      color: #1864ab;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #999;
      font-size: 1.1rem;
    }
  `]
})
export class LearningPathVisualizerComponent implements OnInit {
  userId: string = 'student_001';
  userAge: number = 13;
  userGrade: string = '初中';
  maxNodes: number = 20;
  
  currentUser: UserProfile | null = null;
  pathNodes: LearningPathNode[] = [];
  pathSummary: any = null;
  loading: boolean = false;
  error: string | null = null;
  adjustmentReason: string | null = null;

  private apiUrl = 'http://localhost:8000/api/v1/user-profile';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // 尝试获取现有用户
    this.loadUser(this.userId);
  }

  loadUser(userId: string): void {
    this.http.get<UserProfile>(`${this.apiUrl}/${userId}`).subscribe({
      next: (profile) => {
        this.currentUser = profile;
        console.log('用户加载成功:', profile);
      },
      error: (err) => {
        console.log('用户不存在，需要创建');
        this.currentUser = null;
      }
    });
  }

  createUser(): void {
    if (!this.userId || !this.userAge || !this.userGrade) {
      this.error = '请填写所有必填字段';
      return;
    }

    this.loading = true;
    this.error = null;

    this.http.post<UserProfile>(`${this.apiUrl}/create`, {
      user_id: this.userId,
      age: this.userAge,
      grade_level: this.userGrade
    }).subscribe({
      next: (profile) => {
        this.currentUser = profile;
        this.loading = false;
        console.log('用户创建成功:', profile);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.detail || '创建用户失败';
        console.error('创建用户失败:', err);
      }
    });
  }

  generatePath(): void {
    if (!this.currentUser) {
      this.error = '请先创建或加载用户';
      return;
    }

    this.loading = true;
    this.error = null;
    this.pathNodes = [];
    this.pathSummary = null;

    this.http.get<any>(`${this.apiUrl}/${this.userId}/generate-path?max_nodes=${this.maxNodes}`).subscribe({
      next: (response) => {
        this.pathNodes = response.path_nodes;
        this.pathSummary = response.summary;
        this.loading = false;
        console.log('路径生成成功:', response);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.detail || '生成路径失败';
        console.error('生成路径失败:', err);
      }
    });
  }

  adjustPath(feedbackType: string): void {
    if (!this.currentUser) {
      this.error = '请先创建或加载用户';
      return;
    }

    this.loading = true;
    this.error = null;

    this.http.post<any>(`${this.apiUrl}/${this.userId}/adjust-path`, {
      feedback_type: feedbackType
    }).subscribe({
      next: (response) => {
        this.pathNodes = response.adjusted_path;
        this.adjustmentReason = response.adjustment_reason;
        this.loading = false;
        console.log('路径调整成功:', response);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.detail || '调整路径失败';
        console.error('调整路径失败:', err);
      }
    });
  }

  getNodeTypeLabel(type: string): string {
    const labels: {[key: string]: string} = {
      'course_unit': '课程单元',
      'knowledge_point': '知识点',
      'textbook_chapter': '教材章节',
      'hardware_project': '硬件项目'
    };
    return labels[type] || type;
  }
}
