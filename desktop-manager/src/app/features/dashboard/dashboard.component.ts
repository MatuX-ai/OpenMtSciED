import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule],
  template: `
    <div class="dashboard-container">
      <div class="header">
        <h1>OpenMTSciEd 桌面端</h1>
        <button mat-button (click)="resetSetup()">重新设置</button>
      </div>

      <div class="action-grid">
        <mat-card *ngFor="let action of actions" class="action-card" (click)="navigate(action.route)">
          <mat-card-content>
            <h3>{{ action.title }}</h3>
            <p>{{ action.description }}</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 24px; background: #f5f7fa; min-height: 100vh; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .action-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
    .action-card { cursor: pointer; transition: transform 0.2s; border-radius: 12px; }
    .action-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
    mat-card-content { padding: 24px; text-align: center; }
    h3 { margin: 0 0 8px; color: #333; }
    p { margin: 0; color: #666; font-size: 14px; }
  `]
})
export class DashboardComponent implements OnInit {
  actions = [
    { title: '教程库', description: '浏览和管理开源 STEM 教程', route: '/tutorial-library' },
    { title: '课件库', description: '获取 OpenStax 等经典教材', route: '/material-library' },
    { title: '知识图谱', description: '查看连贯学习路径', route: '/knowledge-graph' },
    { title: '硬件项目', description: '低成本 Arduino/ESP32 实践', route: '/hardware-projects' },
    { title: '用户管理', description: '管理系统用户和权限', route: '/admin/user-management' },
    { title: '系统设置', description: '配置存储与 AI 选项', route: '/settings' },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {}

  navigate(route: string): void {
    void this.router.navigate([route]);
  }

  resetSetup(): void {
    if (confirm('确定要重置配置吗？')) {
      localStorage.removeItem('user-profile');
      void this.router.navigate(['/setup-wizard']);
    }
  }
}
