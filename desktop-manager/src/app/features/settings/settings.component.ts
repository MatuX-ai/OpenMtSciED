import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule],
  template: `
    <div class="settings-container">
      <div class="header">
        <button mat-button (click)="goBack()">返回</button>
        <h1>系统设置</h1>
      </div>

      <mat-card class="action-card">
        <mat-card-content>
          <h3>重置向导</h3>
          <p>如果您需要重新配置 AI 或存储路径，请点击下方按钮。</p>
          <button mat-raised-button color="primary" (click)="resetSetup()">重新运行设置向导</button>
        </mat-card-content>
      </mat-card>

      <mat-card class="about-card">
        <mat-card-content>
          <h3>关于 OpenMTSciEd</h3>
          <p>版本: v0.1.0 (MVP)</p>
          <p>技术栈: Tauri 2.0 + Angular 17</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .settings-container { padding: 24px; background: #f5f7fa; min-height: 100vh; }
    .header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
    .action-card, .about-card { margin-bottom: 24px; border-radius: 12px; }
    mat-card-content { padding: 24px; }
    h3 { margin: 0 0 8px; color: #333; }
    p { margin: 0 0 16px; color: #666; }
  `]
})
export class SettingsComponent {
  constructor(private router: Router) {}

  goBack(): void {
    void this.router.navigate(['/dashboard']);
  }

  resetSetup(): void {
    if (confirm('确定要重置配置吗？')) {
      localStorage.removeItem('user-profile');
      void this.router.navigate(['/setup-wizard']);
    }
  }
}
