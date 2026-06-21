import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import {
  LinkableResource,
  LocalTutorial,
  TutorialResourceService,
  TutorialSuggestion,
} from '../../../core/services/tutorial-resource.service';
import { ResourceAttributionService } from '../../../core/services/resource-attribution.service';
import { CreatorService } from '../../../core/services/creator.service';

export interface AddToTutorialDialogData {
  resource: LinkableResource;
  /** 优先选中的教程 ID（如当前课题已创建的教程） */
  preferredCourseId?: number;
}

@Component({
  selector: 'app-add-to-tutorial-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSnackBarModule,
  ],
  template: `
    <h2 mat-dialog-title>加入教程</h2>
    <mat-dialog-content>
      <p class="resource-title">{{ data.resource.title }}</p>
      <p class="resource-meta" *ngIf="data.resource.source">来源：{{ data.resource.source }}</p>

      <div class="loading" *ngIf="loading">
        <mat-progress-spinner diameter="32" mode="indeterminate"></mat-progress-spinner>
      </div>

      <div *ngIf="!loading && tutorials.length === 0" class="empty">
        暂无本地教程，请先在统一资源库或课题工作室创建教程。
      </div>

      <div *ngIf="!loading && suggestions.length > 0" class="suggestions">
        <p class="section-label">推荐关联</p>
        <div class="suggestion-chip" *ngFor="let s of suggestions" (click)="selectedCourseId = s.tutorial.id">
          <strong>{{ s.tutorial.name }}</strong>
          <span>{{ s.reason }}</span>
        </div>
      </div>

      <mat-radio-group *ngIf="!loading && tutorials.length > 0" [(ngModel)]="selectedCourseId" class="tutorial-list">
        <mat-radio-button *ngFor="let t of tutorials" [value]="t.id" class="tutorial-option">
          <span class="name">{{ t.name }}</span>
          <span class="cat" *ngIf="t.category">{{ t.category }}</span>
        </mat-radio-button>
      </mat-radio-group>

      <div class="attribution-block" *ngIf="needsAttribution">
        <p class="section-label">引用来源（必填）</p>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>来源 URL</mat-label>
          <input matInput [(ngModel)]="attribution.sourceUrl" name="sourceUrl" required />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>许可证</mat-label>
          <input matInput [(ngModel)]="attribution.license" name="license" placeholder="如 CC-BY-4.0" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>原作者</mat-label>
          <input matInput [(ngModel)]="attribution.author" name="author" />
        </mat-form-field>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="cancel()">取消</button>
      <button
        mat-raised-button
        color="primary"
        type="button"
        [disabled]="!selectedCourseId || saving || !canConfirm()"
        (click)="confirm()"
      >
        {{ saving ? '保存中...' : '确认加入' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .resource-title {
        margin: 0 0 4px;
        font-weight: 600;
      }

      .resource-meta {
        margin: 0 0 16px;
        font-size: 13px;
        color: #666;
      }

      .loading,
      .empty {
        text-align: center;
        padding: 24px;
        color: #888;
      }

      .section-label {
        font-size: 13px;
        color: #667eea;
        margin: 0 0 8px;
        font-weight: 600;
      }

      .suggestions {
        margin-bottom: 16px;
      }

      .suggestion-chip {
        padding: 8px 12px;
        border: 1px solid #e0e7ff;
        background: #f8f9ff;
        border-radius: 8px;
        margin-bottom: 8px;
        cursor: pointer;
      }

      .suggestion-chip span {
        display: block;
        font-size: 12px;
        color: #666;
        margin-top: 2px;
      }

      .tutorial-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-height: 240px;
        overflow-y: auto;
      }

      .tutorial-option {
        border: 1px solid #eee;
        border-radius: 8px;
        padding: 4px 8px;
      }

      .name {
        font-weight: 500;
      }

      .cat {
        margin-left: 8px;
        font-size: 12px;
        color: #888;
      }

      .attribution-block {
        margin-top: 16px;
        padding-top: 12px;
        border-top: 1px dashed #ddd;
      }

      .full-width {
        width: 100%;
      }
    `,
  ],
})
export class AddToTutorialDialogComponent implements OnInit {
  loading = true;
  saving = false;
  tutorials: LocalTutorial[] = [];
  suggestions: TutorialSuggestion[] = [];
  selectedCourseId: number | null = null;
  needsAttribution = false;
  attribution = { sourceUrl: '', license: '', author: '' };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AddToTutorialDialogData,
    private dialogRef: MatDialogRef<AddToTutorialDialogComponent>,
    private tutorialResourceService: TutorialResourceService,
    private attributionService: ResourceAttributionService,
    private creatorService: CreatorService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.needsAttribution =
      this.data.resource.type === 'external' ||
      (!!this.data.resource.url && this.data.resource.type !== 'material');
    if (this.data.resource.url) {
      this.attribution.sourceUrl = this.data.resource.url;
    }
    this.tutorialResourceService.listLocalTutorials().subscribe({
      next: (tutorials) => {
        this.tutorials = tutorials;
        this.loading = false;
        if (this.data.preferredCourseId && tutorials.some((t) => t.id === this.data.preferredCourseId)) {
          this.selectedCourseId = this.data.preferredCourseId!;
        } else if (tutorials.length === 1) {
          this.selectedCourseId = tutorials[0].id;
        }
      },
      error: () => {
        this.loading = false;
      },
    });

    this.tutorialResourceService
      .suggestTutorials(this.data.resource.title, undefined, this.data.preferredCourseId, 3)
      .subscribe({
        next: (suggestions) => {
          this.suggestions = suggestions;
          if (!this.selectedCourseId && suggestions.length > 0) {
            this.selectedCourseId = suggestions[0].tutorial.id;
          }
        },
      });
  }

  canConfirm(): boolean {
    if (!this.needsAttribution) return true;
    return !!this.attribution.sourceUrl.trim();
  }

  confirm(): void {
    if (!this.selectedCourseId || !this.canConfirm()) return;

    this.saving = true;

    const saveLink = () => {
      this.tutorialResourceService
        .linkResourceToTutorial(this.selectedCourseId!, this.data.resource)
        .subscribe({
          next: (added) => {
            this.saving = false;
            if (added) {
              this.creatorService
                .award('link_resource', {
                  refType: 'resource',
                  refId: String(this.data.resource.id ?? this.data.resource.title),
                  note: `关联「${this.data.resource.title}」`,
                })
                .subscribe();
              this.snackBar.open('已加入教程', '关闭', { duration: 2000 });
              this.dialogRef.close(true);
            } else {
              this.snackBar.open('该资源已在教程中', '关闭', { duration: 2000 });
              this.dialogRef.close(false);
            }
          },
          error: () => {
            this.saving = false;
            this.snackBar.open('加入失败', '关闭', { duration: 3000 });
          },
        });
    };

    if (this.needsAttribution) {
      this.attributionService
        .saveAttribution({
          resourceType: this.data.resource.type,
          resourceId: String(this.data.resource.id ?? this.data.resource.title),
          resourceTitle: this.data.resource.title,
          sourceUrl: this.attribution.sourceUrl.trim(),
          license: this.attribution.license.trim() || undefined,
          author: this.attribution.author.trim() || undefined,
        })
        .subscribe({ next: () => saveLink(), error: () => saveLink() });
      return;
    }

    saveLink();
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
