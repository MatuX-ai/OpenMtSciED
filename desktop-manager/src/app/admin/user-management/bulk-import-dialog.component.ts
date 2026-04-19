import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';

import { UserService } from '../../core/services/user.service';
import { BulkImportResult } from '../../models/user.models';

/**
 * 批量导入用户对话框组件
 */
@Component({
  selector: 'app-bulk-import-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule,
    MatRadioModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="bulk-import-dialog">
      <h2 mat-dialog-title>
        <mat-icon>upload</mat-icon>
        批量导入用户
      </h2>

      <mat-dialog-content>
        <mat-stepper [linear]="true" #stepper>
          <!-- 步骤1: 上传文件 -->
          <mat-step label="上传文件" [completed]="fileSelected()">
            <div class="step-content">
              <p class="step-description">
                请选择要导入的CSV或Excel文件。文件格式应包含以下列：
                <strong>username, email, role（可选）</strong>
              </p>

              <div class="upload-area" (click)="fileInput.click()" (dragover)="onDragOver($event)" (drop)="onDrop($event)">
                <input
                  #fileInput
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  (change)="onFileSelected($event)"
                  hidden
                />
                
                @if (!selectedFile()) {
                  <div class="upload-placeholder">
                    <mat-icon class="upload-icon">cloud_upload</mat-icon>
                    <p>点击或拖拽文件到此处</p>
                    <span class="file-types">支持 CSV, Excel 格式</span>
                  </div>
                } @else {
                  <div class="file-selected">
                    <mat-icon>insert_drive_file</mat-icon>
                    <div class="file-info">
                      <div class="file-name">{{ selectedFile()?.name }}</div>
                      <div class="file-size">{{ formatFileSize(selectedFile()?.size || 0) }}</div>
                    </div>
                    <button mat-icon-button color="warn" (click)="clearFile(); $event.stopPropagation()">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                }
              </div>

              <div class="sample-download">
                <a href="#" (click)="downloadSample($event)">
                  <mat-icon>download</mat-icon>
                  下载示例文件
                </a>
              </div>
            </div>

            <div class="step-actions">
              <button mat-button mat-dialog-close>取消</button>
              <button 
                mat-flat-button 
                color="primary" 
                [disabled]="!fileSelected()"
                (click)="stepper.next()"
              >
                下一步
              </button>
            </div>
          </mat-step>

          <!-- 步骤2: 配置选项 -->
          <mat-step label="配置选项">
            <div class="step-content">
              <h3>冲突处理策略</h3>
              <p class="hint-text">当遇到重复的用户名或邮箱时，选择处理方式：</p>

              <mat-radio-group [(ngModel)]="conflictResolution" class="conflict-options">
                <mat-radio-button value="skip">
                  <div class="radio-content">
                    <strong>跳过</strong>
                    <p>跳过已存在的用户，只导入新用户</p>
                  </div>
                </mat-radio-button>

                <mat-radio-button value="update">
                  <div class="radio-content">
                    <strong>更新</strong>
                    <p>更新已存在用户的信息</p>
                  </div>
                </mat-radio-button>

                <mat-radio-button value="overwrite">
                  <div class="radio-content">
                    <strong>覆盖</strong>
                    <p>完全覆盖已存在的用户数据</p>
                  </div>
                </mat-radio-button>
              </mat-radio-group>

              <div class="password-option">
                <label>
                  <input type="checkbox" [(ngModel)]="generatePassword" />
                  为新用户自动生成密码
                </label>
                <p class="hint-text">如果不勾选，需要在文件中提供密码列</p>
              </div>
            </div>

            <div class="step-actions">
              <button mat-button (click)="stepper.previous()">上一步</button>
              <button mat-button mat-dialog-close>取消</button>
              <button 
                mat-flat-button 
                color="primary"
                (click)="startImport()"
                [disabled]="importing()"
              >
                @if (importing()) {
                  <mat-progress-spinner diameter="20" mode="indeterminate"></mat-progress-spinner>
                  导入中...
                } @else {
                  <mat-icon>play_arrow</mat-icon>
                  开始导入
                }
              </button>
            </div>
          </mat-step>

          <!-- 步骤3: 导入结果 -->
          <mat-step label="导入结果" [completed]="importResult() !== null">
            <div class="step-content">
              @if (importing()) {
                <div class="importing-state">
                  <mat-progress-spinner mode="indeterminate" diameter="60"></mat-progress-spinner>
                  <p>正在导入用户，请稍候...</p>
                </div>
              } @else if (importResult()) {
                <div class="import-result">
                  <div class="result-summary">
                    <div class="result-item success">
                      <mat-icon>check_circle</mat-icon>
                      <div>
                        <div class="result-value">{{ importResult()?.success_count }}</div>
                        <div class="result-label">成功导入</div>
                      </div>
                    </div>
                    <div class="result-item failed">
                      <mat-icon>error</mat-icon>
                      <div>
                        <div class="result-value">{{ importResult()?.failed_count }}</div>
                        <div class="result-label">导入失败</div>
                      </div>
                    </div>
                    <div class="result-item conflict">
                      <mat-icon>warning</mat-icon>
                      <div>
                        <div class="result-value">{{ importResult()?.conflicts_count }}</div>
                        <div class="result-label">冲突</div>
                      </div>
                    </div>
                  </div>

                  @if (importResult()?.errors && importResult()?.errors?.length > 0) {
                    <div class="error-list">
                      <h4>错误信息:</h4>
                      <ul>
                        @for (error of importResult()?.errors; track error) {
                          <li>{{ error }}</li>
                        }
                      </ul>
                    </div>
                  }

                  <div class="result-actions">
                    <button mat-stroked-button (click)="downloadReport()">
                      <mat-icon>download</mat-icon>
                      下载报告
                    </button>
                  </div>
                </div>
              }
            </div>

            <div class="step-actions">
              <button mat-button mat-dialog-close>关闭</button>
              <button 
                mat-flat-button 
                color="primary"
                (click)="resetImport()"
              >
                <mat-icon>refresh</mat-icon>
                重新导入
              </button>
            </div>
          </mat-step>
        </mat-stepper>
      </mat-dialog-content>
    </div>
  `,
  styles: [`
    .bulk-import-dialog {
      min-width: 600px;
      max-width: 800px;

      h2[mat-dialog-title] {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 20px;
        color: #333;
      }

      .step-content {
        padding: 20px 0;

        .step-description {
          color: #666;
          margin-bottom: 20px;
          line-height: 1.6;
        }

        .upload-area {
          border: 2px dashed #ccc;
          border-radius: 8px;
          padding: 40px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
          background: #fafafa;

          &:hover {
            border-color: #2196f3;
            background: #e3f2fd;
          }

          .upload-placeholder {
            .upload-icon {
              font-size: 48px;
              width: 48px;
              height: 48px;
              color: #999;
              margin-bottom: 15px;
            }

            p {
              margin: 10px 0;
              font-size: 1.1rem;
              color: #666;
            }

            .file-types {
              font-size: 0.85rem;
              color: #999;
            }
          }

          .file-selected {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px;
            background: white;
            border-radius: 6px;

            mat-icon {
              font-size: 32px;
              width: 32px;
              height: 32px;
              color: #2196f3;
            }

            .file-info {
              flex: 1;
              text-align: left;

              .file-name {
                font-weight: 500;
                color: #333;
                margin-bottom: 4px;
              }

              .file-size {
                font-size: 0.85rem;
                color: #999;
              }
            }
          }
        }

        .sample-download {
          margin-top: 15px;
          text-align: center;

          a {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            color: #2196f3;
            text-decoration: none;
            font-size: 0.9rem;

            &:hover {
              text-decoration: underline;
            }
          }
        }

        h3 {
          margin: 0 0 10px 0;
          color: #333;
          font-size: 1.1rem;
        }

        .hint-text {
          color: #666;
          font-size: 0.85rem;
          margin-bottom: 15px;
        }

        .conflict-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;

          mat-radio-button {
            ::ng-deep .mat-mdc-radio-button-frame {
              padding: 12px;
              border: 1px solid #e0e0e0;
              border-radius: 6px;
              transition: all 0.2s;

              &:hover {
                background: #f5f5f5;
              }
            }

            &.mat-mdc-radio-checked ::ng-deep .mat-mdc-radio-button-frame {
              border-color: #2196f3;
              background: #e3f2fd;
            }
          }

          .radio-content {
            strong {
              display: block;
              color: #333;
              margin-bottom: 4px;
            }

            p {
              margin: 0;
              font-size: 0.85rem;
              color: #666;
            }
          }
        }

        .password-option {
          label {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            color: #333;

            input[type="checkbox"] {
              width: 18px;
              height: 18px;
              cursor: pointer;
            }
          }
        }

        .importing-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;

          p {
            margin-top: 20px;
            color: #666;
            font-size: 1rem;
          }
        }

        .import-result {
          .result-summary {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 20px;

            .result-item {
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 15px;
              border-radius: 8px;
              background: #f5f5f5;

              mat-icon {
                font-size: 32px;
                width: 32px;
                height: 32px;
              }

              .result-value {
                font-size: 1.5rem;
                font-weight: 600;
                color: #333;
              }

              .result-label {
                font-size: 0.85rem;
                color: #666;
              }

              &.success {
                mat-icon {
                  color: #4caf50;
                }
              }

              &.failed {
                mat-icon {
                  color: #f44336;
                }
              }

              &.conflict {
                mat-icon {
                  color: #ff9800;
                }
              }
            }
          }

          .error-list {
            background: #ffebee;
            border-left: 4px solid #f44336;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;

            h4 {
              margin: 0 0 10px 0;
              color: #c62828;
              font-size: 0.95rem;
            }

            ul {
              margin: 0;
              padding-left: 20px;
              color: #d32f2f;

              li {
                margin-bottom: 5px;
                font-size: 0.9rem;
              }
            }
          }

          .result-actions {
            text-align: center;

            button {
              display: inline-flex;
              align-items: center;
              gap: 5px;
            }
          }
        }
      }

      .step-actions {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #e0e0e0;

        button {
          display: flex;
          align-items: center;
          gap: 5px;
        }
      }
    }

    @media (max-width: 768px) {
      .bulk-import-dialog {
        min-width: 90vw;

        .result-summary {
          grid-template-columns: 1fr !important;
        }
      }
    }
  `],
})
export class BulkImportDialogComponent {
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<BulkImportDialogComponent>);

  readonly selectedFile = signal<File | null>(null);
  readonly fileSelected = signal<boolean>(false);
  readonly conflictResolution = signal<string>('skip');
  readonly generatePassword = signal<boolean>(true);
  readonly importing = signal<boolean>(false);
  readonly importResult = signal<BulkImportResult | null>(null);

  /**
   * 文件选择处理
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files[0]);
      this.fileSelected.set(true);
    }
  }

  /**
   * 拖拽悬停处理
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * 文件拖放处理
   */
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (this.isValidFileType(file)) {
        this.selectedFile.set(file);
        this.fileSelected.set(true);
      } else {
        this.snackBar.open('只支持 CSV 和 Excel 文件格式', '关闭', { duration: 3000 });
      }
    }
  }

  /**
   * 验证文件类型
   */
  isValidFileType(file: File): boolean {
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();

    return (
      validTypes.includes(file.type) ||
      validExtensions.some((ext) => fileName.endsWith(ext))
    );
  }

  /**
   * 清除选择的文件
   */
  clearFile(): void {
    this.selectedFile.set(null);
    this.fileSelected.set(false);
  }

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * 下载示例文件
   */
  downloadSample(event: Event): void {
    event.preventDefault();
    this.snackBar.open('下载示例文件功能开发中...', '关闭', { duration: 2000 });
  }

  /**
   * 开始导入
   */
  startImport(): void {
    const file = this.selectedFile();
    if (!file) {
      this.snackBar.open('请先选择文件', '关闭', { duration: 2000 });
      return;
    }

    this.importing.set(true);

    // TODO: 调用后端API进行批量导入
    setTimeout(() => {
      this.userService.bulkImportUsers(file, this.conflictResolution()).subscribe({
        next: (result) => {
          this.importResult.set(result);
          this.importing.set(false);
          this.snackBar.open('导入完成', '关闭', { duration: 2000 });
        },
        error: (error) => {
          console.error('导入失败:', error);
          this.snackBar.open('导入失败，请重试', '关闭', { duration: 3000 });
          this.importing.set(false);
        },
      });
    }, 500);
  }

  /**
   * 下载报告
   */
  downloadReport(): void {
    this.snackBar.open('下载报告功能开发中...', '关闭', { duration: 2000 });
  }

  /**
   * 重置导入
   */
  resetImport(): void {
    this.clearFile();
    this.importResult.set(null);
    this.conflictResolution.set('skip');
    this.generatePassword.set(true);
  }
}
