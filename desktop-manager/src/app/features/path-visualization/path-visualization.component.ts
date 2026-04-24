import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import * as echarts from 'echarts';
import { HttpClient } from '@angular/common/http';

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
  selector: 'app-path-visualization',
  templateUrl: './path-visualization.component.html',
  styleUrls: ['./path-visualization.component.css']
})
export class PathVisualizationComponent implements OnInit, AfterViewInit {
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  
  pathData: PathResponse | null = null;
  loading = false;
  private chart: any;
  
  // 测试用户数据（public以便单元测试访问）
  testUser = {
    user_id: 'test_user_001',
    age: 14,
    grade_level: '初中',
    max_nodes: 15
  };

  // 年龄预设选项
  agePresets = [
    { label: '小学 (8岁)', age: 8, grade: '小学' },
    { label: '初中 (13岁)', age: 13, grade: '初中' },
    { label: '高中 (16岁)', age: 16, grade: '高中' },
    { label: '大学 (19岁)', age: 19, grade: '大学' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.initChart();
  }

  initChart() {
    if (this.chartContainer) {
      this.chart = echarts.init(this.chartContainer.nativeElement);
      this.showEmptyState();
    }
  }

  showEmptyState() {
    const option = {
      title: {
        text: '点击"生成路径"按钮开始',
        left: 'center',
        top: 'center',
        textStyle: {
          color: '#999',
          fontSize: 16
        }
      }
    };
    this.chart.setOption(option);
  }

  generatePath() {
    this.loading = true;
    
    // 使用相对路径，Vite代理会转发到后端
    this.http.post<PathResponse>('/api/v1/path/generate', this.testUser)
      .subscribe({
        next: (response) => {
          this.pathData = response;
          this.renderPathGraph(response.path_nodes);
          this.loading = false;
        },
        error: (error) => {
          console.error('生成路径失败:', error);
          alert('生成路径失败，请检查后端服务是否运行');
          this.loading = false;
        }
      });
  }

  setAgePreset(preset: any) {
    this.testUser.age = preset.age;
    this.testUser.grade_level = preset.grade;
    // 触发一次新的路径生成
    this.generatePath();
  }

  onAgeChange(event: any) {
    const age = parseInt(event.target.value, 10);
    this.testUser.age = age;
    
    // 根据年龄自动匹配学段
    if (age <= 12) this.testUser.grade_level = '小学';
    else if (age <= 15) this.testUser.grade_level = '初中';
    else if (age <= 18) this.testUser.grade_level = '高中';
    else this.testUser.grade_level = '大学';
    
    this.generatePath();
  }

  renderPathGraph(nodes: PathNode[]) {
    if (!nodes || nodes.length === 0) {
      this.showEmptyState();
      return;
    }

    // 构建节点和边
    const graphNodes: any[] = [];
    const graphLinks: any[] = [];
    
    // 颜色映射
    const colorMap: Record<string, string> = {
      'course_unit': '#5470c6',
      'knowledge_point': '#91cc75',
      'cross_discipline_kp': '#fac858',
      'textbook_chapter': '#ee6666',
      'hardware_project': '#73c0de'
    };

    // 添加节点
    nodes.forEach((node, index) => {
      graphNodes.push({
        id: node.node_id,
        name: node.title,
        value: node.difficulty,
        symbolSize: 30 + node.difficulty * 10,
        itemStyle: {
          color: colorMap[node.node_type] || '#999'
        },
        category: node.node_type,
        label: {
          show: true,
          formatter: node.title.length > 10 ? node.title.substring(0, 10) + '...' : node.title
        }
      });

      // 添加连线（按顺序连接）
      if (index > 0) {
        graphLinks.push({
          source: nodes[index - 1].node_id,
          target: node.node_id,
          lineStyle: {
            curveness: 0.2
          }
        });
      }
    });

    const option = {
      title: {
        text: 'K12-大学学习路径图谱',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const node = nodes.find(n => n.node_id === params.name);
          if (node) {
            return `
              <strong>${node.title}</strong><br/>
              类型: ${this.getNodeTypeName(node.node_type)}<br/>
              难度: ${node.difficulty}<br/>
              学时: ${node.estimated_hours}h<br/>
              ${node.description ? '说明: ' + node.description : ''}
            `;
          }
          return params.name;
        }
      },
      legend: [{
        data: ['课程单元', '知识点', '跨学科', '教材章节', '硬件项目'],
        bottom: 10
      }],
      series: [{
        type: 'graph',
        layout: 'force',
        data: graphNodes,
        links: graphLinks,
        categories: [
          { name: '课程单元' },
          { name: '知识点' },
          { name: '跨学科' },
          { name: '教材章节' },
          { name: '硬件项目' }
        ],
        roam: true,
        label: {
          position: 'right',
          formatter: '{b}'
        },
        force: {
          repulsion: 300,
          edgeLength: 150
        },
        lineStyle: {
          color: 'source',
          curveness: 0.3
        }
      }]
    };

    this.chart.setOption(option);
  }

  getNodeTypeName(type: string): string {
    const typeMap: Record<string, string> = {
      'course_unit': '课程单元',
      'knowledge_point': '知识点',
      'cross_discipline_kp': '跨学科知识点',
      'textbook_chapter': '教材章节',
      'hardware_project': '硬件项目'
    };
    return typeMap[type] || type;
  }
}
