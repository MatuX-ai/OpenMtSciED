# OpenMTSciEd 配置说明

## 环境变量 (.env)

| 变量名 | 描述 | 默认值 |
| --- | --- | --- |
| `NEO4J_URI` | Neo4j 数据库连接地址 | `bolt://localhost:7687` |
| `NEO4J_USER` | Neo4j 用户名 | `neo4j` |
| `NEO4J_PASSWORD` | Neo4j 密码 | `password` |
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql://...` |
| `REDIS_URL` | Redis 缓存地址 | `redis://localhost:6379/0` |
| `MINICPM_API_KEY` | MiniCPM AI 模型密钥 | (可选) |

## 知识图谱配置

在 `backend/openmtscied/services/graph_service.py` 中可以调整图谱查询的深度和关联权重。

## 硬件项目配置

所有硬件项目的元数据存储在 `data/hardware_projects.json` 中。修改后需重启后端服务以生效。
