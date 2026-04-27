import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';

declare var echarts: any;

@Component({
  selector: 'app-knowledge-graph-admin',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatSnackBarModule, FormsModule],
  template: `
    <div class="graph-admin-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>知识图谱可视化与管理</mat-card-title>
          <mat-card-subtitle>实时查看 Neo4j 中的教程、课件与硬件项目关联</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="toolbar">
            <div class="toolbar-left">
              <button mat-raised-button color="primary" (click)="loadGraphData()">
                <mat-icon>refresh</mat-icon> 刷新图谱
              </button>
              <div class="search-box">
                <mat-icon class="search-icon">search</mat-icon>
                <input
                  type="text"
                  class="search-input"
                  placeholder="搜索知识点、课程、教材..."
                  [(ngModel)]="searchKeyword"
                  (input)="onSearch()"
                />
                <button *ngIf="searchKeyword" mat-icon-button class="clear-btn" (click)="clearSearch()">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            </div>
            <span class="stats">节点数: {{ nodes.length }} | 关系数: {{ relationships.length }}{{ searchKeyword ? ' | 搜索结果: ' + filteredNodes.length + ' 个节点' : '' }}</span>
          </div>
          <div #chartContainer class="chart-container"></div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .graph-admin-container { padding: 20px; height: calc(100vh - 64px); }
    .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; gap: 16px; }
    .toolbar-left { display: flex; align-items: center; gap: 16px; flex: 1; }
    .search-box {
      display: flex;
      align-items: center;
      background: #f5f5f5;
      border-radius: 4px;
      padding: 0 12px;
      flex: 1;
      max-width: 500px;
      border: 2px solid transparent;
      transition: all 0.3s;
    }
    .search-box:focus-within {
      border-color: #1976d2;
      background: white;
      box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
    }
    .search-icon { color: #999; margin-right: 8px; }
    .search-input {
      border: none;
      outline: none;
      background: transparent;
      padding: 8px 0;
      font-size: 14px;
      width: 100%;
    }
    .clear-btn { margin-left: 4px; }
    .stats { color: #666; font-size: 14px; white-space: nowrap; }
    .chart-container { width: 100%; height: 600px; background: #f5f5f5; border-radius: 4px; }
  `]
})
export class KnowledgeGraphAdminComponent implements OnInit, AfterViewInit {
  @ViewChild('chartContainer') chartContainer!: ElementRef;

  nodes: any[] = [];
  relationships: any[] = [];
  filteredNodes: any[] = [];
  filteredRelationships: any[] = [];
  searchKeyword: string = '';
  private chart: any = null;

  constructor(private http: HttpClient, private snackBar: MatSnackBar, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.loadGraphData();
  }

  loadGraphData(): void {
    this.http.get('/api/v1/admin/graph/overview').subscribe({
      next: (data: any) => {
        console.log('API返回的原始数据:', data);
        this.nodes = data.nodes || [];
        this.relationships = data.relationships || [];
        this.filteredNodes = [...this.nodes];
        this.filteredRelationships = [...this.relationships];
        console.log('节点数量:', this.nodes.length);
        console.log('第一个节点示例:', this.nodes[0]);
        this.cdr.detectChanges(); // 手动触发变更检测
        this.initChart();
        this.snackBar.open('✅ 图谱数据已更新', '关闭', { duration: 2000 });
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('❌ 获取图谱数据失败', '关闭', { duration: 3000 });
      }
    });
  }

  // 搜索功能
  onSearch(): void {
    if (!this.searchKeyword || this.searchKeyword.trim() === '') {
      // 清空搜索，显示所有节点
      this.filteredNodes = [...this.nodes];
      this.filteredRelationships = [...this.relationships];
    } else {
      const keyword = this.searchKeyword.toLowerCase().trim();

      // 过滤节点
      this.filteredNodes = this.nodes.filter(node => {
        const name = (node.name || '').toLowerCase();
        const subject = (node.subject || '').toLowerCase();
        const category = (node.category || '').toLowerCase();
        return name.includes(keyword) || subject.includes(keyword) || category.includes(keyword);
      });

      // 构建匹配节点ID集合
      const matchedNodeIds = new Set(this.filteredNodes.map(n => n.id));

      // 过滤关系：只保留两端节点都在搜索结果中的关系
      this.filteredRelationships = this.relationships.filter(rel => {
        return matchedNodeIds.has(rel.source) && matchedNodeIds.has(rel.target);
      });

      console.log(`搜索结果: ${this.filteredNodes.length} 个节点, ${this.filteredRelationships.length} 个关系`);
    }

    // 重新渲染图表
    this.updateChart();
  }

  // 清空搜索
  clearSearch(): void {
    this.searchKeyword = '';
    this.filteredNodes = [...this.nodes];
    this.filteredRelationships = [...this.relationships];
    this.updateChart();
  }

  initChart(): void {
    if (!this.chartContainer) {
      console.error('图表容器未找到');
      return;
    }

    console.log('开始初始化图表，节点数:', this.filteredNodes.length, '关系数:', this.filteredRelationships.length);

    if (this.filteredNodes.length === 0) {
      console.warn('没有节点数据，无法渲染图表');
      return;
    }

    if (this.chart) this.chart.dispose();
    this.chart = echarts.init(this.chartContainer.nativeElement);

    this.updateChart();

    // 添加窗口大小调整监听
    window.addEventListener('resize', () => {
      if (this.chart) {
        this.chart.resize();
      }
    });
  }

  // 更新图表（用于搜索后重新渲染）
  updateChart(): void {
    if (!this.chart) {
      console.warn('图表未初始化，无法更新');
      return;
    }

    if (this.filteredNodes.length === 0) {
      console.warn('没有节点数据，无法渲染图表');
      return;
    }

    // 收集所有唯一的category
    const categorySet = new Set<string>();
    this.filteredNodes.forEach(n => {
      if (n.category) categorySet.add(n.category);
    });
    const categories = Array.from(categorySet).map(name => ({ name }));

    console.log('图表类别:', categories);
    console.log('关系数据示例（前3个）:', this.filteredRelationships.slice(0, 3));
    console.log('节点ID示例（前3个）:', this.filteredNodes.slice(0, 3).map(n => n.id));

    const option = {
      title: { text: 'STEM 知识图谱概览', left: 'center' },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (params.dataType === 'node') {
            return `<strong>${params.name}</strong><br/>类型: ${params.data.category}${params.data.subject ? '<br/>学科: ' + params.data.subject : ''}`;
          }
          return params.name;
        }
      },
      legend: {
        data: categories.map(c => c.name),
        bottom: 10,
        type: 'scroll'
      },
      series: [{
        type: 'graph',
        layout: 'force',
        data: this.filteredNodes.map(n => ({
          id: n.id,
          name: n.name || n.title || 'Unknown',
          category: n.category || 'Unknown',
          symbolSize: 30,
          value: 10,
          itemStyle: {
            color: this.getCategoryColor(n.category)
          }
        })),
        links: this.filteredRelationships.map(r => ({
          source: r.source,
          target: r.target,
          name: r.name || ''
        })),
        categories: categories,
        roam: true,
        label: {
          show: true,
          position: 'right',
          fontSize: 10
        },
        force: {
          repulsion: 200,
          edgeLength: 150,
          gravity: 0.1
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 3
          }
        },
        lineStyle: {
          color: 'source',
          curveness: 0.3
        }
      }]
    };

    console.log('设置图表配置...');
    this.chart.setOption(option, true); // true表示不合并，完全替换
    console.log('图表更新完成');
  }

  // 根据类别返回颜色
  private getCategoryColor(category: string): string {
    const colorMap: Record<string, string> = {
      'CourseUnit': '#5470c6',
      'TextbookChapter': '#91cc75',
      'HardwareProject': '#fac858',
      'KnowledgePoint': '#ee6666',
      'Question': '#73c0de',
      'User': '#3ba272'
    };
    return colorMap[category] || '#999';
  }
}
