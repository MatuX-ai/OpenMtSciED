import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';

interface HardwareProject {
  id: string;
  name: string;
  description: string;
  code: string;
  board: 'arduino' | 'esp32';
  materials: string[];
}

@Component({
  selector: 'app-webusb-flash',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="webusb-container" *ngIf="isVisible">
      <div class="flash-header">
        <h3>🔌 硬件烧录</h3>
        <button class="close-btn" (click)="close()">×</button>
      </div>

      <div class="flash-content">
        <!-- 设备连接状态 -->
        <div class="device-status" [class.connected]="isConnected">
          <div class="status-icon">{{ isConnected ? '✅' : '❌' }}</div>
          <div class="status-text">
            <strong>{{ isConnected ? '设备已连接' : '设备未连接' }}</strong>
            <p *ngIf="connectedDevice">{{ connectedDevice }}</p>
          </div>
          <button
            class="connect-btn"
            (click)="connectDevice()"
            [disabled]="isFlashing"
          >
            {{ isConnected ? '断开' : '连接设备' }}
          </button>
        </div>

        <!-- 项目信息 -->
        <div class="project-info" *ngIf="project">
          <h4>{{ project.name }}</h4>
          <p>{{ project.description }}</p>
          <div class="materials">
            <strong>所需材料：</strong>
            <ul>
              <li *ngFor="let item of project.materials">{{ item }}</li>
            </ul>
          </div>
        </div>

        <!-- 代码预览 -->
        <div class="code-preview">
          <div class="code-header">
            <span>代码预览</span>
            <button (click)="copyCode()" class="copy-btn">复制</button>
          </div>
          <pre><code>{{ project?.code || '// 暂无代码' }}</code></pre>
        </div>

        <!-- 烧录控制 -->
        <div class="flash-controls">
          <button
            class="flash-btn"
            (click)="startFlash()"
            [disabled]="!isConnected || isFlashing || !project"
          >
            {{ isFlashing ? '烧录中...' : '开始烧录' }}
          </button>

          <!-- 进度条 -->
          <div class="progress-bar" *ngIf="isFlashing">
            <div class="progress-fill" [style.width.%]="flashProgress"></div>
            <span class="progress-text">{{ flashProgress }}%</span>
          </div>

          <!-- 烧录结果 -->
          <div class="flash-result" *ngIf="flashResult">
            <div [class.success]="flashResult.success" [class.error]="!flashResult.success">
              {{ flashResult.success ? '✅ 烧录成功！' : '❌ 烧录失败：' + flashResult.error }}
            </div>
          </div>
        </div>

        <!-- 串口监视器 -->
        <div class="serial-monitor" *ngIf="isConnected">
          <div class="monitor-header">
            <span>串口监视器</span>
            <button (click)="clearMonitor()" class="clear-btn">清空</button>
          </div>
          <div class="monitor-output" #monitorOutput>
            <div *ngFor="let line of serialLines" class="serial-line">
              {{ line }}
            </div>
          </div>
          <div class="monitor-input">
            <input
              type="text"
              [(ngModel)]="serialInput"
              placeholder="发送数据..."
              (keyup.enter)="sendSerialData()"
            />
            <button (click)="sendSerialData()">发送</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .webusb-container {
        position: fixed;
        bottom: 20px;
        left: 20px;
        width: 500px;
        max-height: 600px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        z-index: 1002;
        display: flex;
        flex-direction: column;
      }
      .flash-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
        border-radius: 12px 12px 0 0;
      }
      .flash-header h3 {
        margin: 0;
        font-size: 16px;
      }
      .close-btn {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 18px;
      }
      .flash-content {
        padding: 20px;
        overflow-y: auto;
        max-height: 540px;
      }
      .device-status {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: #fff3cd;
        border: 2px solid #ffc107;
        border-radius: 8px;
        margin-bottom: 16px;
      }
      .device-status.connected {
        background: #d4edda;
        border-color: #28a745;
      }
      .status-icon {
        font-size: 32px;
      }
      .status-text {
        flex: 1;
      }
      .status-text p {
        margin: 4px 0 0 0;
        font-size: 13px;
        color: #666;
      }
      .connect-btn {
        padding: 8px 16px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
      }
      .connect-btn:hover:not(:disabled) {
        background: #0056b3;
      }
      .connect-btn:disabled {
        background: #ccc;
        cursor: not-allowed;
      }
      .project-info {
        margin-bottom: 16px;
        padding: 12px;
        background: #f8f9fa;
        border-radius: 8px;
      }
      .project-info h4 {
        margin: 0 0 8px 0;
      }
      .materials ul {
        margin: 8px 0;
        padding-left: 20px;
      }
      .code-preview {
        margin-bottom: 16px;
      }
      .code-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }
      .copy-btn {
        padding: 4px 12px;
        background: #6c757d;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }
      pre {
        background: #f4f4f4;
        padding: 12px;
        border-radius: 6px;
        overflow-x: auto;
        max-height: 200px;
        overflow-y: auto;
      }
      code {
        font-family: 'Courier New', monospace;
        font-size: 13px;
      }
      .flash-controls {
        margin-bottom: 16px;
      }
      .flash-btn {
        width: 100%;
        padding: 12px;
        background: #28a745;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
      }
      .flash-btn:hover:not(:disabled) {
        background: #218838;
      }
      .flash-btn:disabled {
        background: #ccc;
        cursor: not-allowed;
      }
      .progress-bar {
        margin-top: 12px;
        height: 24px;
        background: #e9ecef;
        border-radius: 12px;
        overflow: hidden;
        position: relative;
      }
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #28a745, #20c997);
        transition: width 0.3s;
      }
      .progress-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 12px;
        font-weight: bold;
        color: #333;
      }
      .flash-result {
        margin-top: 12px;
        padding: 12px;
        border-radius: 6px;
        text-align: center;
      }
      .flash-result .success {
        background: #d4edda;
        color: #155724;
      }
      .flash-result .error {
        background: #f8d7da;
        color: #721c24;
      }
      .serial-monitor {
        border-top: 2px solid #eee;
        padding-top: 16px;
      }
      .monitor-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }
      .clear-btn {
        padding: 4px 12px;
        background: #dc3545;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }
      .monitor-output {
        background: #1e1e1e;
        color: #d4d4d4;
        padding: 12px;
        border-radius: 6px;
        max-height: 150px;
        overflow-y: auto;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        margin-bottom: 8px;
      }
      .serial-line {
        margin: 2px 0;
      }
      .monitor-input {
        display: flex;
        gap: 8px;
      }
      .monitor-input input {
        flex: 1;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      .monitor-input button {
        padding: 8px 16px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
    `,
  ],
})
export class WebusbFlashComponent implements OnDestroy {
  @Input() project: HardwareProject | null = null;

  isVisible = false;
  isConnected = false;
  connectedDevice: string | null = null;
  isFlashing = false;
  flashProgress = 0;
  flashResult: { success: boolean; error?: string } | null = null;
  serialLines: string[] = [];
  serialInput = '';
  private flashInterval: any = null;

  show(project: HardwareProject): void {
    this.project = project;
    this.isVisible = true;
    this.reset();
  }

  close(): void {
    this.isVisible = false;
  }

  async connectDevice(): Promise<void> {
    if (this.isConnected) {
      this.disconnectDevice();
      return;
    }

    try {
      // TODO: 实际调用 WebUSB API
      // const port = await navigator.serial.requestPort();
      // await port.open({ baudRate: 9600 });

      // 模拟连接
      setTimeout(() => {
        this.isConnected = true;
        this.connectedDevice = 'Arduino Uno (COM3)';
        this.addSerialLine('设备已连接');
      }, 1000);
    } catch (error) {
      console.error('连接失败:', error);
      alert('连接设备失败，请确保浏览器支持 WebUSB');
    }
  }

  disconnectDevice(): void {
    this.isConnected = false;
    this.connectedDevice = null;
    this.addSerialLine('设备已断开');
  }

  async startFlash(): Promise<void> {
    if (!this.project || !this.isConnected) return;

    this.isFlashing = true;
    this.flashProgress = 0;
    this.flashResult = null;

    // 模拟烧录进度
    this.flashInterval = setInterval(() => {
      this.flashProgress += 10;
      if (this.flashProgress >= 100) {
        this.clearFlashInterval();
        this.isFlashing = false;
        this.flashResult = { success: true };
        this.addSerialLine('烧录完成！');
      }
    }, 300);
  }

  ngOnDestroy(): void {
    this.clearFlashInterval();
  }

  private clearFlashInterval(): void {
    if (this.flashInterval) {
      clearInterval(this.flashInterval);
      this.flashInterval = null;
    }
  }

  copyCode(): void {
    if (this.project?.code) {
      navigator.clipboard.writeText(this.project.code);
      alert('代码已复制到剪贴板');
    }
  }

  sendSerialData(): void {
    if (!this.serialInput.trim()) return;

    this.addSerialLine(`> ${this.serialInput}`);
    this.serialInput = '';

    // 模拟设备响应
    setTimeout(() => {
      this.addSerialLine('< OK');
    }, 100);
  }

  clearMonitor(): void {
    this.serialLines = [];
  }

  private reset(): void {
    this.isConnected = false;
    this.connectedDevice = null;
    this.isFlashing = false;
    this.flashProgress = 0;
    this.flashResult = null;
    this.serialLines = [];
  }

  private addSerialLine(line: string): void {
    this.serialLines.push(line);
    // 保持最近 100 行
    if (this.serialLines.length > 100) {
      this.serialLines.shift();
    }
  }
}
