# iMato企业API网关技术文档

## 概述

iMato企业API网关为企业客户提供安全、可靠的API访问服务，基于OAuth2.0协议实现企业级认证和授权管理。

## 架构设计

### 核心组件

```
企业API网关
├── 认证服务层 (Authentication Layer)
│   ├── OAuth2.0认证服务
│   ├── JWT令牌管理
│   └── 客户端凭据验证
├── 授权管理层 (Authorization Layer)
│   ├── 企业认证中间件
│   ├── 设备白名单检查
│   └── API配额控制
├── 业务逻辑层 (Business Logic Layer)
│   ├── 设备管理服务
│   ├── 监控统计服务
│   └── 日志记录服务
└── 数据访问层 (Data Access Layer)
    ├── 企业客户模型
    ├── 设备白名单模型
    └── 访问日志模型
```

### 数据模型

#### 企业客户模型 (EnterpriseClient)
```python
class EnterpriseClient(Base):
    id = Column(Integer, primary_key=True)
    client_name = Column(String(100))           # 企业名称
    client_id = Column(String(50), unique=True) # OAuth2 client_id
    client_secret = Column(String(100))         # 加密的client_secret
    redirect_uris = Column(Text)                # 允许的回调地址
    is_active = Column(Boolean, default=True)   # 账户状态
    api_quota_limit = Column(Integer)           # API调用配额
    current_usage = Column(Integer)             # 当前使用量
    contact_email = Column(String(100))         # 联系邮箱
    company_info = Column(JSON)                 # 企业详细信息
```

#### 设备白名单模型 (DeviceWhitelist)
```python
class DeviceWhitelist(Base):
    id = Column(Integer, primary_key=True)
    enterprise_client_id = Column(Integer, ForeignKey('enterprise_clients.id'))
    device_id = Column(String(100))             # 设备唯一标识
    device_name = Column(String(100))           # 设备名称
    ip_address = Column(String(45))             # IP地址
    mac_address = Column(String(17))            # MAC地址
    user_agent = Column(String(500))            # 用户代理
    is_approved = Column(Boolean, default=False) # 是否批准
    approved_at = Column(DateTime)              # 批准时间
    expires_at = Column(DateTime)               # 过期时间
```

#### 访问日志模型 (EnterpriseAPILog)
```python
class EnterpriseAPILog(Base):
    id = Column(Integer, primary_key=True)
    enterprise_client_id = Column(Integer, ForeignKey('enterprise_clients.id'))
    device_id = Column(String(100))             # 设备标识
    api_endpoint = Column(String(200))          # API端点
    http_method = Column(String(10))            # HTTP方法
    status_code = Column(Integer)               # 状态码
    response_time = Column(Float)               # 响应时间(ms)
    request_size = Column(Integer)              # 请求大小
    response_size = Column(Integer)             # 响应大小
    user_agent = Column(String(500))            # 用户代理
    ip_address = Column(String(45))             # IP地址
    timestamp = Column(DateTime)                # 访问时间
```

## 认证流程

### OAuth2.0 Client Credentials流程

1. **客户端注册**
   ```
   POST /api/enterprise/clients
   {
     "client_name": "MyCompany API Client",
     "contact_email": "admin@mycompany.com"
   }
   ```

2. **获取访问令牌**
   ```
   POST /api/enterprise/oauth/token
   Content-Type: application/x-www-form-urlencoded
   
   grant_type=client_credentials&
   client_id=ent_1234567890_abcd1234&
   client_secret=your_client_secret
   ```

3. **使用访问令牌调用API**
   ```
   GET /api/enterprise/monitoring/stats/my_client_id
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   X-Device-ID: device_fingerprint_12345
   ```

### 设备白名单验证

当启用设备白名单功能时，每次API调用都需要提供设备标识：

```python
# 设备标识可以通过以下方式提供：
# 1. 自定义请求头
X-Device-ID: device_unique_identifier

# 2. 从User-Agent和IP生成指纹
# 系统会自动生成设备指纹用于验证
```

## API端点说明

### 认证相关端点

#### 获取访问令牌
```
POST /api/enterprise/oauth/token
```
**请求参数：**
- `grant_type`: 授权类型 (client_credentials)
- `client_id`: 客户端ID
- `client_secret`: 客户端密钥

**响应示例：**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 86400,
  "scope": "api:read"
}
```

#### 撤销令牌
```
POST /api/enterprise/oauth/revoke
```

#### 令牌内省
```
GET /api/enterprise/oauth/introspect?token={access_token}
```

### 设备管理端点

#### 审批设备
```
POST /api/enterprise/devices/approve
```

#### 获取设备列表
```
GET /api/enterprise/devices/{client_id}?include_expired=false
```

#### 更新设备状态
```
PUT /api/enterprise/devices/{device_id}
```

#### 移除设备
```
DELETE /api/enterprise/devices/{device_id}
```

### 监控统计端点

#### 客户端使用统计
```
GET /api/enterprise/monitoring/stats/{client_id}?days=30
```

#### API访问日志
```
GET /api/enterprise/monitoring/logs/{client_id}?limit=100&offset=0
```

#### 实时指标
```
GET /api/enterprise/monitoring/realtime/{client_id}?minutes=5
```

#### 告警信息
```
GET /api/enterprise/monitoring/alerts/{client_id}
```

## 安全特性

### 1. 客户端认证
- 使用OAuth2.0 Client Credentials流程
- 客户端密钥加密存储
- 支持令牌刷新机制

### 2. 设备控制
- 设备白名单管理
- 设备指纹识别
- IP地址验证
- 访问过期控制

### 3. 访问控制
- API调用配额限制
- 速率限制
- 细粒度权限控制
- 完整的审计日志

### 4. 数据保护
- 敏感信息加密存储
- HTTPS强制传输
- 输入验证和清理
- SQL注入防护

## 配置说明

### 环境变量配置

```bash
# 应用配置
APP_NAME=iMato企业API网关
APP_VERSION=1.0.0
DEBUG=True
HOST=0.0.0.0
PORT=8001

# 数据库配置
ENTERPRISE_DATABASE_URL=postgresql://user:pass@host:port/dbname

# JWT配置
ENTERPRISE_JWT_SECRET=your-32-character-secret-key
ENTERPRISE_JWT_ALGORITHM=HS256
ENTERPRISE_TOKEN_EXPIRE_HOURS=24

# 安全配置
DEVICE_WHITELIST_ENABLED=true
DEFAULT_DEVICE_APPROVAL_PERIOD_DAYS=365
DEFAULT_API_QUOTA_LIMIT=10000
API_RATE_LIMIT_PER_HOUR=1000
```

### 部署配置

#### Docker部署
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.enterprise.txt .
RUN pip install -r requirements.enterprise.txt

COPY ./backend/enterprise_gateway/ ./enterprise_gateway/
COPY ./backend/config/ ./config/

EXPOSE 8001

CMD ["uvicorn", "enterprise_gateway.main:app", "--host", "0.0.0.0", "--port", "8001"]
```

#### Nginx反向代理
```nginx
upstream enterprise_api {
    server enterprise-gateway:8001;
}

server {
    listen 443 ssl;
    server_name enterprise.api.imato.com;
    
    location /api/enterprise/ {
        proxy_pass http://enterprise_api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Device-ID $http_x_device_id;
    }
}
```

## 监控和运维

### 健康检查
```
GET /health
GET /
```

### 日志管理
- 应用日志：`logs/enterprise_gateway.log`
- 访问日志：存储在数据库中
- 安全日志：记录认证失败等安全事件

### 性能监控
- 响应时间统计
- API调用成功率
- 系统资源使用情况
- 数据库性能指标

### 告警机制
- 配额使用预警（90%、95%）
- 高错误率告警
- 系统异常告警
- 安全事件告警

## 最佳实践

### 1. 客户端管理
- 定期轮换客户端密钥
- 限制回调地址范围
- 监控API使用模式
- 及时处理异常访问

### 2. 设备管理
- 定期审查设备白名单
- 设置合理的设备过期时间
- 监控设备访问模式
- 及时移除不再使用的设备

### 3. 安全运维
- 启用HTTPS强制传输
- 定期安全审计
- 保持系统和依赖更新
- 实施备份和灾难恢复计划

### 4. 性能优化
- 合理设置API配额
- 使用缓存减少数据库压力
- 优化数据库索引
- 监控和调优系统性能

## 故障排除

### 常见问题

1. **认证失败**
   - 检查客户端凭据是否正确
   - 验证令牌是否过期
   - 确认设备是否在白名单中

2. **配额超限**
   - 检查当前配额使用情况
   - 申请提高配额限制
   - 优化API调用频率

3. **设备访问被拒**
   - 确认设备已获得批准
   - 检查设备是否已过期
   - 验证IP地址是否匹配

### 调试工具

- Swagger UI文档：`/docs`
- ReDoc文档：`/redoc`
- 健康检查端点：`/health`
- OpenAPI规范：`/openapi.json`

## 版本历史

### v1.0.0 (当前版本)
- 基础OAuth2.0认证功能
- 设备白名单管理
- API使用监控
- 完整的Swagger文档
- 企业级安全特性

### 未来规划
- 多租户支持
- 更细粒度的权限控制
- GraphQL支持
- 实时WebSocket通知
