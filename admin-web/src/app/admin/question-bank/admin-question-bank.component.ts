import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface QuestionBank {
  id: number;
  name: string;
  description?: string;
  source?: string;
  subject?: string;
  level?: string;
  total_questions: number;
}

@Component({
  selector: 'app-admin-question-bank',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatChipsModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
  ],
  template: `
    <div class="admin-question-bank">
      <!-- 头部 -->
      <div class="header">
        <h2>
          <mat-icon>quiz</mat-icon>
          题库管理
        </h2>
        <div class="header-actions">
          <button mat-stroked-button color="primary" (click)="refreshData()">
            <mat-icon>refresh</mat-icon>
            刷新
          </button>
          <button mat-flat-button color="primary" (click)="openCreateDialog()">
            <mat-icon>add</mat-icon>
            新建题库
          </button>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-grid" *ngIf="!loading(); else loadingTemplate">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>quiz</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ banks().length }}</div>
              <div class="stat-label">题库总数</div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>description</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ getTotalQuestions() }}</div>
              <div class="stat-label">题目总数</div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <ng-template #loadingTemplate>
        <div class="loading-container">
          <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
          <p>加载题库数据...</p>
        </div>
      </ng-template>

      <!-- 题库列表 -->
      <div class="content-section" *ngIf="!loading()">
        <mat-card>
          <mat-card-header>
            <mat-card-title>题库列表</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="banks()" class="full-width-table">
              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef> 名称 </th>
                <td mat-cell *matCellDef="let bank"> {{bank.name}} </td>
              </ng-container>

              <!-- Source Column -->
              <ng-container matColumnDef="source">
                <th mat-header-cell *matHeaderCellDef> 来源 </th>
                <td mat-cell *matCellDef="let bank"> {{bank.source || '-'}} </td>
              </ng-container>

              <!-- Subject Column -->
              <ng-container matColumnDef="subject">
                <th mat-header-cell *matHeaderCellDef> 学科 </th>
                <td mat-cell *matCellDef="let bank">
                  <mat-chip-set>
                    <mat-chip>{{bank.subject || '通用'}}</mat-chip>
                  </mat-chip-set>
                </td>
              </ng-container>

              <!-- Level Column -->
              <ng-container matColumnDef="level">
                <th mat-header-cell *matHeaderCellDef> 难度/年级 </th>
                <td mat-cell *matCellDef="let bank"> {{getLevelText(bank.level)}} </td>
              </ng-container>

              <!-- Questions Count Column -->
              <ng-container matColumnDef="total_questions">
                <th mat-header-cell *matHeaderCellDef> 题目数 </th>
                <td mat-cell *matCellDef="let bank"> {{bank.total_questions}} </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef> 操作 </th>
                <td mat-cell *matCellDef="let bank">
                  <button mat-icon-button color="primary" (click)="editBank(bank)" matTooltip="编辑">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteBank(bank)" matTooltip="删除">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            <div *ngIf="banks().length === 0" class="empty-state">
              <mat-icon>inbox</mat-icon>
              <p>暂无题库数据，请点击“新建题库”添加</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .admin-question-bank {
      padding: 20px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .header h2 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
    }
    .header-actions {
      display: flex;
      gap: 10px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    .stat-card {
      display: flex;
      align-items: center;
    }
    .stat-icon {
      background-color: #e3f2fd;
      color: #1976d2;
      padding: 15px;
      border-radius: 8px;
      margin-right: 15px;
    }
    .stat-number {
      font-size: 24px;
      font-weight: bold;
    }
    .stat-label {
      color: #666;
      font-size: 14px;
    }
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }
    .full-width-table {
      width: 100%;
    }
    .empty-state {
      text-align: center;
      padding: 40px;
      color: #666;
    }
    .empty-state mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 10px;
    }
  `]
})
export class AdminQuestionBankComponent implements OnInit {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  readonly loading = signal<boolean>(true);
  readonly banks = signal<QuestionBank[]>([]);

  displayedColumns: string[] = ['name', 'source', 'subject', 'level', 'total_questions', 'actions'];

  ngOnInit(): void {
    this.loadBanks();
  }

  async loadBanks() {
    this.loading.set(true);
    try {
      const res: any = await firstValueFrom(this.http.get('/api/questions/banks'));
      if (res.success) {
        this.banks.set(res.data);
      }
    } catch (error) {
      this.snackBar.open('加载题库失败', '关闭', { duration: 3000 });
    } finally {
      this.loading.set(false);
    }
  }

  refreshData() {
    this.loadBanks();
  }

  getTotalQuestions(): number {
    return this.banks().reduce((sum, bank) => sum + bank.total_questions, 0);
  }

  getLevelText(level?: string): string {
    const map: Record<string, string> = {
      'elementary': '小学',
      'middle': '初中',
      'high': '高中',
      'university': '大学'
    };
    return map[level || ''] || level || '通用';
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(QuestionBankDialogComponent, {
      width: '500px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createBank(result);
      }
    });
  }

  editBank(bank: QuestionBank) {
    const dialogRef = this.dialog.open(QuestionBankDialogComponent, {
      width: '500px',
      data: { mode: 'edit', bank }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateBank(bank.id, result);
      }
    });
  }

  async createBank(data: Partial<QuestionBank>) {
    try {
      const res: any = await firstValueFrom(this.http.post('/api/questions/banks', data));
      if (res.success) {
        this.snackBar.open('题库创建成功', '关闭', { duration: 2000 });
        this.loadBanks();
      }
    } catch (error) {
      this.snackBar.open('创建题库失败', '关闭', { duration: 3000 });
    }
  }

  async updateBank(id: number, data: Partial<QuestionBank>) {
    try {
      // Assuming PUT /api/questions/banks/:id exists or similar
      const res: any = await firstValueFrom(this.http.put(`/api/questions/banks/${id}`, data));
      if (res.success) {
        this.snackBar.open('题库更新成功', '关闭', { duration: 2000 });
        this.loadBanks();
      }
    } catch (error) {
      this.snackBar.open('更新题库失败', '关闭', { duration: 3000 });
    }
  }

  async deleteBank(bank: QuestionBank) {
    if (confirm(`确定要删除题库 "${bank.name}" 吗？此操作不可恢复。`)) {
      try {
        const res: any = await firstValueFrom(this.http.delete(`/api/questions/banks/${bank.id}`));
        if (res.success) {
          this.snackBar.open('题库删除成功', '关闭', { duration: 2000 });
          this.loadBanks();
        }
      } catch (error) {
        this.snackBar.open('删除题库失败', '关闭', { duration: 3000 });
      }
    }
  }
}

@Component({
  selector: 'app-question-bank-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? '新建题库' : '编辑题库' }}</h2>
    <mat-dialog-content>
      <form #bankForm="ngForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>题库名称</mat-label>
          <input matInput [(ngModel)]="formData.name" name="name" required>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>描述</mat-label>
          <textarea matInput [(ngModel)]="formData.description" name="description" rows="3"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>来源</mat-label>
          <input matInput [(ngModel)]="formData.source" name="source">
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>学科</mat-label>
            <mat-select [(ngModel)]="formData.subject" name="subject">
              <mat-option value="physics">物理</mat-option>
              <mat-option value="chemistry">化学</mat-option>
              <mat-option value="biology">生物</mat-option>
              <mat-option value="math">数学</mat-option>
              <mat-option value="general">通用</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>难度/年级</mat-label>
            <mat-select [(ngModel)]="formData.level" name="level">
              <mat-option value="elementary">小学</mat-option>
              <mat-option value="middle">初中</mat-option>
              <mat-option value="high">高中</mat-option>
              <mat-option value="university">大学</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>取消</button>
      <button mat-flat-button color="primary" [mat-dialog-close]="formData" [disabled]="!formData.name">保存</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; }
    .row { display: flex; gap: 10px; }
    .half-width { flex: 1; }
  `]
})
export class QuestionBankDialogComponent {
  formData: Partial<QuestionBank> = {};

  constructor(
    public dialogRef: MatDialogRef<QuestionBankDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit', bank?: QuestionBank }
  ) {
    if (data.mode === 'edit' && data.bank) {
      this.formData = { ...data.bank };
    }
  }
}
