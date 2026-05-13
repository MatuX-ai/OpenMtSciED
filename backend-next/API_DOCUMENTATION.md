# OpenMTSciEd API 文档

## 概述

OpenMTSciEd API 是基于 Next.js 和 Neo4j 图数据库构建的教育平台后端服务,提供教程管理、课件管理、学习路径生成和资源推荐等功能。

**基础URL**: `http://localhost:3000/api`

## 目录

- [健康检查](#健康检查)
- [教程管理](#教程管理)
- [课件管理](#课件管理)
- [知识图谱 - 学习路径](#知识图谱---学习路径)
- [知识图谱 - 资源推荐](#知识图谱---资源推荐)
- [硬件项目管理](#硬件项目管理)

---

## 健康检查

### GET /health

检查API服务状态。

**响应示例:**
```json
{
  "status": "ok",
  "timestamp": "2026-05-13T10:30:00.000Z",
  "service": "OpenMTSciEd API",
  "version": "1.0.0"
}
```

---

## 教程管理

### GET /v1/tutorials

获取教程列表,支持分页和筛选。

**查询参数:**
- `page` (可选): 页码,默认 1
- `size` (可选): 每页数量,默认 20
- `subject` (可选): 学科筛选 (如: physics, mathematics, chemistry)
- `grade_level` (可选): 年级筛选 (如: 9-12, K-5)

**响应示例:**
```json
{
  "items": [
    {
      "id": "tutorial_001",
      "title": "牛顿运动定律",
      "description": "学习牛顿三大运动定律",
      "grade_level": "9-12",
      "subject": "physics",
      "duration_minutes": 60,
      "difficulty_level": "intermediate",
      "created_at": "2026-05-13T10:00:00.000Z"
    }
  ],
  "total": 50,
  "page": 1,
  "size": 20,
  "total_pages": 3
}
```

### POST /v1/tutorials

创建新教程。

**请求体:**
```json
{
  "id": "tutorial_002",
  "title": "电磁感应",
  "description": "法拉第电磁感应定律",
  "grade_level": "9-12",
  "subject": "physics",
  "duration_minutes": 90,
  "difficulty_level": "advanced",
  "content": "详细内容..."
}
```

**必填字段:** id, title, grade_level, subject

### GET /v1/tutorials/[id]

获取单个教程详情。

**响应示例:**
```json
{
  "id": "tutorial_001",
  "title": "牛顿运动定律",
  "description": "学习牛顿三大运动定律",
  "grade_level": "9-12",
  "subject": "physics",
  "duration_minutes": 60,
  "difficulty_level": "intermediate",
  "content": "详细内容...",
  "created_at": "2026-05-13T10:00:00.000Z",
  "updated_at": "2026-05-13T10:00:00.000Z",
  "contents": [
    {
      "id": "content_001",
      "type": "video",
      "title": "讲解视频",
      "url": "https://example.com/video.mp4"
    }
  ]
}
```

### PUT /v1/tutorials/[id]

更新教程信息。

**请求体:** (所有字段可选,只更新提供的字段)
```json
{
  "title": "更新后的标题",
  "description": "更新后的描述"
}
```

### DELETE /v1/tutorials/[id]

删除教程。

**响应示例:**
```json
{
  "message": "Tutorial deleted successfully",
  "id": "tutorial_001"
}
```

---

## 课件管理

### GET /v1/coursewares

获取课件列表。

**查询参数:**
- `page` (可选): 页码,默认 1
- `size` (可选): 每页数量,默认 20
- `subject` (可选): 学科筛选
- `grade_level` (可选): 年级筛选
- `type` (可选): 课件类型 (pdf, video, interactive)

**响应示例:**
```json
{
  "items": [
    {
      "id": "courseware_001",
      "title": "物理实验手册",
      "description": "中学物理实验指导",
      "type": "pdf",
      "grade_level": "9-12",
      "subject": "physics",
      "difficulty_level": "intermediate",
      "file_url": "https://example.com/manual.pdf",
      "thumbnail_url": "https://example.com/thumb.jpg",
      "duration_minutes": 45,
      "knowledge_points": [
        {"id": "kp_001", "name": "力学"}
      ],
      "created_at": "2026-05-13T10:00:00.000Z"
    }
  ],
  "total": 30,
  "page": 1,
  "size": 20,
  "total_pages": 2
}
```

### POST /v1/coursewares

创建新课件。

**请求体:**
```json
{
  "id": "courseware_002",
  "title": "化学实验视频",
  "description": "酸碱中和反应",
  "type": "video",
  "grade_level": "9-12",
  "subject": "chemistry",
  "difficulty_level": "beginner",
  "file_url": "https://example.com/video.mp4",
  "thumbnail_url": "https://example.com/thumb.jpg",
  "duration_minutes": 30,
  "knowledge_point_ids": ["kp_001", "kp_002"]
}
```

**必填字段:** id, title, type, grade_level, subject

---

## 知识图谱 - 学习路径

### POST /v1/knowledge-graph/path

基于用户信息和目标生成个性化学习路径。

**请求体:**
```json
{
  "user_id": 1,
  "current_grade": "9-12",
  "subjects": ["physics"],
  "learning_goals": ["mechanics", "thermodynamics"]
}
```

**必填字段:** user_id, current_grade, subjects (数组)

**响应示例:**
```json
{
  "path_id": "path_1_1715587800000",
  "nodes": [
    {
      "id": "node_0",
      "type": "tutorial",
      "resource_id": "tutorial_001",
      "title": "牛顿第一定律",
      "prerequisites": [],
      "next_steps": ["node_1"],
      "estimated_time_minutes": 45,
      "difficulty_level": "beginner"
    },
    {
      "id": "node_1",
      "type": "tutorial",
      "resource_id": "tutorial_002",
      "title": "牛顿第二定律",
      "prerequisites": ["node_0"],
      "next_steps": ["node_2"],
      "estimated_time_minutes": 60,
      "difficulty_level": "intermediate"
    }
  ],
  "estimated_duration_hours": 12.5,
  "difficulty_progression": "adaptive",
  "message": "Learning path generated successfully based on prerequisite relationships"
}
```

### GET /v1/knowledge-graph/path

获取用户的学习进度。

**查询参数:**
- `user_id` (必填): 用户ID

**响应示例:**
```json
{
  "user_id": "1",
  "completed_tutorials": [
    {
      "tutorial_id": "tutorial_001",
      "title": "牛顿第一定律",
      "completion_date": "2026-05-10T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

## 知识图谱 - 资源推荐

### POST /v1/knowledge-graph/recommend

基于用户历史获取个性化推荐。

**请求体:**
```json
{
  "user_id": 1,
  "limit": 10,
  "subjects": ["physics", "mathematics"]
}
```

**必填字段:** user_id

**响应示例:**
```json
{
  "user_id": 1,
  "recommendations": [
    {
      "id": "tutorial_003",
      "title": "能量守恒定律",
      "description": "学习能量守恒原理",
      "subject": "physics",
      "grade_level": "9-12",
      "difficulty_level": "intermediate",
      "type": "tutorial",
      "recommendation_reason": "Based on your learning history",
      "score": 5
    }
  ],
  "strategy": "collaborative_filtering",
  "message": "Personalized recommendations based on your learning history"
}
```

### GET /v1/knowledge-graph/recommend

获取推荐的课件资源。

**查询参数:**
- `user_id` (必填): 用户ID
- `subject` (可选): 学科筛选
- `limit` (可选): 返回数量,默认 10

**响应示例:**
```json
{
  "user_id": "1",
  "coursewares": [
    {
      "id": "courseware_001",
      "title": "物理实验手册",
      "type": "pdf",
      "subject": "physics",
      "grade_level": "9-12",
      "file_url": "https://example.com/manual.pdf",
      "thumbnail_url": "https://example.com/thumb.jpg",
      "relevance_score": 8
    }
  ],
  "count": 1
}
```

---

## 硬件项目管理

### GET /v1/hardware-projects

获取硬件项目列表。

**查询参数:**
- `page` (可选): 页码,默认 1
- `size` (可选): 每页数量,默认 20
- `difficulty` (可选): 难度级别 (beginner, intermediate, advanced)
- `category` (可选): 类别 (electronics, robotics, programming)
- `subject` (可选): 学科

**响应示例:**
```json
{
  "items": [
    {
      "id": "project_001",
      "title": "Arduino LED控制",
      "description": "学习使用Arduino控制LED灯",
      "difficulty_level": "beginner",
      "category": "electronics",
      "subject": "computer_science",
      "estimated_time_hours": 2,
      "thumbnail_url": "https://example.com/project.jpg",
      "hardware_required": [
        {
          "id": "hw_001",
          "name": "Arduino Uno",
          "quantity": 1
        },
        {
          "id": "hw_002",
          "name": "LED灯",
          "quantity": 5
        }
      ],
      "knowledge_points": [
        {"id": "kp_001", "name": "电路基础"}
      ],
      "created_at": "2026-05-13T10:00:00.000Z"
    }
  ],
  "total": 15,
  "page": 1,
  "size": 20,
  "total_pages": 1
}
```

### POST /v1/hardware-projects

创建新硬件项目。

**请求体:**
```json
{
  "id": "project_002",
  "title": "智能小车",
  "description": "制作一个可编程的智能小车",
  "difficulty_level": "intermediate",
  "category": "robotics",
  "subject": "computer_science",
  "estimated_time_hours": 8,
  "thumbnail_url": "https://example.com/car.jpg",
  "hardware_list": [
    {
      "id": "hw_003",
      "name": "电机驱动模块",
      "quantity": 2
    },
    {
      "name": "电池盒",
      "quantity": 1
    }
  ],
  "knowledge_point_ids": ["kp_001", "kp_002"]
}
```

**必填字段:** id, title, difficulty_level, category, subject

---

## 错误处理

所有API在出错时返回统一的错误格式:

```json
{
  "error": "错误描述",
  "details": "详细错误信息"
}
```

**常见HTTP状态码:**
- 200: 成功
- 201: 创建成功
- 400: 请求参数错误
- 404: 资源未找到
- 500: 服务器内部错误

---

## 测试

运行测试脚本验证所有API端点:

```powershell
cd G:\OpenMTSciEd\backend-next
.\test-openmtscied-apis.ps1
```

---

## 环境变量配置

确保 `.env.local` 文件中配置了正确的Neo4j连接信息:

```env
NEO4J_URI="bolt+s://instance.databases.neo4j.io"
NEO4J_USERNAME="neo4j"
NEO4J_PASSWORD="your_actual_password"
```

---

## 启动服务

```bash
cd G:\OpenMTSciEd\backend-next
npm run dev
```

服务将在 `http://localhost:3000` 启动。
