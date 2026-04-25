import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

declare var echarts: any;

@Component({
  selector: 'app-knowledge-graph-admin',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="graph-admin-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>知识图谱可视化与管理</mat-card-title>
          <mat-card-subtitle>实时查看 Neo4j 中的教程、课件与硬件项目关联</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="toolbar">
            <button mat-raised-button color="primary" (click)="loadGraphData()">
              <mat-icon>refresh</mat-icon> 刷新图谱
            </button>
            <span class="stats">节点数: {{ nodes.length }} | 关系数: {{ relationships.length }}</span>
          </div>
          <div #chartContainer class="chart-container"></div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .graph-admin-container { padding: 20px; height: calc(100vh - 64px); }
    .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .stats { color: #666; font-size: 14px; }
    .chart-container { width: 100%; height: 600px; background: #f5f5f5; border-radius: 4px; }
  `]
})
export class KnowledgeGraphAdminComponent implements OnInit, AfterViewInit {
  @ViewChild('chartContainer') chartContainer!: ElementRef;

  nodes: any[] = [];
  relationships: any[] = [];
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

  initChart(): void {
    if (!this.chartContainer) return;

    console.log('开始初始化图表，节点数:', this.nodes.length, '关系数:', this.relationships.length);

    if (this.chart) this.chart.dispose();
    this.chart = echarts.init(this.chartContainer.nativeElement);

    // 检查节点数据结构
    if (this.nodes.length > 0) {
      console.log('第一个节点的完整结构:', JSON.stringify(this.nodes[0], null, 2));
    }

    const categories = [
      { name: 'CourseUnit' },
      { name: 'TextbookChapter' },
      { name: 'HardwareProject' },
      { name: 'KnowledgePoint' }
    ];

    const option = {
      title: { text: 'STEM 知识图谱概览', left: 'center' },
      tooltip: {},
      legend: { data: categories.map(c => c.name), bottom: 10 },
      series: [{
        type: 'graph',
        layout: 'force',
        data: this.nodes.filter(n => n).map(n => ({
          id: n.id.toString(),
          name: n.title || n.name || 'Unknown',
          category: categories.findIndex(c => c.name === (n.labels && n.labels[0] ? n.labels[0] : 'Unknown')),
          symbolSize: 40,
          value: n.id
        })),
        links: this.relationships.filter(r => r).map(r => ({
          source: r.source ? r.source.toString() : '',
          target: r.target ? r.target.toString() : ''
        })),
        categories: categories,
        roam: true,
        label: { show: true, position: 'right' },
        force: { repulsion: 100, edgeLength: 150 },
        emphasis: { focus: 'adjacency' }
      }]
    };

    this.chart.setOption(option);
  }
}
