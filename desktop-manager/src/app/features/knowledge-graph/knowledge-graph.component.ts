import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { KnowledgeGraphService } from '../../core/services/knowledge-graph.service';
import {
  KnowledgeGraphLinkService,
  LinkedTutorialResource,
} from '../../core/services/knowledge-graph-link.service';
import { TauriService } from '../../core/services/tauri.service';

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

interface PathNode {
  node_type: string;
  node_id: string;
  title: string;
  difficulty: number;
  estimated_hours: number;
  description?: string;
}

interface PathResponse {
  user_id: string;
  path_nodes: PathNode[];
  summary: {
    total_nodes: number;
    total_hours: number;
    avg_difficulty: number;
  };
  generated_at: string;
}

@Component({
  selector: 'app-knowledge-graph',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatTabsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
  ],
  template: `
    <div class="knowledge-graph-container">
      <div class="info-banner">
        <i class="ri-lightbulb-line"></i>
        <div class="info-text">
          <h3>STEM 知识图谱与学习路径</h3>
          <p>预设路径、个性化推荐与知识点搜索，统一在此浏览 STEM 学习关系</p>
        </div>
      </div>

      <mat-tab-group
        class="main-tabs"
        [(selectedIndex)]="mainTabIndex"
        (selectedIndexChange)="onMainTabChange()"
      >
        <!-- Tab 1: 学习路径图谱 -->
        <mat-tab label="学习路径图谱">
          <div class="tab-panel">
            <div class="path-selector">
              <mat-tab-group
                [(selectedIndex)]="selectedPathIndex"
                (selectedIndexChange)="onPathChange()"
              >
                <mat-tab *ngFor="let path of learningPaths" [label]="path.name">
                  <ng-template matTabContent>
                    <div class="tab-content">
                      <p>{{ path.description }}</p>
                      <div class="path-stats">
                        <span><i class="ri-book-line"></i> {{ getTutorialCount(path) }} 个教程</span>
                        <span><i class="ri-file-list-line"></i> {{ getMaterialCount(path) }} 个课件</span>
                        <span><i class="ri-line-chart-line"></i> {{ getLevelRange(path.nodes) }}</span>
                      </div>
                    </div>
                  </ng-template>
                </mat-tab>
              </mat-tab-group>
            </div>

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

            <div #pathsChartContainer class="chart-container"></div>

            <div class="legend">
              <div class="legend-item"><span class="legend-color tutorial"></span><span>教程</span></div>
              <div class="legend-item"><span class="legend-color material"></span><span>课件</span></div>
              <div class="legend-item"><span class="legend-line prerequisite"></span><span>前置关系</span></div>
              <div class="legend-item"><span class="legend-line related"></span><span>相关资源</span></div>
              <div class="legend-item"><span class="legend-line progression"></span><span>进阶路径</span></div>
              <div class="legend-item"><span class="legend-color hardware"></span><span>硬件项目</span></div>
            </div>

            <div class="actions">
              <button mat-raised-button color="primary" (click)="exportPath()">
                <i class="ri-download-line"></i> 导出学习路径
              </button>
              <button mat-button (click)="refreshPathsGraph()">
                <i class="ri-refresh-line"></i> 刷新图谱
              </button>
            </div>
          </div>
        </mat-tab>

        <!-- Tab 2: 个性化路径 -->
        <mat-tab label="个性化路径">
          <div class="tab-panel">
            <div class="path-controls">
              <mat-form-field appearance="outline" class="filter-item">
                <mat-label>年龄预设</mat-label>
                <mat-select [(value)]="selectedAgePreset" (selectionChange)="applyAgePreset()">
                  <mat-option *ngFor="let preset of agePresets" [value]="preset.label">
                    {{ preset.label }}
                  </mat-option>
                </mat-select>
              </mat-form-field>
              <button mat-raised-button color="primary" (click)="generatePersonalPath()" [disabled]="pathLoading">
                {{ pathLoading ? '生成中...' : '生成路径' }}
              </button>
              <button mat-button (click)="loadAdjustmentSuggestions()">加载调整建议</button>
            </div>

            <div *ngIf="pathData" class="path-summary">
              <span>节点: {{ pathData.summary.total_nodes }}</span>
              <span>预计学时: {{ pathData.summary.total_hours }}h</span>
              <span>平均难度: {{ pathData.summary.avg_difficulty }}</span>
            </div>

            <div *ngIf="adjustmentSuggestions?.weak_points?.length" class="adjustment-panel">
              <p>薄弱知识点建议练习：</p>
              <button
                mat-stroked-button
                *ngFor="let point of adjustmentSuggestions!.weak_points"
                (click)="navigateToPractice(point)"
              >
                {{ point }}
              </button>
            </div>

            <div #personalChartContainer class="chart-container"></div>
          </div>
        </mat-tab>

        <!-- Tab 3: 知识点搜索 -->
        <mat-tab label="知识点搜索">
          <div class="tab-panel">
            <div class="search-controls">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>搜索关键词</mat-label>
                <input
                  matInput
                  [(ngModel)]="searchKeyword"
                  placeholder="如：光合作用、电路..."
                  (keyup.enter)="runKnowledgeSearch()"
                />
              </mat-form-field>
              <mat-form-field appearance="outline" class="filter-item">
                <mat-label>类型</mat-label>
                <mat-select [(ngModel)]="searchCategory">
                  <mat-option value="">全部</mat-option>
                  <mat-option value="0">教程</mat-option>
                  <mat-option value="1">课件</mat-option>
                  <mat-option value="2">知识点</mat-option>
                  <mat-option value="3">硬件</mat-option>
                </mat-select>
              </mat-form-field>
              <button mat-raised-button color="primary" (click)="runKnowledgeSearch()" [disabled]="searchLoading">
                搜索
              </button>
              <button mat-button (click)="resetSearchView()">重置</button>
            </div>

            <div class="search-layout">
              <div #searchChartContainer class="chart-container search-chart"></div>
              <div class="detail-panel" *ngIf="selectedSearchNode">
                <div class="panel-header">
                  <h3>{{ selectedSearchNode.name }}</h3>
                  <button mat-icon-button (click)="selectedSearchNode = null">
                    <i class="ri-close-line"></i>
                  </button>
                </div>
                <div class="panel-content">
                  <p><strong>类型:</strong> {{ getSearchCategoryName(selectedSearchNode.category) }}</p>
                  <p *ngIf="selectedSearchNode.subject"><strong>学科:</strong> {{ selectedSearchNode.subject }}</p>
                  <p *ngIf="selectedSearchNode.description"><strong>描述:</strong> {{ selectedSearchNode.description }}</p>
                  <div *ngIf="linkedTutorials.length > 0" class="linked-block">
                    <p><strong>关联教程:</strong></p>
                    <ul>
                      <li *ngFor="let t of linkedTutorials">{{ t.tutorial_title || ('教程 #' + t.local_tutorial_id) }}</li>
                    </ul>
                  </div>
                  <div class="panel-actions">
                    <button mat-raised-button color="primary" (click)="openSearchResult(selectedSearchNode)">
                      打开资源
                    </button>
                    <button
                      mat-stroked-button
                      *ngIf="selectedSearchNode.category === 3"
                      (click)="viewSearchHardware(selectedSearchNode)"
                    >
                      查看硬件项目
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      .knowledge-graph-container {
        padding: 20px;
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .info-banner {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 8px;
        margin-bottom: 16px;
        color: white;
        flex-shrink: 0;
      }

      .info-banner i[class^='ri-'] {
        font-size: 32px;
      }

      .info-text h3 {
        margin: 0 0 4px;
        font-size: 18px;
      }

      .info-text p {
        margin: 0;
        font-size: 14px;
        opacity: 0.9;
      }

      .main-tabs {
        flex: 1;
        min-height: 0;
      }

      .tab-panel {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: auto;
        padding-top: 12px;
      }

      .path-selector,
      .filters,
      .path-controls,
      .search-controls {
        margin-bottom: 12px;
        flex-shrink: 0;
      }

      .path-controls,
      .search-controls {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
      }

      .search-field {
        flex: 1;
        min-width: 220px;
      }

      .filter-item {
        width: 200px;
      }

      .path-summary {
        display: flex;
        gap: 20px;
        margin-bottom: 12px;
        color: #667eea;
        font-size: 14px;
      }

      .adjustment-panel {
        margin-bottom: 12px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }

      .tab-content {
        padding: 16px;
      }

      .path-stats {
        display: flex;
        gap: 20px;
        color: #667eea;
        font-size: 14px;
      }

      .chart-container {
        flex: 1;
        min-height: 400px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .search-layout {
        display: flex;
        flex: 1;
        gap: 16px;
        min-height: 400px;
      }

      .search-chart {
        flex: 1;
      }

      .detail-panel {
        width: 320px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        flex-shrink: 0;
      }

      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid #eee;
      }

      .panel-header h3 {
        margin: 0;
        font-size: 16px;
      }

      .panel-content {
        padding: 16px;
      }

      .panel-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 16px;
      }

      .linked-block ul {
        margin: 4px 0 0;
        padding-left: 18px;
        font-size: 13px;
      }

      .legend {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 16px;
        padding: 12px;
        margin-top: 12px;
        background: white;
        border-radius: 8px;
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
      }

      .legend-color.tutorial {
        background: #667eea;
      }

      .legend-color.material {
        background: #f093fb;
      }

      .legend-color.hardware {
        background: #4caf50;
      }

      .legend-line {
        width: 24px;
        height: 3px;
        border-radius: 2px;
      }

      .legend-line.prerequisite {
        background: #ff6b6b;
      }

      .legend-line.related {
        background: #4ecdc4;
      }

      .legend-line.progression {
        background: #ffa502;
      }

      .actions {
        display: flex;
        justify-content: center;
        gap: 12px;
        padding: 12px;
      }

      ::ng-deep .main-tabs .mat-mdc-tab-body-wrapper {
        flex: 1;
      }
    `,
  ],
})
export class KnowledgeGraphComponent implements OnInit, AfterViewInit {
  @ViewChild('pathsChartContainer') pathsChartContainer!: ElementRef;
  @ViewChild('personalChartContainer') personalChartContainer!: ElementRef;
  @ViewChild('searchChartContainer') searchChartContainer!: ElementRef;

  mainTabIndex = 0;
  learningPaths: LearningPath[] = [];
  selectedPathIndex = 0;
  selectedLevelSpan = 'all';

  pathLoading = false;
  pathData: PathResponse | null = null;
  adjustmentSuggestions: { weak_points: string[] } | null = null;
  selectedAgePreset = '初中 (13岁)';
  agePresets = [
    { label: '小学 (8岁)', age: 8, grade: '小学' },
    { label: '初中 (13岁)', age: 13, grade: '初中' },
    { label: '高中 (16岁)', age: 16, grade: '高中' },
    { label: '大学 (19岁)', age: 19, grade: '大学' },
  ];
  testUser = { user_id: 'test_user_001', age: 13, grade_level: '初中', max_nodes: 15 };

  searchKeyword = '';
  searchCategory = '';
  searchLoading = false;
  selectedSearchNode: { id: string; name: string; category: number; subject?: string; description?: string } | null =
    null;
  linkedTutorials: LinkedTutorialResource[] = [];
  private searchGraphData: { categories: { name: string }[]; nodes: any[]; links: any[] } | null = null;

  private pathsChart: any = null;
  private personalChart: any = null;
  private searchChart: any = null;
  private readonly apiUrl = '/api/v1/learning/path';

  constructor(
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private knowledgeGraphService: KnowledgeGraphService,
    private knowledgeGraphLinkService: KnowledgeGraphLinkService,
    private tauriService: TauriService
  ) {}

  ngOnInit(): void {
    const tab = this.route.snapshot.queryParamMap.get('tab');
    if (tab === 'path') this.mainTabIndex = 1;
    else if (tab === 'search') this.mainTabIndex = 2;

    this.learningPaths = this.getMockLearningPaths();
    this.loadRealLearningPaths();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initActiveTabChart(), 150);
  }

  onMainTabChange(): void {
    setTimeout(() => this.initActiveTabChart(), 100);
  }

  private initActiveTabChart(): void {
    if (this.mainTabIndex === 0) {
      this.initPathsChart();
    } else if (this.mainTabIndex === 1) {
      this.initPersonalChart();
      if (this.pathData) this.renderPersonalPathChart();
    } else if (this.mainTabIndex === 2) {
      this.initSearchChart();
      if (this.searchGraphData) this.renderSearchChart(this.searchGraphData);
    }
  }

  // ─── Tab 1: 学习路径图谱 ───

  getTutorialCount(path: LearningPath): number {
    return path.nodes.filter((n) => n.type === 'tutorial').length;
  }

  getMaterialCount(path: LearningPath): number {
    return path.nodes.filter((n) => n.type === 'material').length;
  }

  async loadRealLearningPaths(): Promise<void> {
    try {
      const token = this.authService.getToken();
      if (!token) return;

      const response = await firstValueFrom(
        this.http.get<{ learning_path: Array<{ id: number; title: string; description: string | null; depth: number }> }>(
          this.apiUrl,
          {
            headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
            params: { limit: '20' },
          }
        )
      );

      if (response?.learning_path?.length) {
        this.learningPaths = response.learning_path.map((item) => this.mapToLearningPath(item));
        this.updatePathsChart();
      }
    } catch {
      this.snackBar.open('路径生成中，已显示本地推荐路径', '关闭', { duration: 3000 });
    }
  }

  private mapToLearningPath(item: { id: number; title: string; description: string | null; depth: number }): LearningPath {
    const nodeId = `concept-${item.id}`;
    return {
      id: String(item.id),
      name: item.title,
      description: item.description ?? '基于闭包表生成的学习路径',
      nodes: [
        {
          id: nodeId,
          type: 'tutorial',
          title: item.title,
          source: 'PostgreSQL 闭包表',
          level: 'middle',
          subject: 'stem',
          difficulty: item.depth,
        },
      ],
      edges: [],
    };
  }

  initPathsChart(): void {
    if (!this.pathsChartContainer?.nativeElement) return;
    if (this.pathsChart) this.pathsChart.dispose();
    this.pathsChart = echarts.init(this.pathsChartContainer.nativeElement);
    this.updatePathsChart();
  }

  updatePathsChart(): void {
    if (!this.pathsChart || !this.learningPaths.length) return;

    const currentPath = this.learningPaths[this.selectedPathIndex];
    let filteredNodes = currentPath.nodes;

    if (this.selectedLevelSpan !== 'all') {
      const [start, end] = this.selectedLevelSpan.split('-');
      const levelOrder = ['elementary', 'middle', 'high', 'university'];
      const startIndex = levelOrder.indexOf(start);
      const endIndex = levelOrder.indexOf(end);
      filteredNodes = currentPath.nodes.filter((node) => {
        const nodeIndex = levelOrder.indexOf(node.level);
        return nodeIndex >= startIndex && nodeIndex <= endIndex;
      });
    }

    const nodes = filteredNodes.map((node) => ({
      id: node.id,
      name: node.title,
      symbolSize: node.type === 'tutorial' ? 60 : node.type === 'material' ? 50 : 45,
      category: node.type === 'tutorial' ? 0 : node.type === 'material' ? 1 : 2,
      itemStyle: {
        color: node.type === 'tutorial' ? '#667eea' : node.type === 'material' ? '#f093fb' : '#4caf50',
      },
    }));

    const edges = currentPath.edges.map((edge) => ({
      source: edge.from,
      target: edge.to,
      lineStyle: { color: this.getEdgeColor(edge.relation), width: 2, curveness: 0.2 },
    }));

    this.pathsChart.setOption({
      title: { text: currentPath.name, left: 'center', top: 10 },
      tooltip: { trigger: 'item' },
      series: [
        {
          type: 'graph',
          layout: 'force',
          data: nodes,
          links: edges,
          roam: true,
          force: { repulsion: 300, edgeLength: 150 },
        },
      ],
    });
  }

  onPathChange(): void {
    this.updatePathsChart();
  }

  onFilterChange(): void {
    this.updatePathsChart();
  }

  refreshPathsGraph(): void {
    if (this.pathsChart) {
      this.pathsChart.dispose();
      this.initPathsChart();
    }
    this.snackBar.open('图谱已刷新', '关闭', { duration: 2000 });
  }

  exportPath(): void {
    const currentPath = this.learningPaths[this.selectedPathIndex];
    this.snackBar.open(`正在导出 "${currentPath.name}"`, '关闭', { duration: 3000 });
  }

  // ─── Tab 2: 个性化路径 ───

  applyAgePreset(): void {
    const preset = this.agePresets.find((p) => p.label === this.selectedAgePreset);
    if (preset) {
      this.testUser.age = preset.age;
      this.testUser.grade_level = preset.grade;
    }
  }

  generatePersonalPath(): void {
    this.pathLoading = true;
    this.http.post<any>('/api/v1/path/generate', this.testUser).subscribe({
      next: (res) => {
        if (res?.success !== false && (res?.path_nodes || res?.data?.path_nodes)) {
          this.pathData = res.data || res;
          this.renderPersonalPathChart();
          this.snackBar.open('个性化路径已生成', '关闭', { duration: 2000 });
        } else {
          this.snackBar.open('路径生成失败', '关闭', { duration: 3000 });
        }
        this.pathLoading = false;
      },
      error: () => {
        this.snackBar.open('路径生成请求失败', '关闭', { duration: 3000 });
        this.pathLoading = false;
      },
    });
  }

  initPersonalChart(): void {
    if (!this.personalChartContainer?.nativeElement) return;
    if (this.personalChart) this.personalChart.dispose();
    this.personalChart = echarts.init(this.personalChartContainer.nativeElement);
    this.personalChart.setOption({
      title: { text: '点击"生成路径"开始', left: 'center', top: 'center', textStyle: { color: '#999', fontSize: 16 } },
    });
  }

  renderPersonalPathChart(): void {
    if (!this.personalChart || !this.pathData?.path_nodes?.length) return;

    const nodes = this.pathData.path_nodes.map((n, i) => ({
      id: n.node_id || `node-${i}`,
      name: n.title,
      category: this.mapPathNodeCategory(n.node_type),
      symbolSize: 50,
      value: n.difficulty,
    }));

    const links = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      links.push({ source: nodes[i].id, target: nodes[i + 1].id });
    }

    this.personalChart.setOption({
      tooltip: { trigger: 'item' },
      series: [
        {
          type: 'graph',
          layout: 'force',
          data: nodes,
          links,
          roam: true,
          force: { repulsion: 200, edgeLength: 120 },
        },
      ],
    });

    this.personalChart.off('click');
    this.personalChart.on('click', (params: any) => {
      if (params.dataType === 'node') {
        this.handlePersonalNodeClick(params.data);
      }
    });
  }

  private mapPathNodeCategory(nodeType: string): number {
    if (nodeType === 'textbook_chapter') return 1;
    if (nodeType === 'hardware_project') return 2;
    return 0;
  }

  handlePersonalNodeClick(nodeData: { name: string; category: number }): void {
    const name = nodeData.name;
    if (nodeData.category === 2) {
      void this.router.navigate(['/hardware-projects'], { queryParams: { search: name } });
    } else if (nodeData.category === 1) {
      void this.router.navigate(['/resource-explorer'], { queryParams: { search: name, type: 'material' } });
    } else {
      void this.router.navigate(['/resource-explorer'], { queryParams: { search: name, type: 'tutorial' } });
    }
  }

  loadAdjustmentSuggestions(): void {
    this.http.get<any>(`/api/v1/path/dynamic-adjust/${this.testUser.user_id}`).subscribe({
      next: (res) => {
        if (res?.weak_points?.length) {
          this.adjustmentSuggestions = res;
        } else if (res?.success && res?.data?.weak_points?.length) {
          this.adjustmentSuggestions = res.data;
        }
      },
    });
  }

  navigateToPractice(point: string): void {
    void this.router.navigate(['/question-practice'], { queryParams: { point } });
  }

  // ─── Tab 3: 知识点搜索 ───

  runKnowledgeSearch(): void {
    if (!this.searchKeyword.trim()) return;
    this.searchLoading = true;
    this.knowledgeGraphService.getGraph(30).subscribe({
      next: (graph) => {
        const kw = this.searchKeyword.toLowerCase();
        let nodes = graph.nodes.filter(
          (n) =>
            n.name.toLowerCase().includes(kw) ||
            (n.description || '').toLowerCase().includes(kw) ||
            (n.subject || '').toLowerCase().includes(kw)
        );
        if (this.searchCategory !== '') {
          nodes = nodes.filter((n) => String(n.category) === this.searchCategory);
        }
        if (nodes.length === 0) {
          void this.loadSearchFromTauri(kw);
          return;
        }
        nodes = this.knowledgeGraphLinkService.mergeLinksIntoGraphNodes(nodes);
        const nodeIds = new Set(nodes.map((n) => n.id));
        const links = graph.links.filter((l) => nodeIds.has(l.source) && nodeIds.has(l.target));
        this.searchGraphData = { categories: graph.categories, nodes, links };
        this.renderSearchChart(this.searchGraphData);
        this.searchLoading = false;
      },
      error: () => {
        void this.loadSearchFromTauri(this.searchKeyword.toLowerCase());
      },
    });
  }

  private async loadSearchFromTauri(keyword: string): Promise<void> {
    try {
      const response: any = await this.tauriService.smartSearch(keyword, 20);
      const items = response?.data || response?.items || [];
      const nodes = items.map((item: any, index: number) => ({
        id: String(item.id || `t-${index}`),
        name: item.title || item.name || '未知',
        category: item.type === 'material' ? 1 : item.type === 'hardware' ? 3 : 0,
        subject: item.subject,
        description: item.description,
      }));
      const links = [];
      for (let i = 0; i < nodes.length - 1; i++) {
        links.push({ source: nodes[i].id, target: nodes[i + 1].id });
      }
      this.searchGraphData = {
        categories: [{ name: '教程' }, { name: '课件' }, { name: '知识点' }, { name: '硬件' }],
        nodes,
        links,
      };
      this.renderSearchChart(this.searchGraphData);
    } catch {
      this.snackBar.open('搜索失败', '关闭', { duration: 3000 });
    } finally {
      this.searchLoading = false;
    }
  }

  initSearchChart(): void {
    if (!this.searchChartContainer?.nativeElement) return;
    if (this.searchChart) this.searchChart.dispose();
    this.searchChart = echarts.init(this.searchChartContainer.nativeElement);
    this.searchChart.setOption({
      title: { text: '输入关键词开始搜索', left: 'center', top: 'center', textStyle: { color: '#999' } },
    });
  }

  renderSearchChart(data: { categories: { name: string }[]; nodes: any[]; links: any[] }): void {
    if (!this.searchChart) this.initSearchChart();
    if (!this.searchChart) return;

    this.searchChart.setOption({
      tooltip: { trigger: 'item' },
      legend: { data: data.categories.map((c) => c.name), bottom: 10 },
      series: [
        {
          type: 'graph',
          layout: 'force',
          categories: data.categories,
          data: data.nodes,
          links: data.links,
          roam: true,
          force: { repulsion: 250, edgeLength: 100 },
          label: { show: true, fontSize: 11 },
        },
      ],
    });

    this.searchChart.off('click');
    this.searchChart.on('click', (params: any) => {
      if (params.dataType === 'node') {
        this.selectedSearchNode = params.data;
        this.loadLinkedTutorialsForNode(params.data);
      }
    });
  }

  private loadLinkedTutorialsForNode(node: { id: string; category: number }): void {
    this.linkedTutorials = [];
    const conceptId = this.parseConceptId(node.id);
    if (conceptId == null) return;

    this.knowledgeGraphLinkService.getLinksForConcept(conceptId).subscribe({
      next: (items) => {
        this.linkedTutorials = items;
      },
    });
  }

  private parseConceptId(nodeId: string): number | null {
    if (!nodeId.startsWith('concept-')) return null;
    const id = Number(nodeId.replace('concept-', ''));
    return Number.isNaN(id) || id <= 0 ? null : id;
  }

  resetSearchView(): void {
    this.searchKeyword = '';
    this.searchCategory = '';
    this.selectedSearchNode = null;
    this.linkedTutorials = [];
    this.searchGraphData = null;
    this.initSearchChart();
  }

  getSearchCategoryName(category: number): string {
    const names = ['教程', '课件', '知识点', '硬件'];
    return names[category] || '未知';
  }

  openSearchResult(node: { name: string; category: number }): void {
    if (node.category === 3) {
      void this.router.navigate(['/hardware-projects'], { queryParams: { search: node.name } });
    } else if (node.category === 1) {
      void this.router.navigate(['/resource-explorer'], { queryParams: { search: node.name, type: 'material' } });
    } else {
      void this.router.navigate(['/resource-explorer'], { queryParams: { search: node.name, type: 'tutorial' } });
    }
  }

  viewSearchHardware(node: { name: string }): void {
    void this.router.navigate(['/hardware-projects'], { queryParams: { search: node.name } });
  }

  // ─── 共享工具 ───

  getLevelRange(nodes: KnowledgeNode[]): string {
    const levels = [...new Set(nodes.map((n) => n.level))];
    if (levels.length === 1) return this.getLevelName(levels[0]);
    const levelOrder = ['elementary', 'middle', 'high', 'university'];
    const minIndex = Math.min(...levels.map((l) => levelOrder.indexOf(l)));
    const maxIndex = Math.max(...levels.map((l) => levelOrder.indexOf(l)));
    return `${this.getLevelName(levelOrder[minIndex])} → ${this.getLevelName(levelOrder[maxIndex])}`;
  }

  getLevelName(level: string): string {
    const names: Record<string, string> = {
      elementary: '小学',
      middle: '初中',
      high: '高中',
      university: '大学',
    };
    return names[level] || level;
  }

  getEdgeColor(relation: string): string {
    const colors: Record<string, string> = {
      prerequisite: '#ff6b6b',
      related: '#4ecdc4',
      progression: '#ffa502',
      aligns_with: '#9c27b0',
    };
    return colors[relation] || '#999';
  }

  private getMockLearningPaths(): LearningPath[] {
    return [
      {
        id: 'path-001',
        name: 'STEM基础：工程设计与科学探究',
        description: '从科学方法到工程实践，培养STEM核心素养',
        nodes: [
          { id: 't1', type: 'tutorial', title: '工程设计流程', source: 'OpenSciEd', level: 'middle', subject: 'engineering', difficulty: 2 },
          { id: 'm1', type: 'material', title: '设计思维工作坊', source: 'MIT OCW', level: 'middle', subject: 'engineering' },
          { id: 't2', type: 'tutorial', title: '科学探究方法', source: 'OpenSciEd', level: 'middle', subject: 'science', difficulty: 3 },
        ],
        edges: [
          { from: 't1', to: 'm1', relation: 'related' },
          { from: 't1', to: 't2', relation: 'progression' },
        ],
      },
      {
        id: 'path-002',
        name: 'STEM进阶：智能制造与机器人',
        description: '融合机械工程、电子技术与编程',
        nodes: [
          { id: 't4', type: 'tutorial', title: '机械结构与传动', source: 'MIT OCW', level: 'high', subject: 'engineering', difficulty: 2 },
          { id: 't5', type: 'tutorial', title: '电路与控制系统', source: '格物斯坦', level: 'high', subject: 'technology', difficulty: 3 },
        ],
        edges: [{ from: 't4', to: 't5', relation: 'progression' }],
      },
    ];
  }
}
