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

---

## 🧭 学习路径闭包表 (Learning Path — PostgreSQL)

| 方法 | 路径 | 说明 | 认证 | 状态 |
|------|------|------|------|------|
| GET | `/v1/learning-path/prerequisites/:conceptId` | 前置依赖（depth DESC） | ❌ | ✅ |
| GET | `/v1/learning-path/successors/:conceptId` | 后续可学（depth ASC） | ❌ | ✅ |
| GET | `/v1/learning-path/route` | 完整路径链条 | ❌ | ✅ |

**查询参数**:
- `path_type`: 路径类型 (默认: `required`)

**示例**:
```bash
curl "http://localhost:3000/api/v1/learning-path/prerequisites/42?path_type=required"
curl "http://localhost:3000/api/v1/learning-path/route?from=3&to=42&path_type=required"
```

---

## 🛤️ Desktop 路径兼容 (Path Shim)

| 方法 | 路径 | 说明 | 认证 | 状态 |
|------|------|------|------|------|
| POST | `/v1/path/generate` | path-visualization 路径生成 | ❌ | ✅ |
| GET | `/v1/path/dynamic-adjust/:userId` | 动态调整建议 | ❌ | ✅ |

**请求体 (POST /v1/path/generate)**:
```json
{ "user_id": "test_user_001", "age": 14, "grade_level": "初中", "max_nodes": 15 }
```

---

## 👤 Admin 知识点管理 (Concepts)

| 方法 | 路径 | 说明 | 认证 | 状态 |
|------|------|------|------|------|
| GET | `/v1/admin/concepts` | 知识点列表 | ✅ admin | ✅ |
| POST | `/v1/admin/concepts` | 创建知识点 | ✅ admin | ✅ |
| GET | `/v1/admin/concepts/:id` | 知识点详情 | ✅ admin | ✅ |
| PUT | `/v1/admin/concepts/:id` | 更新知识点 | ✅ admin | ✅ |
| DELETE | `/v1/admin/concepts/:id` | 删除知识点 | ✅ admin | ✅ |
| POST | `/v1/admin/concepts/dependencies` | 新增依赖 + 闭包维护 | ✅ admin | ✅ |
| DELETE | `/v1/admin/concepts/dependencies` | 删除依赖 + 重建闭包 | ✅ admin | ✅ |
| POST | `/v1/admin/concepts/rebuild-closure` | 全量重建闭包表 | ✅ admin | ✅ |

**依赖请求体**:
```json
{ "prerequisiteId": 10, "dependentId": 20, "pathType": "required" }
```

---

## 🗺️ 知识图谱 - 学习路径 (Knowledge Graph Path) — 已废弃

| 方法 | 路径 | 说明 | 认证 | 状态 |
|------|------|------|------|------|
| POST | `/v1/knowledge-graph/path` | 生成学习路径（兼容） | ❌ | ⚠️ deprecated |
| GET | `/v1/knowledge-graph/path` | 获取用户进度（stub） | ❌ | ⚠️ deprecated |

> 请改用 `/v1/learning-path/*` 端点。

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

### 已实现端点总数: **30+**

- 系统端点: 1个
- 学习路径闭包表: 3个（canonical）
- Desktop 路径兼容: 2个
- Admin 知识点: 8个
- 教程管理: 5个
- 课件管理: 2个
- 学习路径（legacy）: 2个
- 资源推荐: 2个
- 硬件项目: 2个

### 功能覆盖

✅ **完整CRUD**: 教程管理  
✅ **列表查询**: 所有模块支持分页和筛选  
✅ **闭包表**: 学习路径前置/后续/链条查询（PostgreSQL）  
✅ **智能算法**: 学习路径生成、个性化推荐  
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
- **SQL 脚本**: `sql/README.md`
- **闭包表需求**: `../docs/requirements/08-learning-path-closure-table-migration.md`

---

**最后更新**: 2026-06-18  
**API版本**: v1.1.0  
**技术栈**: Next.js + PostgreSQL (Prisma) + 闭包表
