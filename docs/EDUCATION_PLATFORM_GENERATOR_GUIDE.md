# 教育平台数据生成器使用指南

## 概述

教育平台数据生成器是一个统一的系统，用于管理多个教育平台（edX、MIT OpenCourseWare、中国大学MOOC等）的数据采集、处理和导入到知识图谱中。

## 功能特性

1. **多平台支持**：统一管理多个教育平台的数据生成
2. **自动化调度**：支持定时任务，按配置周期自动更新数据
3. **智能关系优化**：自动建立跨平台递进关系和基于内容相似度的推荐
4. **Admin管理界面**：提供可视化的平台管理和监控界面
5. **API接口**：提供完整的RESTful API用于程序化控制

## 架构组件

### 1. 数据生成器核心 (`scripts/scrapers/education_platform_generator.py`)

```python
# 主要类
- EducationPlatformGenerator (基类)
  - EdXGenerator
  - MITOpenCourseWareGenerator  
  - ChineseMOOCGenerator
- EducationPlatformManager (统一管理器)
```

### 2. 知识图谱优化器 (`scripts/graph_db/knowledge_graph_optimizer.py`)

```python
# 主要功能
- 计算课程间的内容相似度
- 建立跨平台递进关系
- 生成SIMILAR_TO推荐关系
```

### 3. 后端API (`backend/openmtscied/api/education_platform_routes.py`)

```
GET    /api/v1/education-platforms/status          # 获取平台状态
GET    /api/v1/education-platforms/platforms       # 列出所有平台
POST   /api/v1/education-platforms/generate        # 触发生成任务
POST   /api/v1/education-platforms/schedule/start  # 启动定时任务
POST   /api/v1/education-platforms/schedule/stop   # 停止定时任务
GET    /api/v1/education-platforms/schedule/status # 获取调度状态
```

### 4. Admin前端组件 (`desktop-manager/src/app/admin/education-platforms/`)

提供可视化的平台管理界面，包括：
- 平台状态监控
- 手动触发生成
- 定时任务控制
- 数据统计展示

## 安装依赖

```bash
pip install schedule scikit-learn numpy
```

## 使用方法

### 方法一：命令行运行

#### 1. 运行数据生成器

```bash
cd scripts/scrapers
python education_platform_generator.py
```

这将立即生成所有平台的示例数据。

#### 2. 运行知识图谱优化器

```bash
cd scripts/graph_db
python knowledge_graph_optimizer.py
```

这将分析所有课程数据，建立优化后的关系。

#### 3. 导入到Neo4j

```bash
cd scripts/graph_db
python import_to_neo4j.py
```

这将把所有数据和优化后的关系导入到Neo4j数据库。

### 方法二：通过API控制

#### 启动后端服务

```bash
cd backend
python -m uvicorn openmtscied.main:app --reload --port 8000
```

#### API调用示例

```bash
# 获取平台状态
curl http://localhost:8000/api/v1/education-platforms/status

# 生成所有平台数据
curl -X POST http://localhost:8000/api/v1/education-platforms/generate

# 生成特定平台数据
curl -X POST http://localhost:8000/api/v1/education-platforms/generate \
  -H "Content-Type: application/json" \
  -d '{"platform_name": "edX"}'

# 启动定时任务
curl -X POST http://localhost:8000/api/v1/education-platforms/schedule/start

# 停止定时任务
curl -X POST http://localhost:8000/api/v1/education-platforms/schedule/stop
```

### 方法三：通过Admin界面

1. 启动桌面管理器
```bash
cd desktop-manager
npm start
```

2. 访问教育平台管理页面
```
http://localhost:4200/admin/education-platforms
```

3. 在界面上可以：
   - 查看所有平台状态
   - 点击"生成所有平台"按钮
   - 单独生成某个平台
   - 启动/停止定时任务
   - 查看统计数据

## 配置说明

### 平台调度配置

每个平台可以在其生成器类中配置调度参数：

```python
def get_schedule_config(self) -> Dict[str, Any]:
    return {
        "interval": "weekly",  # daily, weekly, biweekly
        "day": "monday",       # monday, tuesday, etc.
        "time": "02:00"        # 24小时制时间
    }
```

### 添加新平台

1. 创建新的生成器类，继承 `EducationPlatformGenerator`
2. 实现 `generate_courses()` 方法
3. 实现 `get_schedule_config()` 方法
4. 在 `EducationPlatformManager.__init__()` 中注册

示例：

```python
class CourseraGenerator(EducationPlatformGenerator):
    def __init__(self):
        super().__init__("Coursera")
    
    def generate_courses(self) -> List[Dict[str, Any]]:
        # 实现Coursera数据生成逻辑
        courses = [...]
        return courses
    
    def get_schedule_config(self) -> Dict[str, Any]:
        return {
            "interval": "weekly",
            "day": "sunday",
            "time": "03:00"
        }

# 在管理器中注册
platform_manager.register_generator(CourseraGenerator())
```

## 数据流程

```
1. 数据生成器运行
   ↓
2. 生成JSON文件到 data/course_library/ 或 data/textbook_library/
   ↓
3. 知识图谱优化器分析所有课程
   ↓
4. 生成优化关系数据到 data/knowledge_graph_relationships.json
   ↓
5. Neo4j导入器读取所有数据
   ↓
6. 导入节点和关系到Neo4j数据库
   ↓
7. 前端通过API查询和展示
```

## 文件结构

```
OpenMTSciEd/
├── scripts/
│   ├── scrapers/
│   │   └── education_platform_generator.py    # 数据生成器核心
│   └── graph_db/
│       ├── knowledge_graph_optimizer.py       # 关系优化器
│       └── import_to_neo4j.py                 # Neo4j导入器（已更新）
├── backend/
│   └── openmtscied/
│       ├── api/
│       │   └── education_platform_routes.py   # API路由
│       └── main.py                            # 主应用（已更新）
├── desktop-manager/
│   └── src/
│       └── app/
│           ├── admin/
│           │   └── education-platforms/       # Admin组件
│           │       └── admin-education-platforms.component.ts
│           └── app.routes.ts                  # 路由配置（已更新）
└── data/
    ├── course_library/                        # 教程库数据
    ├── textbook_library/                      # 课件库数据
    └── knowledge_graph_relationships.json     # 优化关系数据
```

## 定时任务说明

系统使用 `schedule` 库实现定时任务：

- **edX**: 每周一凌晨2:00更新
- **MIT OpenCourseWare**: 每两周周三凌晨3:00更新
- **中国大学MOOC**: 每周五凌晨4:00更新

定时任务在后台线程中运行，不会阻塞主进程。

## 注意事项

1. **首次运行**：建议先手动运行一次所有生成器，确保数据文件正确生成
2. **Neo4j连接**：确保Neo4j Aura实例正在运行且连接信息正确
3. **依赖安装**：确保安装了所有必需的Python包
4. **权限问题**：确保有写入 `data/` 目录的权限
5. **内存使用**：处理大量课程时注意内存使用情况

## 故障排除

### 问题1：无法连接到Neo4j

检查 `scripts/graph_db/import_to_neo4j.py` 中的连接配置：
```python
self.uri = "neo4j+s://your-instance.databases.neo4j.io"
self.username = "your-username"
self.password = "your-password"
```

### 问题2：数据生成失败

查看日志文件 `education_platform_generator.log` 获取详细错误信息。

### 问题3：API返回404

确保后端服务已启动，并且路由已正确注册到主应用中。

### 问题4：前端无法加载

检查浏览器控制台是否有错误，确保Angular开发服务器正常运行。

## 扩展开发

### 实现真实的数据爬取

目前的生成器返回示例数据。要实现真实的数据爬取：

1. 使用 `requests` 库调用平台API
2. 或使用 `BeautifulSoup`/`Selenium` 进行网页爬取
3. 解析HTML/API响应，提取课程信息
4. 转换为统一的JSON格式

示例：

```python
import requests

def generate_courses(self) -> List[Dict[str, Any]]:
    # 调用edX API
    response = requests.get("https://www.edx.org/api/v1/courses/")
    data = response.json()
    
    courses = []
    for course_data in data['results']:
        course = {
            "course_id": course_data['key'],
            "title": course_data['name'],
            "source": "edx",
            # ... 其他字段
        }
        courses.append(course)
    
    return courses
```

## 性能优化建议

1. **批量处理**：使用批量导入减少数据库交互次数
2. **增量更新**：只更新变化的数据，避免全量重新导入
3. **缓存机制**：缓存TF-IDF向量等计算结果
4. **异步处理**：使用后台任务处理耗时的生成操作
5. **分页加载**：前端使用分页加载大量数据

## 下一步计划

1. 实现更多教育平台的支持（Coursera、Khan Academy等）
2. 添加数据质量检查和验证机制
3. 实现更智能的关系推荐算法
4. 添加数据版本控制和回滚功能
5. 提供数据导出和备份功能

## 联系与支持

如有问题或建议，请提交Issue或联系开发团队。
