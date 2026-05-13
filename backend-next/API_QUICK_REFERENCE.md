# OpenMTSciEd API 快速参考

## 🚀 服务状态
- **URL**: http://localhost:3000
- **状态**: ✅ 运行中
- **Neo4j**: ✅ 已连接 (neo4j+s://4abd5ef9.databases.neo4j.io)

## 📋 API端点速查

### 基础
```
GET  /api/health                          # 健康检查
```

### 教程管理
```
GET  /api/v1/tutorials?page=1&size=20     # 列表(支持subject, grade_level筛选)
POST /api/v1/tutorials                    # 创建
GET  /api/v1/tutorials/{id}               # 详情
PUT  /api/v1/tutorials/{id}               # 更新
DELETE /api/v1/tutorials/{id}             # 删除
```

### 课件管理
```
GET  /api/v1/coursewares?page=1&size=20   # 列表(支持subject, type筛选)
POST /api/v1/coursewares                  # 创建
```

### 知识图谱
```
POST /api/v1/knowledge-graph/path         # 生成学习路径
GET  /api/v1/knowledge-graph/path?user_id=1  # 用户进度
POST /api/v1/knowledge-graph/recommend    # 资源推荐
GET  /api/v1/knowledge-graph/recommend?user_id=1  # 课件推荐
```

### 硬件项目
```
GET  /api/v1/hardware-projects?page=1&size=20  # 列表(支持difficulty, category筛选)
POST /api/v1/hardware-projects            # 创建
```

## 🔑 关键参数

### 分页参数
- `page`: 页码 (默认: 1)
- `size`: 每页数量 (默认: 20)

### 筛选参数
- `subject`: 学科 (physics, mathematics, chemistry等)
- `grade_level`: 年级 (9-12, K-5等)
- `type`: 类型 (pdf, video, interactive)
- `difficulty`: 难度 (beginner, intermediate, advanced)
- `category`: 类别 (electronics, robotics, programming)

## 📝 请求示例

### PowerShell
```powershell
# 获取教程列表
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/tutorials?page=1&size=5"

# 创建教程
$body = @{
    id = "tutorial_001"
    title = "牛顿运动定律"
    grade_level = "9-12"
    subject = "physics"
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/tutorials" `
    -Method Post -Body $body -ContentType "application/json"

# 生成学习路径
$pathBody = @{
    user_id = 1
    current_grade = "9-12"
    subjects = @("physics")
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/knowledge-graph/path" `
    -Method Post -Body $pathBody -ContentType "application/json"
```

### cURL
```bash
# 健康检查
curl http://localhost:3000/api/health

# 获取硬件项目
curl "http://localhost:3000/api/v1/hardware-projects?difficulty=beginner"
```

## 🗄️ Neo4j数据概览

| 节点类型 | 数量 |
|---------|------|
| KnowledgePoint | 4,623 |
| CourseUnit | 2,225 |
| Question | 1,080 |
| HardwareProject | 14 |
| Tutorial | 1+ |

## ⚡ 性能提示

- 所有分页查询已优化 (< 2s)
- 6个索引已创建加速查询
- 推荐API响应时间 < 1s

## 🛠️ 常用命令

```bash
# 启动开发服务器
npm run dev

# 创建Neo4j索引
node scripts/create-neo4j-indexes.js

# 测试Neo4j连接
node test-neo4j-connection.js

# 测试所有API
.\test-openmtscied-apis.ps1
```

## 📚 文档

- **完整API文档**: API_DOCUMENTATION.md
- **测试报告**: API_FINAL_TEST_REPORT.md
- **快速启动**: QUICK_START_API.md
- **端点清单**: API_ENDPOINTS.md

## 🆘 故障排查

### 500错误 - 整数类型
**症状**: `Invalid input. '0.0' is not a valid value`  
**解决**: 确保使用 `neo4j.int()` 包装分页参数

### 连接失败
**检查**: 
1. .env.local中的Neo4j配置
2. Neo4j Aura实例状态
3. 网络连接

### 端口占用
```powershell
# 查找并终止占用进程
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

**最后更新**: 2026-05-13  
**版本**: v1.0.0
