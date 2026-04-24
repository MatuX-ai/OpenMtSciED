/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as echarts from 'echarts';



@Component({
  selector: 'app-search-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="controls">
        <input
          type="text"
          [(ngModel)]="keyword"
          placeholder="搜索知识点（如：光合作用）..."
          (keyup.enter)="search()"
        />
        <select [(ngModel)]="category">
          <option value="">所有类型</option>
          <option value="0">教程库</option>
          <option value="1">课件库</option>
          <option value="2">知识点</option>
          <option value="3">硬件项目</option>
        </select>
        <button (click)="search()">搜索</button>
        <button (click)="resetView()">重置视图</button>
      </div>

      <div id="chart-container"></div>

      <div class="detail-panel" *ngIf="selectedNode">
        <div class="panel-header">
          <h3>{{ selectedNode.name }}</h3>
          <button class="close-btn" (click)="closePanel()">×</button>
        </div>
        <div class="panel-content">
          <p><strong>类型:</strong> {{ getCategoryName(selectedNode.category) }}</p>
          <p *ngIf="selectedNode.subject"><strong>学科:</strong> {{ selectedNode.subject }}</p>
          <p *ngIf="selectedNode.level"><strong>难度:</strong> {{ selectedNode.level }}星</p>
          <p *ngIf="selectedNode.description">
            <strong>描述:</strong> {{ selectedNode.description }}
          </p>
          <div class="panel-actions">
            <button (click)="download(selectedNode.id)" class="btn-primary">下载资源</button>
            <button
              *ngIf="selectedNode.hardware"
              (click)="viewHardware(selectedNode.id)"
              class="btn-secondary"
            >
              查看硬件项目
            </button>
          </div>
        </div>
      </div>



    </div>
  `,
  styles: [
    `
      .container {
        padding: 20px;
        height: 100vh;
        display: flex;
        flex-direction: column;
      }
      .controls {
        margin-bottom: 20px;
        display: flex;
        gap: 10px;
        align-items: center;
      }
      input,
      select,
      button {
        padding: 8px 16px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 14px;
      }
      button {
        cursor: pointer;
        background: #007bff;
        color: white;
        border: none;
        transition: background 0.2s;
      }
      button:hover {
        background: #0056b3;
      }
      #chart-container {
        flex: 1;
        border: 1px solid #eee;
        border-radius: 8px;
        overflow: hidden;
      }
      .detail-panel {
        position: fixed;
        right: 20px;
        top: 100px;
        width: 350px;
        max-height: calc(100vh - 140px);
        background: white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border-radius: 8px;
        overflow-y: auto;
        z-index: 1000;
      }
      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid #eee;
        background: #f8f9fa;
      }
      .panel-header h3 {
        margin: 0;
        font-size: 18px;
      }
      .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
        padding: 0;
        width: 30px;
        height: 30px;
        line-height: 30px;
      }
      .close-btn:hover {
        color: #000;
        background: #e9ecef;
        border-radius: 4px;
      }
      .panel-content {
        padding: 20px;
      }
      .panel-content p {
        margin: 12px 0;
        line-height: 1.6;
      }
      .panel-actions {
        margin-top: 20px;
        display: flex;
        gap: 10px;
      }
      .btn-primary {
        flex: 1;
        background: #007bff;
      }
      .btn-secondary {
        flex: 1;
        background: #6c757d;
      }
    `,
  ],
})
export class SearchMapComponent implements OnInit, OnDestroy {


  keyword = '';
  category = '';
  selectedNode: any = null;
  myChart: echarts.ECharts | undefined;
  graphData: any = null;

  constructor(private readonly http: HttpClient) {}

  ngOnInit() {
    this.initChart();
    this.loadGraphData();

    // 监听窗口大小变化，使图表自适应
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  ngOnDestroy() {
    // 销毁 ECharts 实例，防止内存泄漏
    if (this.myChart) {
      this.myChart.dispose();
      this.myChart = undefined;
    }

    // 移除事件监听器
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  handleResize() {
    if (this.myChart) {
      this.myChart.resize();
    }
  }

  initChart() {
    const chartDom = document.getElementById('chart-container');
    if (chartDom) {
      this.myChart = echarts.init(chartDom);
      this.myChart.on('click', (params: any) => {
        this.selectedNode = params.data;
      });
    }
  }

  loadGraphData() {
    // TODO: 替换为实际的图谱数据API
    console.warn('图谱数据API未实现');
    this.graphData = { categories: [], nodes: [], links: [] };
  }

  search() {
    if (!this.graphData) return;

    let filteredNodes = this.graphData.nodes;

    // 根据关键词过滤
    if (this.keyword) {
      filteredNodes = filteredNodes.filter((node: any) =>
        node.name.toLowerCase().includes(this.keyword.toLowerCase())
      );
    }

    // 根据类型过滤
    if (this.category !== '') {
      filteredNodes = filteredNodes.filter(
        (node: any) => node.category.toString() === this.category
      );
    }

    // 更新图表显示
    const option = {
      series: [
        {
          data: filteredNodes,
          links: this.graphData.links.filter((link: any) => {
            return (
              filteredNodes.some((node: any) => node.id === link.source) &&
              filteredNodes.some((node: any) => node.id === link.target)
            );
          }),
        },
      ],
    };

    this.myChart?.setOption(option);
  }

  download(id: string) {
    // TODO: 替换为实际的下载API
    console.warn('下载功能未实现', id);
  }

  viewHardware(id: string) {
    // 模拟硬件项目数据
    const mockProject = {
      id,
      name: 'Arduino 气象站',
      description: '使用温湿度传感器采集环境数据',
      code: `void setup() {
  Serial.begin(9600);
}

void loop() {
  float temp = 25.5;
  float humidity = 60.0;
  
  Serial.print("Temperature: ");
  Serial.print(temp);
  Serial.print("°C, Humidity: ");
  Serial.print(humidity);
  Serial.println("%");
  
  delay(2000);
}`,
      board: 'arduino' as const,
      materials: ['Arduino Uno', 'DHT11传感器', '杜邦线'],
    };


  }

  resetView() {
    if (this.myChart) {
      this.myChart.dispatchAction({
        type: 'restore',
      });
    }
    this.keyword = '';
    this.category = '';
    this.selectedNode = null;
    if (this.graphData) {
      this.loadGraphData();
    }
  }

  closePanel() {
    this.selectedNode = null;
  }

  getCategoryName(index: number): string {
    const names = ['教程库', '课件库', '知识点', '硬件项目'];
    return names[index] || '未知';
  }
}
