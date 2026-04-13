import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';

interface OpenMaterial {
  id: string;
  title: string;
  description: string;
  source: 'openstax' | 'ted-ed' | 'phetsim';
  type: 'pdf' | 'ppt' | 'video' | 'interactive';
  subject: string;
  level: 'elementary' | 'middle' | 'high' | 'university';
  duration?: string; // 视频时长或学习时长
  fileSize?: string;
  downloadUrl?: string;
  previewUrl?: string;
  thumbnail?: string;
}

@Component({
  selector: 'app-open-material-browser',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
  ],
  template: `
    <div class="open-material-browser">
      <!-- 资源源选择器 -->
      <div class="source-selector">
        <mat-tab-group [(selectedIndex)]="selectedSourceIndex" (selectedIndexChange)="onSourceChange()">
          <mat-tab label="📖 OpenStax">
            <ng-template matTabContent>
              <div class="tab-content">
                <h3>大学/高中开源教材</h3>
                <p class="source-desc">免费、高质量、同行评审的教科书和教学资源</p>
              </div>
            </ng-template>
          </mat-tab>
          <mat-tab label="🎬 TED-Ed">
            <ng-template matTabContent>
              <div class="tab-content">
                <h3>STEM教育视频</h3>
                <p class="source-desc">短小精悍的动画视频,激发学习兴趣</p>
              </div>
            </ng-template>
          </mat-tab>
          <mat-tab label="🔬 PhET 仿真实验">
            <ng-template matTabContent>
              <div class="tab-content">
                <h3>互动式科学仿真</h3>
                <p class="source-desc">科罗拉多大学开发的交互式物理/化学/生物仿真</p>
              </div>
            </ng-template>
          </mat-tab>
        </mat-tab-group>
      </div>

      <!-- 加载状态 -->
      <div *ngIf="loading" class="loading-container">
        <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
        <p>正在获取开源课件...</p>
      </div>

      <!-- 课件列表 -->
      <div *ngIf="!loading" class="material-grid">
        <mat-card *ngFor="let material of materials" class="material-card">
          <!-- 缩略图区域 -->
          <div class="thumbnail-container" [class]="getTypeClass(material.type)">
            <mat-icon class="type-icon">{{ getTypeIcon(material.type) }}</mat-icon>
            <span class="type-label">{{ getTypeName(material.type) }}</span>
          </div>

          <mat-card-header>
            <mat-card-title>{{ material.title }}</mat-card-title>
            <mat-card-subtitle>
              <span class="source-badge" [class]="getSourceClass(material.source)">
                {{ getSourceName(material.source) }}
              </span>
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <p class="description">{{ material.description }}</p>

            <div class="meta-info">
              <div class="meta-item">
                <mat-icon>school</mat-icon>
                <span>{{ getSubjectName(material.subject) }}</span>
              </div>
              <div class="meta-item">
                <mat-icon>trending_up</mat-icon>
                <span>{{ getLevelName(material.level) }}</span>
              </div>
              <div class="meta-item" *ngIf="material.duration">
                <mat-icon>schedule</mat-icon>
                <span>{{ material.duration }}</span>
              </div>
              <div class="meta-item" *ngIf="material.fileSize">
                <mat-icon>storage</mat-icon>
                <span>{{ material.fileSize }}</span>
              </div>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button
              mat-raised-button
              color="primary"
              (click)="downloadMaterial(material)"
              [disabled]="downloadingIds.has(material.id)"
            >
              <mat-icon *ngIf="!downloadingIds.has(material.id)">download</mat-icon>
              <mat-progress-spinner
                *ngIf="downloadingIds.has(material.id)"
                mode="indeterminate"
                diameter="20"
              ></mat-progress-spinner>
              {{ downloadingIds.has(material.id) ? '下载中...' : '下载到本地' }}
            </button>
            <button mat-button (click)="previewMaterial(material)">
              <mat-icon>visibility</mat-icon>
              预览
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- 空状态 -->
        <div *ngIf="materials.length === 0" class="empty-state">
          <mat-icon>search_off</mat-icon>
          <p>暂无可用课件</p>
          <button mat-button color="primary" (click)="loadMaterials()">
            <mat-icon>refresh</mat-icon>
            重新加载
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .open-material-browser {
      padding: 20px;
    }

    .source-selector {
      margin-bottom: 24px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .tab-content {
      padding: 16px;
    }

    .tab-content h3 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 18px;
    }

    .source-desc {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #666;
    }

    .material-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .material-card {
      transition: transform 0.2s, box-shadow 0.2s;
      overflow: hidden;
    }

    .material-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .thumbnail-container {
      height: 120px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;

      &.pdf {
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
      }

      &.ppt {
        background: linear-gradient(135deg, #ffa502 0%, #ff7f50 100%);
      }

      &.video {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      &.interactive {
        background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      }
    }

    .type-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: white;
    }

    .type-label {
      color: white;
      font-size: 14px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .source-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;

      &.openstax {
        background: #e3f2fd;
        color: #1565c0;
      }

      &.ted-ed {
        background: #fce4ec;
        color: #c2185b;
      }

      &.phetsim {
        background: #e8f5e9;
        color: #2e7d32;
      }
    }

    .description {
      color: #555;
      line-height: 1.6;
      margin: 12px 0;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .meta-info {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 12px;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: #666;
    }

    .meta-item mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .empty-state {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #999;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }

    ::ng-deep .mat-mdc-tab-body-wrapper {
      overflow: visible !important;
    }
  `]
})
export class OpenMaterialBrowserComponent implements OnInit {
  loading = false;
  materials: OpenMaterial[] = [];
  selectedSourceIndex = 0;
  downloadingIds = new Set<string>();

  private sources = ['openstax', 'ted-ed', 'phetsim'];

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadMaterials();
  }

  async loadMaterials(): Promise<void> {
    this.loading = true;
    const source = this.sources[this.selectedSourceIndex];

    try {
      // TODO: 调用 Rust 后端获取开源课件
      // const result = await this.tauriService.invoke('browse_open_materials', { source });
      // this.materials = result;

      // 临时使用模拟数据
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.materials = this.getMockMaterials(source);
    } catch (error) {
      console.error('加载课件失败:', error);
      this.snackBar.open('加载课件失败,请重试', '关闭', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  onSourceChange(): void {
    this.loadMaterials();
  }

  async downloadMaterial(material: OpenMaterial): Promise<void> {
    if (this.downloadingIds.has(material.id)) {
      return;
    }

    this.downloadingIds.add(material.id);

    try {
      // TODO: 调用 Rust 后端下载课件
      // await this.tauriService.invoke('download_material', {
      //   material_id: material.id,
      //   save_path: '/user/materials/'
      // });

      // 模拟下载
      await new Promise(resolve => setTimeout(resolve, 2000));

      this.snackBar.open(`✅ "${material.title}" 已下载到本地`, '查看', {
        duration: 5000,
        panelClass: ['success-snackbar']
      });
    } catch (error) {
      console.error('下载失败:', error);
      this.snackBar.open('❌ 下载失败,请重试', '关闭', { duration: 3000 });
    } finally {
      this.downloadingIds.delete(material.id);
    }
  }

  previewMaterial(material: OpenMaterial): void {
    // TODO: 打开预览窗口或导航到预览页
    console.log('预览课件:', material);

    if (material.type === 'video') {
      this.snackBar.open(`▶️ 播放视频: "${material.title}"`, '关闭', { duration: 3000 });
    } else if (material.type === 'interactive') {
      this.snackBar.open(`🔬 启动仿真实验: "${material.title}"`, '关闭', { duration: 3000 });
    } else {
      this.snackBar.open(`📄 预览 ${material.type.toUpperCase()}: "${material.title}"`, '关闭', { duration: 3000 });
    }
  }

  getSourceName(source: string): string {
    const names: Record<string, string> = {
      openstax: 'OpenStax',
      'ted-ed': 'TED-Ed',
      phetsim: 'PhET'
    };
    return names[source] || source;
  }

  getSourceClass(source: string): string {
    return source;
  }

  getTypeName(type: string): string {
    const names: Record<string, string> = {
      pdf: 'PDF文档',
      ppt: 'PPT课件',
      video: '教学视频',
      interactive: '交互仿真'
    };
    return names[type] || type;
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      pdf: 'picture_as_pdf',
      ppt: 'slideshow',
      video: 'play_circle_filled',
      interactive: 'science'
    };
    return icons[type] || 'insert_drive_file';
  }

  getTypeClass(type: string): string {
    return type;
  }

  getSubjectName(subject: string): string {
    const names: Record<string, string> = {
      physics: '物理',
      chemistry: '化学',
      biology: '生物',
      math: '数学',
      engineering: '工程',
      computer_science: '计算机科学',
      earth_science: '地球科学'
    };
    return names[subject] || subject;
  }

  getLevelName(level: string): string {
    const names: Record<string, string> = {
      elementary: '小学',
      middle: '初中',
      high: '高中',
      university: '大学'
    };
    return names[level] || level;
  }

  private getMockMaterials(source: string): OpenMaterial[] {
    const mockData: Record<string, OpenMaterial[]> = {
      openstax: [
        {
          id: 'os-mat-001',
          title: '大学物理 Vol.1 - 力学与热学',
          description: '完整的大学物理教材,涵盖运动学、牛顿定律、能量守恒、动量、转动、流体、热力学等核心概念。包含大量例题和习题。',
          source: 'openstax',
          type: 'pdf',
          subject: 'physics',
          level: 'university',
          fileSize: '45.2 MB',
        },
        {
          id: 'os-mat-002',
          title: '高中化学 - 原子结构与周期表',
          description: '系统讲解原子结构、电子排布、元素周期律、化学键等基础知识。配有彩色插图和思维导图,适合高中生自学。',
          source: 'openstax',
          type: 'pdf',
          subject: 'chemistry',
          level: 'high',
          fileSize: '28.7 MB',
        },
        {
          id: 'os-mat-003',
          title: '生物学基础 - 细胞与遗传',
          description: '介绍细胞结构、代谢、DNA复制、基因表达、遗传规律等核心内容。包含实验指导和案例分析。',
          source: 'openstax',
          type: 'ppt',
          subject: 'biology',
          level: 'high',
          fileSize: '156 MB',
        }
      ],
      'ted-ed': [
        {
          id: 'ted-001',
          title: '量子纠缠如何工作?',
          description: '通过精美的动画解释量子纠缠现象,探讨爱因斯坦的"鬼魅般的超距作用"。适合高中及以上学生理解量子力学基础。',
          source: 'ted-ed',
          type: 'video',
          subject: 'physics',
          level: 'high',
          duration: '5:23',
        },
        {
          id: 'ted-002',
          title: 'DNA是如何被发现的?',
          description: '回顾沃森、克里克、富兰克林等科学家发现DNA双螺旋结构的历史故事。展现科学合作与竞争的精彩历程。',
          source: 'ted-ed',
          type: 'video',
          subject: 'biology',
          level: 'middle',
          duration: '4:47',
        },
        {
          id: 'ted-003',
          title: '为什么桥梁不会倒塌?',
          description: '探索桥梁设计的工程学原理,包括力的分布、材料强度、共振等概念。结合著名桥梁案例进行分析。',
          source: 'ted-ed',
          type: 'video',
          subject: 'engineering',
          level: 'middle',
          duration: '5:12',
        }
      ],
      phetsim: [
        {
          id: 'phet-001',
          title: '电路构建工具包',
          description: '交互式电路仿真实验,学生可以拖拽电池、电阻、灯泡等元件搭建电路,实时观察电流电压变化。支持串联/并联电路。',
          source: 'phetsim',
          type: 'interactive',
          subject: 'physics',
          level: 'middle',
        },
        {
          id: 'phet-002',
          title: '化学反应与平衡',
          description: '可视化化学反应过程,调整反应物浓度、温度、压力,观察反应速率和平衡移动。帮助理解勒夏特列原理。',
          source: 'phetsim',
          type: 'interactive',
          subject: 'chemistry',
          level: 'high',
        },
        {
          id: 'phet-003',
          title: '自然选择模拟器',
          description: '模拟进化过程,调整环境压力、突变率、繁殖率等参数,观察种群基因频率变化。直观展示达尔文进化论。',
          source: 'phetsim',
          type: 'interactive',
          subject: 'biology',
          level: 'high',
        }
      ]
    };

    return mockData[source] || [];
  }
}
