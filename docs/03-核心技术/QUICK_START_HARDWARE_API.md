# 硬件项目API快速启动指南

## 🚀 5分钟快速开始

### 前提条件

- Python 3.8+
- PostgreSQL数据库（Neon）
- Node.js 16+ (前端开发)

### 步骤1: 配置环境变量

确保 `.env` 文件中包含正确的数据库连接：

```env
DATABASE_URL=postgresql+asyncpg://user:password@host:port/database
```

### 步骤2: 启动后端服务

```bash
# 进入项目根目录
cd g:\OpenMTSciEd

# 安装依赖（如果尚未安装）
pip install -r requirements.txt

# 启动FastAPI服务
python src/main.py
```

服务将在 `http://localhost:8000` 启动

### 步骤3: 验证API

打开浏览器访问 Swagger UI：
```
http://localhost:8000/docs
```

或者使用测试脚本：
```bash
pip install httpx
python test_hardware_project_api.py
```

### 步骤4: 测试API端点

#### 使用curl测试

```bash
# 获取项目列表
curl http://localhost:8000/api/v1/hardware/projects/

# 按分类筛选
curl "http://localhost:8000/api/v1/hardware/projects/?category=sensor&limit=5"

# 搜索项目
curl "http://localhost:8000/api/v1/hardware/projects/?search=超声波"

# 获取分类列表
curl http://localhost:8000/api/v1/hardware/projects/categories

# 获取统计信息
curl http://localhost:8000/api/v1/hardware/projects/stats/summary
```

#### 使用Python测试

```python
import requests

# 获取所有项目
response = requests.get('http://localhost:8000/api/v1/hardware/projects/')
projects = response.json()
print(f"找到 {len(projects)} 个项目")

# 获取单个项目
project_id = projects[0]['project_id'] if projects else None
if project_id:
    response = requests.get(f'http://localhost:8000/api/v1/hardware/projects/{project_id}')
    project = response.json()
    print(f"项目: {project['title']}")
```

### 步骤5: 前端集成（可选）

```bash
# 进入前端项目
cd desktop-manager

# 安装依赖
npm install

# 启动开发服务器
npm start
```

在Angular组件中使用：

```typescript
import { HardwareProjectService } from './services/hardware-project.service';

constructor(private hardwareService: HardwareProjectService) {}

ngOnInit() {
  // 获取项目列表
  this.hardwareService.getProjects().subscribe(result => {
    console.log('项目列表:', result.projects);
  });
  
  // 按分类获取
  this.hardwareService.getProjectsByCategory('sensor').subscribe(projects => {
    console.log('传感器项目:', projects);
  });
}
```

## 📋 常用API调用示例

### 1. 获取所有项目

```javascript
fetch('http://localhost:8000/api/v1/hardware/projects/')
  .then(res => res.json())
  .then(projects => console.log(projects));
```

### 2. 筛选和分页

```javascript
// 获取传感器类项目，每页10个
fetch('http://localhost:8000/api/v1/hardware/projects/?category=sensor&limit=10&offset=0')
  .then(res => res.json())
  .then(projects => console.log(projects));
```

### 3. 创建新项目

```javascript
fetch('http://localhost:8000/api/v1/hardware/projects/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    project_id: 'HW-Custom-001',
    title: '我的第一个项目',
    category: 'electronics',
    difficulty: 1,
    subject: '物理',
    description: '这是一个简单的项目',
    total_cost: 20.0,
    estimated_time_hours: 1.5,
    mcu_type: 'arduino_nano',
    is_active: true
  })
})
.then(res => res.json())
.then(project => console.log('创建成功:', project));
```

### 4. 更新项目

```javascript
fetch('http://localhost:8000/api/v1/hardware/projects/HW-Custom-001', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: '更新后的项目名称',
    description: '更新的描述'
  })
})
.then(res => res.json())
.then(project => console.log('更新成功:', project));
```

### 5. 删除项目

```javascript
fetch('http://localhost:8000/api/v1/hardware/projects/HW-Custom-001', {
  method: 'DELETE'
})
.then(res => res.json())
.then(result => console.log('删除结果:', result));
```

## 🔍 故障排除

### 问题1: 连接数据库失败

**错误信息**: `Connection refused` 或 `Database connection error`

**解决方案**:
1. 检查 `.env` 文件中的 `DATABASE_URL` 是否正确
2. 确认PostgreSQL服务正在运行
3. 验证网络连接（如果使用远程数据库）

### 问题2: API返回404

**错误信息**: `404 Not Found`

**解决方案**:
1. 确认后端服务已启动
2. 检查URL路径是否正确
3. 查看控制台日志确认路由已注册

### 问题3: CORS错误

**错误信息**: `Access to fetch has been blocked by CORS policy`

**解决方案**:
已在 `src/main.py` 中配置CORS，允许所有来源。如需限制，修改：
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # 指定允许的域名
    ...
)
```

### 问题4: 返回空列表

**可能原因**:
1. 数据库中没有数据
2. 筛选条件过于严格

**解决方案**:
```bash
# 检查数据库中是否有数据
curl http://localhost:8000/api/v1/hardware/projects/

# 移除所有筛选条件
curl "http://localhost:8000/api/v1/hardware/projects/?limit=100"
```

## 📊 API端点速查表

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/v1/hardware/projects/` | GET | 获取项目列表 |
| `/api/v1/hardware/projects/{id}` | GET | 获取单个项目 |
| `/api/v1/hardware/projects/` | POST | 创建项目 |
| `/api/v1/hardware/projects/{id}` | PUT | 更新项目 |
| `/api/v1/hardware/projects/{id}` | DELETE | 删除项目 |
| `/api/v1/hardware/projects/categories` | GET | 获取分类列表 |
| `/api/v1/hardware/projects/stats/summary` | GET | 获取统计信息 |

## 💡 提示和技巧

### 1. 使用Swagger UI

访问 `http://localhost:8000/docs` 可以：
- 查看所有API端点
- 在线测试API
- 查看请求/响应模型
- 下载OpenAPI规范

### 2. 查看日志

后端日志会显示：
- API请求详情
- 数据库查询
- 错误信息

```
INFO:     127.0.0.1:xxxxx - "GET /api/v1/hardware/projects/ HTTP/1.1" 200 OK
```

### 3. 性能优化

对于大量数据：
- 使用 `limit` 参数限制返回数量
- 实现前端缓存
- 考虑添加Redis缓存层

### 4. 调试技巧

```python
# 在后端代码中添加日志
logger.info(f"查询参数: category={category}, difficulty={difficulty}")
logger.debug(f"SQL查询: {query}")
```

## 🎯 下一步

1. **阅读完整文档**: `HARDWARE_PROJECT_API_INTEGRATION.md`
2. **查看完成报告**: `HARDWARE_PROJECT_COMPLETION_REPORT.md`
3. **自定义前端组件**: 根据UI需求调整组件样式和功能
4. **添加认证**: 实现JWT或其他认证机制
5. **部署到生产**: 配置生产环境变量和部署流程

## 📞 需要帮助？

- 查看Swagger文档: http://localhost:8000/docs
- 查看日志输出
- 参考示例代码
- 阅读完整集成文档

---

**祝使用愉快！** 🎉