import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';

interface HardwareProject {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: number; // 1-5
  estimatedTime: string; // 例如: "2小时"
  hardwareBudget: number; // 预算(元)
  materials: MaterialItem[];
  hasCode: boolean;
  codeLanguage?: 'arduino' | 'python' | 'blockly';
  thumbnail?: string;
}

interface MaterialItem {
  name: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
  link?: string;
}

@Component({
  selector: 'app-hardware-project-browser',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatIconModule,
    MatSnackBarModule,
    MatTabsModule,
  ],
  template: `
    <div class="hardware-project-browser">
      <!-- 顶部说明 -->
      <div class="info-banner">
        <mat-icon>build</mat-icon>
        <div class="info-text">
          <h3>🔧 低成本硬件项目库</h3>
          <p>所有项目预算 ≤50元,适合普惠STEM教育,支持可视化编程和一键烧录</p>
        </div>
      </div>

      <!-- 分类标签 -->
      <div class="category-tabs">
        <mat-chip-set>
          <mat-chip
            *ngFor="let category of categories"
            [class.selected]="selectedCategory === category.id"
            (click)="selectCategory(category.id)"
            class="category-chip"
          >
            {{ category.icon }} {{ category.name }}
          </mat-chip>
        </mat-chip-set>
      </div>

      <!-- 项目列表 -->
      <div class="project-grid">
        <mat-card *ngFor="let project of filteredProjects" class="project-card">
          <!-- 预算徽章 -->
          <div
            class="budget-badge"
            [class.budget-low]="project.hardwareBudget <= 30"
            [class.budget-medium]="project.hardwareBudget > 30 && project.hardwareBudget <= 50"
          >
            ¥{{ project.hardwareBudget }}
          </div>

          <mat-card-header>
            <mat-card-title>{{ project.title }}</mat-card-title>
            <mat-card-subtitle>
              <span class="difficulty-stars">{{ getDifficultyStars(project.difficulty) }}</span>
              <span class="time-label">⏱️ {{ project.estimatedTime }}</span>
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <p class="description">{{ project.description }}</p>

            <!-- 材料清单预览 -->
            <div class="materials-preview">
              <h4>📦 材料清单 (共{{ project.materials.length }}项)</h4>
              <ul class="material-list">
                <li *ngFor="let material of project.materials.slice(0, 3)">
                  {{ material.name }} ×{{ material.quantity }}{{ material.unit }}
                  <span class="price">¥{{ material.estimatedPrice }}</span>
                </li>
                <li *ngIf="project.materials.length > 3" class="more-items">
                  ...还有{{ project.materials.length - 3 }}项
                </li>
              </ul>
            </div>

            <!-- 编程支持 -->
            <div class="code-support" *ngIf="project.hasCode">
              <mat-icon>code</mat-icon>
              <span>支持 {{ getCodeLanguageName(project.codeLanguage) }} 编程</span>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button mat-raised-button color="primary" (click)="openProjectDetail(project)">
              <mat-icon>visibility</mat-icon>
              查看详情
            </button>
            <button mat-button (click)="viewMaterials(project)">
              <mat-icon>list</mat-icon>
              材料清单
            </button>
            <button
              mat-button
              color="accent"
              (click)="startCoding(project)"
              *ngIf="project.hasCode"
            >
              <mat-icon>edit</mat-icon>
              开始编程
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- 空状态 -->
        <div *ngIf="filteredProjects.length === 0" class="empty-state">
          <mat-icon>search_off</mat-icon>
          <p>该分类下暂无项目</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .hardware-project-browser {
        padding: 20px;
      }

      .info-banner {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px 20px;
        background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        border-radius: 8px;
        margin-bottom: 20px;
        color: white;
      }

      .info-banner mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      .info-text h3 {
        margin: 0 0 4px 0;
        font-size: 18px;
      }

      .info-text p {
        margin: 0;
        font-size: 14px;
        opacity: 0.9;
      }

      .category-tabs {
        margin-bottom: 20px;
      }

      .category-chip {
        cursor: pointer;
        transition: all 0.2s;
      }

      .category-chip:hover {
        background: #11998e;
        color: white;
      }

      .project-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
        gap: 20px;
      }

      .project-card {
        position: relative;
        transition:
          transform 0.2s,
          box-shadow 0.2s;
      }

      .project-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      }

      .budget-badge {
        position: absolute;
        top: 12px;
        right: 12px;
        padding: 6px 12px;
        border-radius: 16px;
        font-weight: 600;
        font-size: 14px;
        z-index: 1;

        &.budget-low {
          background: #4caf50;
          color: white;
        }

        &.budget-medium {
          background: #ff9800;
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
        padding: 12px;
        background: #f5f7fa;
        border-radius: 6px;
      }

      .materials-preview h4 {
        margin: 0 0 8px 0;
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
        padding: 4px 0;
        color: #666;
        display: flex;
        justify-content: space-between;
      }

      .price {
        color: #f5576c;
        font-weight: 500;
      }

      .more-items {
        color: #999;
        font-style: italic;
      }

      .code-support {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: 12px;
        padding: 8px 12px;
        background: #e3f2fd;
        border-radius: 6px;
        color: #1565c0;
        font-size: 13px;
      }

      .code-support mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      .empty-state {
        grid-column: 1 / -1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        color: #999;
      }

      .empty-state mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        margin-bottom: 16px;
      }
    `,
  ],
})
export class HardwareProjectBrowserComponent implements OnInit {
  projects: HardwareProject[] = [];
  filteredProjects: HardwareProject[] = [];
  selectedCategory = 'all';

  categories = [
    { id: 'all', name: '全部', icon: '📚' },
    { id: 'electronics', name: '电子电路', icon: '⚡' },
    { id: 'robotics', name: '机器人', icon: '🤖' },
    { id: 'iot', name: '物联网', icon: '🌐' },
    { id: 'mechanical', name: '机械结构', icon: '⚙️' },
    { id: 'smart-home', name: '智能家居', icon: '🏠' },
  ];

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.projects = this.getMockProjects();
    this.filterProjects();
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.filterProjects();
  }

  filterProjects(): void {
    if (this.selectedCategory === 'all') {
      this.filteredProjects = this.projects;
    } else {
      this.filteredProjects = this.projects.filter((p) => p.category === this.selectedCategory);
    }
  }

  openProjectDetail(project: HardwareProject): void {
    this.snackBar.open(`查看 "${project.title}" 详情`, '关闭', { duration: 3000 });
    // TODO: 打开详情对话框,显示完整教程、代码编辑器、烧录界面
  }

  viewMaterials(project: HardwareProject): void {
    const materialList = project.materials
      .map((m) => `${m.name} ×${m.quantity}${m.unit} (¥${m.estimatedPrice})`)
      .join('\n');

    const totalCost = project.materials.reduce((sum, m) => sum + m.estimatedPrice * m.quantity, 0);

    alert(`📦 ${project.title} - 材料清单

${materialList}

💰 总计: ¥${totalCost}`);
  }

  startCoding(project: HardwareProject): void {
    this.snackBar.open(`🔧 启动 ${this.getCodeLanguageName(project.codeLanguage)} 编辑器`, '关闭', {
      duration: 3000,
    });
    // TODO: 打开Blockly编辑器或代码编辑器
  }

  getDifficultyStars(difficulty: number): string {
    return '⭐'.repeat(difficulty);
  }

  getCodeLanguageName(language?: string): string {
    const names: Record<string, string> = {
      arduino: 'Arduino C++',
      python: 'MicroPython',
      blockly: '可视化编程',
    };
    return names[language ?? ''] || '未知';
  }

  private getMockProjects(): HardwareProject[] {
    return [
      this.createTemperatureMonitor(),
      this.createTrackingRobot(),
      this.createWifiSwitch(),
      this.createOscilloscope(),
      this.createSolarTracker(),
      this.createVoiceLamp(),
    ];
  }

  private createTemperatureMonitor(): HardwareProject {
    return {
      id: 'hw-001',
      title: '智能温湿度监测器',
      description:
        '使用DHT11传感器和OLED显示屏,实时监测环境温湿度,数据超标时蜂鸣器报警。适合学习传感器数据采集和显示。',
      category: 'iot',
      difficulty: 2,
      estimatedTime: '2小时',
      hardwareBudget: 35,
      materials: [
        { name: 'Arduino Nano', quantity: 1, unit: '块', estimatedPrice: 15 },
        { name: 'DHT11温湿度传感器', quantity: 1, unit: '个', estimatedPrice: 5 },
        { name: 'OLED显示屏(0.96寸)', quantity: 1, unit: '个', estimatedPrice: 10 },
        { name: '蜂鸣器', quantity: 1, unit: '个', estimatedPrice: 2 },
        { name: '杜邦线', quantity: 10, unit: '根', estimatedPrice: 3 },
      ],
      hasCode: true,
      codeLanguage: 'arduino',
    };
  }

  private createTrackingRobot(): HardwareProject {
    return {
      id: 'hw-002',
      title: '循迹智能小车',
      description:
        '基于红外传感器的自动循迹小车,学习PID控制算法。包含电机驱动、传感器融合、路径规划等核心概念。',
      category: 'robotics',
      difficulty: 4,
      estimatedTime: '4小时',
      hardwareBudget: 48,
      materials: [
        { name: 'Arduino Uno', quantity: 1, unit: '块', estimatedPrice: 18 },
        { name: 'L298N电机驱动模块', quantity: 1, unit: '个', estimatedPrice: 8 },
        { name: '直流减速电机', quantity: 2, unit: '个', estimatedPrice: 6 },
        { name: '红外循迹传感器', quantity: 3, unit: '个', estimatedPrice: 9 },
        { name: '小车底盘套件', quantity: 1, unit: '套', estimatedPrice: 7 },
      ],
      hasCode: true,
      codeLanguage: 'blockly',
    };
  }

  private createWifiSwitch(): HardwareProject {
    return {
      id: 'hw-003',
      title: 'WiFi远程控制开关',
      description: '使用ESP8266模块实现手机APP远程控制家电开关,学习物联网通信协议和Web服务器搭建。',
      category: 'smart-home',
      difficulty: 3,
      estimatedTime: '3小时',
      hardwareBudget: 30,
      materials: [
        { name: 'ESP8266 NodeMCU', quantity: 1, unit: '块', estimatedPrice: 15 },
        { name: '继电器模块', quantity: 1, unit: '个', estimatedPrice: 5 },
        { name: 'LED指示灯', quantity: 2, unit: '个', estimatedPrice: 2 },
        { name: '电阻(220Ω)', quantity: 2, unit: '个', estimatedPrice: 1 },
        { name: '面包板', quantity: 1, unit: '块', estimatedPrice: 7 },
      ],
      hasCode: true,
      codeLanguage: 'arduino',
    };
  }

  private createOscilloscope(): HardwareProject {
    return {
      id: 'hw-004',
      title: '简易示波器',
      description:
        '使用ADC采样和OLED显示,制作一个简易数字示波器,观察音频信号波形。学习模拟信号处理和可视化。',
      category: 'electronics',
      difficulty: 4,
      estimatedTime: '3小时',
      hardwareBudget: 40,
      materials: [
        { name: 'Arduino Nano', quantity: 1, unit: '块', estimatedPrice: 15 },
        { name: 'OLED显示屏(0.96寸)', quantity: 1, unit: '个', estimatedPrice: 10 },
        { name: '电位器(10K)', quantity: 1, unit: '个', estimatedPrice: 2 },
        { name: '电容(100nF)', quantity: 1, unit: '个', estimatedPrice: 1 },
        { name: '音频输入接口', quantity: 1, unit: '个', estimatedPrice: 5 },
        { name: '杜邦线', quantity: 10, unit: '根', estimatedPrice: 3 },
        { name: '面包板', quantity: 1, unit: '块', estimatedPrice: 7 },
      ],
      hasCode: true,
      codeLanguage: 'arduino',
    };
  }

  private createSolarTracker(): HardwareProject {
    return {
      id: 'hw-005',
      title: '太阳能追光系统',
      description: '使用光敏电阻和舵机,制作自动追踪光源的太阳能板支架,最大化能量收集效率。',
      category: 'mechanical',
      difficulty: 3,
      estimatedTime: '3小时',
      hardwareBudget: 45,
      materials: [
        { name: 'Arduino Nano', quantity: 1, unit: '块', estimatedPrice: 15 },
        { name: '舵机(SG90)', quantity: 2, unit: '个', estimatedPrice: 10 },
        { name: '光敏电阻', quantity: 4, unit: '个', estimatedPrice: 4 },
        { name: '电阻(10K)', quantity: 4, unit: '个', estimatedPrice: 2 },
        { name: '小型太阳能板', quantity: 1, unit: '块', estimatedPrice: 10 },
        { name: '支架材料(纸板/木棒)', quantity: 1, unit: '套', estimatedPrice: 4 },
      ],
      hasCode: true,
      codeLanguage: 'blockly',
    };
  }

  private createVoiceLamp(): HardwareProject {
    return {
      id: 'hw-006',
      title: '语音控制台灯',
      description:
        '集成离线语音识别模块,实现"开灯"、"关灯"、"调亮"等语音命令控制,学习人机交互设计。',
      category: 'smart-home',
      difficulty: 3,
      estimatedTime: '2.5小时',
      hardwareBudget: 42,
      materials: [
        { name: 'Arduino Nano', quantity: 1, unit: '块', estimatedPrice: 15 },
        { name: '离线语音识别模块', quantity: 1, unit: '个', estimatedPrice: 18 },
        { name: 'LED灯带', quantity: 1, unit: '米', estimatedPrice: 5 },
        { name: 'MOSFET模块', quantity: 1, unit: '个', estimatedPrice: 3 },
        { name: '杜邦线', quantity: 10, unit: '根', estimatedPrice: 3 },
      ],
      hasCode: true,
      codeLanguage: 'arduino',
    };
  }
}
