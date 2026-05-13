# OpenMTSciEd API 端点清单

## 📌 基础信息

**Base URL**: `http://localhost:3000/api`

---

## 🔧 系统端点

| 方法 | 路径 | 说明 | 状态 |
|------|------|------|------|
| GET | `/health` | 健康检查 | ✅ |

---

## 📚 教程管理 (Tutorials)

| 方法 | 路径 | 说明 | 认证 | 状态 |
|------|------|------|------|------|
| GET | `/v1/tutorials` | 获取教程列表 | ❌ | ✅ |
| POST | `/v1/tutorials` | 创建教程 | ❌ | ✅ |
| GET | `/v1/tutorials/:id` | 获取教程详情 | ❌ | ✅ |
| PUT | `/v1/tutorials/:id` | 更新教程 | ❌ | ✅ |
| DELETE | `/v1/tutorials/:id` | 删除教程 | ❌ | ✅ |

**查询参数 (GET /v1/tutorials)**:
- `page`: 页码 (默认: 1)
- `size`: 每页数量 (默认: 20)
- `subject`: 学科筛选
- `grade_level`: 年级筛选

---

## 📖 课件管理 (Coursewares)

| 方法 | 路径 | 说明 | 认证 | 状态 |
|------|------|------|------|------|
| GET | `/v1/coursewares` | 获取课件列表 | ❌ | ✅ |
| POST | `/v1/coursewares` | 创建课件 | ❌ | ✅ |

**查询参数 (GET /v1/coursewares)**:
- `page`: 页码 (默认: 1)
- `size`: 每页数量 (默认: 20)
- `subject`: 学科筛选
- `grade_level`: 年级筛选
- `type`: 课件类型 (pdf/video/interactive)

---

## 🗺️ 知识图谱 - 学习路径 (Knowledge Graph Path)

| 方法 | 路径 | 说明 | 认证 | 状态 |
|------|------|------|------|------|
| POST | `/v1/knowledge-graph/path` | 生成学习路径 | ❌ | ✅ |
| GET | `/v1/knowledge-graph/path` | 获取用户进度 | ❌ | ✅ |

**请求体 (POST /v1/knowledge-graph/path)**:
```json
{
  "user_id": 1,
  "current_grade": "9-12",
  "subjects": ["physics"],
  "learning_goals": ["mechanics"]
}
```

**查询参数 (GET /v1/knowledge-graph/path)**:
- `user_id`: 用户ID (必填)

---

## 💡 知识图谱 - 资源推荐 (Knowledge Graph Recommend)

| 方法 | 路径 | 说明 | 认证 | 状态 |
|------|------|------|------|------|
| POST | `/v1/knowledge-graph/recommend` | 个性化推荐 | ❌ | ✅ |
| GET | `/v1/knowledge-graph/recommend` | 课件推荐 | ❌ | ✅ |

**请求体 (POST /v1/knowledge-graph/recommend)**:
```json
{
  "user_id": 1,
  "limit": 10,
  "subjects": ["physics", "mathematics"]
}
```

**查询参数 (GET /v1/knowledge-graph/recommend)**:
- `user_id`: 用户ID (必填)
- `subject`: 学科筛选 (可选)
- `limit`: 返回数量 (默认: 10)

---

## 🔩 硬件项目管理 (Hardware Projects)

| 方法 | 路径 | 说明 | 认证 | 状态 |
|------|------|------|------|------|
| GET | `/v1/hardware-projects` | 获取项目列表 | ❌ | ✅ |
| POST | `/v1/hardware-projects` | 创建项目 | ❌ | ✅ |

**查询参数 (GET /v1/hardware-projects)**:
- `page`: 页码 (默认: 1)
- `size`: 每页数量 (默认: 20)
- `difficulty`: 难度级别 (beginner/intermediate/advanced)
- `category`: 类别 (electronics/robotics/programming)
- `subject`: 学科筛选

---

## 📊 统计汇总

### 已实现端点总数: **14个**

- 系统端点: 1个
- 教程管理: 5个 (CRUD + 列表)
- 课件管理: 2个 (列表 + 创建)
- 学习路径: 2个 (生成 + 进度)
- 资源推荐: 2个 (教程推荐 + 课件推荐)
- 硬件项目: 2个 (列表 + 创建)

### 功能覆盖

✅ **完整CRUD**: 教程管理  
✅ **列表查询**: 所有模块支持分页和筛选  
✅ **智能算法**: 学习路径生成、个性化推荐  
✅ **图数据库**: Neo4j Cypher查询优化  
✅ **错误处理**: 统一的错误响应格式  
✅ **文档完善**: API文档、测试脚本、快速启动指南  

---

## 🔐 认证说明

当前所有端点均未启用认证(开发模式)。生产环境建议:

1. 为写操作(POST/PUT/DELETE)添加JWT认证
2. 实现基于角色的访问控制(RBAC)
3. 添加速率限制防止滥用
4. 启用CORS配置

---

## 📝 响应格式标准

### 成功响应

**列表查询**:
```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "size": 20,
  "total_pages": 5
}
```

**单个资源**:
```json
{
  "id": "...",
  "title": "...",
  ...
}
```

**创建成功**:
```json
{
  "id": "...",
  "message": "Created successfully"
}
```

### 错误响应

```json
{
  "error": "错误描述",
  "details": "详细错误信息"
}
```

**HTTP状态码**:
- 200: 成功
- 201: 创建成功
- 400: 请求参数错误
- 404: 资源未找到
- 500: 服务器内部错误

---

## 🧪 测试命令速查

### PowerShell

```powershell
# 健康检查
Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method Get

# 获取教程列表
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/tutorials?page=1&size=5" -Method Get

# 创建教程
$body = @{ id="test_001"; title="测试"; grade_level="9-12"; subject="physics" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/tutorials" -Method Post -Body $body -ContentType "application/json"

# 生成学习路径
$body = @{ user_id=1; current_grade="9-12"; subjects=@("physics") } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/knowledge-graph/path" -Method Post -Body $body -ContentType "application/json"

# 运行完整测试
.\test-openmtscied-apis.ps1
```

### cURL (Linux/Mac)

```bash
# 健康检查
curl http://localhost:3000/api/health

# 获取教程列表
curl "http://localhost:3000/api/v1/tutorials?page=1&size=5"

# 创建教程
curl -X POST http://localhost:3000/api/v1/tutorials \
  -H "Content-Type: application/json" \
  -d '{"id":"test_001","title":"测试","grade_level":"9-12","subject":"physics"}'

# 生成学习路径
curl -X POST http://localhost:3000/api/v1/knowledge-graph/path \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"current_grade":"9-12","subjects":["physics"]}'
```

---

## 📖 相关文档

- **完整API文档**: `API_DOCUMENTATION.md`
- **开发完成报告**: `API_DEVELOPMENT_COMPLETE.md`
- **快速启动指南**: `QUICK_START_API.md`
- **实施计划**: `../OPENMTSCIED_API_IMPLEMENTATION.md`

---

**最后更新**: 2026-05-13  
**API版本**: v1.0.0
