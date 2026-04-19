# OpenMTSciEd 补缺补漏任务清单

**创建时间**: 2026-04-18  
**当前状态**: Neo4j配置已修复，待验证

---

## 🔴 立即执行 (今天完成)

### ✅ 已完成
- [x] 修复 `.env` 中的Neo4j配置变量名
- [x] 修复 `path_generator.py` 的Neo4j连接代码
- [x] 修复 `graph_service.py` 的Neo4j连接代码
- [x] 创建开发计划文档

### ⏳ 待执行
- [ ] **阻塞**: Neo4j DNS解析失败 - 需检查网络或Neo4j实例状态
- [ ] 运行 `python verify_neo4j_http.py` 验证HTTP API连接
- [ ] 重启后端服务: `cd backend && python -m openmtscied.main`
- [ ] 测试API: `curl http://localhost:8000/api/v1/path/health`

---

## 📅 本周任务 (2026-04-19 ~ 2026-04-25)

### 阶段1: Neo4j集成验证 (3天)

---

## 🎯 关键里程碑

| 日期 | 里程碑 | 验收标准 |
|------|--------|----------|
| 2026-04-19 | Neo4j连接验证通过 | 能查询到所有节点类型 |
| 2026-04-21 | 路径生成API可用 | POST /api/v1/path/generate 返回有效路径 |
| 2026-04-23 | 前端路径地图组件完成 | 能可视化显示学习路径 |
| 2026-04-26 | PPO模型训练完成 | 模型文件生成，推理正常 |
| 2026-04-30 | MVP功能完整 | 所有核心功能联调通过 |

---

## 📝 每日站会记录模板

### 2026-04-18 (今天)
**完成**:
- 创建开发计划文档
- 修复Neo4j配置问题

**阻塞**:
- 无

**明天计划**:
- 验证Neo4j连接
- 开始任务1.2

---

### 2026-04-19
**完成**:
- [ ] 

**阻塞**:
- [ ]

**明天计划**:
- [ ]

---

## 🐛 已知问题跟踪

| 问题ID | 描述 | 优先级 | 状态 | 负责人 |
|--------|------|--------|------|--------|
| #001 | Neo4j配置变量名不一致 | 🔴 高 | ✅ 已修复 | AI |
| #002 | path_generator只查询单层关系 | 🔴 高 | ⏳ 待处理 | - |
| #003 | 缺少路径可视化前端 | 🟡 中 | ⏳ 待处理 | - |
| #004 | 桌面端Blockly未集成 | 🟡 中 | ⏳ 待处理 | - |

---

## 💡 快速命令参考

```bash
# 验证Neo4j连接
python verify_neo4j_connection.py

# 启动后端 (开发模式)
cd backend
python -m openmtscied.main

# 启动前端Web
cd frontend
npm run dev

# 启动桌面端
cd desktop-manager
npm run tauri dev

# 查看Neo4j数据 (使用Cypher)
# 在Neo4j Browser中执行:
MATCH (n) RETURN labels(n) AS label, count(n) AS count

# 测试路径生成API
curl -X POST http://localhost:8000/api/v1/path/generate \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test1","age":14,"grade_level":"middle","max_nodes":10}'
```

---

## 📚 相关文档

- [开发计划详情](./GAP_ANALYSIS_AND_DEVELOPMENT_PLAN.md)
- [项目需求文档](./docs/PROJECT_REQUIREMENTS.md)
- [README](./README.md)
- [Neo4j Schema设计](./docs/neo4j_schema_design.md)

---

**最后更新**: 2026-04-18  
**下次更新**: 2026-04-19 (完成Neo4j验证后)
