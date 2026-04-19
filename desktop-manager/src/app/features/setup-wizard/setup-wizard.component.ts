import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { Router } from '@angular/router';

@Component({
  selector: 'app-setup-wizard',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatButtonModule, MatCardModule,
    MatStepperModule, MatFormFieldModule, MatInputModule
  ],
  providers: [{ provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false } }],
  template: `
    <div class="wizard-container">
      <mat-card class="wizard-card">
        <mat-card-header>
          <mat-card-title>OpenMTSciEd 桌面端</mat-card-title>
          <mat-card-subtitle>首次使用设置</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <mat-stepper [linear]="false" #stepper>
            <!-- 步骤1: 欢迎 -->
            <mat-step [completed]="true">
              <ng-template matStepLabel>欢迎</ng-template>
              <div class="step-content">
                <h3>欢迎使用 OpenMTSciEd</h3>
                <p>这是一个开源的 STEM 连贯学习路径引擎。</p>
                <ul>
                  <li>打通教程库与课件库</li>
                  <li>匹配低成本硬件项目 (≤50元)</li>
                  <li>支持离线学习与本地存储</li>
                </ul>
              </div>
              <div class="step-actions">
                <button mat-raised-button color="primary" matStepperNext>开始</button>
              </div>
            </mat-step>

            <!-- 步骤2: 基本信息 -->
            <mat-step>
              <ng-template matStepLabel>基本信息</ng-template>
              <div class="step-content">
                <form class="setup-form">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>教师姓名</mat-label>
                    <input matInput [(ngModel)]="teacherName" name="teacherName" />
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>学校名称</mat-label>
                    <input matInput [(ngModel)]="schoolName" name="schoolName" />
                  </mat-form-field>
                </form>
              </div>
              <div class="step-actions">
                <button mat-button matStepperPrevious>上一步</button>
                <button mat-raised-button color="primary" matStepperNext [disabled]="!teacherName">下一步</button>
              </div>
            </mat-step>

            <!-- 步骤3: 完成 -->
            <mat-step>
              <ng-template matStepLabel>完成</ng-template>
              <div class="step-content completion">
                <h3>设置完成！</h3>
                <p>您已准备好开始探索 STEM 学习路径。</p>
              </div>
              <div class="step-actions">
                <button mat-button matStepperPrevious>上一步</button>
                <button mat-raised-button color="primary" (click)="finishSetup()">进入系统</button>
              </div>
            </mat-step>
          </mat-stepper>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .wizard-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f5f7fa; padding: 20px; }
    .wizard-card { max-width: 600px; width: 100%; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
    mat-card-header { margin-bottom: 24px; text-align: center; }
    .step-content { padding: 20px 0; min-height: 200px; }
    .setup-form { display: flex; flex-direction: column; gap: 16px; margin-top: 20px; }
    .full-width { width: 100%; }
    .step-actions { display: flex; justify-content: space-between; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e0e0e0; }
    .completion { text-align: center; }
  `]
})
export class SetupWizardComponent {
  teacherName = '';
  schoolName = '';

  constructor(private router: Router) {}

  finishSetup(): void {
    localStorage.setItem('user-profile', JSON.stringify({ teacherName: this.teacherName, schoolName: this.schoolName }));
    void this.router.navigate(['/dashboard']);
  }
}
