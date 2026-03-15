import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface CircuitElement {
  element_id: string;
  element_type: string;
  voltage: number;
  current: number;
  power: number;
  node1: string;
  node2: string;
  parameter_value: number;
}

interface CircuitState {
  session_id: string;
  elements: CircuitElement[];
  total_power: number;
  total_current: number;
  simulation_time: number;
  timestamp: string;
}

interface DeviceState {
  device_id: string;
  device_type: string;
  voltage: number;
  current: number;
  temperature: number;
  is_connected: boolean;
  custom_properties?: any;
  timestamp: string;
}

interface SessionInfo {
  session_id: string;
  host_user_id: number;
  participant_count: number;
  created_at: string;
  is_active: boolean;
}

@Component({
  selector: 'app-digital-twin-lab',
  templateUrl: './digital-twin-lab.component.html',
  styleUrls: ['./digital-twin-lab.component.scss']
})
export class DigitalTwinLabComponent implements OnInit, OnDestroy {
  @ViewChild('unityContainer') unityContainer!: ElementRef;

  sessionId!: string;
  sessionInfo!: SessionInfo;
  isLoading = true;
  errorMessage = '';

  // Unity WebGL相关
  unityInstance: any = null;
  isUnityLoaded = false;

  // 网络状态
  isConnected = false;
  participantCount = 1;

  // 电路状态
  circuitState: CircuitState | null = null;
  deviceStates: Map<string, DeviceState> = new Map();

  // 控制面板状态
  isSimulationRunning = false;
  isDeviceSyncEnabled = true;

  private destroy$ = new Subject<void>();
  private webSocket!: WebSocket;
  private baseUrl = '/api/v1'; // 代理到后端

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.sessionId = this.route.snapshot.paramMap.get('id') || '';
    this.loadSession();
    this.initializeWebSocket();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.cleanupConnections();
  }

  private loadSession(): void {
    this.http.get<SessionInfo>(`${this.baseUrl}/digital-twin/sessions/${this.sessionId}`)
      .subscribe({
        next: (session) => {
          this.sessionInfo = session;
          this.isLoading = false;
          this.loadUnityContent();
          this.snackBar.open('数字孪生实验室已加载', '关闭', { duration: 2000 });
        },
        error: (error) => {
          this.errorMessage = '加载会话失败';
          this.isLoading = false;
          this.snackBar.open('会话加载失败', '关闭', { duration: 3000 });
        }
      });
  }

  private loadUnityContent(): void {
    // 动态加载Unity WebGL构建
    const script = document.createElement('script');
    script.src = `/digital-twin/builds/lab/index.html`;
    script.onload = () => {
      this.initializeUnityPlayer();
    };
    script.onerror = () => {
      this.snackBar.open('Unity内容加载失败', '关闭', { duration: 3000 });
    };
    document.head.appendChild(script);
  }

  private initializeUnityPlayer(): void {
    // Unity WebGL初始化配置
    const unityConfig = {
      dataUrl: "/digital-twin/builds/lab/Build/lab.data",
      frameworkUrl: "/digital-twin/builds/lab/Build/lab.framework.js",
      codeUrl: "/digital-twin/builds/lab/Build/lab.wasm",
      streamingAssetsUrl: "StreamingAssets",
      companyName: "iMatu",
      productName: "Digital Twin Lab",
      productVersion: "1.0",
      showBanner: false,
    };

    // 创建Unity实例
    if ((window as any).createUnityInstance) {
      (window as any).createUnityInstance(
        this.unityContainer.nativeElement,
        unityConfig,
        (progress: number) => {
          // 加载进度回调
          console.log(`Unity加载进度: ${(progress * 100).toFixed(2)}%`);
        }
      ).then((instance: any) => {
        this.unityInstance = instance;
        this.isUnityLoaded = true;
        this.setupUnityCommunication();
        this.snackBar.open('Unity实验室已就绪', '关闭', { duration: 2000 });
      }).catch((error: any) => {
        console.error('Unity实例创建失败:', error);
        this.snackBar.open('Unity启动失败', '关闭', { duration: 3000 });
      });
    }
  }

  private setupUnityCommunication(): void {
    // 设置与Unity的双向通信
    (window as any).sendToUnity = (objectName: string, methodName: string, value: string) => {
      if (this.unityInstance) {
        this.unityInstance.SendMessage(objectName, methodName, value);
      }
    };

    // 接收来自Unity的消息
    (window as any).receiveFromUnity = (message: string) => {
      this.handleUnityMessage(message);
    };
  }

  private handleUnityMessage(message: string): void {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'circuit_state_update':
          this.sendCircuitStateToBackend(data.state);
          break;

        case 'device_state_update':
          this.sendDeviceStateToBackend(data.state);
          break;

        case 'simulation_control':
          this.handleSimulationControl(data.action);
          break;

        default:
          console.log('未知的Unity消息类型:', data.type);
      }
    } catch (error) {
      console.error('解析Unity消息失败:', error);
    }
  }

  private handleSimulationControl(action: string): void {
    switch (action) {
      case 'start':
        this.isSimulationRunning = true;
        break;
      case 'stop':
        this.isSimulationRunning = false;
        break;
      case 'reset':
        this.resetCircuit();
        break;
      default:
        console.log('未知的仿真控制动作:', action);
    }
  }

  private initializeWebSocket(): void {
    const wsUrl = `ws://${window.location.host}/api/v1/digital-twin/ws/session/${this.sessionId}?user_id=user_${Math.random()}`;

    try {
      this.webSocket = new WebSocket(wsUrl);

      this.webSocket.onopen = () => {
        this.isConnected = true;
        console.log('WebSocket连接已建立');
        this.snackBar.open('实时连接已建立', '关闭', { duration: 2000 });
      };

      this.webSocket.onmessage = (event) => {
        this.handleWebSocketMessage(event.data);
      };

      this.webSocket.onclose = () => {
        this.isConnected = false;
        console.log('WebSocket连接已关闭');
        // 尝试重连
        setTimeout(() => this.initializeWebSocket(), 5000);
      };

      this.webSocket.onerror = (error) => {
        console.error('WebSocket错误:', error);
        this.snackBar.open('连接出现错误', '关闭', { duration: 3000 });
      };

    } catch (error) {
      console.error('WebSocket初始化失败:', error);
      this.snackBar.open('无法建立实时连接', '关闭', { duration: 3000 });
    }
  }

  private handleWebSocketMessage(data: string): void {
    try {
      const message = JSON.parse(data);

      switch (message.type) {
        case 'circuit_state_broadcast':
          this.updateCircuitState(message.state);
          break;

        case 'device_state_broadcast':
          this.updateDeviceState(message.device_id, message.state);
          break;

        case 'sync_response':
          this.handleSyncResponse(message);
          break;

        case 'error':
          this.snackBar.open(`错误: ${message.message}`, '关闭', { duration: 3000 });
          break;

        default:
          console.log('未知的WebSocket消息类型:', message.type);
      }
    } catch (error) {
      console.error('解析WebSocket消息失败:', error);
    }
  }

  private updateCircuitState(state: CircuitState): void {
    this.circuitState = state;

    // 同步到Unity
    if (this.isUnityLoaded) {
      (window as any).sendToUnity('CircuitManager', 'UpdateCircuitState', JSON.stringify(state));
    }

    // 更新UI显示
    this.participantCount = state.elements?.length || 0;

    console.log('电路状态已更新:', state);
  }

  private updateDeviceState(deviceId: string, state: DeviceState): void {
    this.deviceStates.set(deviceId, state);

    // 同步到Unity
    if (this.isUnityLoaded) {
      const message = { deviceId, state };
      (window as any).sendToUnity('DeviceManager', 'UpdateDeviceState', JSON.stringify(message));
    }

    console.log(`设备状态更新: ${deviceId}`, state);
  }

  private handleSyncResponse(message: any): void {
    if (message.circuit_state) {
      this.updateCircuitState(message.circuit_state);
    }

    if (message.device_states) {
      message.device_states.forEach((deviceState: DeviceState) => {
        this.deviceStates.set(deviceState.device_id, deviceState);
      });
    }

    this.snackBar.open('状态同步完成', '关闭', { duration: 2000 });
  }

  // 发送电路状态到后端
  private sendCircuitStateToBackend(state: CircuitState): void {
    if (!this.isConnected) return;

    const message = {
      type: 'circuit_state_update',
      session_id: this.sessionId,
      state: state,
      sender: 'frontend'
    };

    this.webSocket.send(JSON.stringify(message));
  }

  // 发送设备状态到后端
  private sendDeviceStateToBackend(state: DeviceState): void {
    if (!this.isConnected) return;

    const message = {
      type: 'device_state_update',
      session_id: this.sessionId,
      state: state
    };

    this.webSocket.send(JSON.stringify(message));
  }

  // 仿真控制
  toggleSimulation(): void {
    this.isSimulationRunning = !this.isSimulationRunning;

    if (this.isUnityLoaded) {
      (window as any).sendToUnity(
        'SimulationController',
        'ToggleSimulation',
        this.isSimulationRunning.toString()
      );
    }

    const action = this.isSimulationRunning ? '开始' : '停止';
    this.snackBar.open(`仿真已${action}`, '关闭', { duration: 2000 });
  }

  // 设备同步控制
  toggleDeviceSync(): void {
    this.isDeviceSyncEnabled = !this.isDeviceSyncEnabled;

    if (this.isUnityLoaded) {
      (window as any).sendToUnity(
        'IoTManager',
        'ToggleDeviceSync',
        this.isDeviceSyncEnabled.toString()
      );
    }

    const status = this.isDeviceSyncEnabled ? '启用' : '禁用';
    this.snackBar.open(`设备同步已${status}`, '关闭', { duration: 2000 });
  }

  // 重置电路
  resetCircuit(): void {
    if (this.isUnityLoaded) {
      (window as any).sendToUnity('CircuitManager', 'ResetCircuit', '');
      this.snackBar.open('电路已重置', '关闭', { duration: 2000 });
    }
  }

  // 添加元件
  addElement(elementType: string): void {
    if (this.isUnityLoaded) {
      (window as any).sendToUnity('CircuitManager', 'AddElement', elementType);
      this.snackBar.open(`已添加${elementType}元件`, '关闭', { duration: 2000 });
    }
  }

  // 获取会话信息
  getSessionDetails(): void {
    this.http.get<any>(`${this.baseUrl}/digital-twin/sessions/${this.sessionId}/participants`)
      .subscribe({
        next: (data) => {
          this.participantCount = data.participant_count;
          // 显示详细信息对话框
          this.showSessionDialog(data);
        },
        error: (error) => {
          console.error('获取会话详情失败:', error);
        }
      });
  }

  private showSessionDialog(data: any): void {
    // 这里可以创建一个Material Dialog组件显示会话详情
    console.log('会话详情:', data);
  }

  // 返回主页
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  // 全屏切换
  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      this.unityContainer.nativeElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  // 获取平均电压
  getAverageVoltage(): number {
    if (this.deviceStates.size === 0) return 0;

    let sum = 0;
    let count = 0;
    this.deviceStates.forEach(state => {
      if (state.is_connected) {
        sum += state.voltage;
        count++;
      }
    });

    return count > 0 ? sum / count : 0;
  }

  // 获取前N个元件
  getTopElements(count: number): CircuitElement[] {
    if (!this.circuitState?.elements) return [];

    // 按功率排序，返回前count个
    return [...this.circuitState.elements]
      .sort((a, b) => Math.abs(b.power) - Math.abs(a.power))
      .slice(0, count);
  }

  private cleanupConnections(): void {
    if (this.webSocket) {
      this.webSocket.close();
    }

    if (this.unityInstance) {
      this.unityInstance.Quit();
    }
  }
}
