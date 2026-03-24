# Admin 全局 API 设置模块使用指南

## 📋 功能概述

Admin 全局 API 设置模块提供了统一的界面来管理所有外部服务和第三方集成的 API 配置，包括：

- **OpenHydra** - 第三方服务集成
- **JupyterHub** - 教育平台集成  
- **数据库连接** - PostgreSQL/MySQL等数据库配置
- **MQTT** - 消息推送服务
- **Prometheus** - 监控指标采集
- **Celery** - 分布式任务队列
- **对象存储** - S3 兼容存储服务（AWS S3、阿里云 OSS、腾讯云 COS、MinIO）
- **AI 服务** - OpenAI/Claude 等 AI 服务配置

---

## 🚀 快速开始

### 1. 访问设置页面

登录 Admin 后台后：
- 导航到 **"数据中心"** → **"API 设置"**
- 或直接访问：`http://your-domain/admin/api-settings`

### 2. 配置服务

每个服务类型都有独立的 Tab 页面：

#### OpenHydra 配置
```
API URL: http://localhost:8080 (必填)
API Key: your-api-key
超时时间：5000ms
启用服务：☑️
```

#### JupyterHub 配置
```
URL: http://localhost:8000 (必填)
API Token: your-token
默认角色：user/admin/instructor
启用服务：☑️
```

#### 数据库连接配置
```
连接名称：主数据库
主机地址：localhost
端口：5432
数据库名：imato_main
用户名：postgres
密码：******
SSL: ☐
连接池大小：10
启用：☑️
```

#### MQTT 配置
```
Broker URL: tcp://localhost
端口：1883
用户名：mqtt_user
密码：******
TLS: ☐
QoS: 1
启用服务：☑️
```

#### Prometheus 配置
```
Server URL: http://localhost:9090
Metrics Endpoint: /metrics
采集间隔：15 秒
启用监控：☑️
```

#### Celery 配置
```
Broker URL: redis://localhost:6379/0
Result Backend: redis://localhost:6379/0
默认队列：default
Worker 数量：4
启用任务队列：☑️
```

#### 对象存储配置
```
服务提供商：MinIO / AWS S3 / 阿里云 OSS / 腾讯云 COS
Access Key: your-access-key
Secret Key: your-secret-key
Bucket: imato-storage
区域：us-east-1
Endpoint: http://localhost:9000
启用存储：☑️
```

#### AI 服务配置
```
服务名称：OpenAI GPT
API 端点：https://api.openai.com/v1
API Key: sk-***
模型：gpt-4
最大 Token: 2048
温度：0.7
启用服务：☑️
```

---

## 🔧 功能说明

### 测试连接

每个支持测试的服务都提供 **"测试连接"** 按钮：

1. 填写配置信息
2. 点击对应 Tab 的 "测试连接" 按钮
3. 系统会显示测试结果和响应时间
4. 如果失败，检查网络和配置信息

### 保存设置

1. 填写完所有必填项（标记 * 的字段）
2. 点击右上角 **"保存"** 按钮
3. 系统会自动保存到本地缓存和后端（如果可用）
4. 成功后会显示提示消息

### 刷新配置

点击 **"刷新"** 按钮可以重新加载服务器上的最新配置。

---

## 💾 数据存储

### 本地缓存
- 所有设置都会自动保存到 `localStorage`
- Key: `admin_api_settings_cache`
- 即使后端 API 不可用也能查看历史配置

### 后端同步
- 如果后端 API 可用，设置会同步到服务器
- API 路径：`/api/v1/admin/settings`
- 支持配置的持久化和多用户共享

---

## ⚠️ 注意事项

### 必填字段验证
- 标记 `*` 的字段为必填项
- 未填写时无法保存
- 系统会高亮显示错误字段

### 安全建议
- API 密钥和密码会进行加密存储
- 建议定期更新敏感凭证
- 生产环境请使用 HTTPS 连接

### 降级机制
- 如果后端 API 不可用，系统会自动切换到 Mock 数据模式
- 可以在开发环境中正常使用所有功能
- Mock 数据已预配置了常用服务的示例值

---

## 🔌 后端 API 要求

如需完整功能，后端需要提供以下接口：

### 获取设置
```
GET /api/v1/admin/settings
Response: ApiSettingsResponse
```

### 保存设置
```
POST /api/v1/admin/settings
Body: GlobalApiSettings
Response: ApiSettingsResponse
```

### 测试数据库连接（可选）
```
POST /api/v1/admin/settings/test-database
Body: DatabaseConnectionConfig
Response: { success: boolean, message: string }
```

### 测试 MQTT 连接（可选）
```
POST /api/v1/admin/settings/test-mqtt
Body: MqttConfig
Response: { success: boolean, message: string }
```

---

## 🎨 UI/UX 特性

- ✅ 响应式设计，支持桌面和移动端
- ✅ Material Design 风格，与 Angular Material 主题一致
- ✅ Tab 分页展示，清晰的视觉层次
- ✅ 实时表单验证
- ✅ Toast 消息提示
- ✅ 加载状态指示器
- ✅ 空状态提示

---

## 📝 示例场景

### 场景 1: 配置 OpenHydra 集成

1. 打开 "OpenHydra" Tab
2. 填写 API URL: `http://openhydra.example.com`
3. 填写 API Key: `oh_prod_key_12345`
4. 勾选 "启用 OpenHydra 服务"
5. 点击 "测试连接" 验证
6. 点击 "保存" 完成配置

### 场景 2: 添加多个数据库连接

1. 打开 "数据库连接" Tab
2. 点击右上角 "+" 按钮添加新连接
3. 填写第一个数据库信息（主库）
4. 再次点击 "+" 添加第二个数据库（从库）
5. 分别测试每个连接
6. 保存配置

### 场景 3: 配置 AI 服务

1. 打开 "AI 服务" Tab
2. 点击右上角 "+" 按钮
3. 选择服务提供商（如 OpenAI）
4. 填写 API 端点和密钥
5. 选择模型和调整参数
6. 测试连接并保存

---

## 🛠️ 故障排查

### 问题：无法保存设置

**解决方案：**
1. 检查是否所有必填项都已填写
2. 查看浏览器控制台是否有错误信息
3. 确认后端 API 服务正常运行
4. 检查网络连接状态

### 问题：测试连接失败

**解决方案：**
1. 确认服务地址和端口正确
2. 检查防火墙设置
3. 验证 API 密钥是否有效
4. 查看服务端的日志输出

### 问题：页面加载缓慢

**解决方案：**
1. 清除浏览器缓存
2. 检查网络延迟
3. 如果是首次加载，可能需要加载 Mock 数据
4. 考虑减少不必要的服务配置

---

## 📞 技术支持

如有问题或需要额外帮助，请联系：
- 技术支持邮箱：support@imato.com
- 项目文档：https://docs.imato.com
- GitHub Issues: https://github.com/imato/issues

---

**最后更新时间**: 2026-03-24  
**版本**: v1.0.0
