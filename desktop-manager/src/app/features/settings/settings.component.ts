import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { ImportExportService } from '../../core/services/import-export.service';

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

      <mat-card class="action-card">
        <mat-card-content>
          <h3>📦 数据导入导出</h3>
          <div class="import-export-actions">
            <button mat-stroked-button color="primary" (click)="exportCourses()">
              <i class="ri-download-line"></i> 导出教程库(JSON)
            </button>
            <button mat-stroked-button color="accent" (click)="importCourses()">
              <i class="ri-upload-line"></i> 导入教程库(JSON)
            </button>
            <button mat-stroked-button (click)="exportMaterials()">
              <i class="ri-file-text-line"></i> 导出课件清单(CSV)
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="action-card">
        <mat-card-content>
          <h3>💾 数据库备份恢复</h3>
          <div class="import-export-actions">
            <button mat-stroked-button color="primary" (click)="backupDatabase()">
              <i class="ri-database-2-line"></i> 备份数据库
            </button>
            <button mat-stroked-button color="warn" (click)="restoreDatabase()">
              <i class="ri-history-line"></i> 恢复数据库
            </button>
          </div>
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
    .import-export-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 12px;
    }
    .import-export-actions button i {
      margin-right: 8px;
    }
  `]
})
export class SettingsComponent {
  constructor(
    private router: Router,
    private importExportService: ImportExportService,
    private snackBar: MatSnackBar
  ) {}

  goBack(): void {
    void this.router.navigate(['/dashboard']);
  }

  resetSetup(): void {
    if (confirm('确定要重置配置吗？')) {
      localStorage.removeItem('user-profile');
      void this.router.navigate(['/setup-wizard']);
    }
  }

  async exportCourses(): Promise<void> {
    try {
      // 使用默认路径
      const defaultPath = `${this.getDownloadsPath()}/courses_export_${Date.now()}.json`;
      const result = await this.importExportService.exportCoursesToJson(defaultPath);
      this.snackBar.open(result, '关闭', { duration: 5000 });
    } catch (error) {
      console.error('导出失败:', error);
      this.snackBar.open('导出失败: ' + error, '关闭', { duration: 5000 });
    }
  }

  async importCourses(): Promise<void> {
    const filePath = prompt('请输入JSON文件路径：');
    if (!filePath) return;

    try {
      const result = await this.importExportService.importCoursesFromJson(filePath);
      this.snackBar.open(result, '关闭', { duration: 5000 });
    } catch (error) {
      console.error('导入失败:', error);
      this.snackBar.open('导入失败: ' + error, '关闭', { duration: 5000 });
    }
  }

  async exportMaterials(): Promise<void> {
    try {
      const defaultPath = `${this.getDownloadsPath()}/materials_list_${Date.now()}.csv`;
      const result = await this.importExportService.exportMaterialsToCsv(defaultPath);
      this.snackBar.open(result, '关闭', { duration: 5000 });
    } catch (error) {
      console.error('导出失败:', error);
      this.snackBar.open('导出失败: ' + error, '关闭', { duration: 5000 });
    }
  }

  async backupDatabase(): Promise<void> {
    try {
      const defaultPath = `${this.getAppDataPath()}/backups`;
      const result = await this.importExportService.backupDatabase(defaultPath);
      this.snackBar.open(result, '关闭', { duration: 5000 });
    } catch (error) {
      console.error('备份失败:', error);
      this.snackBar.open('备份失败: ' + error, '关闭', { duration: 5000 });
    }
  }

  async restoreDatabase(): Promise<void> {
    const filePath = prompt('请输入备份文件路径（.db文件）：');
    if (!filePath) return;

    if (!confirm('恢复数据库将覆盖当前数据，确定要继续吗？')) {
      return;
    }

    try {
      const result = await this.importExportService.restoreDatabase(filePath);
      this.snackBar.open(result, '关闭', { duration: 5000 });
    } catch (error) {
      console.error('恢复失败:', error);
      this.snackBar.open('恢复失败: ' + error, '关闭', { duration: 5000 });
    }
  }

  private getDownloadsPath(): string {
    // 在Tauri环境中，可以使用tauri API获取下载目录
    // 这里暂时返回一个默认路径
    return './downloads';
  }

  private getAppDataPath(): string {
    return './data';
  }
}
