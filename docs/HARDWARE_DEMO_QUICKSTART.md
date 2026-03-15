# 🚀 硬件通信原型快速开始指南

## 📋 准备工作

### 1. 环境要求
- **Flutter SDK** 3.0+ ([下载安装](https://flutter.dev/docs/get-started/install))
- **支持WebUSB的浏览器** (Chrome 61+, Edge 79+)
- **USB硬件设备** (Arduino Uno/Nano, ESP32等)

### 2. 硬件准备
1. 准备一块Arduino Uno或其他兼容设备
2. 将 `docs/arduino_test_sketch.ino` 上传到设备
3. 通过USB线连接设备到电脑

## ▶️ 快速启动

### 方法一：使用自动化脚本（推荐）

```powershell
# Windows PowerShell
cd g:\iMato
.\scripts\setup-hardware-demo.ps1
```

### 方法二：手动启动

```bash
# 1. 进入Flutter项目目录
cd flutter_app

# 2. 获取依赖
flutter pub get

# 3. 运行测试（可选）
flutter test

# 4. 启动Web应用
flutter run -d chrome
```

## 🎮 使用演示

1. 应用启动后，在主页找到 **"WebUSB 硬件通信演示"** 入口
2. 点击进入硬件通信演示页面
3. 点击 **"连接设备"** 按钮
4. 在浏览器弹出的设备选择对话框中选择你的Arduino设备
5. 使用预设按钮或自定义命令与硬件交互

## 🔧 预设命令说明

| 命令 | 功能 | 字节序列 |
|------|------|----------|
| 初始化 | 设备初始化测试 | `[0x01, 0x02, 0x03]` |
| 状态查询 | 查询设备当前状态 | `[0x10, 0x00]` |
| LED控制 | 控制LED开关和亮度 | `[0x20, 0x01, 0xFF]` |

## 📱 界面功能

### 连接管理
- 实时显示连接状态
- 一键连接/断开设备
- 支持指定Vendor ID和Product ID

### 命令发送
- 预设常用命令按钮
- 自定义命令输入框
- 支持十六进制和十进制格式

### 调试信息
- 实时通信日志
- 数据收发记录
- 错误信息提示

## 🔍 故障排除

### 常见问题

**Q: 浏览器提示不支持WebUSB？**
A: 确保使用Chrome 61+或Edge 79+，并且在HTTPS环境下运行

**Q: 找不到USB设备？**
A: 检查设备是否正确连接，确认设备驱动正常安装

**Q: 连接总是失败？**
A: 确保没有其他程序占用该USB端口，尝试重新插拔设备

**Q: 收不到设备响应？**
A: 检查Arduino固件是否正确上传，查看串口监视器输出

### 调试技巧

1. 打开浏览器开发者工具查看控制台日志
2. 使用Arduino IDE的串口监视器查看设备端输出
3. 检查设备管理器中的USB设备信息

## 📚 进阶使用

### 自定义设备支持
修改 `utils/usb_device_utils.dart` 添加新的设备信息：

```dart
static const myCustomDevice = UsbDeviceInfo(
  vendorId: 0x1234,
  productId: 0x5678,
  name: 'My Device',
  description: 'Custom hardware device',
);
```

### 扩展通信协议
在 `services/hardware_communication_service.dart` 中添加新的协议处理方法。

## 🤝 获取帮助

- 查看详细文档: `docs/HARDWARE_COMMUNICATION_README.md`
- 运行单元测试: `flutter test test/hardware_communication_test.dart`
- 提交Issue: 在GitHub仓库中创建issue

---
*iMatuProject - 让硬件交互变得更简单*