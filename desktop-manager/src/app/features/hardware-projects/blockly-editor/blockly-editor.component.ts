import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';

import { HardwareProject, CodeTemplate } from '../../../models/hardware-project.models';

// Blockly 类型声明（需要在 package.json 中添加 blockly 依赖）
declare const Blockly: any;

/**
 * 自定义管道：代码高亮（简化版）
 * 实际项目中建议使用 prismjs 或 highlight.js
 */
@Pipe({
  name: 'highlightCode',
  standalone: true,
})
class HighlightCodePipe implements PipeTransform {
  transform(code: string, language: string): string {
    if (!code) return '';

    // 简单的 HTML 转义
    let escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // 简单的关键字高亮（仅示例）
    if (language === 'arduino') {
      escaped = escaped
        .replace(
          /\b(void|int|float|char|bool|if|else|for|while|return)\b/g,
          '<span style="color:#569cd6">$1</span>'
        )
        .replace(
          /\b(setup|loop|pinMode|digitalWrite|analogRead)\b/g,
          '<span style="color:#dcdcaa">$1</span>'
        )
        .replace(/\/\/.*/g, '<span style="color:#6a9955">$&</span>');
    } else if (language === 'python') {
      escaped = escaped
        .replace(
          /\b(def|class|if|else|elif|for|while|import|from|return)\b/g,
          '<span style="color:#569cd6">$1</span>'
        )
        .replace(/\b(print|range|len)\b/g, '<span style="color:#dcdcaa">$1</span>')
        .replace(/#.*/g, '<span style="color:#6a9955">$&</span>');
    }

    return escaped;
  }
}

@Component({
  selector: 'app-blockly-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    MatSnackBarModule,
    MatTabsModule,
    MatToolbarModule,
    HighlightCodePipe,
  ],
  template: `
    <div class="blockly-editor">
      <!-- 工具栏 -->
      <mat-toolbar color="primary" class="editor-toolbar">
        <span class="toolbar-title">
          <mat-icon>code</mat-icon>
          {{ project?.name || '可视化编程编辑器' }}
        </span>
        <span class="toolbar-spacer"></span>

        <button mat-button (click)="undo()" [disabled]="!canUndo">
          <mat-icon>undo</mat-icon>
          撤销
        </button>
        <button mat-button (click)="redo()" [disabled]="!canRedo">
          <mat-icon>redo</mat-icon>
          重做
        </button>
        <button mat-button (click)="clearWorkspace()">
          <mat-icon>delete_sweep</mat-icon>
          清空
        </button>
        <button mat-raised-button color="accent" (click)="generateCode()">
          <mat-icon>play_arrow</mat-icon>
          生成代码
        </button>
        <button mat-raised-button color="primary" (click)="saveProject()">
          <mat-icon>save</mat-icon>
          保存
        </button>
      </mat-toolbar>

      <!-- 主编辑区 -->
      <div class="editor-content">
        <!-- 左侧：Blockly 工作区 -->
        <div class="blockly-workspace-container">
          <div #blocklyDiv id="blocklyDiv" class="blockly-div"></div>
        </div>

        <!-- 右侧：代码预览 -->
        <div class="code-preview-container">
          <mat-tab-group [(selectedIndex)]="selectedTabIndex">
            <mat-tab label="Arduino C++">
              <div class="code-preview">
                <pre><code [innerHTML]="arduinoCode | highlightCode:'arduino'"></code></pre>
              </div>
            </mat-tab>
            <mat-tab label="MicroPython">
              <div class="code-preview">
                <pre><code [innerHTML]="pythonCode | highlightCode:'python'"></code></pre>
              </div>
            </mat-tab>
            <mat-tab label="JSON">
              <div class="code-preview">
                <pre><code>{{ blocklyXml }}</code></pre>
              </div>
            </mat-tab>
          </mat-tab-group>

          <!-- 代码操作按钮 -->
          <div class="code-actions">
            <button mat-button (click)="copyCode()">
              <mat-icon>content_copy</mat-icon>
              复制代码
            </button>
            <button mat-button (click)="downloadCode()">
              <mat-icon>download</mat-icon>
              下载代码
            </button>
            <button
              mat-raised-button
              color="primary"
              (click)="flashToDevice()"
              *ngIf="project?.webUsbSupport"
            >
              <mat-icon>usb</mat-icon>
              烧录到设备
            </button>
          </div>
        </div>
      </div>

      <!-- 底部状态栏 -->
      <div class="status-bar">
        <span>
          <mat-icon>info</mat-icon>
          积木块数量: {{ blockCount }}
        </span>
        <span *ngIf="lastSaved">
          <mat-icon>check_circle</mat-icon>
          上次保存: {{ lastSaved | date:'HH:mm:ss' }}
        </span>
      </div>
    </div>
  `,
  styles: [
    `
    .blockly-editor {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: #f5f7fa;
    }

    .editor-toolbar {
      padding: 0 16px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .toolbar-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 500;
    }

    .toolbar-spacer {
      flex: 1 1 auto;
    }

    .editor-content {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .blockly-workspace-container {
      flex: 1;
      min-width: 60%;
      position: relative;
      border-right: 2px solid #e0e0e0;
    }

    .blockly-div {
      width: 100%;
      height: 100%;
    }

    .code-preview-container {
      width: 40%;
      min-width: 400px;
      display: flex;
      flex-direction: column;
      background: white;
    }

    .code-preview {
      flex: 1;
      overflow: auto;
      padding: 16px;
      background: #1e1e1e;
      color: #d4d4d4;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 14px;
      line-height: 1.6;
    }

    .code-preview pre {
      margin: 0;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .code-preview code {
      color: #d4d4d4;
    }

    .code-actions {
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid #e0e0e0;
      background: #fafafa;
    }

    .status-bar {
      display: flex;
      gap: 24px;
      padding: 8px 16px;
      background: #2c3e50;
      color: white;
      font-size: 13px;
      align-items: center;
    }

    .status-bar span {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .status-bar mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    /* Blockly 自定义样式 */
    ::ng-deep .blocklyToolboxDiv {
      background-color: #f8f9fa !important;
      border-right: 1px solid #ddd !important;
    }

    ::ng-deep .blocklyFlyoutBackground {
      fill: #ffffff !important;
      fill-opacity: 0.95 !important;
    }

    ::ng-deep .blocklyMainWorkspaceScrollbar {
      z-index: 20 !important;
    }
  `,
  ],
})
export class BlocklyEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('blocklyDiv') blocklyDiv!: ElementRef;

  project: HardwareProject | null = null;
  workspace: any = null;

  arduinoCode: string = '// Arduino 代码将在这里生成\nvoid setup() {\n  // 初始化\n}\n\nvoid loop() {\n  // 主循环\n}';
  pythonCode: string = '# MicroPython 代码将在这里生成\nfrom machine import Pin\nimport time\n';
  blocklyXml: string = '<xml></xml>';

  selectedTabIndex: number = 0;
  blockCount: number = 0;
  canUndo: boolean = false;
  canRedo: boolean = false;
  lastSaved: Date | null = null;

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    // TODO: 从路由或输入获取项目信息
    this.loadProject();
  }

  ngAfterViewInit(): void {
    this.initializeBlockly();
  }

  ngOnDestroy(): void {
    if (this.workspace) {
      this.workspace.dispose();
    }
  }

  initializeBlockly(): void {
    try {
      // 检查 Blockly 是否已加载
      if (typeof Blockly === 'undefined') {
        console.warn('Blockly 未加载，请确保已安装 blockly 依赖');
        this.snackBar.open('Blockly 编辑器加载中...', '关闭', { duration: 3000 });
        return;
      }

      // 创建工作区
      this.workspace = Blockly.inject(this.blocklyDiv.nativeElement, {
        toolbox: document.getElementById('toolbox'),
        grid: {
          spacing: 20,
          length: 3,
          colour: '#ccc',
          snap: true
        },
        zoom: {
          controls: true,
          wheel: true,
          startScale: 1.0,
          maxScale: 3,
          minScale: 0.3,
          scaleSpeed: 1.2
        },
        trashcan: true,
        scrollbars: true
      });

      // 监听工作区变化
      this.workspace.addChangeListener(() => {
        this.updateCodePreview();
        this.updateBlockCount();
        this.updateUndoRedoState();
      });

      // 加载项目代码模板
      if (this.project?.codeTemplate) {
        this.loadCodeTemplate(this.project.codeTemplate);
      }

      console.log('Blockly 编辑器初始化成功');
    } catch (error) {
      console.error('Blockly 初始化失败:', error);
      this.snackBar.open('编辑器初始化失败', '关闭', { duration: 3000 });
    }
  }

  loadProject(): void {
    // TODO: 从服务或路由获取项目
    // 示例数据
    this.project = {
      id: 'hw-001',
      name: '智能温湿度监测器',
      description: '使用DHT11传感器和OLED显示屏',
      category: 'iot',
      difficulty: 2,
      estimatedTime: '2小时',
      totalCost: 35,
      materials: [],
      webUsbSupport: false,
      codeTemplate: {
        language: 'arduino',
        code: '// 示例代码',
        description: '基础模板'
      }
    };
  }

  loadCodeTemplate(template: CodeTemplate): void {
    if (!this.workspace) return;

    try {
      if (template.language === 'blockly' && template.code) {
        // 加载 Blockly XML
        const xml = Blockly.utils.xml.textToDom(template.code);
        Blockly.Xml.domToWorkspace(xml, this.workspace);
      } else {
        // 对于其他语言，显示在代码预览区
        if (template.language === 'arduino') {
          this.arduinoCode = template.code;
        } else if (template.language === 'python') {
          this.pythonCode = template.code;
        }
      }
    } catch (error) {
      console.error('加载代码模板失败:', error);
    }
  }

  updateCodePreview(): void {
    if (!this.workspace) return;

    try {
      // 生成 Blockly XML
      const xml = Blockly.Xml.workspaceToDom(this.workspace);
      this.blocklyXml = Blockly.Xml.domToPrettyText(xml);

      // 生成 Arduino 代码
      if (typeof Blockly.Arduino !== 'undefined') {
        this.arduinoCode = Blockly.Arduino.workspaceToCode(this.workspace);
      }

      // 生成 Python 代码
      if (typeof Blockly.Python !== 'undefined') {
        this.pythonCode = Blockly.Python.workspaceToCode(this.workspace);
      }
    } catch (error) {
      console.error('生成代码失败:', error);
    }
  }

  updateBlockCount(): void {
    if (!this.workspace) return;

    const blocks = this.workspace.getAllBlocks(false);
    this.blockCount = blocks.length;
  }

  updateUndoRedoState(): void {
    if (!this.workspace) return;

    this.canUndo = this.workspace.undoStack_.length > 0;
    this.canRedo = this.workspace.redoStack_.length > 0;
  }

  undo(): void {
    if (this.workspace && this.canUndo) {
      this.workspace.undo(false);
    }
  }

  redo(): void {
    if (this.workspace && this.canRedo) {
      this.workspace.undo(true);
    }
  }

  clearWorkspace(): void {
    if (this.workspace) {
      if (confirm('确定要清空工作区吗？此操作不可恢复。')) {
        this.workspace.clear();
        this.snackBar.open('工作区已清空', '关闭', { duration: 2000 });
      }
    }
  }

  generateCode(): void {
    this.updateCodePreview();
    this.snackBar.open('代码已生成', '查看', { duration: 3000 });
  }

  saveProject(): void {
    if (!this.workspace) return;

    try {
      const xml = Blockly.Xml.workspaceToDom(this.workspace);
      const xmlText = Blockly.Xml.domToText(xml);

      // TODO: 保存到本地存储或后端
      localStorage.setItem(`blockly_${this.project?.id}`, xmlText);

      this.lastSaved = new Date();
      this.snackBar.open('项目已保存', '关闭', { duration: 2000 });
    } catch (error) {
      console.error('保存失败:', error);
      this.snackBar.open('保存失败', '关闭', { duration: 3000 });
    }
  }

  copyCode(): void {
    let codeToCopy = '';

    switch (this.selectedTabIndex) {
      case 0:
        codeToCopy = this.arduinoCode;
        break;
      case 1:
        codeToCopy = this.pythonCode;
        break;
      case 2:
        codeToCopy = this.blocklyXml;
        break;
    }

    navigator.clipboard.writeText(codeToCopy).then(() => {
      this.snackBar.open('代码已复制到剪贴板', '关闭', { duration: 2000 });
    }).catch(err => {
      console.error('复制失败:', err);
      this.snackBar.open('复制失败', '关闭', { duration: 3000 });
    });
  }

  downloadCode(): void {
    let code = '';
    let filename = '';
    let extension = '';

    switch (this.selectedTabIndex) {
      case 0:
        code = this.arduinoCode;
        filename = this.project?.name || 'sketch';
        extension = '.ino';
        break;
      case 1:
        code = this.pythonCode;
        filename = this.project?.name || 'main';
        extension = '.py';
        break;
      case 2:
        code = this.blocklyXml;
        filename = this.project?.name || 'project';
        extension = '.xml';
        break;
    }

    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}${extension}`;
    a.click();
    URL.revokeObjectURL(url);

    this.snackBar.open('代码已下载', '关闭', { duration: 2000 });
  }

  flashToDevice(): void {
    if (!this.project?.webUsbSupport) {
      this.snackBar.open('该项目不支持 WebUSB 烧录', '关闭', { duration: 3000 });
      return;
    }

    // TODO: 实现 WebUSB 烧录功能
    this.snackBar.open('正在连接设备...', '关闭', { duration: 3000 });
    console.log('WebUSB 烧录功能待实现');
  }
}
