# 资源关联功能开发者文档

## 📋 目录

1. [架构概述](#架构概述)
2. [技术栈](#技术栈)
3. [项目结构](#项目结构)
4. [API参考](#api参考)
5. [前端组件](#前端组件)
6. [数据模型](#数据模型)
7. [开发指南](#开发指南)
8. [测试](#测试)
9. [部署](#部署)
10. [扩展开发](#扩展开发)

---

## 架构概述

### 系统架构图

```
┌─────────────────────────────────────────────────┐
│                  用户界面层                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │ 教程库   │ │ 课件库   │ │ 硬件项目库    │   │
│  └──────────┘ └──────────┘ └──────────────┘   │
│  ┌──────────────────────────────────────────┐  │
│  │     学习路径可视化 (ECharts)              │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│                服务层 (Angular)                   │
│  ┌──────────────────────────────────────────┐  │
│  │  ResourceAssociationService              │  │
│  │  - HTTP请求封装                          │  │
│  │  - 缓存管理 (5分钟TTL)                   │  │
│  │  - 错误处理                              │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│               API层 (FastAPI)                    │
│  ┌──────────────────────────────────────────┐  │
│  │  /api/v1/resources/*                     │  │
│  │  - GET /tutorials/{id}/related-materials │  │
│  │  - GET /materials/{id}/required-hardware │  │
│  │  - GET /learning-path/{id}               │  │
│  │  - GET /hardware/{id}/related-resources  │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│              业务逻辑层                           │
│  ┌──────────────────────────────────────────┐  │
│  │  ResourceAssociationService (Python)     │  │
│  │  - 关联查询算法                          │  │
│  │  - 数据加载和过滤                        │  │
│  │  - 关联度计算                            │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│              数据源层                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │ JSON文件 │ │ Neo4j    │ │ PostgreSQL   │   │
│  │ (当前)   │ │ (未来)   │ │ (未来)       │   │
│  └──────────┘ └──────────┘ └──────────────┘   │
└─────────────────────────────────────────────────┘
```

---

## 技术栈

### 后端
- **框架**: FastAPI 0.104+
- **数据验证**: Pydantic v2
- **异步支持**: asyncio
- **数据源**: JSON文件（可扩展到Neo4j/PostgreSQL）

### 前端
- **框架**: Angular 17+ (Standalone Components)
- **状态管理**: RxJS Observables
- **UI组件**: Angular Material
- **可视化**: ECharts 5.x
- **HTTP客户端**: HttpClient
- **路由**: Angular Router

### 开发工具
- **包管理**: npm / pip
- **构建工具**: Vite (前端)
- **测试**: pytest (后端), Jasmine/Karma (前端)
- **代码规范**: ESLint, Prettier, Black

---

## 项目结构

```
OpenMTSciEd/
├── backend/openmtscied/modules/resources/
│   ├── services/
│   │   └── association_service.py          # 关联服务核心逻辑
│   ├── association_api.py                   # API路由定义
│   └── __init__.py
│
├── desktop-manager/src/app/
│   ├── models/
│   │   └── resource-association.models.ts   # TypeScript类型定义
│   ├── services/
│   │   ├── index.ts                         # 服务导出
│   │   └── resource-association.service.ts  # 共享服务
│   ├── shared/components/
│   │   └── resource-associations/
│   │       └── resource-associations.component.ts  # 通用关联组件
│   └── features/
│       ├── tutorial-library/
│       │   └── tutorial-library.component.ts       # 教程库
│       ├── material-library/
│       │   └── material-library.component.ts       # 课件库
│       ├── hardware-projects/hardware-project-list/
│       │   └── hardware-project-list.component.ts  # 硬件库
│       └── path-visualization/
│           └── path-visualization.component.ts     # 路径图谱
│
├── admin-web/src/app/admin/
│   └── resource-associations/
│       └── resource-associations.component.ts      # Admin管理界面
│
├── tests/
│   ├── test_resource_associations.py        # 单元测试
│   └── test_resource_associations_e2e.py    # 端到端测试
│
└── docs/
    ├── RESOURCE_ASSOCIATIONS.md             # 功能说明
    ├── RESOURCE_ASSOCIATIONS_USER_GUIDE.md  # 用户手册
    ├── IMPLEMENTATION_SUMMARY.md            # 实施总结
    └── RESOURCE_ASSOCIATIONS_DEVELOPER.md   # 本文档
```

---

## API参考

### 基础信息

- **Base URL**: `http://localhost:8000/api/v1/resources`
- **Content-Type**: `application/json`
- **认证**: 无需认证（公开API）

### 端点列表

#### 1. 获取教程相关课件

```http
GET /tutorials/{tutorial_id}/related-materials
```

**参数**:
- `tutorial_id` (path): 教程ID
- `subject` (query, optional): 学科过滤

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "OST-Bio-Ch5",
      "title": "生态系统与环境保护",
      "subject": "生物",
      "grade_level": "高中",
      "textbook": "OpenStax Biology",
      "relevance_score": 0.85
    }
  ]
}
```

---

#### 2. 获取课件所需硬件

```http
GET /materials/{material_id}/required-hardware
```

**参数**:
- `material_id` (path): 课件ID

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "project_id": "HW-Sensor-001",
      "title": "温度传感器实验套件",
      "subject": "物理",
      "difficulty": 3,
      "total_cost": 199.99,
      "components": [...]
    }
  ],
  "total_cost": 199.99
}
```

---

#### 3. 获取完整学习路径

```http
GET /learning-path/{tutorial_id}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "tutorial": {...},
    "related_materials": [...],
    "required_hardware": [...]
  }
}
```

---

#### 4. 搜索资源

```http
GET /search-resources?keyword={keyword}&type={type}
```

**参数**:
- `keyword` (query): 搜索关键词
- `type` (query, optional): 资源类型过滤 (tutorial/material/hardware)

---

#### 5. 获取硬件相关资源（反向查询）

```http
GET /hardware/{hardware_id}/related-resources?subject={subject}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "related_tutorials": [...],
    "related_materials": [...]
  }
}
```

---

#### 6. 获取资源统计摘要

```http
GET /resources/summary
```

**响应**:
```json
{
  "success": true,
  "data": {
    "total_tutorials": 150,
    "total_materials": 300,
    "total_hardware": 80,
    "total_associations": 450
  }
}
```

---

## 前端组件

### ResourceAssociationService

**位置**: `desktop-manager/src/app/services/resource-association.service.ts`

**主要方法**:

```typescript
// 获取学习路径
getLearningPath(tutorialId: string): Observable<ApiResponse<LearningPath>>

// 获取教程相关课件
getTutorialRelatedMaterials(
  tutorialId: string, 
  subject?: string
): Observable<ApiResponse<RelatedMaterial[]>>

// 获取课件所需硬件
getMaterialRequiredHardware(
  materialId: string
): Observable<ApiResponse<{
  data: RequiredHardware[],
  total_cost: number
}>>

// 获取硬件相关资源（反向）
getHardwareRelatedResources(
  hardwareId: string,
  subject?: string
): Observable<ApiResponse<HardwareRelatedResources>>

// 搜索资源
searchResources(
  keyword: string,
  type?: 'tutorial' | 'material' | 'hardware'
): Observable<ApiResponse<SearchResult[]>>

// 工具方法
formatCost(cost: number): string
getDifficultyStars(difficulty: number): string
getSubjectColor(subject: string): string
```

**缓存机制**:
- 内存缓存 (Map)
- TTL: 5分钟
- 自动失效和刷新

---

### ResourceAssociationsComponent

**位置**: `desktop-manager/src/app/shared/components/resource-associations.component.ts`

**Inputs**:
- `resourceId`: 资源ID
- `resourceType`: 资源类型 ('tutorial' | 'material')

**使用示例**:

```html
<app-resource-associations
  [resourceId]="'OS-Unit-001'"
  [resourceType]="'tutorial'">
</app-resource-associations>
```

---

## 数据模型

### TypeScript接口

```typescript
interface RelatedMaterial {
  id: string;
  title: string;
  subject: string;
  grade_level: string;
  textbook: string;
  relevance_score: number;  // 0-1
}

interface RequiredHardware {
  project_id: string;
  title: string;
  subject: string;
  difficulty: number;  // 1-5
  total_cost: number;
  components: Component[];
  relevance_score?: number;
}

interface LearningPath {
  tutorial: Tutorial | null;
  related_materials: RelatedMaterial[];
  required_hardware: RequiredHardware[];
}

interface HardwareRelatedResources {
  related_tutorials: Tutorial[];
  related_materials: RelatedMaterial[];
}

interface SearchResult {
  id: string;
  title: string;
  type: 'tutorial' | 'material' | 'hardware';
  subject: string;
  description?: string;
}
```

---

## 开发指南

### 本地开发环境搭建

#### 1. 后端设置

```bash
# 克隆仓库
git clone <repository-url>
cd OpenMTSciEd

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt

# 启动后端服务
cd backend/openmtscied
python main.py
```

#### 2. 前端设置

```bash
# 进入桌面管理器目录
cd desktop-manager

# 安装依赖
npm install

# 启动开发服务器
npm start
```

#### 3. Admin后台设置

```bash
# 进入Admin Web目录
cd admin-web

# 安装依赖
npm install

# 启动开发服务器
npm start
```

---

### 添加新的关联关系

#### 方法1: 通过Admin后台（推荐）

1. 登录Admin后台
2. 进入"资源关联"页面
3. 切换到"添加关联"标签
4. 填写表单并保存

#### 方法2: 直接编辑JSON文件

```python
# 示例：手动添加关联
import json

# 读取现有数据
with open('data/knowledge_graph.json', 'r', encoding='utf-8') as f:
    graph = json.load(f)

# 添加新关联
graph['edges'].append({
    'source': 'OS-Unit-001',
    'target': 'OST-Bio-Ch5',
    'type': 'requires',
    'relevance_score': 0.85
})

# 保存
with open('data/knowledge_graph.json', 'w', encoding='utf-8') as f:
    json.dump(graph, f, ensure_ascii=False, indent=2)
```

---

### 自定义关联算法

当前实现基于学科匹配，可以扩展为更智能的算法：

```python
# backend/openmtscied/modules/resources/services/association_service.py

def calculate_relevance_score(resource1: dict, resource2: dict) -> float:
    """
    计算两个资源的关联度
    
    当前实现：简单的学科匹配
    TODO: 实现更复杂的算法
    - 关键词相似度 (TF-IDF, Cosine Similarity)
    - 用户行为分析 (协同过滤)
    - 知识图谱路径分析
    """
    score = 0.0
    
    # 学科匹配 (权重: 0.5)
    if resource1.get('subject') == resource2.get('subject'):
        score += 0.5
    
    # 年级匹配 (权重: 0.3)
    if resource1.get('grade_level') == resource2.get('grade_level'):
        score += 0.3
    
    # 关键词重叠 (权重: 0.2)
    keywords1 = set(resource1.get('keywords', []))
    keywords2 = set(resource2.get('keywords', []))
    if keywords1 and keywords2:
        overlap = len(keywords1 & keywords2) / len(keywords1 | keywords2)
        score += 0.2 * overlap
    
    return min(score, 1.0)
```

---

## 测试

### 运行后端测试

```bash
cd tests
python test_resource_associations.py
```

### 运行端到端测试

```bash
cd tests
python test_resource_associations_e2e.py
```

### 测试覆盖范围

- ✅ API健康检查
- ✅ 教程→课件关联查询
- ✅ 课件→硬件关联查询
- ✅ 完整学习路径生成
- ✅ 硬件反向关联查询
- ✅ 资源搜索功能
- ✅ 错误处理和边界情况

---

## 部署

### 生产环境配置

#### 1. 后端部署

```bash
# 使用Gunicorn + Uvicorn
pip install gunicorn uvicorn

# 启动命令
gunicorn openmtscied.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
```

#### 2. 前端部署

```bash
# 构建生产版本
cd desktop-manager
npm run build

# 部署到Nginx
# 将 dist/ 目录复制到 Nginx html 目录
```

#### 3. 环境变量配置

创建 `.env` 文件：

```env
# 后端配置
DATABASE_URL=postgresql://user:pass@localhost/dbname
NEO4J_URI=bolt://localhost:7687
CACHE_TTL=300
CORS_ORIGINS=http://localhost:4200,https://yourdomain.com

# 前端配置
API_BASE_URL=https://api.yourdomain.com
```

---

## 扩展开发

### 集成Neo4j图数据库

#### 1. 安装Neo4j驱动

```bash
pip install neo4j
```

#### 2. 更新关联服务

```python
from neo4j import GraphDatabase

class Neo4jAssociationService:
    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))
    
    def get_related_materials(self, tutorial_id: str):
        with self.driver.session() as session:
            result = session.run("""
                MATCH (t:Tutorial {id: $tutorial_id})-[:REQUIRES]->(m:Material)
                RETURN m
                ORDER BY m.relevance_score DESC
            """, tutorial_id=tutorial_id)
            
            return [record['m'] for record in result]
```

#### 3. 迁移数据

```python
# 从JSON迁移到Neo4j
def migrate_to_neo4j():
    # 读取JSON数据
    # 创建节点和关系
    # 验证数据完整性
    pass
```

---

### 添加个性化推荐

#### 基于用户历史的推荐

```python
def get_personalized_recommendations(user_id: str, current_resource: dict):
    """
    基于用户历史行为的个性化推荐
    
    算法：
    1. 获取用户浏览历史
    2. 计算资源相似度
    3. 过滤已浏览资源
    4. 按相关性排序
    """
    user_history = get_user_history(user_id)
    
    recommendations = []
    for resource in all_resources:
        if resource['id'] in user_history:
            continue
        
        similarity = calculate_similarity(current_resource, resource)
        recommendations.append({
            'resource': resource,
            'score': similarity
        })
    
    return sorted(recommendations, key=lambda x: x['score'], reverse=True)[:10]
```

---

### 性能优化建议

#### 1. 缓存策略

```python
# 使用Redis替代内存缓存
import redis

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def get_cached_data(key: str):
    data = redis_client.get(key)
    if data:
        return json.loads(data)
    return None

def set_cache(key: str, value: dict, ttl: int = 300):
    redis_client.setex(key, ttl, json.dumps(value))
```

#### 2. 数据库索引

```cypher
// Neo4j索引
CREATE INDEX tutorial_id_idx FOR (t:Tutorial) ON (t.id);
CREATE INDEX material_subject_idx FOR (m:Material) ON (m.subject);
CREATE INDEX hardware_difficulty_idx FOR (h:Hardware) ON (h.difficulty);
```

#### 3. 前端懒加载

```typescript
// Angular路由懒加载
const routes: Routes = [
  {
    path: 'resource-associations',
    loadChildren: () => import('./resource-associations.module').then(m => m.ResourceAssociationsModule)
  }
];
```

---

## 故障排查

### 常见问题

#### 1. API返回404

**原因**: 路由未注册  
**解决**: 检查 `main.py` 中是否包含 `app.include_router(association_api.router)`

#### 2. 前端无法连接后端

**原因**: CORS配置问题  
**解决**: 在 `main.py` 中添加正确的CORS origins

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 3. 缓存不生效

**原因**: 缓存键冲突或TTL过短  
**解决**: 检查缓存键的唯一性，适当增加TTL

---

## 贡献指南

### 提交代码

1. Fork仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

### 代码规范

- **Python**: 遵循PEP 8，使用Black格式化
- **TypeScript**: 遵循Angular风格指南，使用ESLint
- **提交信息**: 使用约定式提交 (Conventional Commits)

---

**最后更新**: 2026-04-24  
**版本**: v1.0.0  
**维护者**: OpenMTSciEd 团队
