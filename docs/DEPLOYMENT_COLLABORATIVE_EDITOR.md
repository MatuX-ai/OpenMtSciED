# 教师协作编辑系统部署指南

## 系统概述

教师协作编辑系统是一个基于 Operational Transformation 算法的实时协同编辑解决方案，支持多用户同时编辑、评论批注、建议审核等功能。

## 部署架构

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   前端应用      │    │   后端服务       │    │   数据存储      │
│  (Angular)      │◄──►│  (FastAPI)       │◄──►│ (PostgreSQL)    │
│                 │    │                  │    │                 │
│ • 编辑器组件    │    │ • API路由        │    │ • 文档数据      │
│ • OT算法        │    │ • WebSocket服务  │    │ • 操作历史      │
│ • UI界面        │    │ • 权限验证       │    │ • 用户会话      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 环境要求

### 后端环境
- Python 3.8+
- PostgreSQL 12+
- Redis 6+ (用于会话管理)
- pip包管理器

### 前端环境
- Node.js 16+
- npm 8+
- Angular CLI 16+

## 部署步骤

### 1. 后端部署

#### 安装依赖
```bash
cd backend
pip install -r requirements.txt
```

#### 数据库配置
```sql
-- 创建数据库
CREATE DATABASE collaborative_editor;
CREATE USER editor_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE collaborative_editor TO editor_user;
```

#### 环境变量配置
创建 `.env` 文件：
```env
# 数据库配置
DATABASE_URL=postgresql://editor_user:secure_password@localhost:5432/collaborative_editor

# Redis配置
REDIS_URL=redis://localhost:6379/0

# 应用配置
APP_NAME=CollaborativeEditor
APP_VERSION=1.0.0
DEBUG=False
HOST=0.0.0.0
PORT=8000

# 安全配置
SECRET_KEY=your-secret-key-here
ALLOWED_ORIGINS=http://localhost:4200,https://your-domain.com
```

#### 初始化数据库
```bash
cd backend
python setup_database.py
```

#### 启动服务
```bash
# 开发模式
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 生产模式
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

### 2. 前端部署

#### 安装依赖
```bash
npm install
```

#### 构建生产版本
```bash
npm run build --prod
```

#### 部署静态文件
将 `dist/` 目录下的文件部署到Web服务器：
```bash
# 使用Nginx示例配置
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        root /path/to/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 3. 系统配置

#### 组件集成
在Angular模块中导入协作编辑模块：

```typescript
// app.module.ts
import { CollaborativeEditorModule } from './shared/components/collaborative-editor/collaborative-editor.module';

@NgModule({
  imports: [
    // ... 其他模块
    CollaborativeEditorModule
  ]
})
export class AppModule { }
```

#### 在组件中使用
```html
<!-- course-editor.component.html -->
<app-collaborative-editor
  [courseId]="courseId"
  [orgId]="orgId" 
  [documentId]="documentId"
  [userId]="currentUserId"
  [userName]="currentUser.name"
  (contentChange)="onContentChange($event)"
  (documentLoaded)="onDocumentLoaded($event)">
</app-collaborative-editor>
```

```typescript
// course-editor.component.ts
export class CourseEditorComponent {
  courseId = 101;
  orgId = 1;
  documentId = 1;
  currentUserId = 123;
  currentUser = { name: '张老师' };

  onContentChange(content: string) {
    console.log('文档内容已更新:', content);
  }

  onDocumentLoaded(document: any) {
    console.log('文档加载完成:', document);
  }
}
```

## 性能优化

### 后端优化
1. **数据库索引优化**
```sql
CREATE INDEX idx_document_operations_document_revision 
ON document_operations(document_id, revision);

CREATE INDEX idx_document_sessions_active 
ON document_sessions(is_active);
```

2. **Redis缓存配置**
```python
# 在服务中添加缓存层
import redis
from functools import lru_cache

redis_client = redis.from_url(os.getenv('REDIS_URL'))

@lru_cache(maxsize=1000)
def get_document_cache(document_id: int):
    cache_key = f"document:{document_id}"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    return None
```

3. **WebSocket连接池**
```python
# 限制单个用户的连接数
MAX_CONNECTIONS_PER_USER = 3

class ConnectionLimiter:
    def __init__(self):
        self.user_connections = defaultdict(int)
    
    def can_connect(self, user_id: int) -> bool:
        return self.user_connections[user_id] < MAX_CONNECTIONS_PER_USER
```

### 前端优化
1. **操作批处理**
```typescript
// 合并短时间内频繁的操作
private operationBuffer: any[] = [];
private bufferTimer: any;

private scheduleOperationSync() {
  if (this.bufferTimer) {
    clearTimeout(this.bufferTimer);
  }
  
  this.bufferTimer = setTimeout(() => {
    if (this.operationBuffer.length > 0) {
      this.syncOperations();
      this.operationBuffer = [];
    }
  }, 100); // 100ms延迟
}
```

2. **虚拟滚动**
对于大型文档，实现虚拟滚动以提高渲染性能。

## 监控和日志

### 日志配置
```python
# backend/utils/logger.py
import logging
import logging.handlers

def setup_logger(level="INFO", log_file="collaborative_editor.log"):
    logger = logging.getLogger("collaborative_editor")
    logger.setLevel(getattr(logging, level.upper()))
    
    # 文件处理器
    file_handler = logging.handlers.RotatingFileHandler(
        log_file, maxBytes=10*1024*1024, backupCount=5
    )
    file_handler.setFormatter(
        logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    )
    
    # 控制台处理器
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(
        logging.Formatter('%(levelname)s - %(message)s')
    )
    
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger
```

### 性能监控
```python
# 添加性能监控中间件
from starlette.middleware.base import BaseHTTPMiddleware
import time

class PerformanceMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        
        # 记录慢查询
        if process_time > 1.0:
            logger.warning(f"Slow request: {request.url} took {process_time:.2f}s")
            
        response.headers["X-Process-Time"] = str(process_time)
        return response
```

## 安全配置

### CORS配置
```python
# 严格限制允许的源
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-production-domain.com",
        "https://admin.your-domain.com"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

### 权限验证
```python
# 强制JWT验证
from fastapi.security import HTTPBearer
from jose import jwt

security = HTTPBearer()

async def verify_token(credentials: HTTPBearer = Depends(security)):
    try:
        payload = jwt.decode(
            credentials.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        return payload
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="无效的令牌")
```

## 故障排除

### 常见问题

1. **WebSocket连接失败**
   - 检查防火墙设置
   - 确认Nginx代理配置正确
   - 验证SSL证书配置

2. **操作同步延迟高**
   - 检查网络延迟
   - 优化数据库查询
   - 增加服务器资源

3. **内存使用过高**
   - 实施操作历史清理策略
   - 限制文档大小
   - 优化前端渲染

### 健康检查端点
```bash
# 检查服务状态
curl http://localhost:8000/health

# 检查API文档
curl http://localhost:8000/docs

# 测试WebSocket连接
websocat ws://localhost:8000/api/v1/org/1/courses/101/collaborative-documents/1/ws?session_id=test
```

## 维护计划

### 定期任务
```bash
# 每天凌晨清理过期会话
0 2 * * * /path/to/cleanup_sessions.sh

# 每周备份数据库
0 3 * * 0 pg_dump collaborative_editor > /backup/editor_$(date +%Y%m%d).sql

# 每月清理旧操作日志
0 4 1 * * find /var/log/collaborative_editor -name "*.log" -mtime +30 -delete
```

### 升级步骤
1. 备份当前数据库
2. 停止服务
3. 拉取新代码
4. 运行数据库迁移
5. 启动服务
6. 验证功能

这个部署指南提供了完整的生产环境部署方案，包括性能优化、安全配置和监控措施。
