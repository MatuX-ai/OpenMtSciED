import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

// 声明 ECharts
declare var echarts: any;

interface KnowledgeNode {
  id: string;
  type: 'tutorial' | 'material' | 'hardware';
  title: string;
  source: string;
  level: 'elementary' | 'middle' | 'high' | 'university';
  subject: string;
  difficulty?: number;
}

interface KnowledgeEdge {
  from: string;
  to: string;
  relation: 'prerequisite' | 'related' | 'progression' | 'aligns_with';
}

interface LearningPath {
  id: string;
  name: string;
  description: string;
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}

@Component({
  selector: 'app-knowledge-graph',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
    MatTabsModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  template: `
    <div class="knowledge-graph-container">
      <!-- 顶部说明 -->
      <div class="info-banner">
        <mat-icon>lightbulb</mat-icon>
        <div class="info-text">
          <h3>🧠 STEM知识图谱与学习路径</h3>
          <p>基于知识图谱自动关联教程与课件，生成连贯的STEM（科学、技术、工程、数学）学习路径</p>
        </div>
      </div>

      <!-- 学习路径选择器 -->
      <div class="path-selector">
        <mat-tab-group [(selectedIndex)]="selectedPathIndex" (selectedIndexChange)="onPathChange()">
          <mat-tab *ngFor="let path of learningPaths; let i = index" [label]="path.name">
            <ng-template matTabContent>
              <div class="tab-content">
                <p>{{ path.description }}</p>
                <div class="path-stats">
                  <span><mat-icon>book</mat-icon> {{ getTutorialCount(path) }} 个教程</span>
                  <span><mat-icon>description</mat-icon> {{ getMaterialCount(path) }} 个课件</span>
                  <span><mat-icon>trending_up</mat-icon> {{ getLevelRange(path.nodes) }}</span>
                </div>
              </div>
            </ng-template>
          </mat-tab>
        </mat-tab-group>
      </div>

      <!-- 筛选器 -->
      <div class="filters">
        <mat-form-field appearance="outline" class="filter-item">
          <mat-label>学段跨度</mat-label>
          <mat-select [(value)]="selectedLevelSpan" (selectionChange)="onFilterChange()">
            <mat-option value="all">全部</mat-option>
            <mat-option value="elementary-middle">小学 → 初中</mat-option>
            <mat-option value="middle-high">初中 → 高中</mat-option>
            <mat-option value="high-university">高中 → 大学</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <!-- ECharts 图表容器 -->
      <div #chartContainer class="chart-container"></div>

      <!-- 图例说明 -->
      <div class="legend">
        <div class="legend-item">
          <span class="legend-color tutorial"></span>
          <span>教程</span>
        </div>
        <div class="legend-item">
          <span class="legend-color material"></span>
          <span>课件</span>
        </div>
        <div class="legend-item">
          <span class="legend-line prerequisite"></span>
          <span>前置关系</span>
        </div>
        <div class="legend-item">
          <span class="legend-line related"></span>
          <span>相关资源</span>
        </div>
        <div class="legend-item">
          <span class="legend-line progression"></span>
          <span>进阶路径</span>
        </div>
        <div class="legend-item">
          <span class="legend-color hardware"></span>
          <span>硬件项目</span>
        </div>
        <div class="legend-item">
          <span class="legend-line aligns_with"></span>
          <span>标准对齐</span>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="actions">
        <button mat-raised-button color="primary" (click)="exportPath()">
          <mat-icon>download</mat-icon>
          导出学习路径
        </button>
        <button mat-button (click)="refreshGraph()">
          <mat-icon>refresh</mat-icon>
          刷新图谱
        </button>
      </div>
    </div>
  `,
  styles: [`
    .knowledge-graph-container {
      padding: 20px;
      height: calc(100vh - 140px);
      display: flex;
      flex-direction: column;
    }

    .info-banner {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

    .path-selector {
      margin-bottom: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .tab-content {
      padding: 16px;
    }

    .tab-content p {
      margin: 0 0 12px 0;
      color: #666;
    }

    .path-stats {
      display: flex;
      gap: 20px;
      color: #667eea;
      font-size: 14px;
    }

    .path-stats span {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .path-stats mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .chart-container {
      flex: 1;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      min-height: 500px;
    }

    .legend {
      display: flex;
      justify-content: center;
      gap: 24px;
      padding: 16px;
      margin-top: 16px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #666;
    }

    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 50%;

      &.tutorial {
        background: #667eea;
      }

      &.material {
        background: #f093fb;
      }

      &.hardware {
        background: #4caf50;
      }
    }

    .legend-line {
      width: 24px;
      height: 3px;
      border-radius: 2px;

      &.prerequisite {
        background: #ff6b6b;
      }

      &.related {
        background: #4ecdc4;
      }

      &.progression {
        background: #ffa502;
      }

      &.aligns_with {
        background: #9c27b0;
      }
    }

    .actions {
      display: flex;
      justify-content: center;
      gap: 12px;
      padding: 16px;
      margin-top: 16px;
    }

    .filters {
      display: flex;
      justify-content: center;
      margin-bottom: 16px;
    }

    .filter-item {
      width: 200px;
    }

    ::ng-deep .mat-mdc-tab-body-wrapper {
      overflow: visible !important;
    }
  `]
})
export class KnowledgeGraphComponent implements OnInit, AfterViewInit {
  @ViewChild('chartContainer') chartContainer!: ElementRef;

  learningPaths: LearningPath[] = [];
  selectedPathIndex = 0;
  selectedLevelSpan: string = 'all';
  private chart: any = null;

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.learningPaths = this.getMockLearningPaths();
    // TODO: 替换为真实 API 调用
    // this.loadRealLearningPaths();
  }

  loadRealLearningPaths(): void {
    // 模拟从后端获取数据
    console.log('正在从 Neo4j 加载真实学习路径...');
    // fetch('/api/learning/path?subject=Physics&grade_level=middle')
    //   .then(res => res.json())
    //   .then(data => { this.learningPaths = data; this.updateChart(); });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initChart();
    }, 100);
  }

  // Helper methods for template
  getTutorialCount(path: LearningPath): number {
    return path.nodes.filter(n => n.type === 'tutorial').length;
  }

  getMaterialCount(path: LearningPath): number {
    return path.nodes.filter(n => n.type === 'material').length;
  }

  initChart(): void {
    if (!this.chartContainer || !this.chartContainer.nativeElement) {
      return;
    }

    // 初始化 ECharts
    this.chart = echarts.init(this.chartContainer.nativeElement);
    this.updateChart();
  }

  updateChart(): void {
    if (!this.chart) {
      return;
    }

    const currentPath = this.learningPaths[this.selectedPathIndex];
    let filteredNodes = currentPath.nodes;

    // 根据学段跨度筛选
    if (this.selectedLevelSpan !== 'all') {
      const [start, end] = this.selectedLevelSpan.split('-');
      const levelOrder = ['elementary', 'middle', 'high', 'university'];
      const startIndex = levelOrder.indexOf(start);
      const endIndex = levelOrder.indexOf(end);
      
      filteredNodes = currentPath.nodes.filter(node => {
        const nodeIndex = levelOrder.indexOf(node.level);
        return nodeIndex >= startIndex && nodeIndex <= endIndex;
      });
    }

    // 构建节点数据
    const nodes = filteredNodes.map(node => ({
      id: node.id,
      name: node.title,
      symbolSize: node.type === 'tutorial' ? 60 : (node.type === 'material' ? 50 : 45),
      category: node.type === 'tutorial' ? 0 : (node.type === 'material' ? 1 : 2),
      value: node.difficulty || 3,
      itemStyle: {
        color: node.type === 'tutorial' ? '#667eea' : (node.type === 'material' ? '#f093fb' : '#4caf50')
      },
      label: {
        show: true,
        fontSize: 12,
        formatter: (params: any) => {
          return params.name.length > 8
            ? params.name.substring(0, 8) + '...'
            : params.name;
        }
      }
    }));

    // 构建边数据
    const edges = currentPath.edges.map(edge => ({
      source: edge.from,
      target: edge.to,
      lineStyle: {
        color: this.getEdgeColor(edge.relation),
        width: 2,
        curveness: 0.2
      },
      label: {
        show: true,
        formatter: this.getRelationLabel(edge.relation),
        fontSize: 10
      }
    }));

    const option = {
      title: {
        text: currentPath.name,
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16,
          color: '#333'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (params.dataType === 'node') {
            const node = currentPath.nodes.find(n => n.id === params.name);
            if (node) {
              return `
                <strong>${node.title}</strong><br/>
                类型: ${node.type === 'tutorial' ? '教程' : (node.type === 'material' ? '课件' : '硬件')}<br/>
                来源: ${node.source}<br/>
                学段: ${this.getLevelName(node.level)}<br/>
                学科: ${this.getSubjectName(node.subject)}
              `;
            }
          }
          return params.name;
        }
      },
      legend: {
        data: ['教程', '课件', '硬件项目'],
        bottom: 10,
        left: 'center'
      },
      series: [
        {
          type: 'graph',
          layout: 'force',
          data: nodes,
          links: edges,
          categories: [
            { name: '教程' },
            { name: '课件' },
            { name: '硬件项目' }
          ],
          roam: true,
          label: {
            position: 'right',
            formatter: '{b}'
          },
          force: {
            repulsion: 300,
            gravity: 0.1,
            edgeLength: 150,
            layoutAnimation: true
          },
          emphasis: {
            focus: 'adjacency',
            lineStyle: {
              width: 4
            }
          }
        }
      ]
    };

    this.chart.setOption(option);
  }

  onPathChange(): void {
    this.updateChart();
  }

  refreshGraph(): void {
    if (this.chart) {
      this.chart.dispose();
      this.initChart();
    }
    this.snackBar.open('✅ 图谱已刷新', '关闭', { duration: 2000 });
  }

  exportPath(): void {
    const currentPath = this.learningPaths[this.selectedPathIndex];
    console.log('导出学习路径:', currentPath);

    // TODO: 实现导出功能(JSON/PDF)
    this.snackBar.open(`📥 正在导出 "${currentPath.name}"`, '关闭', { duration: 3000 });
  }

  getLevelName(level: string): string {
    const names: Record<string, string> = {
      elementary: '小学',
      middle: '初中',
      high: '高中',
      university: '大学'
    };
    return names[level] || level;
  }

  getSubjectName(subject: string): string {
    const names: Record<string, string> = {
      science: '科学',
      technology: '技术',
      engineering: '工程',
      mathematics: '数学',
      physics: '物理',
      chemistry: '化学',
      biology: '生物',
      math: '数学',
      computer_science: '计算机科学',
      environmental: '环境科学',
      robotics: '机器人技术'
    };
    return names[subject] || subject;
  }

  getLevelRange(nodes: KnowledgeNode[]): string {
    const levels = nodes.map(n => n.level);
    const uniqueLevels = [...new Set(levels)];

    if (uniqueLevels.length === 1) {
      return this.getLevelName(uniqueLevels[0]);
    }

    const levelOrder = ['elementary', 'middle', 'high', 'university'];
    const minIndex = Math.min(...uniqueLevels.map(l => levelOrder.indexOf(l)));
    const maxIndex = Math.max(...uniqueLevels.map(l => levelOrder.indexOf(l)));

    return `${this.getLevelName(levelOrder[minIndex])} → ${this.getLevelName(levelOrder[maxIndex])}`;
  }

  getEdgeColor(relation: string): string {
    const colors: Record<string, string> = {
      prerequisite: '#ff6b6b',  // 红色 - 前置关系
      related: '#4ecdc4',       // 青色 - 相关资源
      progression: '#ffa502',   // 橙色 - 进阶路径
      aligns_with: '#9c27b0'    // 紫色 - 标准对齐
    };
    return colors[relation] || '#999';
  }

  getRelationLabel(relation: string): string {
    const labels: Record<string, string> = {
      prerequisite: '前置',
      related: '相关',
      progression: '进阶',
      aligns_with: 'PBL对齐'
    };
    return labels[relation] || '';
  }

  onFilterChange(): void {
    this.updateChart();
  }

  private getMockLearningPaths(): LearningPath[] {
    return [
      {
        id: 'path-001',
        name: 'STEM基础：工程设计与科学探究',
        description: '从科学方法到工程实践，培养STEM核心素养与问题解决能力',
        nodes: [
          { id: 't1', type: 'tutorial', title: '工程设计流程', source: 'OpenSciEd', level: 'middle', subject: 'engineering', difficulty: 2 },
          { id: 'm1', type: 'material', title: '设计思维工作坊', source: 'MIT OpenCourseWare', level: 'middle', subject: 'engineering' },
          { id: 't2', type: 'tutorial', title: '科学探究方法', source: 'OpenSciEd', level: 'middle', subject: 'science', difficulty: 3 },
          { id: 'm2', type: 'material', title: '实验设计与数据分析', source: 'Coursera', level: 'middle', subject: 'science' },
          { id: 't3', type: 'tutorial', title: 'Arduino传感器应用', source: '格物斯坦', level: 'middle', subject: 'technology', difficulty: 3 },
          { id: 'm3', type: 'material', title: '智能环境监测项目', source: '格物斯坦', level: 'middle', subject: 'technology' },
        ],
        edges: [
          { from: 't1', to: 'm1', relation: 'related' },
          { from: 't1', to: 't2', relation: 'progression' },
          { from: 't2', to: 'm2', relation: 'related' },
          { from: 't2', to: 't3', relation: 'progression' },
          { from: 't3', to: 'm3', relation: 'related' },
        ]
      },
      {
        id: 'path-002',
        name: 'STEM进阶：智能制造与机器人',
        description: '融合机械工程、电子技术与编程，探索智能制造领域',
        nodes: [
          { id: 't4', type: 'tutorial', title: '机械结构与传动', source: 'MIT OCW', level: 'high', subject: 'engineering', difficulty: 2 },
          { id: 'm4', type: 'material', title: '3D打印技术手册', source: 'Coursera', level: 'high', subject: 'technology' },
          { id: 't5', type: 'tutorial', title: '电路与控制系统', source: '格物斯坦', level: 'high', subject: 'technology', difficulty: 3 },
          { id: 'm5', type: 'material', title: '传感器与执行器', source: 'edx', level: 'high', subject: 'technology' },
          { id: 't6', type: 'tutorial', title: 'ROS机器人编程', source: 'MIT OCW', level: 'high', subject: 'technology', difficulty: 4 },
          { id: 'm6', type: 'material', title: '自主导航项目实战', source: '格物斯坦', level: 'high', subject: 'engineering' },
        ],
        edges: [
          { from: 't4', to: 'm4', relation: 'related' },
          { from: 't4', to: 't5', relation: 'progression' },
          { from: 't5', to: 'm5', relation: 'related' },
          { from: 't5', to: 't6', relation: 'progression' },
          { from: 't6', to: 'm6', relation: 'related' },
        ]
      },
      {
        id: 'path-003',
        name: 'STEM综合：环境科学与可持续发展',
        description: '跨学科整合环境科学、数据分析与技术创新，应对全球挑战',
        nodes: [
          { id: 't7', type: 'tutorial', title: '生态系统基础', source: 'OpenSciEd', level: 'elementary', subject: 'science', difficulty: 1 },
          { id: 'm7', type: 'material', title: '生物多样性观察指南', source: 'Khan Academy', level: 'elementary', subject: 'science' },
          { id: 't8', type: 'tutorial', title: '气候变化与数据分析', source: 'OpenSciEd', level: 'middle', subject: 'science', difficulty: 2 },
          { id: 'm8', type: 'material', title: 'Python数据可视化', source: 'Coursera', level: 'middle', subject: 'technology' },
          { id: 't9', type: 'tutorial', title: '可再生能源技术', source: 'edx', level: 'high', subject: 'engineering', difficulty: 3 },
          { id: 'm9', type: 'material', title: '太阳能追踪系统设计', source: '格物斯坦', level: 'high', subject: 'technology' },
        ],
        edges: [
          { from: 't7', to: 'm7', relation: 'related' },
          { from: 't7', to: 't8', relation: 'progression' },
          { from: 't8', to: 'm8', relation: 'related' },
          { from: 't8', to: 't9', relation: 'progression' },
          { from: 't9', to: 'm9', relation: 'related' },
        ]
      }
    ];
  }
}
