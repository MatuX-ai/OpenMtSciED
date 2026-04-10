"""
OpenMTSciEd WebUSB Arduino/ESP32烧录服务
实现浏览器直接烧录代码到硬件设备
"""

from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field


class SerialPort(BaseModel):
    """串口设备信息"""
    port_id: str = Field(..., description="端口ID")
    device_path: str = Field(..., description="设备路径")
    manufacturer: Optional[str] = Field(None, description="制造商")
    product_name: Optional[str] = Field(None, description="产品名称")
    vendor_id: Optional[int] = Field(None, description="厂商ID")
    product_id: Optional[int] = Field(None, description="产品ID")
    is_connected: bool = Field(default=False, description="是否已连接")


class CompilationResult(BaseModel):
    """编译结果"""
    success: bool = Field(..., description="编译是否成功")
    binary_data: Optional[str] = Field(None, description="二进制数据(base64)")
    error_message: Optional[str] = Field(None, description="错误信息")
    warnings: List[str] = Field(default_factory=list, description="警告列表")
    compile_time_ms: int = Field(default=0, description="编译耗时(毫秒)")


class FlashResult(BaseModel):
    """烧录结果"""
    success: bool = Field(..., description="烧录是否成功")
    progress_percent: float = Field(default=0, description="进度百分比")
    error_message: Optional[str] = Field(None, description="错误信息")
    flash_time_ms: int = Field(default=0, description="烧录耗时(毫秒)")


class SerialMonitorData(BaseModel):
    """串口监视器数据"""
    data: str = Field(..., description="接收到的数据")
    timestamp: float = Field(..., description="时间戳")
    is_error: bool = Field(default=False, description="是否为错误信息")


class WebUSBFlashService:
    """
    WebUSB烧录服务

    通过浏览器WebUSB API直接连接Arduino/ESP32设备并烧录代码
    """

    def __init__(self):
        self.connected_device: Optional[SerialPort] = None
        self.serial_monitor_callback = None

    async def list_ports(self) -> List[SerialPort]:
        """
        列出可用的串口设备

        Returns:
            串口设备列表
        """
        # 注意: 实际实现需要前端JavaScript调用navigator.serial.getPorts()
        # 这里返回模拟数据
        return [
            SerialPort(
                port_id="port_1",
                device_path="COM3",
                manufacturer="Arduino LLC",
                product_name="Arduino Nano",
                vendor_id=9025,
                product_id=67,
                is_connected=False
            ),
            SerialPort(
                port_id="port_2",
                device_path="COM4",
                manufacturer="Espressif",
                product_name="ESP32 DevKit",
                vendor_id=4292,
                product_id=60000,
                is_connected=False
            )
        ]

    async def connect_device(self, port_id: str, baud_rate: int = 115200) -> bool:
        """
        连接到指定设备

        Args:
            port_id: 端口ID
            baud_rate: 波特率

        Returns:
            连接是否成功
        """
        # 实际实现需要前端JavaScript:
        # const port = await navigator.serial.requestPort();
        # await port.open({ baudRate: baud_rate });

        self.connected_device = SerialPort(
            port_id=port_id,
            device_path="COM3",
            is_connected=True
        )

        print(f"✅ 已连接到设备: {port_id} (波特率: {baud_rate})")
        return True

    async def disconnect_device(self) -> bool:
        """断开设备连接"""
        if self.connected_device:
            self.connected_device.is_connected = False
            self.connected_device = None
            print("✅ 已断开连接")
            return True
        return False

    async def compile_code(self, arduino_code: str, board_type: str = "arduino_nano") -> CompilationResult:
        """
        编译Arduino代码

        Args:
            arduino_code: Arduino C++代码
            board_type: 开发板类型(arduino_nano/esp32)

        Returns:
            编译结果
        """
        import time
        start_time = time.time()

        try:
            # 实际实现需要调用后端编译服务或PlatformIO CLI
            # 这里模拟编译过程

            # 基本语法检查
            if not arduino_code.strip():
                return CompilationResult(
                    success=False,
                    error_message="代码不能为空"
                )

            if "void setup()" not in arduino_code or "void loop()" not in arduino_code:
                return CompilationResult(
                    success=False,
                    error_message="代码必须包含setup()和loop()函数"
                )

            # 模拟编译成功
            compile_time = int((time.time() - start_time) * 1000)

            return CompilationResult(
                success=True,
                binary_data="base64_encoded_binary_data_here",  # 实际应为编译后的.bin文件
                error_message=None,
                warnings=[],
                compile_time_ms=compile_time
            )

        except Exception as e:
            return CompilationResult(
                success=False,
                error_message=f"编译失败: {str(e)}"
            )

    async def flash_device(self, binary_data: str) -> FlashResult:
        """
        烧录二进制文件到设备

        Args:
            binary_data: 二进制数据(base64编码)

        Returns:
            烧录结果
        """
        import time
        start_time = time.time()

        if not self.connected_device or not self.connected_device.is_connected:
            return FlashResult(
                success=False,
                error_message="设备未连接"
            )

        try:
            # 实际实现需要通过WebSerial发送二进制数据
            # 对于Arduino需要使用avrdude协议
            # 对于ESP32需要使用esptool.py协议

            # 模拟烧录过程
            flash_time = int((time.time() - start_time) * 1000)

            print(f"✅ 烧录成功! 耗时: {flash_time}ms")

            return FlashResult(
                success=True,
                progress_percent=100.0,
                error_message=None,
                flash_time_ms=flash_time
            )

        except Exception as e:
            return FlashResult(
                success=False,
                error_message=f"烧录失败: {str(e)}"
            )

    async def start_serial_monitor(self, baud_rate: int = 9600):
        """
        启动串口监视器

        Args:
            baud_rate: 波特率
        """
        if not self.connected_device:
            raise Exception("设备未连接")

        print(f"📡 串口监视器已启动 (波特率: {baud_rate})")

        # 实际实现需要前端JavaScript持续读取serial port数据
        # 并通过WebSocket或回调函数发送到后端

    async def stop_serial_monitor(self):
        """停止串口监视器"""
        print("📡 串口监视器已停止")

    def get_device_info(self) -> Optional[Dict[str, Any]]:
        """获取当前连接设备的信息"""
        if self.connected_device:
            return self.connected_device.model_dump()
        return None


# Angular前端TypeScript接口定义(供参考)
TYPESCRIPT_INTERFACES = """
// WebUSB烧录服务接口
export interface SerialPort {
  portId: string;
  devicePath: string;
  manufacturer?: string;
  productName?: string;
  vendorId?: number;
  productId?: number;
  isConnected: boolean;
}

export interface CompilationResult {
  success: boolean;
  binaryData?: string;
  errorMessage?: string;
  warnings: string[];
  compileTimeMs: number;
}

export interface FlashResult {
  success: boolean;
  progressPercent: number;
  errorMessage?: string;
  flashTimeMs: number;
}

// WebUSB烧录服务
@Injectable({
  providedIn: 'root'
})
export class WebUSBFlashService {
  private connectedDevice: SerialPort | null = null;

  // 列出可用串口
  async listPorts(): Promise<SerialPort[]> {
    if (!('serial' in navigator)) {
      throw new Error('WebSerial API not supported');
    }

    const ports = await (navigator as any).serial.getPorts();
    return ports.map((port: any, index: number) => ({
      portId: `port_${index}`,
      devicePath: 'Unknown',
      isConnected: false
    }));
  }

  // 连接设备
  async connectDevice(baudRate: number = 115200): Promise<boolean> {
    const port = await (navigator as any).serial.requestPort();
    await port.open({ baudRate });

    this.connectedDevice = {
      portId: 'connected',
      devicePath: 'WebUSB',
      isConnected: true
    };

    return true;
  }

  // 发送代码到设备
  async sendCode(arduinoCode: string): Promise<void> {
    if (!this.connectedDevice) {
      throw new Error('Device not connected');
    }

    // 实际实现需要通过WebSerial发送数据
    console.log('Sending code:', arduinoCode);
  }

  // 读取串口数据
  async readSerialData(callback: (data: string) => void): Promise<void> {
    // 持续读取串口数据并调用回调
  }
}
"""


# 示例使用
if __name__ == "__main__":
    import asyncio

    async def main():
        service = WebUSBFlashService()

        print("=" * 60)
        print("WebUSB烧录服务测试")
        print("=" * 60)

        # 列出端口
        print("\n1. 列出可用串口:")
        ports = await service.list_ports()
        for port in ports:
            print(f"   - {port.device_path}: {port.product_name}")

        # 连接设备
        print("\n2. 连接设备:")
        await service.connect_device("port_1")

        # 编译代码
        print("\n3. 编译Arduino代码:")
        test_code = """
void setup() {
  Serial.begin(9600);
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);
  digitalWrite(LED_BUILTIN, LOW);
  delay(1000);
}
"""
        result = await service.compile_code(test_code, "arduino_nano")
        print(f"   编译结果: {'成功' if result.success else '失败'}")
        if result.success:
            print(f"   编译耗时: {result.compile_time_ms}ms")
        else:
            print(f"   错误: {result.error_message}")

        # 烧录设备
        print("\n4. 烧录到设备:")
        if result.success and result.binary_data:
            flash_result = await service.flash_device(result.binary_data)
            print(f"   烧录结果: {'成功' if flash_result.success else '失败'}")
            if flash_result.success:
                print(f"   烧录耗时: {flash_result.flash_time_ms}ms")

        # 获取设备信息
        print("\n5. 设备信息:")
        info = service.get_device_info()
        if info:
            print(f"   {info}")

        # 断开连接
        print("\n6. 断开连接:")
        await service.disconnect_device()

    asyncio.run(main())
