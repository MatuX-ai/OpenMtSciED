# ArcadeDB 快速入门指南

## 🚀 5分钟快速开始

### 步骤 1: 启动 ArcadeDB 服务器

#### 方法 A: 使用提供的脚本（推荐）

双击运行：
```
start-arcadedb.bat
```

#### 方法 B: 手动使用 Docker

打开命令行，运行：
```bash
docker run --rm -p 2480:2480 -p 2424:2424 ^
  -e JAVA_OPTS="-Darcadedb.server.rootPassword=playwithdata -Darcadedb.server.defaultDatabases=OpenMTSciEd[root]" ^
  arcadedata/arcadedb:latest
```

**等待看到以下输出表示启动成功：**
```
[INFO] ArcadeDB Server started
[INFO] HTTP Server listening on port 2480
```

### 步骤 2: 验证服务器运行

打开浏览器访问：
```
http://localhost:2480
```

您应该看到 **ArcadeDB Studio** 界面。

或者在命令行测试：
```bash
curl http://localhost:2480/api/v1/server
```

### 步骤 3: 运行测试脚本

打开新的命令行窗口，运行：

```bash
python test_arcadedb_simple.py
```

选择测试模式：
- 输入 `1` - 快速连接测试
- 输入 `2` - 完整功能演示（推荐）

### 步骤 4: 查看结果

如果一切正常，您将看到：

```
======================================================================
ArcadeDB 快速连接测试
======================================================================

✅ 成功连接到 ArcadeDB!

🧪 执行测试查询...
   ✅ Cypher 查询成功
   ✅ SQL 查询成功

📊 数据库统计:
   总节点数: 4
   总关系数: 3
   节点类型: ['KnowledgeNode']
   关系类型: ['PREREQUISITE']

✅ 所有测试通过!
```

## 📖 基本使用示例

### 创建知识点

```python
from src.ai_service.arcadedb_adapter import ArcadeDBAdapter

# 连接数据库
adapter = ArcadeDBAdapter(
    host="localhost",
    port=2480,
    database="OpenMTSciEd",
    username="root",
    password="playwithdata"
)

# 创建节点
node = {
    "node_id": "math_algebra",
    "title": "代数基础",
    "description": "学习代数的基本概念",
    "category": "数学",
    "difficulty_level": "beginner",
    "estimated_hours": 8.0,
    "prerequisites": [],
    "learning_outcomes": ["理解变量", "掌握方程"],
    "tags": ["数学", "代数", "基础"]
}

adapter.create_knowledge_node(node)
print("✅ 节点创建成功")
```

### 创建关系

```python
# 创建先修关系
adapter.create_relationship(
    from_node_id="math_arithmetic",
    to_node_id="math_algebra",
    relationship_type="PREREQUISITE",
    weight=1.0,
    description="学习代数前需要掌握算术"
)
print("✅ 关系创建成功")
```

### 查询路径

```python
# 查找学习路径
path = adapter.find_shortest_path(
    start_node_id="math_arithmetic",
    end_node_id="math_calculus",
    max_depth=5
)

if path:
    print(f"学习路径: {' → '.join(path)}")
else:
    print("未找到路径")
```

### 获取推荐

```python
# 获取推荐学习内容
recommendations = adapter.get_node_recommendations(
    node_id="math_algebra",
    limit=5
)

print("推荐学习:")
for i, rec in enumerate(recommendations, 1):
    print(f"{i}. {rec['title']} (难度: {rec['difficulty_level']})")
```

### 批量导入

```python
# 批量创建节点
nodes = [
    {"node_id": "node1", "title": "节点1", ...},
    {"node_id": "node2", "title": "节点2", ...},
    # ... 更多节点
]

results = adapter.batch_create_nodes(nodes)
print(f"成功: {results['success']}, 失败: {results['failed']}")

# 批量创建关系
relationships = [
    {"from_node_id": "node1", "to_node_id": "node2", ...},
    # ... 更多关系
]

results = adapter.batch_create_relationships(relationships)
print(f"成功: {results['success']}, 失败: {results['failed']}")
```

## 🔍 使用 ArcadeDB Studio

ArcadeDB Studio 是一个强大的 Web 界面工具。

### 访问 Studio

浏览器打开：`http://localhost:2480`

### 主要功能

1. **Command Panel** - 执行查询
   - 支持 Cypher、SQL、Gremlin 等语言
   - 实时查看结果

2. **Graph Panel** - 可视化图谱
   - 交互式图形展示
   - 拖拽探索节点关系

3. **Database Panel** - 管理数据库
   - 查看 Schema
   - 创建/删除数据库
   - 备份恢复

4. **API Panel** - API 文档
   - 查看所有可用 API
   - 在线测试

### 示例查询

在 Studio 的 Command Panel 中尝试：

**Cypher 查询:**
```cypher
MATCH (n:KnowledgeNode) 
RETURN n LIMIT 10
```

**SQL 查询:**
```sql
SELECT FROM KnowledgeNode LIMIT 10
```

**路径查询:**
```cypher
MATCH path = (a:KnowledgeNode {node_id: 'math_algebra'})-[:PREREQUISITE*1..3]->(b)
RETURN path
```

## 🛠️ 常见问题

### Q1: 无法连接到 ArcadeDB

**症状:** 测试脚本显示 "无法连接到 ArcadeDB 服务器"

**解决:**
1. 确认 ArcadeDB 正在运行
   ```bash
   docker ps | findstr arcadedb
   ```

2. 检查端口是否被占用
   ```bash
   netstat -ano | findstr ":2480"
   ```

3. 重启 ArcadeDB
   ```bash
   # 停止现有容器
   docker stop arcadedb-server
   
   # 重新启动
   start-arcadedb.bat
   ```

### Q2: 查询执行失败

**症状:** Cypher 或 SQL 查询报错

**解决:**
1. 检查语法是否正确
2. 确认节点类型和属性名
3. 在 Studio 中测试相同的查询

### Q3: 性能较慢

**解决:**
1. 使用批量操作而非单个创建
2. 确保已创建适当的索引
3. 限制查询返回的数据量
4. 增加 Docker 容器的内存分配

### Q4: 数据丢失

**注意:** 使用 `--rm` 参数时，容器停止后数据会丢失

**持久化方案:**
```bash
docker run -d ^
  -p 2480:2480 ^
  -v arcadedb-data:/opt/arcadedb/databases ^
  -e JAVA_OPTS="-Darcadedb.server.rootPassword=playwithdata" ^
  --name arcadedb-server ^
  arcadedata/arcadedb:latest
```

## 📚 下一步

1. **阅读完整文档**: [ARCADEDB_ADAPTER_README.md](./ARCADEDB_ADAPTER_README.md)

2. **查看测试报告**: [ARCADEDB_TEST_REPORT.md](./ARCADEDB_TEST_REPORT.md)

3. **集成到项目**: 
   - 修改 `src/config/settings.py` 添加配置
   - 更新 `KnowledgeGraphManager` 支持 ArcadeDB
   - 迁移现有数据

4. **性能优化**:
   - 创建合适的索引
   - 优化查询语句
   - 调整 JVM 参数

5. **生产部署**:
   - 配置持久化存储
   - 设置备份策略
   - 监控和告警

## 💡 提示

- **开发环境**: 使用 `--rm` 便于清理
- **测试环境**: 挂载卷持久化数据
- **生产环境**: 使用 Kubernetes 部署

## 🆘 获取帮助

- **官方文档**: https://docs.arcadedb.com/
- **GitHub Issues**: https://github.com/ArcadeData/arcadedb/issues
- **Discord**: https://discord.gg/arcadedb
- **项目文档**: 查看本项目的 docs 目录

---

**祝您使用愉快！** 🎉
