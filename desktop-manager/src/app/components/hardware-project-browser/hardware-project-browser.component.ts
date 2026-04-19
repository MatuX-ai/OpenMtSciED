/**
 * 硬件项目浏览器组件
 * 
 * 展示硬件项目列表，支持筛选和搜索功能
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HardwareProjectService } from '../../services/hardware-project.service';
import { HardwareProject, HardwareCategory, HardwareProjectFilter } from '../../models/hardware-project.models';

@Component({
  selector: 'app-hardware-project-browser',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="hardware-project-browser">
      <h2>硬件项目库</h2>
      
      <!-- 搜索和筛选区域 -->
      <div class="filters">
        <input 
          type="text" 
          [(ngModel)]="searchKeyword" 
          (input)="onSearch()"
          placeholder="搜索项目..."
          class="search-input"
        />
        
        <select [(ngModel)]="selectedCategory" (change)="applyFilters()">
          <option value="">全部分类</option>
          <option *ngFor="let category of categories" [value]="category">
            {{ getCategoryName(category) }}
          </option>
        </select>
        
        <select [(ngModel)]="selectedDifficulty" (change)="applyFilters()">
          <option value="">全部难度</option>
          <option value="1">⭐</option>
          <option value="2">⭐⭐</option>
          <option value="3">⭐⭐⭐</option>
          <option value="4">⭐⭐⭐⭐</option>
          <option value="5">⭐⭐⭐⭐⭐</option>
        </select>
      </div>

      <!-- 加载状态 -->
      <div *ngIf="loading" class="loading">
        加载中...
      </div>

      <!-- 项目列表 -->
      <div *ngIf="!loading && projects.length > 0" class="project-grid">
        <div *ngFor="let project of projects" class="project-card" (click)="viewProjectDetail(project)">
          <h3>{{ project.title }}</h3>
          <p class="description">{{ project.description | slice:0:100 }}...</p>
          
          <div class="project-meta">
            <span class="category">{{ getCategoryName(project.category) }}</span>
            <span class="difficulty">{{ getDifficultyStars(project.difficulty) }}</span>
            <span class="cost">¥{{ project.total_cost }}</span>
          </div>
          
          <div class="subject">{{ project.subject }}</div>
        </div>
      </div>

      <!-- 空状态 -->
      <div *ngIf="!loading && projects.length === 0" class="empty-state">
        <p>没有找到匹配的硬件项目</p>
      </div>
    </div>
  `,
  styles: [`
    .hardware-project-browser {
      padding: 20px;
    }
    
    .filters {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    
    .search-input {
      flex: 1;
      min-width: 200px;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    select {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .loading {
      text-align: center;
      padding: 40px;
      color: #666;
    }
    
    .project-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    
    .project-card {
      border: 1px solid #eee;
      border-radius: 8px;
      padding: 16px;
      cursor: pointer;
      transition: box-shadow 0.3s;
    }
    
    .project-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .project-card h3 {
      margin: 0 0 8px 0;
      color: #333;
    }
    
    .description {
      color: #666;
      margin: 0 0 12px 0;
    }
    
    .project-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .category {
      background: #e3f2fd;
      color: #1976d2;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
    }
    
    .difficulty {
      color: #ff9800;
    }
    
    .cost {
      color: #f44336;
      font-weight: bold;
    }
    
    .subject {
      color: #999;
      font-size: 14px;
    }
    
    .empty-state {
      text-align: center;
      padding: 40px;
      color: #999;
    }
  `]
})
export class HardwareProjectBrowserComponent implements OnInit {
  projects: HardwareProject[] = [];
  categories: string[] = [];
  loading = false;
  
  searchKeyword = '';
  selectedCategory = '';
  selectedDifficulty = '';
  
  constructor(private hardwareProjectService: HardwareProjectService) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProjects();
  }

  /**
   * 加载项目分类
   */
  loadCategories(): void {
    this.hardwareProjectService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('加载分类失败:', error);
      }
    });
  }

  /**
   * 加载项目列表
   */
  loadProjects(): void {
    this.loading = true;
    
    const filter: HardwareProjectFilter = {};
    if (this.selectedCategory) {
      filter.category = this.selectedCategory as HardwareCategory;
    }
    if (this.selectedDifficulty) {
      filter.difficultyRange = [parseInt(this.selectedDifficulty), parseInt(this.selectedDifficulty)];
    }
    if (this.searchKeyword) {
      filter.keyword = this.searchKeyword;
    }
    
    this.hardwareProjectService.getProjects(filter).subscribe({
      next: (result) => {
        this.projects = result.projects;
        this.loading = false;
      },
      error: (error) => {
        console.error('加载项目失败:', error);
        this.loading = false;
      }
    });
  }

  /**
   * 应用筛选条件
   */
  applyFilters(): void {
    this.loadProjects();
  }

  /**
   * 搜索处理
   */
  onSearch(): void {
    // 防抖处理，避免频繁请求
    setTimeout(() => {
      this.loadProjects();
    }, 300);
  }

  /**
   * 查看项目详情
   */
  viewProjectDetail(project: HardwareProject): void {
    // 这里可以打开详情对话框或导航到详情页
    console.log('查看项目详情:', project);
    alert(`查看项目: ${project.title}`);
  }

  /**
   * 获取分类中文名称
   */
  getCategoryName(category: string): string {
    const names: Record<string, string> = {
      electronics: '电子电路',
      robotics: '机器人',
      iot: '物联网',
      mechanical: '机械结构',
      smart_home: '智能家居',
      sensor: '传感器应用',
      communication: '通信技术'
    };
    return names[category] || category;
  }

  /**
   * 获取难度星级显示
   */
  getDifficultyStars(difficulty: number): string {
    if (difficulty < 1 || difficulty > 5) {
      return '⭐';
    }
    return '⭐'.repeat(difficulty);
  }
}