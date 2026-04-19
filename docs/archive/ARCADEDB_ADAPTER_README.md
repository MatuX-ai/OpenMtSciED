# ArcadeDB 适配器使用指南

## 概述

`arcadedb_adapter.py` 提供了一个与现有 `KnowledgeGraphManager` 兼容的接口层，允许您从 Neo4j 无缝切换到 ArcadeDB。

## 主要特性

- ✅ **Cypher 查询支持** - 完全兼容 Neo4j Cypher 语法
- ✅ **SQL 查询支持** - 支持原生 SQL 查询
- ✅ **自动 Schema 初始化** - 自动创建必要的类型和索引
- ✅ **批量操作** - 支持批量创建节点和关系
- ✅ **路径查询** - 支持最短路径查找
- ✅ **推荐引擎** - 基于图关系的智能推荐
- ✅ **模拟模式** - 连接失败时自动降级为模拟模式

## 快速开始

### 1. 启动 ArcadeDB 服务器

使用 Docker 快速启动：

```bash
docker run --rm -p 2480:2480 -p 2424:2424 \
  -e JAVA_OPTS="-Darcadedb.server.rootPassword=playwithdata" \
  arcadedata/arcadedb:latest
```

或者下载并手动启动：

```bash
# Windows
bin\server.bat

# Linux/Mac
bin/server.sh
```

### 2. 运行测试

```bash
# 快速连接测试
python test_arcadedb_adapter.py

# 完整功能测试（包含示例数据）
python src/ai_service/arcadedb_adapter.py
```

### 3. 基本使用

```python
from ai_service.arcadedb_adapter import ArcadeDBAdapter

# 创建适配器实例
adapter = ArcadeDBAdapter(
    host="localhost",
    port=2480,
    database="OpenMTSciEd",
    username="root",
    password="playwithdata"
)

# 创建知识点节点
node_data = {
    "node_id": "python_basics",
    "title": "Python基础语法",
    "description": "Python编程语言基础概念",
    "category": "programming",
    "difficulty_level": "beginner",
    "estimated_hours": 10.0,
    "prerequisites": [],
    "learning_outcomes": ["掌握变量和数据类型"],
    "tags": ["python", "basics"]
}

adapter.create_knowledge_node(node_data)

# 创建关系
adapter.create_relationship(
    from_node_id="python_basics",
    to_node_id="python_oop",
    relationship_type="PREREQUISITE",
    weight=1.0,
    description="学习OOP前需要掌握基础"
)

# 查找最短路径
path = adapter.find_shortest_path("python_basics", "python_expert")
print(f"学习路径: {' -> '.join(path)}")

# 获取推荐
recommendations = adapter.get_node_recommendations("python_basics", limit=5)

# 获取统计信息
stats = adapter.get_statistics()
print(f"总节点数: {stats['total_nodes']}")
print(f"总关系数: {stats['total_relationships']}")

# 关闭连接
adapter.close()
```

## API 参考

### ArcadeDBAdapter

#### 初始化参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| host | str | "localhost" | ArcadeDB 服务器地址 |
| port | int | 2480 | ArcadeDB 服务器端口 |
| database | str | "OpenMTSciEd" | 数据库名称 |
| username | str | "root" | 用户名 |
| password | str | "playwithdata" | 密码 |

#### 主要方法

##### create_knowledge_node(node_data: Dict) -> bool
创建或更新知识点节点

**参数:**
- `node_data`: 包含节点属性的字典
  - `node_id` (必需): 节点唯一标识
  - `title`: 标题
  - `description`: 描述
  - `category`: 分类
  - `difficulty_level`: 难度级别 (beginner/intermediate/advanced/expert)
  - `estimated_hours`: 预计学习时长
  - `prerequisites`: 先修知识列表
  - `learning_outcomes`: 学习成果列表
  - `tags`: 标签列表

**返回:** 成功返回 True，失败返回 False

##### create_relationship(from_id, to_id, type, weight, description) -> bool
创建两个节点之间的关系

**参数:**
- `from_node_id`: 起始节点 ID
- `to_node_id`: 目标节点 ID
- `relationship_type`: 关系类型 (默认: "PREREQUISITE")
- `weight`: 关系权重 (默认: 1.0)
- `description`: 关系描述

**返回:** 成功返回 True，失败返回 False

##### batch_create_nodes(nodes: List[Dict]) -> Dict[str, int]
批量创建节点

**返回:** `{"success": count, "failed": count}`

##### batch_create_relationships(relationships: List[Dict]) -> Dict[str, int]
批量创建关系

**返回:** `{"success": count, "failed": count}`

##### find_shortest_path(start_id, end_id, max_depth) -> Optional[List[str]]
查找两个节点间的最短路径

**参数:**
- `start_node_id`: 起始节点 ID
- `end_node_id`: 目标节点 ID
- `max_depth`: 最大搜索深度 (默认: 10)

**返回:** 路径节点 ID 列表，找不到返回 None

##### get_node_recommendations(node_id, limit) -> List[Dict]
获取节点的推荐后续学习内容

**参数:**
- `node_id`: 节点 ID
- `limit`: 返回数量限制 (默认: 5)

**返回:** 推荐节点列表

##### get_statistics() -> Dict
获取数据库统计信息

**返回:** 包含节点数、关系数等统计信息的字典

##### close()
关闭数据库连接

## 与 Neo4j KnowledgeGraphManager 的对比

| 功能 | Neo4j | ArcadeDB Adapter | 说明 |
|------|-------|------------------|------|
| Cypher 查询 | ✅ | ✅ | 完全兼容 |
| 事务支持 | ✅ | ✅ | ACID 事务 |
| 批量导入 | ✅ | ✅ | 性能相当 |
| 路径查询 | ✅ | ✅ | shortestPath |
| Python 驱动 | 官方驱动 | HTTP API | ArcadeDB 通过 HTTP |
| 社区生态 | 成熟 | 发展中 | Neo4j 更成熟 |
| 许可费用 | 社区版有限制 | 完全免费 | Apache 2.0 |
| 多模型支持 | 仅图数据库 | 图+文档+KV+向量 | ArcadeDB 优势 |

## 迁移指南

### 从 Neo4j 迁移到 ArcadeDB

1. **安装 ArcadeDB**
   ```bash
   docker pull arcadedata/arcadedb:latest
   ```

2. **数据导出（从 Neo4j）**
   ```python
   # 使用现有的 Neo4j 工具导出数据
   # 可以参考 scripts/graph_db/export_for_echarts.py
   ```

3. **数据导入（到 ArcadeDB）**
   ```python
   from ai_service.arcadedb_adapter import ArcadeDBAdapter
   
   adapter = ArcadeDBAdapter()
   
   # 批量导入节点
   nodes = [...]  # 从 Neo4j 导出的数据
   adapter.batch_create_nodes(nodes)
   
   # 批量导入关系
   relationships = [...]  # 从 Neo4j 导出的数据
   adapter.batch_create_relationships(relationships)
   ```

4. **更新代码引用**
   ```python
   # 原来
   from ai_service.knowledge_graph_manager import KnowledgeGraphManager
   kgm = KnowledgeGraphManager()
   
   # 改为
   from ai_service.arcadedb_adapter import ArcadeDBAdapter
   kgm = ArcadeDBAdapter()
   ```

5. **测试验证**
   ```bash
   python test_arcadedb_adapter.py
   ```

## 性能优化建议

1. **批量操作**: 使用 `batch_create_nodes` 和 `batch_create_relationships` 而非逐个创建
2. **索引优化**: 适配器会自动创建常用字段的索引
3. **查询优化**: 
   - 限制路径查询的深度 (`max_depth`)
   - 使用具体的节点 ID 而非模糊匹配
4. **连接池**: 对于高并发场景，考虑实现连接池

## 故障排除

### 无法连接到 ArcadeDB

**症状:** 适配器进入模拟模式

**解决方案:**
1. 确认 ArcadeDB 服务器正在运行
2. 检查端口 2480 是否被占用
3. 验证用户名和密码是否正确

```bash
# 检查 ArcadeDB 是否运行
curl http://localhost:2480/api/v1/server

# 查看 Docker 日志
docker logs <container_id>
```

### 查询执行失败

**症状:** Cypher 或 SQL 查询抛出异常

**解决方案:**
1. 检查查询语法是否正确
2. 确认节点类型和属性名正确
3. 查看 ArcadeDB 日志获取详细错误信息

### 性能问题

**症状:** 查询响应缓慢

**解决方案:**
1. 检查是否创建了适当的索引
2. 优化查询语句，避免全表扫描
3. 考虑增加 ArcadeDB 服务器的内存

## 常见问题

### Q: ArcadeDB 和 Neo4j 的性能对比如何？

A: 根据官方基准测试，ArcadeDB 在普通硬件上可以实现每秒数百万条记录的处理能力，通常比 Neo4j 快 2-5 倍。但实际性能取决于具体用例和数据规模。

### Q: 是否需要修改现有的 Cypher 查询？

A: 不需要。ArcadeDB 完全兼容 Open Cypher 语法，现有的 Neo4j Cypher 查询可以直接使用。

### Q: ArcadeDB 支持分布式部署吗？

A: 是的，ArcadeDB 支持通过 Docker 和 Kubernetes 进行分布式部署，提供高可用性和可扩展性。

### Q: 数据迁移会很复杂吗？

A: 不复杂。由于两者都支持 Cypher，您可以：
1. 从 Neo4j 导出数据为 JSON/CSV
2. 使用 ArcadeDB 适配器批量导入
3. 验证数据完整性

### Q: 如果遇到问题，哪里可以获得帮助？

A: 
- ArcadeDB 官方文档: https://docs.arcadedb.com/
- GitHub Issues: https://github.com/ArcadeData/arcadedb/issues
- Discord 社区: https://discord.gg/arcadedb

## 下一步

- [ ] 集成到现有的 `KnowledgeGraphManager`
- [ ] 实现数据迁移脚本
- [ ] 性能基准测试
- [ ] 添加更多单元测试

## 许可证

Apache 2.0
