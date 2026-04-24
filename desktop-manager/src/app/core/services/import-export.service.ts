import { Injectable } from '@angular/core';
import { TauriService } from './tauri.service';

@Injectable({
  providedIn: 'root'
})
export class ImportExportService {
  constructor(private tauriService: TauriService) {}

  /**
   * 导出教程库为JSON
   */
  async exportCoursesToJson(filePath: string): Promise<string> {
    return this.tauriService.invokeCommand<string>('export_courses_to_json', filePath);
  }

  /**
   * 从JSON导入教程库
   */
  async importCoursesFromJson(filePath: string): Promise<string> {
    return this.tauriService.invokeCommand<string>('import_courses_from_json', filePath);
  }

  /**
   * 导出课件清单为CSV
   */
  async exportMaterialsToCsv(filePath: string): Promise<string> {
    return this.tauriService.invokeCommand<string>('export_materials_to_csv', filePath);
  }

  /**
   * 备份数据库
   */
  async backupDatabase(backupDir: string): Promise<string> {
    return this.tauriService.invokeCommand<string>('backup_database', backupDir);
  }

  /**
   * 恢复数据库
   */
  async restoreDatabase(backupFile: string): Promise<string> {
    return this.tauriService.invokeCommand<string>('restore_database', backupFile);
  }
}
