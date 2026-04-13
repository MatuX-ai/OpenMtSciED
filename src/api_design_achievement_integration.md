# 学员成果集成模块 - 后端 API 设计文档

## 📋 概述

本文档描述学员成果集成模块的后端 API 设计，包括数据模型、API 端点和业务逻辑。

## 🗄️ 数据库设计

### 成果表 (achievements)

```sql
CREATE TABLE achievements (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    module_id BIGINT REFERENCES learning_modules(id),
    lesson_id BIGINT REFERENCES learning_lessons(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    score INTEGER CHECK (score >= 1 AND score <= 5),
    feedback TEXT,
    reviewed_by BIGINT REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    INDEX idx_user_id (user_id),
    INDEX idx_module_id (module_id),
    INDEX idx_lesson_id (lesson_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_submitted_at (submitted_at)
);
```

### 成果文件表 (achievement_files)

```sql
CREATE TABLE achievement_files (
    id BIGSERIAL PRIMARY KEY,
    achievement_id BIGINT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    INDEX idx_achievement_id (achievement_id)
);
```

### 成果标签表 (achievement_tags)

```sql
CREATE TABLE achievement_tags (
    id BIGSERIAL PRIMARY KEY,
    achievement_id BIGINT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    tag VARCHAR(50) NOT NULL,
    INDEX idx_achievement_id (achievement_id),
    INDEX idx_tag (tag),
    UNIQUE (achievement_id, tag)
);
```

### 成果审核记录表 (achievement_reviews)

```sql
CREATE TABLE achievement_reviews (
    id BIGSERIAL PRIMARY KEY,
    achievement_id BIGINT NOT NULL REFERENCES achievements(id),
    reviewer_id BIGINT NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
    feedback TEXT NOT NULL,
    comment TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    INDEX idx_achievement_id (achievement_id),
    INDEX idx_reviewer_id (reviewer_id)
);
```

### 成果模板表 (achievement_templates)

```sql
CREATE TABLE achievement_templates (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    layout VARCHAR(20) NOT NULL,
    styles JSONB NOT NULL,
    fields JSONB NOT NULL,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (name, type)
);
```

### 学习进度表 (achievement_progress)

```sql
CREATE TABLE achievement_progress (
    id BIGSERIAL PRIMARY KEY,
    achievement_id BIGINT NOT NULL REFERENCES achievements(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    course_id BIGINT REFERENCES courses(id),
    module_id BIGINT REFERENCES learning_modules(id),
    lesson_id BIGINT REFERENCES learning_lessons(id),
    completion_percentage INTEGER NOT NULL DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    total_achievements INTEGER NOT NULL DEFAULT 0,
    completed_achievements INTEGER NOT NULL DEFAULT 0,
    average_score NUMERIC(3, 2),
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    INDEX idx_user_id (user_id),
    INDEX idx_course_id (course_id),
    INDEX idx_module_id (module_id),
    INDEX idx_lesson_id (lesson_id),
    UNIQUE (user_id, course_id, module_id, lesson_id)
);
```

### 进度里程碑表 (progress_milestones)

```sql
CREATE TABLE progress_milestones (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    course_id BIGINT REFERENCES courses(id),
    module_id BIGINT REFERENCES learning_modules(id),
    achievement_ids BIGINT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

### 成果活动记录表 (achievement_activity)

```sql
CREATE TABLE achievement_activity (
    id BIGSERIAL PRIMARY KEY,
    achievement_id BIGINT NOT NULL REFERENCES achievements(id),
    achievement_title VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id),
    user_name VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    INDEX idx_achievement_id (achievement_id),
    INDEX idx_type (type),
    INDEX idx_timestamp (timestamp)
);
```

## 🔌 API 端点

### 1. 成果管理

#### 获取成果列表
```
GET /api/v1/achievements/achievements
```

**查询参数：**
- `page`: 页码（默认：1）
- `page_size`: 每页数量（默认：20）
- `status`: 状态（可多选，逗号分隔）
- `type`: 类型（可多选，逗号分隔）
- `module_id`: 模块ID（可多选，逗号分隔）
- `lesson_id`: 课程ID（可多选，逗号分隔）
- `user_id`: 用户ID（可多选，逗号分隔）
- `date_from`: 起始日期（ISO 8601格式）
- `date_to`: 结束日期（ISO 8601格式）
- `tags`: 标签（可多选，逗号分隔）
- `search`: 搜索关键词
- `sort_by`: 排序字段（submittedAt, updatedAt, score, title, reviewedAt）
- `sort_dir`: 排序方向（asc, desc）

**响应：**
```json
{
  "data": [
    {
      "id": 1,
      "userId": 123,
      "moduleId": 456,
      "lessonId": 789,
      "type": "project",
      "title": "智能客服系统",
      "description": "基于自然语言处理的智能客服系统",
      "status": "approved",
      "score": 5,
      "feedback": "非常优秀的项目！",
      "files": [
        {
          "id": 1,
          "fileName": "project.pdf",
          "fileType": "application/pdf",
          "fileSize": 2048576,
          "fileUrl": "https://cdn.example.com/files/1.pdf",
          "uploadedAt": "2026-03-17T10:00:00Z"
        }
      ],
      "tags": ["人工智能", "NLP"],
      "isPublic": true,
      "submittedAt": "2026-03-15T10:00:00Z",
      "updatedAt": "2026-03-16T14:30:00Z"
    }
  ],
  "total": 100
}
```

#### 获取单个成果详情
```
GET /api/v1/achievements/achievements/:id
```

**响应：** 同上（单个成果对象）

#### 创建成果
```
POST /api/v1/achievements/achievements
```

**请求体：**
```json
{
  "type": "project",
  "title": "智能客服系统",
  "description": "基于自然语言处理的智能客服系统",
  "moduleId": 456,
  "lessonId": 789,
  "tags": ["人工智能", "NLP"],
  "isPublic": true
}
```

**响应：** 创建的成果对象

#### 更新成果
```
PUT /api/v1/achievements/achievements/:id
```

**请求体：** 同创建成果

**响应：** 更新后的成果对象

#### 删除成果
```
DELETE /api/v1/achievements/achievements/:id
```

**响应：** 204 No Content

#### 提交审核
```
POST /api/v1/achievements/achievements/:id/submit
```

**响应：** 更新后的成果对象（状态变为pending）

### 2. 文件管理

#### 上传文件
```
POST /api/v1/achievements/achievements/:id/files
```

**请求：** multipart/form-data
- `file`: 文件

**响应：**
```json
{
  "id": 1,
  "achievementId": 123,
  "fileName": "document.pdf",
  "fileType": "application/pdf",
  "fileSize": 2048576,
  "fileUrl": "https://cdn.example.com/files/1.pdf",
  "thumbnailUrl": "https://cdn.example.com/thumbnails/1.jpg",
  "uploadedAt": "2026-03-17T10:00:00Z"
}
```

#### 删除文件
```
DELETE /api/v1/achievements/files/:id
```

**响应：** 204 No Content

### 3. 审核管理

#### 审核成果
```
POST /api/v1/achievements/achievements/:id/review
```

**请求体：**
```json
{
  "status": "approved",
  "score": 5,
  "feedback": "非常优秀的项目！"
}
```

**响应：** 更新后的成果对象

#### 获取审核记录
```
GET /api/v1/achievements/achievements/:id/reviews
```

**响应：**
```json
[
  {
    "id": 1,
    "achievementId": 123,
    "reviewerId": 456,
    "reviewerName": "张老师",
    "status": "approved",
    "score": 5,
    "feedback": "非常优秀的项目！",
    "reviewedAt": "2026-03-16T14:30:00Z"
  }
]
```

### 4. 模板管理

#### 获取模板列表
```
GET /api/v1/achievements/templates
```

**响应：** 模板对象数组

#### 获取单个模板
```
GET /api/v1/achievements/templates/:id
```

**响应：** 模板对象

#### 创建模板
```
POST /api/v1/achievements/templates
```

**请求体：**
```json
{
  "name": "项目展示卡片",
  "type": "project",
  "layout": "card",
  "styles": {
    "backgroundColor": "#ffffff",
    "textColor": "#333333",
    "accentColor": "#4285f4",
    "cardStyle": "elevated",
    "borderRadius": 12,
    "showProgress": true,
    "showTags": true,
    "showDate": true
  },
  "fields": [
    {
      "key": "title",
      "label": "标题",
      "type": "text",
      "required": true,
      "displayInCard": true,
      "displayInDetail": true
    }
  ]
}
```

**响应：** 创建的模板对象

#### 更新模板
```
PUT /api/v1/achievements/templates/:id
```

#### 删除模板
```
DELETE /api/v1/achievements/templates/:id
```

### 5. 进度和统计

#### 获取用户进度
```
GET /api/v1/achievements/users/:userId/progress
```

**查询参数：**
- `course_id`: 课程ID（可选）
- `module_id`: 模块ID（可选）

**响应：**
```json
{
  "achievementId": 123,
  "userId": 456,
  "courseId": 1,
  "completionPercentage": 75,
  "totalAchievements": 20,
  "completedAchievements": 15,
  "averageScore": 4.5,
  "lastUpdated": "2026-03-17T10:00:00Z",
  "milestones": [
    {
      "id": 1,
      "name": "第一阶段完成",
      "description": "完成前5个成果",
      "achievedAt": "2026-03-10T10:00:00Z",
      "achievementIds": [1, 2, 3, 4, 5]
    }
  ]
}
```

#### 获取统计信息
```
GET /api/v1/achievements/stats
```

**查询参数：**
- `module_id`: 模块ID（可选）
- `user_id`: 用户ID（可选）
- `date_from`: 起始日期
- `date_to`: 结束日期

**响应：**
```json
{
  "totalAchievements": 1000,
  "pendingReviews": 50,
  "approvedAchievements": 800,
  "rejectedAchievements": 100,
  "averageScore": 4.2,
  "recentActivity": [
    {
      "id": 1,
      "achievementId": 123,
      "achievementTitle": "智能客服系统",
      "type": "approved",
      "userId": 456,
      "userName": "张三",
      "timestamp": "2026-03-17T10:00:00Z"
    }
  ],
  "byType": {
    "project": 500,
    "certificate": 200,
    "assignment": 300
  },
  "byStatus": {
    "pending": 50,
    "approved": 800,
    "rejected": 100,
    "revision": 50
  }
}
```

#### 获取最近活动
```
GET /api/v1/achievements/activity
```

**查询参数：**
- `limit`: 数量限制（默认：10）

**响应：** 活动记录数组

#### 导出成果数据
```
GET /api/v1/achievements/export
```

**查询参数：**
- `format`: 格式（csv, excel）
- 其他筛选参数同获取成果列表

**响应：** 文件下载

### 6. 关联查询

#### 获取课程成果
```
GET /api/v1/achievements/courses/:courseId/achievements
```

#### 获取模块成果
```
GET /api/v1/achievements/modules/:moduleId/achievements
```

#### 获取课程章节成果
```
GET /api/v1/achievements/lessons/:lessonId/achievements
```

#### 获取用户成果
```
GET /api/v1/achievements/users/:userId/achievements
```

## 🔐 权限控制

### 角色权限

#### 学员（Student）
- `achievements:create` - 创建自己的成果
- `achievements:read` - 查看自己的成果和公开的成果
- `achievements:update` - 更新自己的草稿
- `achievements:delete` - 删除自己的草稿
- `achievements:submit` - 提交审核
- `achievements:progress:read` - 查看自己的进度

#### 教师（Teacher）
- `achievements:read:all` - 查看所有成果
- `achievements:review` - 审核成果
- `achievements:progress:read:all` - 查看所有学员的进度
- `achievements:export` - 导出数据

#### 管理员（Admin）
- `achievements:*` - 所有权限
- `achievements:templates:manage` - 管理模板

### 权限检查中间件

```python
from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity

def require_permission(permission):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user_id = get_jwt_identity()
            user = get_user(user_id)

            if not has_permission(user, permission):
                return jsonify({'error': 'Permission denied'}), 403

            return f(*args, **kwargs)
        return decorated_function
    return decorator
```

## 📊 业务逻辑

### 1. 成果提交流程

```
学员创建成果 -> 上传文件 -> 提交审核 -> 等待审核 -> 审核结果
                    ↓                ↓
                保存草稿      自动通知教师
```

### 2. 审核流程

```
教师查看成果 -> 提供评分和反馈 -> 提交审核结果 -> 自动通知学员
                                                   ↓
                                        更新学习进度
```

### 3. 进度计算

```python
def calculate_progress(user_id, course_id=None, module_id=None, lesson_id=None):
    total_achievements = count_achievements(user_id, course_id, module_id, lesson_id)
    completed_achievements = count_achievements(
        user_id, course_id, module_id, lesson_id,
        status='approved'
    )
    completion_percentage = (completed_achievements / total_achievements) * 100 if total_achievements > 0 else 0

    avg_score = get_average_score(user_id, course_id, module_id, lesson_id)

    return {
        'completion_percentage': completion_percentage,
        'total_achievements': total_achievements,
        'completed_achievements': completed_achievements,
        'average_score': avg_score
    }
```

### 4. 里程碑检查

```python
def check_milestones(user_id, achievement_id):
    milestone = get_next_milestone(user_id)
    if milestone and achievement_id in milestone['achievement_ids']:
        user_progress = get_user_progress(user_id)
        if all(is_achievement_completed(aid) for aid in milestone['achievement_ids']):
            mark_milestone_achieved(milestone['id'], user_id)
            send_milestone_notification(user_id, milestone)
```

## 🔔 通知机制

### 通知类型

1. **成果提交通知** - 教师收到新成果待审核
2. **审核完成通知** - 学员收到审核结果
3. **里程碑达成通知** - 学员达成学习里程碑
4. **成果被点赞通知** - 学员成果被他人点赞
5. **评论通知** - 成果收到新评论

### 通知实现

```python
def send_notification(user_id, notification_type, data):
    notification = {
        'user_id': user_id,
        'type': notification_type,
        'data': data,
        'created_at': datetime.now(),
        'read': False
    }
    save_notification(notification)
    send_push_notification(user_id, notification)
```

## 📈 性能优化

### 1. 数据库索引
- 为常用查询字段创建索引
- 使用复合索引优化多条件查询

### 2. 缓存策略
```python
from redis import Redis
import json

redis = Redis()

def cache_achievement(achievement):
    key = f"achievement:{achievement['id']}"
    redis.set(key, json.dumps(achievement), ex=3600)

def get_cached_achievement(achievement_id):
    key = f"achievement:{achievement_id}"
    data = redis.get(key)
    if data:
        return json.loads(data)
    return None
```

### 3. 分页优化
- 使用游标分页代替偏移分页
- 对大数据集使用懒加载

### 4. 文件存储
- 使用CDN加速文件访问
- 实现图片缩略图生成
- 支持大文件分片上传

## 🧪 测试

### 单元测试示例

```python
def test_create_achievement():
    user = create_test_user()
    data = {
        'type': 'project',
        'title': '测试项目',
        'description': '测试描述',
        'user_id': user.id
    }
    response = client.post('/api/v1/achievements/achievements', json=data)
    assert response.status_code == 201
    assert response.json()['title'] == '测试项目'

def test_review_achievement():
    achievement = create_test_achievement()
    teacher = create_test_teacher()
    data = {
        'status': 'approved',
        'score': 5,
        'feedback': '优秀'
    }
    response = client.post(
        f'/api/v1/achievements/achievements/{achievement.id}/review',
        json=data,
        headers={'Authorization': f'Bearer {teacher.token}'}
    )
    assert response.status_code == 200
    assert response.json()['status'] == 'approved'
```

## 📝 错误处理

### 错误代码

- `400` - 请求参数错误
- `401` - 未认证
- `403` - 权限不足
- `404` - 资源不存在
- `413` - 文件过大
- `415` - 不支持的文件类型
- `422` - 验证失败
- `500` - 服务器内部错误

### 错误响应格式

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "title": "Title is required",
      "description": "Description is too long"
    }
  }
}
```

## 🚀 部署建议

1. **数据库**：使用PostgreSQL，配置连接池
2. **文件存储**：使用对象存储服务（如AWS S3、腾讯云COS）
3. **缓存**：使用Redis缓存热点数据
4. **队列**：使用Celery处理文件上传和通知发送
5. **监控**：集成Prometheus和Grafana进行监控
6. **日志**：使用ELK Stack进行日志收集和分析

## 🔄 版本历史

### v1.0.0 (2026-03-17)
- 初始版本
- 实现核心功能
