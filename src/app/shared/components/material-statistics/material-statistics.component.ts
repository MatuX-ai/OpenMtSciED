import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  MaterialStatisticsService
} from '../../../core/services/material-statistics.service';
import {
  StatisticsTimeRange,
  StatisticsMetricType,
  StatisticsQuery,
  OverallStatistics,
  PopularMaterial,
  ActiveUser,
  MaterialUsageStatistics,
  isValidStatisticsTimeRange
} from '../../../models/material-statistics.models';

@Component({
  selector: 'app-material-statistics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './material-statistics.component.html',
  styleUrls: ['./material-statistics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaterialStatisticsComponent {
  private statisticsService = inject(MaterialStatisticsService);
  private snackBar = inject(MatSnackBar);
  
  // 查询参数
  readonly timeRange = signal<StatisticsTimeRange>(StatisticsTimeRange.LAST_7_DAYS);
  readonly materialId = signal<number | null>(null);
  
  // 加载状态
  readonly loading = signal<boolean>(false);
  readonly exporting = signal<boolean>(false);
  
  // 数据
  readonly overallStatistics = signal<OverallStatistics | null>(null);
  readonly materialStatistics = signal<MaterialUsageStatistics | null>(null);
  readonly popularMaterials = signal<PopularMaterial[]>([]);
  readonly activeUsers = signal<ActiveUser[]>([]);
  
  // 选中的标签页
  readonly selectedTab = signal<number>(0);
  
  // 配置
  readonly timeRanges = [
    { value: StatisticsTimeRange.TODAY, label: '今天' },
    { value: StatisticsTimeRange.YESTERDAY, label: '昨天' },
    { value: StatisticsTimeRange.LAST_7_DAYS, label: '最近7天' },
    { value: StatisticsTimeRange.LAST_30_DAYS, label: '最近30天' },
    { value: StatisticsTimeRange.LAST_90_DAYS, label: '最近90天' },
    { value: StatisticsTimeRange.THIS_MONTH, label: '本月' },
    { value: StatisticsTimeRange.LAST_MONTH, label: '上月' },
    { value: StatisticsTimeRange.THIS_YEAR, label: '今年' }
  ];
  
  ngOnInit(): void {
    this.loadOverallStatistics();
    this.loadPopularMaterials();
    this.loadActiveUsers();
  }
  
  // ========== 加载数据 ==========
  
  loadOverallStatistics(): void {
    this.loading.set(true);
    
    const query: StatisticsQuery = {
      timeRange: this.timeRange()
    };
    
    this.statisticsService.getOverallStatistics(query).subscribe({
      next: (stats: OverallStatistics) => {
        this.overallStatistics.set(stats);
        this.loading.set(false);
      },
      error: (error: Error) => {
        console.error('[MaterialStatisticsComponent] 加载总体统计失败:', error);
        this.snackBar.open('加载统计失败', '关闭', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }
  
  loadMaterialStatistics(materialId: number): void {
    this.materialId.set(materialId);
    this.loading.set(true);
    
    const query: StatisticsQuery = {
      timeRange: this.timeRange(),
      materialId
    };
    
    this.statisticsService.getMaterialStatistics(materialId, query).subscribe({
      next: (stats: MaterialUsageStatistics) => {
        this.materialStatistics.set(stats);
        this.selectedTab.set(3); // 切换到课件详情标签页
        this.loading.set(false);
      },
      error: (error: Error) => {
        console.error('[MaterialStatisticsComponent] 加载课件统计失败:', error);
        this.snackBar.open('加载课件统计失败', '关闭', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }
  
  loadPopularMaterials(): void {
    const query: StatisticsQuery = {
      timeRange: this.timeRange()
    };
    
    this.statisticsService.getPopularMaterials(query, 10).subscribe({
      next: (materials: PopularMaterial[]) => {
        this.popularMaterials.set(materials);
      },
      error: (error: Error) => {
        console.error('[MaterialStatisticsComponent] 加载热门课件失败:', error);
      }
    });
  }
  
  loadActiveUsers(): void {
    const query: StatisticsQuery = {
      timeRange: this.timeRange()
    };
    
    this.statisticsService.getActiveUsers(query, 10).subscribe({
      next: (users: ActiveUser[]) => {
        this.activeUsers.set(users);
      },
      error: (error: Error) => {
        console.error('[MaterialStatisticsComponent] 加载活跃用户失败:', error);
      }
    });
  }
  
  // ========== 时间范围变化 ==========
  
  onTimeRangeChange(timeRange: StatisticsTimeRange): void {
    this.timeRange.set(timeRange);
    this.refreshAllData();
  }
  
  refreshAllData(): void {
    this.loadOverallStatistics();
    this.loadPopularMaterials();
    this.loadActiveUsers();
    
    if (this.materialId()) {
      this.loadMaterialStatistics(this.materialId()!);
    }
  }
  
  // ========== 导出功能 ==========
  
  exportStatistics(format: 'csv' | 'excel' | 'pdf' = 'excel'): void {
    this.exporting.set(true);
    
    const query: StatisticsQuery = {
      timeRange: this.timeRange(),
      materialId: this.materialId() || undefined
    };
    
    this.statisticsService.exportStatistics(query, format).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `statistics-${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.exporting.set(false);
        this.snackBar.open('统计已导出', '关闭', { duration: 2000 });
      },
      error: (error: Error) => {
        console.error('[MaterialStatisticsComponent] 导出失败:', error);
        this.snackBar.open('导出失败', '关闭', { duration: 3000 });
        this.exporting.set(false);
      }
    });
  }
  
  // ========== 刷新功能 ==========
  
  refreshStatistics(): void {
    this.refreshAllData();
    this.snackBar.open('统计数据已刷新', '关闭', { duration: 2000 });
  }
  
  // ========== 辅助方法 ==========
  
  getTimeRangeLabel(timeRange: StatisticsTimeRange): string {
    const range = this.timeRanges.find(r => r.value === timeRange);
    return range?.label || timeRange;
  }
  
  getTrendIcon(trend: 'up' | 'down' | 'flat'): string {
    const iconMap: Record<string, string> = {
      'up': 'trending_up',
      'down': 'trending_down',
      'flat': 'trending_flat'
    };
    return iconMap[trend] || 'trending_flat';
  }
  
  getTrendColor(trend: 'up' | 'down' | 'flat'): string {
    const colorMap: Record<string, string> = {
      'up': 'success',
      'down': 'danger',
      'flat': 'grey'
    };
    return colorMap[trend] || 'grey';
  }
  
  formatNumber(num: number): string {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }
  
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('zh-CN');
  }
  
  formatDateTime(date: Date): string {
    return new Date(date).toLocaleString('zh-CN');
  }
}
