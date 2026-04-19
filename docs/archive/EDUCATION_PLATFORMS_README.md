# 教育平台数据生成器 - 快速开始

## 🚀 一键运行

```bash
python scripts/run_education_platform_pipeline.py
```

这将自动执行以下流程：
1. ✅ 生成所有教育平台数据（edX、MIT OCW、中国大学MOOC）
2. ✅ 优化知识图谱关系（跨平台递进 + 内容相似度推荐）
3. ✅ 导入到Neo4j数据库

## 📋 前提条件

### 1. Python依赖

```bash
pip install schedule scikit-learn numpy neo4j fastapi uvicorn
```

### 2. Neo4j数据库

确保Neo4j Aura实例正在运行，并更新连接配置：

编辑 `scripts/graph_db/import_to_neo4j.py`:
```python
self.uri = "neo4j+s://your-instance.databases.neo4j.io"
self.username = "your-username"
self.password = "your-password"
```

## 🎯 使用方式

### 方式一：命令行（推荐用于测试）

```bash
# 完整流程
python scripts/run_education_platform_pipeline.py

# 或分步执行
python scripts/scrapers/education_platform_generator.py      # 生成数据
python scripts/graph_db/knowledge_graph_optimizer.py         # 优化关系
python scripts/graph_db/import_to_neo4j.py                   # 导入Neo4j
```

### 方式二：API控制（推荐用于集成）

启动后端服务：
```bash
cd backend
python -m uvicorn openmtscied.main:app --reload --port 8000
```

API调用：
```bash
# 查看所有平台状态
curl http://localhost:8000/api/v1/education-platforms/status

# 生成所有平台数据
curl -X POST http://localhost:8000/api/v1/education-platforms/generate

# 生成特定平台
curl -X POST http://localhost:8000/api/v1/education-platforms/generate \
  -H "Content-Type: application/json" \
  -d '{"platform_name": "edX"}'

# 启动定时任务
curl -X POST http://localhost:8000/api/v1/education-platforms/schedule/start
```

### 方式三：Admin界面（推荐用于日常管理）

1. 启动前端：
```bash
cd desktop-manager
npm start
```

2. 访问管理页面：
```
http://localhost:4200/admin/education-platforms
```

3. 在界面上可以：
   - 📊 查看所有平台状态和统计
   - ▶️ 手动触发生成任务
   - ⏰ 启动/停止定时任务
   - 🔄 刷新实时状态

## 📁 生成的文件

```
data/
├── course_library/
│   ├── edx_courses.json                    # edX课程数据
│   ├── mit_opencourseware_courses.json     # MIT OCW课程数据
│   └── chinese_mooc_courses.json           # 中国大学MOOC课程数据
├── textbook_library/
│   └── ... (其他课件数据)
└── knowledge_graph_relationships.json      # 优化后的关系数据
```

## 🔧 配置定时任务

每个平台的更新频率可在生成器类中配置：

```python
# scripts/scrapers/education_platform_generator.py

class EdXGenerator(EducationPlatformGenerator):
    def get_schedule_config(self) -> Dict[str, Any]:
        return {
            "interval": "weekly",    # daily, weekly, biweekly
            "day": "monday",         # monday, tuesday, etc.
            "time": "02:00"          # 24小时制
        }
```

当前默认配置：
- **edX**: 每周一 02:00
- **MIT OpenCourseWare**: 每两周 周三 03:00
- **中国大学MOOC**: 每周五 04:00

## ➕ 添加新平台

1. 创建新的生成器类：

```python
class YourPlatformGenerator(EducationPlatformGenerator):
    def __init__(self):
        super().__init__("Your Platform Name")
    
    def generate_courses(self) -> List[Dict[str, Any]]:
        # 实现数据生成逻辑
        courses = [...]
        return courses
    
    def get_schedule_config(self) -> Dict[str, Any]:
        return {
            "interval": "weekly",
            "day": "sunday",
            "time": "03:00"
        }
```

2. 在管理器中注册：

```python
# 在 EducationPlatformManager.__init__() 中添加
self.register_generator(YourPlatformGenerator())
```

## 🎨 知识图谱关系优化

系统会自动建立两种类型的关系：

### 1. PROGRESSES_TO（递进关系）
- 连接不同难度级别的同主题课程
- 例如：中学物理 → 大学物理
- 基于学科和年级级别自动匹配

### 2. SIMILAR_TO（相似度推荐）
- 连接内容相似但来自不同平台的课程
- 基于TF-IDF和余弦相似度计算
- 相似度阈值：0.3（可调整）

## 📊 查看结果

### Neo4j Browser

访问Neo4j Browser执行查询：

```cypher
// 查看所有平台
MATCH (n) RETURN DISTINCT n.source AS platform, count(n) AS count

// 查看递进关系
MATCH ()-[r:PROGRESSES_TO]->() RETURN count(r)

// 查看相似度推荐
MATCH ()-[r:SIMILAR_TO]->() RETURN count(r)

// 查找某课程的推荐
MATCH (c:CourseUnit {title: "Introduction to Computer Science"})
OPTIONAL MATCH (c)-[:SIMILAR_TO]->(recommended)
RETURN c.title, recommended.title, r.similarity_score
```

### API查询

```bash
# 获取学习路径推荐
curl http://localhost:8000/api/v1/path/recommend?course_id=EDX-CS-001
```

## ⚠️ 常见问题

### Q1: 无法连接到Neo4j
**A:** 检查连接配置和网络连接，确保Aura实例状态为RUNNING

### Q2: 数据生成很慢
**A:** 目前是示例数据，很快。真实爬取时会较慢，建议使用后台任务

### Q3: 如何停止定时任务
**A:** 
- API: `POST /api/v1/education-platforms/schedule/stop`
- Admin界面: 点击"停止定时任务"按钮

### Q4: 如何查看日志
**A:** 
- 数据生成日志: `education_platform_generator.log`
- 关系优化日志: `knowledge_graph_optimizer.log`
- Neo4j导入日志: `neo4j_import.log`

## 📖 详细文档

完整的使用指南和API文档请查看：
- [教育平台生成器使用指南](../docs/EDUCATION_PLATFORM_GENERATOR_GUIDE.md)
- [API文档](http://localhost:8000/docs) (启动后端后访问)

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个系统！

## 📄 许可证

MIT License
