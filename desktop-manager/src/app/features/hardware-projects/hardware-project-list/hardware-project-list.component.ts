import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';

import {
  HardwareProject,
  HardwareCategory,
  HardwareProjectFilter,
  getDifficultyStars,
  getCategoryName,
  calculateTotalCost
} from '../../../models/hardware-project.models';
import { ResourceAssociationService } from '../../../services/resource-association.service';
import { HardwareProjectService } from '../../../core/services/hardware-project.service';

@Component({
  selector: 'app-hardware-project-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  template: `
    <div class="hardware-project-list">
      <!-- 页面标题 -->
      <div class="page-header">
        <h2>🔧 低成本硬件项目库</h2>
        <p class="subtitle">所有项目预算 ≤50元，适合普惠STEM教育</p>
      </div>

      <!-- 筛选工具栏 -->
      <div class="filter-toolbar">
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>搜索项目</mat-label>
          <input matInput
                 [(ngModel)]="filter.keyword"
                 (input)="applyFilter()"
                 placeholder="输入关键词...">
          <i matSuffix class="ri-search-line search-suffix-icon"></i>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>分类</mat-label>
          <mat-select [(ngModel)]="filter.category" (selectionChange)="applyFilter()">
            <mat-option value="">全部分类</mat-option>
            <mat-option *ngFor="let cat of categories" [value]="cat">
              {{ getCategoryName(cat) }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>最大预算</mat-label>
          <input matInput
                 type="number"
                 [(ngModel)]="filter.maxBudget"
                 (input)="applyFilter()"
                 placeholder="50">
          <span matSuffix>元</span>
        </mat-form-field>

        <button mat-raised-button color="primary" (click)="resetFilter()">
          <i class="ri-refresh-line"></i>
          重置筛选
        </button>
      </div>

      <!-- 统计信息 -->
      <div class="stats-bar" *ngIf="filteredProjects.length > 0">
        <span>找到 {{ filteredProjects.length }} 个项目</span>
        <span *ngIf="filter.maxBudget">| 预算 ≤{{ filter.maxBudget }}元</span>
      </div>

      <!-- 项目网格 -->
      <div class="project-grid">
        <mat-card *ngFor="let project of filteredProjects" class="project-card">
          <!-- 预算徽章 -->
          <div class="budget-badge"
               [class.budget-low]="project.total_cost <= 30"
               [class.budget-medium]="project.total_cost > 30 && project.total_cost <= 50">
            ¥{{ project.total_cost }}
          </div>

          <mat-card-header>
            <mat-card-title>{{ project.title }}</mat-card-title>
            <mat-card-subtitle>
              <span class="difficulty-stars">{{ getDifficultyStars(project.difficulty) }}</span>
              <span class="time-label">⏱️ {{ project.estimated_time_hours }}小时</span>
              <span class="category-tag">{{ getCategoryName(project.category) }}</span>
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <p class="description">{{ project.description }}</p>

            <!-- 材料清单预览 -->
            <div class="materials-preview">
              <h4>📦 材料清单 (共{{ project.materials?.length || 0 }}项)</h4>
              <ul class="material-list">
                <li *ngFor="let material of project.materials?.slice(0, 3) || []">
                  {{ material.name }} ×{{ material.quantity }}{{ material.unit }}
                  <span class="price">¥{{ material.unitPrice }}</span>
                </li>
                <li *ngIf="project.materials && project.materials.length > 3" class="more-items">
                  ...还有{{ project.materials.length - 3 }}项
                </li>
              </ul>
              <div class="total-cost">
                💰 总计: ¥{{ calculateTotalCost(project.materials || []) }}
              </div>
            </div>

            <!-- 编程支持 -->
            <div class="code-support" *ngIf="project.code_templates && project.code_templates.length > 0">
              <i class="ri-code-s-slash-line"></i>
              <span>支持 {{ getCodeLanguageName(project.code_templates[0].language) }}</span>
            </div>

            <!-- 安全提示 -->
            <div class="safety-notes" *ngIf="project.safety_notes && project.safety_notes.length > 0">
              <i class="ri-alert-line"></i>
              <span>{{ project.safety_notes.length }} 条安全注意事项</span>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button mat-raised-button color="primary" (click)="viewDetail(project)">
              <i class="ri-eye-line"></i>
              查看详情
            </button>
            <button mat-button (click)="viewMaterials(project)">
              <i class="ri-list-unordered"></i>
              材料清单
            </button>
            <button mat-button color="accent" (click)="viewRelatedResources(project)">
              <i class="ri-link"></i>
              相关资源
            </button>
            <button mat-button
                    color="accent"
                    (click)="addToTopicStudio(project)"
                    *ngIf="project.code_templates && project.code_templates.length > 0">
              <i class="ri-lightbulb-flash-line"></i>
              加入课题
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- 空状态 -->
        <div *ngIf="filteredProjects.length === 0" class="empty-state">
          <i class="ri-file-search-line empty-icon"></i>
          <h3>未找到匹配的项目</h3>
          <p>请尝试调整筛选条件或搜索关键词</p>
          <button mat-raised-button color="primary" (click)="resetFilter()">
            重置筛选
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hardware-project-list {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 24px;
    }

    .page-header h2 {
      margin: 0 0 8px 0;
      font-size: 28px;
      color: #333;
    }

    .subtitle {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .filter-toolbar {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
      flex-wrap: wrap;
      align-items: center;
    }

    .filter-field {
      flex: 1;
      min-width: 200px;
      max-width: 300px;
    }

    .stats-bar {
      padding: 12px 16px;
      background: #f5f7fa;
      border-radius: 8px;
      margin-bottom: 20px;
      color: #666;
      font-size: 14px;
    }

    .project-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 24px;
    }

    .project-card {
      position: relative;
      transition: transform 0.2s, box-shadow 0.2s;
      border-radius: 12px;
      overflow: hidden;
    }

    .project-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }

    .budget-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      padding: 6px 14px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 15px;
      z-index: 1;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);

      &.budget-low {
        background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
        color: white;
      }

      &.budget-medium {
        background: linear-gradient(135deg, #ff9800 0%, #ffa726 100%);
        color: white;
      }
    }

    .difficulty-stars {
      color: #ffa502;
      margin-right: 12px;
    }

    .time-label {
      color: #666;
      font-size: 13px;
      margin-right: 12px;
    }

    .category-tag {
      display: inline-block;
      padding: 2px 8px;
      background: #e3f2fd;
      color: #1565c0;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .description {
      color: #555;
      line-height: 1.6;
      margin: 12px 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .materials-preview {
      margin: 16px 0;
      padding: 14px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 3px solid #11998e;
    }

    .materials-preview h4 {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #333;
    }

    .material-list {
      list-style: none;
      padding: 0;
      margin: 0;
      font-size: 13px;
    }

    .material-list li {
      padding: 5px 0;
      color: #666;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px dashed #e0e0e0;
    }

    .material-list li:last-child {
      border-bottom: none;
    }

    .price {
      color: #f5576c;
      font-weight: 600;
    }

    .more-items {
      color: #999;
      font-style: italic;
      padding-top: 8px !important;
    }

    .total-cost {
      margin-top: 10px;
      padding-top: 10px;
      border-top: 2px solid #e0e0e0;
      font-weight: 600;
      color: #11998e;
      font-size: 15px;
    }

    .code-support {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      padding: 10px 14px;
      background: #e3f2fd;
      border-radius: 8px;
      color: #1565c0;
      font-size: 13px;

      i[class^="ri-"] {
        font-size: 18px;
      }
    }


    .safety-notes {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 10px;
      padding: 8px 12px;
      background: #fff3e0;
      border-radius: 6px;
      color: #e65100;
      font-size: 13px;

      i[class^="ri-"] {
        font-size: 18px;
      }
    }

    .search-suffix-icon {
      font-size: 20px;
      color: #999;
    }

    .empty-state {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      color: #999;
    }

    .empty-state .empty-icon,
    .empty-state i[class^="ri-"] {
      font-size: 72px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      color: #666;
    }

    .empty-state p {
      margin: 0 0 20px 0;
    }

    @media (max-width: 768px) {
      .project-grid {
        grid-template-columns: 1fr;
      }

      .filter-toolbar {
        flex-direction: column;
      }

      .filter-field {
        max-width: 100%;
      }
    }
  `]
})
export class HardwareProjectListComponent implements OnInit {
  projects: HardwareProject[] = [];
  filteredProjects: HardwareProject[] = [];

  filter: HardwareProjectFilter = {
    maxBudget: 50
  };

  categories: HardwareCategory[] = [
    'electronics',
    'robotics',
    'iot',
    'mechanical',
    'smart-home',
    'sensor',
    'communication'
  ];

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router,
    private associationService: ResourceAssociationService,
    private hardwareProjectService: HardwareProjectService
  ) {}

  ngOnInit(): void {
    this.loadProjects();

    // 监听路由参数，支持从其他页面跳转时自动搜索
    this.route.queryParams.subscribe(params => {
      const search = params['search'];
      const subject = params['subject'];

      if (search) {
        this.filter.keyword = search;
        if (subject) {
          this.filter.category = undefined;
        }
        this.applyFilter();
        this.snackBar.open(`已搜索: ${search}`, '关闭', { duration: 3000 });
      }
    });
  }

  /**
   * 从后端加载硬件项目
   */
  loadProjects(): void {
    this.hardwareProjectService.getProjects({ page: 1, size: 50 }).subscribe({
      next: (resp) => {
        this.projects = (resp.items || []).map((item) => this.mapProject(item));
        this.applyFilter();
        if (this.projects.length === 0) {
          this.snackBar.open('暂未从后端获取到硬件项目', '关闭', { duration: 2000 });
        }
      },
      error: (err) => {
        console.error('加载硬件项目失败:', err);
        this.projects = [];
        this.snackBar.open('硬件项目 API 不可用', '关闭', { duration: 3000 });
      },
    });
  }

  /**
   * 后端字段 → 前端 HardwareProject 字段映射
   */
  private mapProject(raw: any): HardwareProject {
    // 后端字段: title, category, difficulty_level(string), estimated_time_hours, hardware_required
    // 前端字段: total_cost(number), materials, code_templates, safety_notes
    return {
      id: raw.id,
      project_id: raw.project_id || raw.id?.toString() || '',
      title: raw.title || '',
      subject: raw.subject || '',
      description: raw.description || '',
      category: (raw.category || 'electronics') as HardwareCategory,
      difficulty: this.parseDifficulty(raw.difficulty_level),
      estimated_time_hours: raw.estimated_time_hours || 0,
      // 后端暂无 total_cost 字段，临时从 hardware_required 估算或为 0
      total_cost: raw.total_cost ?? 0,
      // 后端 hardware_required 数组（如果有）→ 转为前端 materials 格式
      materials: Array.isArray(raw.materials)
        ? raw.materials
        : Array.isArray(raw.hardware_required)
        ? raw.hardware_required.map((m: any) => ({
            name: typeof m === 'string' ? m : m.name || '',
            quantity: m.quantity || 1,
            unit: m.unit || '个',
            unitPrice: m.unitPrice || m.unit_price || 0,
          }))
        : [],
      code_templates: raw.code_templates || [],
      safety_notes: raw.safety_notes || [],
      knowledge_point_ids: raw.knowledge_point_ids || [],
    } as HardwareProject;
  }

  /**
   * 后端 difficulty_level 是 string（如 'beginner'/'intermediate'/'advanced'），转为数字 1-5
   */
  private parseDifficulty(level: string | number | undefined): number {
    if (typeof level === 'number') return level;
    if (!level) return 3;
    const map: Record<string, number> = {
      beginner: 1,
      elementary: 1,
      intermediate: 3,
      medium: 3,
      advanced: 4,
      expert: 5,
    };
    return map[String(level).toLowerCase()] || 3;
  }

  applyFilter(): void {
    let result = [...this.projects];

    // 关键词搜索
    if (this.filter.keyword) {
      const keyword = this.filter.keyword.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(keyword) ||
        p.description.toLowerCase().includes(keyword)
      );
    }

    // 分类筛选
    if (this.filter.category) {
      result = result.filter(p => p.category === this.filter.category);
    }

    // 预算筛选
    if (this.filter.maxBudget) {
      result = result.filter(p => p.total_cost <= this.filter.maxBudget!);
    }

    this.filteredProjects = result;
  }

  resetFilter(): void {
    this.filter = {
      maxBudget: 50
    };
    this.applyFilter();
    this.snackBar.open('筛选已重置', '关闭', { duration: 2000 });
  }

  viewDetail(project: HardwareProject): void {
    console.log('查看项目详情:', project);
    this.snackBar.open(`查看 "${project.title}" 详情`, '关闭', { duration: 3000 });
    // TODO: 打开详情对话框，显示完整教程、代码编辑器、烧录界面
  }

  viewMaterials(project: HardwareProject): void {
    console.log('查看材料清单:', project);

    const materialList = (project.materials || []).map(m =>
      `${m.name} ×${m.quantity}${m.unit} (¥${m.unitPrice})`
    ).join('\n');

    const totalCost = calculateTotalCost(project.materials || []);

    alert(`📦 ${project.title} - 材料清单

${materialList}

💰 总计: ¥${totalCost}`);
  }

  addToTopicStudio(project: HardwareProject): void {
    this.router.navigate(['/topic-studio', 'new'], {
      queryParams: { title: project.title, subject: project.subject || '' },
    });
  }

  viewRelatedResources(project: HardwareProject): void {
    console.log('查看相关资源:', project);
    this.snackBar.open(
      `正在查找 "${project.title}" 的相关教程和课件...`,
      '关闭',
      { duration: 2000 }
    );
    
    // 调用服务获取相关资源
    this.associationService.getHardwareRelatedResources(
      project.project_id,
      project.subject
    ).subscribe({
      next: (response) => {
        if (response.success) {
          const tutorialCount = response.data.related_tutorials?.length || 0;
          const materialCount = response.data.related_materials?.length || 0;
          
          if (tutorialCount === 0 && materialCount === 0) {
            this.snackBar.open(
              '暂未找到相关教程和课件，您可以手动搜索',
              '关闭',
              { duration: 3000 }
            );
          } else {
            this.snackBar.open(
              `找到 ${tutorialCount} 个教程和 ${materialCount} 个课件`,
              '查看详情',
              { duration: 5000 }
            );
            // TODO: 显示详细列表对话框
          }
        }
      },
      error: (err) => {
        console.error('获取相关资源失败:', err);
        this.snackBar.open('获取相关资源失败', '关闭', { duration: 3000 });
      }
    });
  }

  getDifficultyStars(difficulty: number): string {
    return getDifficultyStars(difficulty);
  }

  getCategoryName(category: HardwareCategory): string {
    return getCategoryName(category);
  }

  getCodeLanguageName(language: string): string {
    const names: Record<string, string> = {
      arduino: 'Arduino C++',
      python: 'MicroPython',
      blockly: '可视化编程',
      scratch: 'Scratch'
    };
    return names[language] || language;
  }

  calculateTotalCost(materials: any[]): number {
    return calculateTotalCost(materials);
  }

  /**
   * @deprecated 不再使用 - 改为从后端 API 加载
   * 保留作为完全离线场景的最后 fallback
   */
  private getMockProjects(): HardwareProject[] {
    return [
      {
        id: 1,
        project_id: 'hw-001',
        title: '智能温湿度监测器',
        subject: '物理',
        description: '使用DHT11传感器和OLED显示屏，实时监测环境温湿度，数据超标时蜂鸣器报警。适合学习传感器数据采集和显示。',
        category: 'iot',
        difficulty: 2,
        estimated_time_hours: 2,
        total_cost: 35,
        materials: [
          { name: 'Arduino Nano', quantity: 1, unit: '块', unitPrice: 15 },
          { name: 'DHT11温湿度传感器', quantity: 1, unit: '个', unitPrice: 5 },
          { name: 'OLED显示屏(0.96寸)', quantity: 1, unit: '个', unitPrice: 10 },
          { name: '蜂鸣器', quantity: 1, unit: '个', unitPrice: 2 },
          { name: '杜邦线', quantity: 10, unit: '根', unitPrice: 0.3 },
        ],
        code_templates: [{
          language: 'arduino',
          code: '// Arduino 代码模板\nvoid setup() {\n  // 初始化代码\n}\n\nvoid loop() {\n  // 主循环代码\n}',
          description: '基础温湿度监测代码',
          dependencies: ['DHT sensor library', 'Adafruit GFX Library']
        }],
        safety_notes: ['注意电源极性', '避免短路'],
        knowledge_point_ids: ['kp-001', 'kp-002', 'kp-003']
      },
      {
        id: 2,
        project_id: 'hw-002',
        title: '循迹智能小车',
        subject: '工程',
        description: '基于红外传感器的自动循迹小车，学习PID控制算法。包含电机驱动、传感器融合、路径规划等核心概念。',
        category: 'robotics',
        difficulty: 4,
        estimated_time_hours: 4,
        total_cost: 48,
        materials: [
          { name: 'Arduino Uno', quantity: 1, unit: '块', unitPrice: 18 },
          { name: 'L298N电机驱动模块', quantity: 1, unit: '个', unitPrice: 8 },
          { name: '直流减速电机', quantity: 2, unit: '个', unitPrice: 6 },
          { name: '红外循迹传感器', quantity: 3, unit: '个', unitPrice: 3 },
          { name: '小车底盘套件', quantity: 1, unit: '套', unitPrice: 7 },
        ],
        code_templates: [{
          language: 'blockly',
          code: '<xml></xml>',
          description: '可视化编程模板',
        }],

        safety_notes: ['注意电机接线', '测试时远离边缘'],
        knowledge_point_ids: ['kp-004', 'kp-005', 'kp-006']
      },
      {
        id: 3,
        project_id: 'hw-003',
        title: 'WiFi远程控制开关',
        subject: '工程',
        description: '使用ESP8266模块实现手机APP远程控制家电开关，学习物联网通信协议和Web服务器搭建。',
        category: 'smart-home',
        difficulty: 3,
        estimated_time_hours: 3,
        total_cost: 30,
        materials: [
          { name: 'ESP8266 NodeMCU', quantity: 1, unit: '块', unitPrice: 15 },
          { name: '继电器模块', quantity: 1, unit: '个', unitPrice: 5 },
          { name: 'LED指示灯', quantity: 2, unit: '个', unitPrice: 1 },
          { name: '电阻(220Ω)', quantity: 2, unit: '个', unitPrice: 0.5 },
          { name: '面包板', quantity: 1, unit: '块', unitPrice: 7 },
        ],
        code_templates: [{
          language: 'arduino',
          code: '// ESP8266 WiFi 控制代码\n#include <ESP8266WiFi.h>\n\nvoid setup() {\n  WiFi.begin("SSID", "PASSWORD");\n}',
          description: 'WiFi控制示例代码',
          dependencies: ['ESP8266WiFi']
        }],
        safety_notes: ['高压危险，谨慎操作', '确保绝缘良好'],
        knowledge_point_ids: ['kp-007', 'kp-008', 'kp-009']
      },
    ];
  }
}
