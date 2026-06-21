import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';

import { TauriService } from '../../core/services/tauri.service';
import { TutorialResourceService } from '../../core/services/tutorial-resource.service';
import { KnowledgeGraphLinkService } from '../../core/services/knowledge-graph-link.service';
import { BrandTemplateService, BrandTemplate } from '../../core/services/brand-template.service';
import { MatRadioModule } from '@angular/material/radio';
import { PublishService, PublishScope, CopyrightType, PublishResult } from '../../core/services/publish.service';
import { CreatorService } from '../../core/services/creator.service';
import {
  GRADE_LEVEL_OPTIONS,
  MatchedResourceItem,
  SUBJECT_OPTIONS,
  TOPIC_STUDIO_STEPS,
  TopicDraft,
  TopicDraftInput,
  TopicOutline,
} from './topic-studio.models';
import { TopicStudioService } from './topic-studio.service';

@Component({
  selector: 'app-topic-studio',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    MatStepperModule,
    MatCheckboxModule,
    MatRadioModule,
  ],
  providers: [{ provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false } }],
  template: `
    <div class="topic-studio-page">
      <!-- 列表视图 -->
      <ng-container *ngIf="viewMode === 'list'">
        <div class="page-header">
          <div>
            <h1><i class="ri-lightbulb-flash-line"></i> 课题工作室</h1>
            <p>提出课题 → AI 大纲 → 匹配课件 → 挂接教学图谱</p>
          </div>
          <button mat-raised-button color="primary" (click)="startNewDraft()">
            <i class="ri-add-line"></i>
            新建课题
          </button>
        </div>

        <div class="loading-block" *ngIf="listLoading">
          <mat-progress-spinner diameter="36" mode="indeterminate"></mat-progress-spinner>
        </div>

        <div class="empty-state" *ngIf="!listLoading && drafts.length === 0">
          <i class="ri-draft-line"></i>
          <p>还没有课题草稿</p>
          <button mat-stroked-button color="primary" (click)="startNewDraft()">创建第一个课题</button>
        </div>

        <div class="draft-grid" *ngIf="!listLoading && drafts.length > 0">
          <mat-card class="draft-card" *ngFor="let draft of drafts" (click)="openDraft(draft.id)">
            <mat-card-header>
              <mat-card-title>{{ draft.title }}</mat-card-title>
              <mat-card-subtitle>{{ draft.subject || '未分类' }} · {{ statusLabel(draft.status) }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p class="draft-meta">更新于 {{ draft.updated_at | date: 'MM-dd HH:mm' }}</p>
              <p class="draft-step">进度：{{ draft.current_step + 1 }} / {{ stepLabels.length }}</p>
            </mat-card-content>
            <mat-card-actions align="end">
              <button mat-button color="warn" (click)="deleteDraft($event, draft)">删除</button>
              <button mat-button color="primary">继续编辑</button>
            </mat-card-actions>
          </mat-card>
        </div>
      </ng-container>

      <!-- 向导视图 -->
      <ng-container *ngIf="viewMode === 'wizard'">
        <div class="wizard-header">
          <button mat-icon-button type="button" (click)="backToList()" aria-label="返回列表">
            <i class="ri-arrow-left-line"></i>
          </button>
          <div>
            <h1>{{ draft?.title || '新建课题' }}</h1>
            <p>{{ stepLabels[currentStep] }}</p>
          </div>
        </div>

        <mat-card class="wizard-card">
          <mat-card-content>
            <mat-stepper [linear]="false" [(selectedIndex)]="currentStep" #stepper>
              <!-- Step 1 -->
              <mat-step [completed]="!!form.title">
                <ng-template matStepLabel>{{ stepLabels[0] }}</ng-template>
                <div class="step-body">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>课题标题</mat-label>
                    <input matInput [(ngModel)]="form.title" name="title" required />
                  </mat-form-field>
                  <div class="row-2">
                    <mat-form-field appearance="outline">
                      <mat-label>学科</mat-label>
                      <mat-select [(ngModel)]="form.subject" name="subject">
                        <mat-option *ngFor="let s of subjectOptions" [value]="s">{{ s }}</mat-option>
                      </mat-select>
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>学段</mat-label>
                      <mat-select [(ngModel)]="form.grade_level" name="grade_level">
                        <mat-option *ngFor="let g of gradeOptions" [value]="g.value">{{ g.label }}</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>教学目标</mat-label>
                    <textarea matInput rows="3" [(ngModel)]="form.goals" name="goals"></textarea>
                  </mat-form-field>
                  <div class="row-2">
                    <mat-form-field appearance="outline">
                      <mat-label>预计课时（小时）</mat-label>
                      <input matInput type="number" min="0.5" step="0.5" [(ngModel)]="form.duration_hours" name="duration_hours" />
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>硬件预算上限（元）</mat-label>
                      <input matInput type="number" min="0" [(ngModel)]="form.max_budget" name="max_budget" />
                    </mat-form-field>
                  </div>
                  <mat-checkbox [(ngModel)]="form.needs_hardware" name="needs_hardware">包含硬件实践</mat-checkbox>
                </div>
                <div class="step-actions">
                  <button mat-raised-button color="primary" [disabled]="!form.title || saving" (click)="saveStep1()">
                    {{ saving ? '保存中...' : '保存并下一步' }}
                  </button>
                </div>
              </mat-step>

              <!-- Step 2 -->
              <mat-step [completed]="!!draft?.outline">
                <ng-template matStepLabel>{{ stepLabels[1] }}</ng-template>
                <div class="step-body">
                  <p class="hint">AI 将根据课题信息生成教程大纲（M1 为模板大纲，后续接入 LLM）。</p>
                  <button mat-stroked-button color="primary" [disabled]="outlineLoading" (click)="generateOutline()">
                    <mat-progress-spinner *ngIf="outlineLoading" diameter="18" mode="indeterminate"></mat-progress-spinner>
                    <span *ngIf="!outlineLoading"><i class="ri-magic-line"></i> 生成大纲</span>
                  </button>
                  <div class="outline-preview" *ngIf="draft?.outline as outline">
                    <h3>学习目标</h3>
                    <ul>
                      <li *ngFor="let obj of outline.learning_objectives">{{ obj }}</li>
                    </ul>
                    <h3>教学环节</h3>
                    <div class="section-card" *ngFor="let section of outline.sections">
                      <strong>{{ section.title }}</strong>
                      <span *ngIf="section.duration_minutes">（{{ section.duration_minutes }} 分钟）</span>
                      <ul *ngIf="section.activities?.length">
                        <li *ngFor="let act of section.activities">{{ act }}</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div class="step-actions">
                  <button mat-button matStepperPrevious>上一步</button>
                  <button mat-raised-button color="primary" [disabled]="!draft?.outline" matStepperNext>下一步</button>
                </div>
              </mat-step>

              <!-- Step 3 -->
              <mat-step [completed]="!!draft?.local_tutorial_id">
                <ng-template matStepLabel>{{ stepLabels[2] }}</ng-template>
                <div class="step-body">
                  <p>将确认的大纲保存为本地教程，可在统一资源库中管理课件。</p>
                  <button mat-raised-button color="primary" [disabled]="confirmLoading || !!draft?.local_tutorial_id" (click)="confirmTutorial()">
                    {{ draft?.local_tutorial_id ? '已创建教程' : confirmLoading ? '创建中...' : '确认并创建教程' }}
                  </button>
                  <p class="success-hint" *ngIf="draft?.local_tutorial_id">
                    教程 ID：{{ draft?.local_tutorial_id }} — 可在统一资源库查看
                  </p>
                </div>
                <div class="step-actions">
                  <button mat-button matStepperPrevious>上一步</button>
                  <button mat-raised-button color="primary" [disabled]="!draft?.local_tutorial_id" matStepperNext>下一步</button>
                </div>
              </mat-step>

              <!-- Step 4 -->
              <mat-step>
                <ng-template matStepLabel>{{ stepLabels[3] }}</ng-template>
                <div class="step-body">
                  <p class="hint">从全网搜或资源库挑选课件/硬件，点击「加入教程」挂接到本课题。</p>
                  <div class="link-actions">
                    <button mat-stroked-button type="button" (click)="goResourceExplorer()">
                      <i class="ri-archive-line"></i> 统一资源库
                    </button>
                    <button mat-stroked-button type="button" (click)="openGlobalSearchHint()">
                      <i class="ri-search-line"></i> 全局搜索 (Ctrl+K)
                    </button>
                    <button mat-stroked-button type="button" (click)="goKnowledgeGraph()">
                      <i class="ri-share-line"></i> 教学图谱
                    </button>
                  </div>

                  <div class="matched-list" *ngIf="matchedResources.length > 0">
                    <h3>已关联资源（{{ matchedResources.length }}）</h3>
                    <div class="matched-item" *ngFor="let item of matchedResources">
                      <i [class]="getResourceIcon(item.type)"></i>
                      <div>
                        <strong>{{ item.title }}</strong>
                        <span *ngIf="item.source">{{ item.source }}</span>
                      </div>
                    </div>
                  </div>
                  <p class="hint" *ngIf="matchedResources.length === 0">尚未关联资源，请搜索后点击「加入教程」。</p>
                </div>
                <div class="step-actions">
                  <button mat-button matStepperPrevious type="button">上一步</button>
                  <button mat-raised-button color="primary" type="button" matStepperNext>下一步</button>
                </div>
              </mat-step>

              <!-- Step 5 -->
              <mat-step [completed]="brandSaved">
                <ng-template matStepLabel>{{ stepLabels[4] }}</ng-template>
                <div class="step-body">
                  <p class="hint">设置 Logo 路径、水印与页脚，将应用于教学包导出。</p>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>模板名称</mat-label>
                    <input matInput [(ngModel)]="brandForm.name" name="brand_name" />
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Logo 路径（本地文件）</mat-label>
                    <input matInput [(ngModel)]="brandForm.logo_path" name="logo_path" placeholder="例如 assets/images/logo.svg" />
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>水印文字</mat-label>
                    <input matInput [(ngModel)]="brandForm.watermark_text" name="watermark_text" />
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>页脚信息</mat-label>
                    <textarea matInput rows="2" [(ngModel)]="brandForm.footer" name="footer"></textarea>
                  </mat-form-field>
                  <button mat-raised-button color="primary" [disabled]="brandSaving" (click)="saveBrandTemplate()">
                    {{ brandSaving ? '保存中...' : brandSaved ? '更新品牌模板' : '保存品牌模板' }}
                  </button>
                  <p class="success-hint" *ngIf="brandSaved">品牌模板已保存，导出时将自动应用</p>
                </div>
                <div class="step-actions">
                  <button mat-button matStepperPrevious>上一步</button>
                  <button mat-raised-button color="primary" [disabled]="!brandSaved" matStepperNext>下一步</button>
                </div>
              </mat-step>

              <!-- Step 6 -->
              <mat-step [completed]="!!publishResult">
                <ng-template matStepLabel>{{ stepLabels[5] }}</ng-template>
                <div class="step-body">
                  <p class="hint">选择发布范围并完成版权确认。公开内容需审核通过后才会出现在公开资源库。</p>

                  <div class="export-summary" *ngIf="draft">
                    <p><strong>课题：</strong>{{ draft.title }}</p>
                    <p><strong>关联资源：</strong>{{ matchedResources.length }} 项</p>
                    <p *ngIf="graphLink"><strong>图谱节点：</strong>{{ graphLink.concept_name }}</p>
                  </div>

                  <p class="section-label">发布范围</p>
                  <mat-radio-group [(ngModel)]="publishScope" name="publish_scope" class="scope-group">
                    <mat-radio-button value="private">私有（仅本人使用）</mat-radio-button>
                    <mat-radio-button value="school">校内共享</mat-radio-button>
                    <mat-radio-button value="public">平台公开（需审核）</mat-radio-button>
                  </mat-radio-group>

                  <p class="section-label">版权确认</p>
                  <mat-radio-group [(ngModel)]="copyrightType" name="copyright_type" class="scope-group">
                    <mat-radio-button value="original">原创内容</mat-radio-button>
                    <mat-radio-button value="licensed">已获授权引用</mat-radio-button>
                    <mat-radio-button value="open_source">开源 / CC 资源策展</mat-radio-button>
                  </mat-radio-group>
                  <mat-checkbox [(ngModel)]="copyrightConfirmed" name="copyright_confirmed">
                    我确认以上内容符合版权要求，外链资源已填写来源信息
                  </mat-checkbox>

                  <div class="publish-result" *ngIf="publishResult">
                    <p class="success-hint">
                      提交成功：{{ publishService.statusLabel(publishResult.package.status) }}
                      <span *ngIf="publishResult.auto_review">（自动审核 {{ publishResult.auto_review.score }} 分）</span>
                    </p>
                    <ul *ngIf="publishResult.auto_review?.issues?.length">
                      <li *ngFor="let issue of publishResult.auto_review!.issues">{{ issue }}</li>
                    </ul>
                  </div>

                  <div class="publish-actions">
                    <button mat-stroked-button color="primary" [disabled]="exporting" (click)="exportTeachingPackage()">
                      {{ exporting ? '导出中...' : '导出教学包 JSON' }}
                    </button>
                    <button
                      mat-raised-button
                      color="primary"
                      [disabled]="publishing || !copyrightConfirmed || !draft?.local_tutorial_id"
                      (click)="submitPublish()"
                    >
                      {{ publishing ? '提交中...' : '提交发布' }}
                    </button>
                    <button mat-button (click)="finishDraft()">完成并返回列表</button>
                  </div>
                </div>
                <div class="step-actions">
                  <button mat-button matStepperPrevious>上一步</button>
                </div>
              </mat-step>
            </mat-stepper>
          </mat-card-content>
        </mat-card>
      </ng-container>
    </div>
  `,
  styles: [
    `
      .topic-studio-page {
        padding: 20px;
        height: 100%;
        overflow: auto;
      }

      .page-header,
      .wizard-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 20px;
      }

      .wizard-header h1,
      .page-header h1 {
        margin: 0 0 4px;
        font-size: 22px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .page-header p,
      .wizard-header p {
        margin: 0;
        color: #666;
        font-size: 14px;
      }

      .draft-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 16px;
      }

      .draft-card {
        cursor: pointer;
        transition: box-shadow 0.2s;
      }

      .draft-card:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
      }

      .draft-meta,
      .draft-step {
        font-size: 13px;
        color: #666;
        margin: 4px 0;
      }

      .empty-state,
      .loading-block {
        text-align: center;
        padding: 48px 16px;
        color: #888;
      }

      .empty-state i {
        font-size: 48px;
        display: block;
        margin-bottom: 12px;
      }

      .wizard-card {
        max-width: 920px;
      }

      .step-body {
        padding: 16px 0;
      }

      .full-width {
        width: 100%;
      }

      .row-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }

      @media (max-width: 720px) {
        .row-2 {
          grid-template-columns: 1fr;
        }
      }

      .step-actions {
        display: flex;
        gap: 8px;
        padding-top: 8px;
      }

      .hint {
        color: #666;
        font-size: 14px;
        margin-bottom: 12px;
      }

      .outline-preview {
        margin-top: 16px;
        padding: 16px;
        background: #f8f9fc;
        border-radius: 8px;
      }

      .section-card {
        margin: 8px 0;
        padding: 8px 12px;
        background: white;
        border-radius: 6px;
        border: 1px solid #eee;
      }

      .link-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 16px;
      }

      .matched-list h3 {
        font-size: 15px;
        margin: 0 0 12px;
      }

      .matched-item {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        padding: 10px 12px;
        border: 1px solid #eee;
        border-radius: 8px;
        margin-bottom: 8px;
      }

      .matched-item i {
        color: #667eea;
        font-size: 18px;
        margin-top: 2px;
      }

      .matched-item span {
        display: block;
        font-size: 12px;
        color: #888;
        margin-top: 2px;
      }

      .placeholder-step {
        text-align: center;
        padding: 32px 16px;
        color: #666;
      }

      .placeholder-step i {
        font-size: 40px;
        display: block;
        margin-bottom: 12px;
        color: #667eea;
      }

      .success-hint {
        margin-top: 12px;
        color: #2e7d32;
        font-size: 14px;
      }

      .export-summary {
        background: #f8f9fc;
        border-radius: 8px;
        padding: 12px 16px;
        margin-bottom: 16px;
      }

      .export-summary p {
        margin: 4px 0;
        font-size: 14px;
      }

      .section-label {
        font-size: 13px;
        color: #667eea;
        font-weight: 600;
        margin: 16px 0 8px;
      }

      .scope-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 12px;
      }

      .publish-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 16px;
      }

      .publish-result ul {
        margin: 8px 0 0;
        padding-left: 18px;
        color: #666;
        font-size: 13px;
      }
    `,
  ],
})
export class TopicStudioComponent implements OnInit {
  @ViewChild('stepper') stepper?: MatStepper;

  viewMode: 'list' | 'wizard' = 'list';
  drafts: TopicDraft[] = [];
  draft: TopicDraft | null = null;
  draftRouteId: string | null = null;

  listLoading = false;
  saving = false;
  outlineLoading = false;
  confirmLoading = false;
  brandSaving = false;
  brandSaved = false;
  exporting = false;
  publishing = false;
  publishScope: PublishScope = 'private';
  copyrightType: CopyrightType = 'original';
  copyrightConfirmed = false;
  publishResult: PublishResult | null = null;
  currentStep = 0;
  matchedResources: MatchedResourceItem[] = [];
  graphLink: { concept_id: number; concept_name: string } | null = null;
  brandForm: Pick<BrandTemplate, 'name' | 'logo_path' | 'watermark_text' | 'footer'> = {
    name: '默认模板',
    logo_path: '',
    watermark_text: '',
    footer: '',
  };

  stepLabels = TOPIC_STUDIO_STEPS;
  subjectOptions = SUBJECT_OPTIONS;
  gradeOptions = GRADE_LEVEL_OPTIONS;

  form: TopicDraftInput & { duration_hours?: number; max_budget?: number; needs_hardware?: boolean } = {
    title: '',
    subject: SUBJECT_OPTIONS[0],
    grade_level: 'middle',
    goals: '',
    duration_hours: 1,
    max_budget: 50,
    needs_hardware: false,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private topicStudioService: TopicStudioService,
    private tauriService: TauriService,
    private snackBar: MatSnackBar,
    private tutorialResourceService: TutorialResourceService,
    private knowledgeGraphLinkService: KnowledgeGraphLinkService,
    private brandTemplateService: BrandTemplateService,
    private creatorService: CreatorService,
    public publishService: PublishService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const draftId = params.get('draftId');
      this.draftRouteId = draftId;

      if (!draftId) {
        this.viewMode = 'list';
        this.loadDraftList();
        return;
      }

      this.viewMode = 'wizard';
      if (draftId === 'new') {
        this.resetWizardForm();
        const title = this.route.snapshot.queryParamMap.get('title');
        const subject = this.route.snapshot.queryParamMap.get('subject');
        if (title) this.form.title = title;
        if (subject) this.form.subject = subject;
        return;
      }

      this.loadDraft(draftId);
    });
  }

  loadDraftList(): void {
    this.listLoading = true;
    this.topicStudioService.listDrafts().subscribe({
      next: (items) => {
        this.drafts = items;
        this.listLoading = false;
      },
      error: () => {
        this.listLoading = false;
      },
    });
  }

  startNewDraft(): void {
    this.router.navigate(['/topic-studio', 'new']);
  }

  openDraft(id: string): void {
    this.router.navigate(['/topic-studio', id]);
  }

  backToList(): void {
    this.router.navigate(['/topic-studio']);
  }

  deleteDraft(event: Event, draft: TopicDraft): void {
    event.stopPropagation();
    if (!confirm(`确定删除课题「${draft.title}」吗？`)) return;

    this.topicStudioService.deleteDraft(draft.id).subscribe({
      next: () => {
        this.snackBar.open('已删除', '关闭', { duration: 2000 });
        this.loadDraftList();
      },
    });
  }

  resetWizardForm(): void {
    this.draft = null;
    this.currentStep = 0;
    this.form = {
      title: '',
      subject: SUBJECT_OPTIONS[0],
      grade_level: 'middle',
      goals: '',
      duration_hours: 1,
      max_budget: 50,
      needs_hardware: false,
    };
  }

  loadDraft(id: string): void {
    this.topicStudioService.getDraft(id).subscribe({
      next: (draft) => {
        if (!draft) {
          this.snackBar.open('草稿不存在', '关闭', { duration: 3000 });
          this.backToList();
          return;
        }
        this.draft = draft;
        this.currentStep = draft.current_step;
        this.form = {
          title: draft.title,
          subject: draft.subject,
          grade_level: draft.grade_level,
          goals: draft.goals,
          duration_hours: draft.duration_hours,
          max_budget: draft.max_budget,
          needs_hardware: draft.needs_hardware,
        };
        this.refreshMatchedResources();
        this.loadBrandTemplate();
        this.loadGraphLink();
      },
    });
  }

  loadBrandTemplate(): void {
    this.brandTemplateService.getDefaultTemplate().subscribe({
      next: (template) => {
        if (template) {
          this.brandForm = {
            name: template.name,
            logo_path: template.logo_path || '',
            watermark_text: template.watermark_text || '',
            footer: template.footer || '',
          };
          this.brandSaved = true;
        }
      },
    });
  }

  loadGraphLink(): void {
    if (!this.draft?.local_tutorial_id) return;
    const link = this.knowledgeGraphLinkService
      .listLocalLinks()
      .find((l) => l.local_tutorial_id === this.draft!.local_tutorial_id);
    if (link) {
      this.graphLink = { concept_id: link.concept_id, concept_name: link.concept_name };
    }
  }

  refreshMatchedResources(): void {
    if (!this.draft) {
      this.matchedResources = [];
      return;
    }

    const fromDraft = this.draft.matched_resources || [];
    const fromCourse = this.draft.local_tutorial_id
      ? this.tutorialResourceService.getLinksForCourse(this.draft.local_tutorial_id)
      : [];

    const merged: MatchedResourceItem[] = [...fromDraft];
    for (const item of fromCourse) {
      if (
        !merged.some(
          (m) => m.title === item.title && m.url === item.url && m.type === item.type
        )
      ) {
        merged.push(item);
      }
    }
    this.matchedResources = merged;
  }

  openGlobalSearchHint(): void {
    this.snackBar.open('请按 Ctrl+K 打开全局搜索，在结果中点击「加入教程」', '关闭', {
      duration: 4000,
    });
  }

  getResourceIcon(type: MatchedResourceItem['type']): string {
    const icons: Record<MatchedResourceItem['type'], string> = {
      material: 'ri-file-paper-2-line',
      hardware: 'ri-cpu-line',
      tutorial: 'ri-book-2-line',
      external: 'ri-links-line',
    };
    return icons[type] || 'ri-file-line';
  }

  saveStep1(): void {
    if (!this.form.title?.trim()) return;

    this.saving = true;
    const payload = { ...this.form, title: this.form.title.trim() };

    if (this.draft) {
      this.topicStudioService
        .updateDraft(this.draft.id, { ...payload, current_step: 1 })
        .subscribe({
          next: (updated) => {
            this.draft = updated;
            this.currentStep = 1;
            this.saving = false;
            this.stepper?.next();
          },
          error: () => {
            this.saving = false;
            this.snackBar.open('保存失败', '关闭', { duration: 3000 });
          },
        });
      return;
    }

    this.topicStudioService.createDraft(payload).subscribe({
      next: (created) => {
        this.draft = created;
        this.saving = false;
        this.router.navigate(['/topic-studio', created.id], { replaceUrl: true });
        this.currentStep = 1;
        setTimeout(() => this.stepper?.next());
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('创建失败', '关闭', { duration: 3000 });
      },
    });
  }

  generateOutline(): void {
    if (!this.draft) return;

    this.outlineLoading = true;
    this.topicStudioService.generateOutline(this.draft.id).subscribe({
      next: (outline) => {
        if (this.draft) {
          this.draft = { ...this.draft, outline, status: 'outline_ready' };
        }
        this.outlineLoading = false;
        this.snackBar.open('大纲已生成', '关闭', { duration: 2000 });
      },
      error: () => {
        this.outlineLoading = false;
        this.snackBar.open('生成失败', '关闭', { duration: 3000 });
      },
    });
  }

  async confirmTutorial(): Promise<void> {
    if (!this.draft?.outline) {
      this.snackBar.open('请先生成大纲', '关闭', { duration: 3000 });
      return;
    }

    this.confirmLoading = true;
    try {
      const description = this.draft.outline.learning_objectives.join('\n');
      const result = (await this.tauriService.createCourse(
        this.draft.title,
        description,
        this.draft.subject || '科学探索'
      )) as { id?: number };

      const tutorialId = result?.id;
      if (!tutorialId) {
        throw new Error('未返回教程 ID');
      }

      this.topicStudioService
        .updateDraft(this.draft.id, {
          local_tutorial_id: tutorialId,
          status: 'tutorial_confirmed',
          current_step: 3,
        })
        .subscribe({
          next: (updated) => {
            this.draft = updated;
            this.currentStep = 3;
            this.confirmLoading = false;
            this.refreshMatchedResources();
            this.linkTutorialToGraph(tutorialId);
            this.snackBar.open('教程已创建', '关闭', { duration: 3000 });
          },
        });
    } catch (error) {
      this.confirmLoading = false;
      console.error(error);
      this.snackBar.open('创建教程失败（请确认在桌面端运行）', '关闭', { duration: 4000 });
    }
  }

  linkTutorialToGraph(tutorialId: number): void {
    if (!this.draft) return;

    const objectives = this.draft.outline?.learning_objectives?.join('\n') || '';
    this.knowledgeGraphLinkService
      .linkTutorial({
        localTutorialId: tutorialId,
        tutorialTitle: this.draft.title,
        subject: this.draft.subject,
        description: objectives,
      })
      .subscribe({
        next: (link) => {
          if (link) {
            this.graphLink = { concept_id: link.concept_id, concept_name: link.concept_name };
            this.snackBar.open(`已挂接教学图谱：${link.concept_name}`, '关闭', { duration: 3500 });
          }
        },
      });
  }

  saveBrandTemplate(): void {
    this.brandSaving = true;
    this.brandTemplateService
      .saveTemplate({
        ...this.brandForm,
        is_default: true,
      })
      .subscribe({
        next: () => {
          this.brandSaving = false;
          this.brandSaved = true;
          if (this.draft) {
            this.topicStudioService
              .updateDraft(this.draft.id, { status: 'branded', current_step: 5 })
              .subscribe();
          }
          this.snackBar.open('品牌模板已保存', '关闭', { duration: 2000 });
        },
        error: () => {
          this.brandSaving = false;
          this.snackBar.open('保存失败', '关闭', { duration: 3000 });
        },
      });
  }

  exportTeachingPackage(): void {
    if (!this.draft) return;

    this.exporting = true;
    const payload = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      topic: {
        title: this.draft.title,
        subject: this.draft.subject,
        grade_level: this.draft.grade_level,
        goals: this.draft.goals,
        outline: this.draft.outline,
      },
      tutorial_id: this.draft.local_tutorial_id,
      matched_resources: this.matchedResources,
      graph_link: this.graphLink,
      brand: this.brandForm,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${this.draft.title.replace(/[^\w\u4e00-\u9fa5-]+/g, '_')}-teaching-package.json`;
    anchor.click();
    URL.revokeObjectURL(url);

    this.creatorService
      .award('export_package', {
        refType: 'topic_draft',
        refId: this.draft.id,
        note: `导出教学包「${this.draft.title}」`,
      })
      .subscribe();

    this.exporting = false;
    this.snackBar.open('教学包已导出', '关闭', { duration: 2500 });
  }

  submitPublish(): void {
    if (!this.draft || !this.copyrightConfirmed) return;
    if (!this.draft.local_tutorial_id) {
      this.snackBar.open('请先确认并创建教程', '关闭', { duration: 3000 });
      return;
    }

    this.publishing = true;
    this.publishService
      .submitPublish(this.draft, {
        scope: this.publishScope,
        copyrightConfirmed: this.copyrightConfirmed,
        copyrightType: this.copyrightType,
        matchedResources: this.matchedResources,
        graphLink: this.graphLink,
        brand: this.brandForm,
      })
      .subscribe({
        next: (result) => {
          this.publishResult = result;
          this.publishing = false;
          const status = result.package.status;
          this.topicStudioService
            .updateDraft(this.draft!.id, {
              status: status === 'published' ? 'published' : 'branded',
              current_step: 5,
            })
            .subscribe();
          this.snackBar.open(
            status === 'published'
              ? '发布成功'
              : '已提交审核，可在创作者中心查看进度',
            '关闭',
            { duration: 3500 }
          );
        },
        error: () => {
          this.publishing = false;
          this.snackBar.open('发布失败', '关闭', { duration: 3000 });
        },
      });
  }

  finishDraft(): void {
    if (this.draft) {
      this.topicStudioService
        .updateDraft(this.draft.id, { current_step: 5, status: 'branded' })
        .subscribe();
    }
    this.snackBar.open('课题已保存', '关闭', { duration: 2000 });
    this.backToList();
  }

  goResourceExplorer(): void {
    this.router.navigate(['/resource-explorer']);
  }

  goKnowledgeGraph(): void {
    this.router.navigate(['/knowledge-graph']);
  }

  statusLabel(status: TopicDraft['status']): string {
    const map: Record<TopicDraft['status'], string> = {
      draft: '草稿',
      outline_ready: '大纲就绪',
      tutorial_confirmed: '教程已建',
      resources_matched: '资源已匹配',
      branded: '已品牌化',
      published: '已发布',
    };
    return map[status] || status;
  }
}
