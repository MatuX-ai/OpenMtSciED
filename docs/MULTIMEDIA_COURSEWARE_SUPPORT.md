# 多媒体课件支持系统技术文档

## 系统概述

多媒体课件支持系统为iMato平台提供了完整的多媒体资源管理功能，包括视频上传与转码、3D模型预览、文档处理等核心功能。

## 核心功能

### 1. 视频上传与转码
- **文件上传**: 支持大文件分片上传，最大5GB
- **云存储**: 集成AWS S3存储服务
- **视频转码**: 使用AWS Elemental MediaConvert进行多格式转码
- **自适应流媒体**: 生成HLS格式支持不同网络环境

### 2. 3D模型预览
- **格式支持**: OBJ、STL、GLB、GLTF等主流3D格式
- **在线预览**: 基于Three.js的交互式3D模型展示
- **自动分析**: 提取模型维度、顶点数、面数等信息
- **响应式设计**: 支持移动端和桌面端浏览

### 3. 文档处理
- **格式支持**: PDF、Markdown、PPTX、DOCX、TXT、HTML
- **文本提取**: 自动提取文档内容用于搜索
- **PDF转换**: 支持多种格式转换为PDF
- **缩略图生成**: 自动生成文档封面预览图

## 系统架构

### 后端架构
```
├── models/
│   └── multimedia.py          # 多媒体资源数据模型
├── services/
│   ├── multimedia_service.py  # 核心多媒体服务
│   ├── three_d_service.py     # 3D模型处理服务
│   └── document_service.py    # 文档处理服务
├── routes/
│   └── multimedia_routes.py   # RESTful API路由
├── tasks/
│   └── __init__.py           # Celery异步任务
├── celery_app.py             # Celery配置
└── migrations/
    └── 005_create_multimedia_tables.py  # 数据库迁移
```

### 数据模型

#### MultimediaResource (多媒体资源)
```python
class MultimediaResource(Base):
    id = Column(Integer, primary_key=True)
    org_id = Column(Integer, ForeignKey('organizations.id'))
    course_id = Column(Integer, ForeignKey('courses.id'))
    title = Column(String(255))
    media_type = Column(Enum(MediaType))  # video, document, 3d_model等
    file_name = Column(String(255))
    file_size = Column(Integer)
    original_url = Column(String(500))
    processed_url = Column(String(500))
    video_status = Column(Enum(VideoStatus))  # uploaded, processing, ready等
    document_format = Column(Enum(DocumentFormat))
    custom_metadata = Column(JSON)
```

#### MediaTranscodingJob (转码任务)
```python
class MediaTranscodingJob(Base):
    id = Column(Integer, primary_key=True)
    resource_id = Column(Integer, ForeignKey('multimedia_resources.id'))
    job_id = Column(String(100))  # AWS MediaConvert Job ID
    status = Column(Enum(VideoStatus))
    progress_percent = Column(Float)
    error_message = Column(Text)
```

## API接口

### 多媒体资源管理
```
POST   /api/v1/org/{org_id}/multimedia/              # 创建资源
GET    /api/v1/org/{org_id}/multimedia/              # 获取资源列表
GET    /api/v1/org/{org_id}/multimedia/{id}          # 获取资源详情
PUT    /api/v1/org/{org_id}/multimedia/{id}          # 更新资源
DELETE /api/v1/org/{org_id}/multimedia/{id}          # 删除资源
```

### 文件上传
```
POST   /api/v1/org/{org_id}/multimedia/upload        # 直接上传文件
POST   /api/v1/org/{org_id}/multimedia/{id}/upload-url  # 获取上传URL
POST   /api/v1/org/{org_id}/multimedia/{id}/complete-upload  # 完成上传
```

### 视频处理
```
POST   /api/v1/org/{org_id}/multimedia/{id}/transcode  # 启动转码
GET    /api/v1/org/{org_id}/multimedia/transcoding-jobs/{job_id}  # 查询转码状态
```

### 3D模型处理
```
POST   /api/v1/org/{org_id}/multimedia/{id}/process-3d  # 处理3D模型
GET    /api/v1/org/{org_id}/multimedia/{id}/preview-3d   # 获取3D预览
GET    /api/v1/org/{org_id}/multimedia/3d-formats       # 支持的3D格式
```

### 文档处理
```
POST   /api/v1/org/{org_id}/multimedia/{id}/process-document  # 处理文档
GET    /api/v1/org/{org_id}/multimedia/document-formats       # 支持的文档格式
```

## 异步任务处理

### Celery配置
```python
# celery_app.py
celery_app.conf.update(
    broker_url='redis://localhost:6379/0',
    result_backend='redis://localhost:6379/0',
    task_routes={
        'tasks.video_transcode': {'queue': 'video_processing'},
        'tasks.document_process': {'queue': 'document_processing'},
    }
)
```

### 主要任务
1. **视频转码任务** (`tasks.video_transcode`)
   - 调用AWS MediaConvert进行视频转码
   - 支持多种质量配置(1080p, 720p, 480p)
   - 生成HLS和MP4两种格式

2. **文档处理任务** (`tasks.document_process`)
   - 文本内容提取
   - PDF格式转换
   - 缩略图生成

3. **状态检查任务** (`tasks.check_transcoding_status`)
   - 定期检查转码任务状态
   - 更新数据库中的任务进度

## 前端组件

### Angular组件结构
```
src/app/shared/components/multimedia-manager/
├── multimedia-manager.component.ts      # 组件逻辑
├── multimedia-manager.component.html    # 模板文件
├── multimedia-manager.component.scss    # 样式文件
└── multimedia-manager.component.spec.ts # 测试文件
```

### 主要功能
- 文件拖拽上传
- 资源列表展示
- 多媒体预览
- 进度显示
- 响应式设计

## 部署配置

### 环境变量
```bash
# 存储配置
STORAGE_TYPE=s3  # 或 local
AWS_S3_BUCKET=imato-multimedia
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1

# CDN配置
CDN_DOMAIN=your-cdn-domain.com

# Celery配置
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# AWS MediaConvert
MEDIA_CONVERT_ROLE=arn:aws:iam::account:role/MediaConvertRole
MEDIA_CONVERT_ENDPOINT=https://abcd1234.mediaconvert.region.amazonaws.com
MEDIA_CONVERT_QUEUE=Default
```

### 启动服务
```bash
# 启动主应用
uvicorn main:app --host 0.0.0.0 --port 8000

# 启动Celery Worker
celery -A celery_app worker --loglevel=info

# 启动Celery Beat (定时任务)
celery -A celery_app beat --loglevel=info
```

## 性能优化

### 缓存策略
- Redis缓存频繁访问的资源信息
- CDN加速静态资源分发
- 浏览器缓存预览页面

### 并发处理
- 异步文件上传
- 多进程Celery workers
- 数据库连接池优化

### 存储优化
- 文件压缩和优化
- 分片上传大文件
- 智能清理过期文件

## 安全考虑

### 访问控制
- 基于角色的权限管理
- 课程级别的资源访问控制
- 签名URL保护私有资源

### 数据安全
- 敏感信息加密存储
- 文件类型验证
- XSS防护

## 监控与维护

### 日志记录
- 详细的操作日志
- 错误追踪和报警
- 性能指标监控

### 定期维护
- 清理临时文件
- 数据库优化
- 系统健康检查

## 测试策略

### 单元测试
- 模型验证测试
- 服务层逻辑测试
- API接口测试

### 集成测试
- 端到端功能测试
- 第三方服务集成测试
- 性能压力测试

### 自动化测试
```python
# 运行测试
python scripts/test_multimedia_support.py
```

## 未来扩展

### 功能增强
- AI驱动的内容分析
- 更多3D格式支持
- 实时协作编辑
- 虚拟现实(VR)支持

### 技术升级
- 微服务架构拆分
- 容器化部署
- 边缘计算支持
- 更智能的CDN策略

---

*本文档最后更新: 2024年*