import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ResourceItem {
  id: string;
  title: string;
  description: string;
  subject?: string;
  difficulty?: number;
}

@Component({
  selector: 'app-resource-browser',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resource-browser.component.html',
  styleUrl: './resource-browser.component.scss'
})
export class ResourceBrowserComponent implements OnInit {
  tutorials: ResourceItem[] = [];
  coursewares: ResourceItem[] = [];
  selectedTutorial: ResourceItem | null = null;

  // 模拟数据 (后续对接 SQLite)
  private mockTutorials: ResourceItem[] = [
    { id: 't1', title: '生态系统能量流动', description: 'OpenSciEd 6-8年级核心单元', subject: 'Biology', difficulty: 2 },
    { id: 't2', title: '电路基础与欧姆定律', description: '物理现象驱动探究', subject: 'Physics', difficulty: 3 },
    { id: 't3', title: '化学反应速率', description: '通过实验观察变量影响', subject: 'Chemistry', difficulty: 3 }
  ];

  private mockCoursewares: Record<string, ResourceItem[]> = {
    't1': [
      { id: 'c1', title: '生态学导论 (OpenStax)', description: '生物圈与能量金字塔章节' },
      { id: 'c2', title: '碳循环机制', description: '大学预科生物教材选段' }
    ],
    't2': [
      { id: 'c3', title: '电磁学基础', description: '电压、电流与电阻的数学推导' }
    ],
    't3': [
      { id: 'c4', title: '化学动力学', description: '反应级数与活化能' }
    ]
  };

  constructor() { }

  ngOnInit(): void {
    this.tutorials = this.mockTutorials;
  }

  selectTutorial(tutorial: ResourceItem): void {
    this.selectedTutorial = tutorial;
    this.coursewares = this.mockCoursewares[tutorial.id] || [];
  }
}
