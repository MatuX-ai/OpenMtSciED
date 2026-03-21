import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

import { MaterialRecommendationService } from '../../../core/services/material-recommendation.service';
import {
  MaterialRecommendation,
  RecommendationReason,
  RecommendationResult,
  RecommendationStatistics,
  UserPreferenceProfile
} from '../../../models/material-recommendation.models';
import { MaterialPreferenceDialogComponent } from './material-preference-dialog.component';

@Component({
  selector: 'app-material-recommendation',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './material-recommendation.component.html',
  styleUrls: ['./material-recommendation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaterialRecommendationComponent implements OnInit, OnDestroy {
  private recommendationService = inject(MaterialRecommendationService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  
  private destroy$ = new Subject<void>();
  
  // 用户ID - 实际应用中从AuthService获取
  readonly userId = 1;
  readonly pageSize = 10;
  readonly currentPage = signal<number>(1);
  
  // 信号状态管理
  readonly loading = signal<boolean>(false);
  readonly recommendations = signal<MaterialRecommendation[]>([]);
  readonly statistics = signal<RecommendationStatistics | null>(null);
  readonly userProfile = signal<UserPreferenceProfile | null>(null);
  readonly selectedTab = signal<number>(0);
  readonly refreshing = signal<boolean>(false);
  
  // 计算属性
  readonly avgScore = computed(() => {
    const stats = this.statistics();
    return stats?.averageScore || 0;
  });
  
  readonly totalRecommendations = computed(() => {
    const stats = this.statistics();
    return stats?.totalRecommendations || 0;
  });
  
  readonly likedRecommendations = computed(() => {
    const stats = this.statistics();
    return stats?.likedRecommendations || 0;
  });
  
  readonly acceptedRecommendations = computed(() => {
    const stats = this.statistics();
    return stats?.acceptedRecommendations || 0;
  });
  
  // 按推荐原因过滤
  readonly filteredRecommendations = computed(() => {
    const recs = this.recommendations();
    const tab = this.selectedTab();
    
    if (tab === 0) return recs; // 全部推荐
    if (tab === 1) return recs.filter(r => 
      r.reason === RecommendationReason.PREFERENCE_BASED ||
      r.reason === RecommendationReason.COLLABORATIVE_FILTERING ||
      r.reason === RecommendationReason.CONTENT_SIMILARITY
    ); // AI推荐
    if (tab === 2) return recs.filter(r => r.reason === RecommendationReason.EDITOR_PICK); // 编辑精选
    
    return recs;
  });

  ngOnInit(): void {
    this.loadAllData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAllData(): void {
    this.loading.set(true);
    this.loadRecommendations();
    this.loadUserProfile();
    this.loadStatistics();
  }

  loadRecommendations(): void {
    this.recommendationService.getRecommendations(this.userId, this.currentPage(), this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: RecommendationResult) => {
          this.recommendations.set(result.recommendations);
          this.loading.set(false);
          this.refreshing.set(false);
        },
        error: (error: Error) => {
          console.error('[MaterialRecommendationComponent] 加载推荐失败:', error);
          this.snackBar.open('加载推荐失败', '关闭', { duration: 3000 });
          this.loading.set(false);
          this.refreshing.set(false);
        }
      });
  }

  loadUserProfile(): void {
    this.recommendationService.getUserPreferenceProfile(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile: UserPreferenceProfile) => {
          this.userProfile.set(profile);
        },
        error: (error: Error) => {
          console.error('[MaterialRecommendationComponent] 加载用户画像失败:', error);
        }
      });
  }

  loadStatistics(): void {
    this.recommendationService.getRecommendationStatistics(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats: RecommendationStatistics) => {
          this.statistics.set(stats);
        },
        error: (error: Error) => {
          console.error('[MaterialRecommendationComponent] 加载统计失败:', error);
        }
      });
  }

  refreshRecommendations(): void {
    this.refreshing.set(true);
    this.recommendationService.regenerateRecommendations(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadRecommendations();
          this.snackBar.open('推荐已刷新', '关闭', { duration: 2000 });
        },
        error: (error: Error) => {
          console.error('[MaterialRecommendationComponent] 刷新推荐失败:', error);
          this.snackBar.open('刷新失败', '关闭', { duration: 3000 });
          this.refreshing.set(false);
        }
      });
  }

  viewMaterial(materialId: number): void {
    // 记录查看行为
    this.recommendationService.submitFeedback({
      recommendationId: materialId,
      userId: this.userId,
      feedbackType: 'viewed',
      feedbackData: { timestamp: new Date().toISOString() }
    }).pipe(takeUntil(this.destroy$)).subscribe();
    
    // 导航到课件详情页
    // this.router.navigate(['/materials', materialId]);
    this.snackBar.open(`查看课件 #${materialId}`, '关闭', { duration: 2000 });
  }

  likeMaterial(materialId: number, event: Event): void {
    event.stopPropagation();
    
    const recs = this.recommendations();
    const rec = recs.find(r => r.materialId === materialId);
    if (!rec) return;
    
    const newLikedState = !rec.isLiked;
    
    this.recommendationService.submitFeedback({
      recommendationId: materialId,
      userId: this.userId,
      feedbackType: newLikedState ? 'liked' : 'unliked',
      feedbackData: { timestamp: new Date().toISOString() }
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        // 更新本地状态
        this.recommendations.update(recs => 
          recs.map(r => r.materialId === materialId 
            ? { ...r, isLiked: newLikedState, likeCount: r.likeCount + (newLikedState ? 1 : -1) }
            : r
          )
        );
        
        // 刷新统计
        this.loadStatistics();
        
        this.snackBar.open(newLikedState ? '已点赞' : '已取消点赞', '关闭', { duration: 2000 });
      },
      error: (error: Error) => {
        console.error('[MaterialRecommendationComponent] 点赞失败:', error);
        this.snackBar.open('操作失败', '关闭', { duration: 3000 });
      }
    });
  }

  skipMaterial(materialId: number, event: Event): void {
    event.stopPropagation();
    
    this.recommendationService.submitFeedback({
      recommendationId: materialId,
      userId: this.userId,
      feedbackType: 'skipped',
      feedbackData: { timestamp: new Date().toISOString() }
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        // 从推荐列表中移除
        this.recommendations.update(recs => 
          recs.filter(r => r.materialId !== materialId)
        );
        
        // 刷新统计
        this.loadStatistics();
        
        this.snackBar.open('已跳过该推荐', '关闭', { duration: 2000 });
      },
      error: (error: Error) => {
        console.error('[MaterialRecommendationComponent] 跳过失败:', error);
        this.snackBar.open('操作失败', '关闭', { duration: 3000 });
      }
    });
  }

  openPreferenceDialog(): void {
    const dialogRef = this.dialog.open(MaterialPreferenceDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: this.userProfile()
    });
    
    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result: UserPreferenceProfile | undefined) => {
      if (result) {
        this.recommendationService.updateUserPreferenceProfile(this.userId, result)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.userProfile.set(result);
              this.refreshRecommendations();
              this.snackBar.open('偏好已更新', '关闭', { duration: 2000 });
            },
            error: (error: Error) => {
              console.error('[MaterialRecommendationComponent] 更新偏好失败:', error);
              this.snackBar.open('更新失败', '关闭', { duration: 3000 });
            }
          });
      }
    });
  }

  // 辅助方法
  getReasonColor(reason: RecommendationReason): string {
    const colorMap: Record<RecommendationReason, string> = {
      [RecommendationReason.PREFERENCE_BASED]: 'primary',
      [RecommendationReason.SUBJECT_RELATED]: 'accent',
      [RecommendationReason.POPULARITY]: 'warn',
      [RecommendationReason.COLLABORATIVE_FILTERING]: 'primary',
      [RecommendationReason.CONTENT_SIMILARITY]: 'accent',
      [RecommendationReason.EDITOR_PICK]: 'warn',
      [RecommendationReason.NEW_ARRIVAL]: 'primary'
    };
    return colorMap[reason] || 'primary';
  }

  getReasonIcon(reason: RecommendationReason): string {
    const iconMap: Record<RecommendationReason, string> = {
      [RecommendationReason.PREFERENCE_BASED]: 'psychology',
      [RecommendationReason.SUBJECT_RELATED]: 'school',
      [RecommendationReason.POPULARITY]: 'trending_up',
      [RecommendationReason.COLLABORATIVE_FILTERING]: 'group',
      [RecommendationReason.CONTENT_SIMILARITY]: 'similarity',
      [RecommendationReason.EDITOR_PICK]: 'star',
      [RecommendationReason.NEW_ARRIVAL]: 'new_releases'
    };
    return iconMap[reason] || 'recommend';
  }

  getReasonLabel(reason: RecommendationReason): string {
    const labelMap: Record<RecommendationReason, string> = {
      [RecommendationReason.PREFERENCE_BASED]: '偏好推荐',
      [RecommendationReason.SUBJECT_RELATED]: '学科相关',
      [RecommendationReason.POPULARITY]: '热门推荐',
      [RecommendationReason.COLLABORATIVE_FILTERING]: '协同过滤',
      [RecommendationReason.CONTENT_SIMILARITY]: '内容相似',
      [RecommendationReason.EDITOR_PICK]: '编辑精选',
      [RecommendationReason.NEW_ARRIVAL]: '最新上线'
    };
    return labelMap[reason] || '推荐';
  }

  hasTag(tag: string, material: MaterialRecommendation): boolean {
    return material.tags?.includes(tag) || false;
  }
}
