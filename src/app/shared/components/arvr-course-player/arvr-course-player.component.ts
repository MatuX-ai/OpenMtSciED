import { Component, OnInit, ViewChild, ElementRef, OnDestroy, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, Subject, interval } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

// 声明全局Unity变量
declare const UnityLoader: any;


interface ARVRContent {
  id: number;
  title: string;
  description: string;
  content_type: string;
  platform: string;
  build_file_url: string;
  manifest_url: string;
  thumbnail_url: string;
  config: any;
  required_sensors: string[];
  interaction_modes: string[];
  is_active: boolean;
  view_count: number;
  completion_count: number;
  average_rating: number;
  created_at: string;
}

interface SensorData {
  sensor_type: string;
  payload: any;
  timestamp: string;
  session_id: string;
}

interface PhysicsState {
  objects: Array<{
    id: string;
    position: [number, number, number];
    velocity: [number, number, number];
    mass: number;
    is_static: boolean;
  }>;
  gravity: number;
  time_step: number;
}

@Component({
  selector: 'app-arvr-course-player',
  templateUrl: './arvr-course-player.component.html',
  styleUrls: ['./arvr-course-player.component.scss']
})
export class ARVRCoursePlayerComponent implements OnInit, OnDestroy {
  @ViewChild('unityContainer') unityContainer!: ElementRef;
  @ViewChild('sensorCanvas') sensorCanvas!: ElementRef;

  contentId!: number;
  content!: ARVRContent;
  isLoading = true;
  errorMessage = '';
  
  // Unity WebGL相关
  unityInstance: any = null;
  isUnityLoaded = false;
  
  // 传感器数据相关
  sensorSocket: WebSocket | null = null;
  clientSocket: WebSocket | null = null;
  sensorData: SensorData[] = [];
  isSensorStreaming = false;
  
  // 物理引擎相关
  physicsState: PhysicsState | null = null;
  isPhysicsActive = false;
  
  // 交互控制
  interactionMode: 'gesture' | 'voice' | 'controller' = 'gesture';
  isVoiceRecognitionActive = false;
  
  // 进度跟踪
  progressPercentage = 0;
  milestonesReached: string[] = [];
  interactionCount = 0;
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.contentId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadContent();
    this.initializeSensorStreaming();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.cleanupConnections();
  }

  private loadContent(): void {
    this.http.get<ARVRContent>(`/api/v1/org/1/arvr/contents/${this.contentId}`)
      .subscribe({
        next: (content) => {
          this.content = content;
          this.isLoading = false;
          
          if (content.content_type === 'unity_webgl') {
            this.loadUnityContent();
          } else if (content.content_type === 'threejs_scene') {
            this.loadThreeJSContent();
          }
          
          this.startProgressTracking();
        },
        error: (error) => {
          this.errorMessage = '加载内容失败';
          this.isLoading = false;
          this.snackBar.open('内容加载失败', '关闭', { duration: 3000 });
        }
      });
  }

  private loadUnityContent(): void {
    if (!this.content.build_file_url) {
      this.snackBar.open('Unity构建文件未找到', '关闭', { duration: 3000 });
      return;
    }

    // 动态加载Unity WebGL脚本
    const script = document.createElement('script');
    script.src = `${this.content.build_file_url.replace('/index.html', '')}/Build/UnityLoader.js`;
    script.onload = () => {
      this.initializeUnityPlayer();
    };
    script.onerror = () => {
      this.snackBar.open('Unity加载器加载失败', '关闭', { duration: 3000 });
    };
    document.head.appendChild(script);
  }

  private initializeUnityPlayer(): void {
    if (typeof UnityLoader !== 'undefined') {
      this.unityInstance = UnityLoader.instantiate(
        this.unityContainer.nativeElement,
        this.content.manifest_url,
        {
          onProgress: (instance: any, progress: number) => {
            if (progress === 1) {
              this.isUnityLoaded = true;
              this.setupUnityMessaging();
            }
          }
        }
      );
    }
  }

  private setupUnityMessaging(): void {
    // 设置Unity与Angular之间的消息传递
    if (this.unityInstance) {
      // 从Unity接收消息
      (window as any).unitySendMessage = (gameObject: string, methodName: string, value: string) => {
        this.handleUnityMessage(gameObject, methodName, value);
      };

      // 向Unity发送消息
      (window as any).sendToUnity = (gameObject: string, methodName: string, value: string) => {
        if (this.unityInstance.SendMessage) {
          this.unityInstance.SendMessage(gameObject, methodName, value);
        }
      };
    }
  }

  private handleUnityMessage(gameObject: string, methodName: string, value: string): void {
    switch (methodName) {
      case 'SensorDataReceived':
        this.handleSensorDataFromUnity(value);
        break;
      case 'InteractionCompleted':
        this.handleInteractionComplete(value);
        break;
      case 'MilestoneReached':
        this.handleMilestoneReached(value);
        break;
    }
  }

  private loadThreeJSContent(): void {
    // 加载Three.js场景
    const container = this.unityContainer.nativeElement;
    container.innerHTML = '<div id="threejs-container" style="width:100%;height:600px;"></div>';
    
    // 这里应该加载Three.js场景代码
    this.loadThreeJSScene();
  }

  private loadThreeJSScene(): void {
    // Three.js场景初始化代码
    const sceneScript = document.createElement('script');
    sceneScript.textContent = `
      // Three.js场景代码将在这里动态生成
      // 基于content.config中的配置
    `;
    document.head.appendChild(sceneScript);
  }

  // 传感器数据处理
  private initializeSensorStreaming(): void {
    const sessionId = this.generateSessionId();
    
    // 连接传感器数据发送通道
    this.sensorSocket = new WebSocket(`ws://localhost:8765?session_id=${sessionId}&content_id=${this.contentId}&user_id=1`);
    
    this.sensorSocket.onopen = () => {
      console.log('传感器数据通道已连接');
      this.isSensorStreaming = true;
      this.initDeviceSensors();
    };

    this.sensorSocket.onerror = (error) => {
      console.error('传感器数据通道错误:', error);
    };

    this.sensorSocket.onclose = () => {
      console.log('传感器数据通道已关闭');
      this.isSensorStreaming = false;
    };

    // 连接客户端数据接收通道
    this.clientSocket = new WebSocket(`ws://localhost:8766?session_id=${sessionId}&content_id=${this.contentId}`);
    
    this.clientSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleIncomingSensorData(data);
    };

    this.clientSocket.onerror = (error) => {
      console.error('客户端数据通道错误:', error);
    };
  }

  private initDeviceSensors(): void {
    // 初始化设备传感器
    if ('DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', this.handleGyroscope.bind(this));
    }

    if ('DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', this.handleAccelerometer.bind(this));
    }

    if ('geolocation' in navigator) {
      this.initGPS();
    }

    // 初始化触摸事件
    this.initTouchEvents();
  }

  private handleGyroscope(event: DeviceOrientationEvent): void {
    if (!this.isSensorStreaming) return;

    const gyroscopeData = {
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma
    };

    this.sendSensorData('gyroscope', gyroscopeData);
  }

  private handleAccelerometer(event: DeviceMotionEvent): void {
    if (!this.isSensorStreaming) return;

    const accelerometerData = {
      x: event.acceleration?.x || 0,
      y: event.acceleration?.y || 0,
      z: event.acceleration?.z || 0,
      timestamp: Date.now()
    };

    this.sendSensorData('accelerometer', accelerometerData);
  }

  private initGPS(): void {
    navigator.geolocation.watchPosition(
      (position) => {
        if (!this.isSensorStreaming) return;

        const gpsData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now()
        };

        this.sendSensorData('gps', gpsData);
      },
      (error) => {
        console.error('GPS获取失败:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000
      }
    );
  }

  private initTouchEvents(): void {
    const container = this.unityContainer.nativeElement;
    
    container.addEventListener('touchstart', this.handleTouchStart.bind(this));
    container.addEventListener('touchmove', this.handleTouchMove.bind(this));
    container.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  private handleTouchStart(event: TouchEvent): void {
    const touch = event.touches[0];
    const rect = this.unityContainer.nativeElement.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

    this.sendSensorData('touch', {
      type: 'start',
      x: x,
      y: y,
      identifier: touch.identifier
    });
  }

  private handleTouchMove(event: TouchEvent): void {
    const touch = event.touches[0];
    const rect = this.unityContainer.nativeElement.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

    this.sendSensorData('touch', {
      type: 'move',
      x: x,
      y: y,
      identifier: touch.identifier
    });
  }

  private handleTouchEnd(event: TouchEvent): void {
    this.sendSensorData('touch', {
      type: 'end',
      identifier: event.changedTouches[0].identifier
    });
  }

  private sendSensorData(sensorType: string, payload: any): void {
    if (this.sensorSocket && this.sensorSocket.readyState === WebSocket.OPEN) {
      const message = {
        sensor_type: sensorType,
        payload: payload
      };
      this.sensorSocket.send(JSON.stringify(message));
    }
  }

  private handleIncomingSensorData(data: SensorData): void {
    // 处理从其他客户端接收到的传感器数据
    this.sensorData.push(data);
    
    // 保持数据缓冲区大小
    if (this.sensorData.length > 100) {
      this.sensorData.shift();
    }

    // 更新UI显示
    this.updateSensorDisplay(data);
    
    // 发送到Unity（如果已加载）
    if (this.isUnityLoaded && this.unityInstance) {
      (window as any).sendToUnity('SensorManager', 'OnSensorDataReceived', JSON.stringify(data));
    }
  }

  private updateSensorDisplay(data: SensorData): void {
    // 更新传感器数据显示
    const canvas = this.sensorCanvas.nativeElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // 这里可以绘制传感器数据的可视化图表
        this.drawSensorVisualization(ctx, data);
      }
    }
  }

  private drawSensorVisualization(ctx: CanvasRenderingContext2D, data: SensorData): void {
    // 传感器数据可视化实现
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    switch (data.sensor_type) {
      case 'accelerometer':
        this.drawAccelerometerGraph(ctx, data.payload);
        break;
      case 'gyroscope':
        this.drawGyroscopeGraph(ctx, data.payload);
        break;
    }
  }

  private drawAccelerometerGraph(ctx: CanvasRenderingContext2D, data: any): void {
    // 绘制加速度计数据图表
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(10, 10, Math.abs(data.x) * 100, 20);
    ctx.fillRect(10, 40, Math.abs(data.y) * 100, 20);
    ctx.fillRect(10, 70, Math.abs(data.z) * 100, 20);
  }

  private drawGyroscopeGraph(ctx: CanvasRenderingContext2D, data: any): void {
    // 绘制陀螺仪数据图表
    ctx.fillStyle = '#2196F3';
    ctx.fillRect(10, 10, Math.abs(data.alpha || 0) * 0.5, 20);
    ctx.fillRect(10, 40, Math.abs(data.beta || 0) * 0.5, 20);
    ctx.fillRect(10, 70, Math.abs(data.gamma || 0) * 0.5, 20);
  }

  // 物理引擎交互
  togglePhysicsSimulation(): void {
    this.isPhysicsActive = !this.isPhysicsActive;
    
    if (this.isPhysicsActive) {
      this.startPhysicsUpdates();
      this.snackBar.open('物理仿真已启动', '关闭', { duration: 2000 });
    } else {
      this.snackBar.open('物理仿真已停止', '关闭', { duration: 2000 });
    }
  }

  private startPhysicsUpdates(): void {
    interval(100) // 每100ms更新一次
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updatePhysicsState();
      });
  }

  private updatePhysicsState(): void {
    if (!this.isPhysicsActive) return;

    this.http.get<PhysicsState>(`/api/v1/org/1/arvr/contents/${this.contentId}/physics-state`)
      .subscribe({
        next: (state) => {
          this.physicsState = state;
          // 将物理状态同步到Unity
          if (this.isUnityLoaded) {
            (window as any).sendToUnity('PhysicsManager', 'UpdatePhysicsState', JSON.stringify(state));
          }
        },
        error: (error) => {
          console.error('获取物理状态失败:', error);
        }
      });
  }

  // 交互模式切换
  setInteractionMode(mode: 'gesture' | 'voice' | 'controller'): void {
    this.interactionMode = mode;
    
    // 通知Unity更改交互模式
    if (this.isUnityLoaded) {
      (window as any).sendToUnity('InteractionManager', 'SetInteractionMode', mode);
    }
    
    this.snackBar.open(`交互模式切换为: ${mode}`, '关闭', { duration: 2000 });
  }

  // 语音识别
  toggleVoiceRecognition(): void {
    this.isVoiceRecognitionActive = !this.isVoiceRecognitionActive;
    
    if (this.isVoiceRecognitionActive) {
      this.startVoiceRecognition();
    } else {
      this.stopVoiceRecognition();
    }
  }

  private startVoiceRecognition(): void {
    if (!('webkitSpeechRecognition' in window)) {
      this.snackBar.open('浏览器不支持语音识别', '关闭', { duration: 3000 });
      this.isVoiceRecognitionActive = false;
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'zh-CN';

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');

      if (event.results[event.results.length - 1].isFinal) {
        this.handleVoiceCommand(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('语音识别错误:', event.error);
      this.isVoiceRecognitionActive = false;
    };

    recognition.start();
    (window as any).voiceRecognition = recognition;

    this.snackBar.open('语音识别已启动', '关闭', { duration: 2000 });
  }

  private stopVoiceRecognition(): void {
    if ((window as any).voiceRecognition) {
      (window as any).voiceRecognition.stop();
      (window as any).voiceRecognition = null;
    }
    this.snackBar.open('语音识别已停止', '关闭', { duration: 2000 });
  }

  private handleVoiceCommand(command: string): void {
    // 发送语音命令到后端处理
    this.http.post(`/api/v1/org/1/arvr/contents/${this.contentId}/voice-command`, {
      command: command,
      user_id: 1
    }).subscribe({
      next: (response: any) => {
        this.snackBar.open(response.response, '关闭', { duration: 3000 });
        
        // 如果是Unity内容，也发送到Unity
        if (this.isUnityLoaded) {
          (window as any).sendToUnity('VoiceManager', 'OnVoiceCommand', command);
        }
      },
      error: (error) => {
        console.error('语音命令处理失败:', error);
      }
    });
  }

  // 进度跟踪
  private startProgressTracking(): void {
    interval(30000) // 每30秒更新一次进度
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.http.post(`/api/v1/org/1/arvr/contents/${this.contentId}/progress`, {
          progress_percentage: this.progressPercentage,
          interaction_count: this.interactionCount,
          milestones_reached: this.milestonesReached
        }))
      )
      .subscribe({
        next: () => {
          console.log('进度已更新');
        },
        error: (error) => {
          console.error('进度更新失败:', error);
        }
      });
  }

  private handleSensorDataFromUnity(data: string): void {
    // 处理来自Unity的传感器数据
    try {
      const sensorData = JSON.parse(data);
      this.handleIncomingSensorData(sensorData);
    } catch (error) {
      console.error('解析Unity传感器数据失败:', error);
    }
  }

  private handleInteractionComplete(data: string): void {
    // 处理交互完成事件
    this.interactionCount++;
    this.progressPercentage = Math.min(this.progressPercentage + 5, 100);
    
    this.snackBar.open('交互完成!', '关闭', { duration: 2000 });
  }

  private handleMilestoneReached(milestone: string): void {
    // 处理里程碑达成事件
    if (!this.milestonesReached.includes(milestone)) {
      this.milestonesReached.push(milestone);
      this.progressPercentage = Math.min(this.progressPercentage + 10, 100);
      
      this.snackBar.open(`达成里程碑: ${milestone}`, '关闭', { duration: 3000 });
    }
  }

  // 实用方法
  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private cleanupConnections(): void {
    if (this.sensorSocket) {
      this.sensorSocket.close();
      this.sensorSocket = null;
    }

    if (this.clientSocket) {
      this.clientSocket.close();
      this.clientSocket = null;
    }

    if (this.unityInstance) {
      this.unityInstance.Quit();
      this.unityInstance = null;
    }
  }

  // UI控制方法
  goBack(): void {
    this.router.navigate(['/courses']);
  }

  toggleFullscreen(): void {
    const container = this.unityContainer.nativeElement;
    if (container.requestFullscreen) {
      container.requestFullscreen();
    }
  }

  showHelp(): void {
    // 显示帮助信息对话框
    this.dialog.open(HelpDialogComponent, {
      width: '600px',
      data: {
        content: this.content,
        required_sensors: this.content.required_sensors,
        interaction_modes: this.content.interaction_modes
      }
    });
  }
}

// 帮助对话框组件
@Component({
  selector: 'app-help-dialog',
  template: `
    <h2 mat-dialog-title>使用帮助</h2>
    <mat-dialog-content>
      <h3>{{data.content.title}}</h3>
      <p>{{data.content.description}}</p>
      
      <h4>支持的传感器:</h4>
      <ul>
        <li *ngFor="let sensor of data.required_sensors">{{sensor}}</li>
      </ul>
      
      <h4>交互模式:</h4>
      <ul>
        <li *ngFor="let mode of data.interaction_modes">{{mode}}</li>
      </ul>
      
      <h4>操作说明:</h4>
      <ul>
        <li>触摸屏幕进行基本交互</li>
        <li>使用手势进行复杂操作</li>
        <li>启用语音识别进行语音控制</li>
        <li>连接外部控制器获得更多功能</li>
      </ul>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>关闭</button>
    </mat-dialog-actions>
  `
})
export class HelpDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}