# 硬件项目API集成指南

## 概述

本文档介绍如何集成和使用新创建的硬件项目API功能，包括后端API接口和前端TypeScript服务。

## 后端API接口

### 路由注册

新的硬件项目API路由已添加到主应用中：

```python
# src/main.py
from routes import hardware_project_routes

app.include_router(
    hardware_project_routes.router, tags=["硬件项目管理"]
)
```

### API端点

#### 1. 获取硬件项目列表
```
GET /api/v1/hardware/projects/
```

**查询参数：**
- `category`: 项目分类筛选 (electronics, robotics, iot, mechanical, smart_home, sensor, communication)
- `difficulty`: 难度等级筛选 (1-5)
- `subject`: 学科筛选
- `max_cost`: 最大成本筛选
- `search`: 搜索关键词
- `limit`: 返回数量限制 (默认20, 最大100)
- `offset`: 偏移量 (默认0)

**响应示例：**
```json
[
  {
    "id": 1,
    "project_id": "HW-Sensor-001",
    "title": "超声波测距仪",
    "category": "sensor",
    "difficulty": 2,
    "subject": "物理",
    "description": "使用HC-SR04超声波传感器测量距离...",
    "total_cost": 25.5,
    "materials": [...],
    "code_templates": [...]
  }
]
```

#### 2. 获取单个项目详情
```
GET /api/v1/hardware/projects/{project_id}
```

#### 3. 创建新项目
```
POST /api/v1/hardware/projects/
```

#### 4. 更新项目
```
PUT /api/v1/hardware/projects/{project_id}
```

#### 5. 删除项目
```
DELETE /api/v1/hardware/projects/{project_id}
```

#### 6. 获取分类列表
```
GET /api/v1/hardware/projects/categories
```

#### 7. 获取统计信息
```
GET /api/v1/hardware/projects/stats/summary
```

## 前端集成

### TypeScript服务

创建了 `HardwareProjectService` 来处理与后端API的交互：

```typescript
// desktop-manager/src/app/services/hardware-project.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HardwareProjectService {
  private baseUrl = '/api/v1/hardware/projects';

  constructor(private http: HttpClient) {}

  // 获取项目列表
  getProjects(filter?: HardwareProjectFilter, page = 1, pageSize = 20): Observable<any> { ... }
  
  // 获取单个项目
  getProject(projectId: string): Observable<HardwareProject> { ... }
  
  // 创建项目
  createProject(projectData: any): Observable<HardwareProject> { ... }
  
  // 更新项目
  updateProject(projectId: string, projectData: any): Observable<HardwareProject> { ... }
  
  // 删除项目
  deleteProject(projectId: string): Observable<any> { ... }
  
  // 获取分类
  getCategories(): Observable<string[]> { ... }
  
  // 获取统计
  getStatistics(): Observable<HardwareProjectStats> { ... }
}
```

### 使用示例

#### 在组件中使用服务

```typescript
import { Component, OnInit } from '@angular/core';
import { HardwareProjectService } from '../services/hardware-project.service';
import { HardwareProject } from '../models/hardware-project.models';

@Component({
  selector: 'app-hardware-projects',
  template: `
    <div *ngFor="let project of projects">
      <h3>{{ project.title }}</h3>
      <p>{{ project.description }}</p>
    </div>
  `
})
export class HardwareProjectsComponent implements OnInit {
  projects: HardwareProject[] = [];

  constructor(private hardwareService: HardwareProjectService) {}

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.hardwareService.getProjects().subscribe({
      next: (result) => {
        this.projects = result.projects;
      },
      error: (error) => {
        console.error('加载项目失败:', error);
      }
    });
  }
}
```

#### 筛选和搜索

```typescript
// 按分类筛选
this.hardwareService.getProjectsByCategory('sensor').subscribe(projects => {
  this.projects = projects;
});

// 搜索项目
this.hardwareService.searchProjects('超声波').subscribe(projects => {
  this.projects = projects;
});

// 自定义筛选
const filter = {
  category: 'electronics',
  maxBudget: 30,
  difficultyRange: [1, 3]
};
this.hardwareService.getProjects(filter).subscribe(result => {
  this.projects = result.projects;
});
```

## 数据模型

### HardwareProject 接口

```typescript
export interface HardwareProject {
  id: string;
  title: string;
  description: string;
  category: HardwareCategory;
  difficulty: number; // 1-5
  subject: string;
  total_cost: number;
  materials: MaterialItem[];
  code_templates?: CodeTemplate[];
  // ... 其他字段
}
```

### 筛选条件

```typescript
export interface HardwareProjectFilter {
  category?: HardwareCategory;
  difficultyRange?: [number, number];
  maxBudget?: number;
  keyword?: string;
}
```

## 数据库模型

硬件项目使用以下数据库表：

- `hardware_project_templates`: 主表，存储项目基本信息
- `hardware_materials`: 材料清单项
- `code_templates`: 代码模板

所有表都通过外键关联，支持级联操作。

## 启动和测试

### 后端启动

```bash
# 确保数据库连接配置正确
# 启动FastAPI应用
python src/main.py
```

### 前端启动

```bash
cd desktop-manager
npm install  # 首次运行需要安装依赖
npm start
```

### API测试

可以使用以下工具测试API：

1. **Swagger UI**: 访问 `http://localhost:8000/docs`
2. **curl命令**:
   ```bash
   curl http://localhost:8000/api/v1/hardware/projects/
   curl http://localhost:8000/api/v1/hardware/projects/HW-Sensor-001
   ```

## 注意事项

1. **认证**: 当前API未添加认证中间件，生产环境需要添加
2. **权限**: 创建、更新、删除操作应添加权限检查
3. **验证**: 输入数据需要更严格的验证
4. **分页**: 当前实现简单分页，大数据量时需要优化
5. **错误处理**: 建议添加更详细的错误处理和日志记录

## 扩展功能

可以进一步扩展的功能：

1. 项目评分和评论系统
2. 用户收藏功能
3. 项目完成进度跟踪
4. 材料采购链接集成
5. WebUSB烧录支持
6. 项目分享和协作功能

## 故障排除

### 常见问题

1. **API返回404**: 检查路由是否正确注册
2. **数据库连接失败**: 检查 `.env` 文件中的数据库配置
3. **前端HTTP错误**: 检查CORS配置和API地址
4. **类型错误**: 确保TypeScript接口与后端响应匹配

### 调试技巧

1. 查看后端日志了解详细错误信息
2. 使用浏览器开发者工具检查网络请求
3. 使用Postman或curl直接测试API端点