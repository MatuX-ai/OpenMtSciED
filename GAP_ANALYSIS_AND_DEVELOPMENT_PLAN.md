# OpenMTSciEd 补缺补漏开发计划

**创建时间**: 2026-04-18  
**当前完成度**: ~50%  
**目标完成度**: 90%+ (MVP可发布版本)

---

## 📊 当前状态评估

### ✅ 已完成核心功能
1. **知识图谱数据** (阶段A - 60%)
   - ✅ Neo4j Aura云数据库已搭建并运行
   - ✅ 教程库数据: OpenSciEd (150+单元), 格物斯坦, stemcloud.cn
   - ✅ 课件库数据: OpenStax (50+章节), TED-Ed, STEM-PBL标准
   - ✅ 硬件项目: 30+项目 (预算≤50元)
   - ✅ 过渡项目: Blockly编程模拟项目
   - ⚠️ 数据已导入Neo4j (125 CourseUnit, 316 KnowledgePoint, 11 TextbookChapter)

2. **后端API架构** (70%)
   - ✅ FastAPI主应用 + CORS配置
   - ✅ 认证API (JWT Token)
   - ✅ 路径生成API (基础规则引擎)
   - ✅ WebUSB烧录服务
   - ✅ Blockly代码生成
   - ⚠️ Neo4j集成刚修复配置问题

3. **前端Web门户** (90%)
   - ✅ 营销首页 + 4个特性页面
   - ✅ 用户认证 (登录/注册/个人资料)
   - ✅ 下载页面 (桌面端入口)
   - ✅ Angular standalone组件架构
   - ✅ 依赖注入问题已修复 (使用inject()函数)

4. **桌面端Tauri** (50%)
   - ✅ 基础框架搭建
   - ✅ Angular前端集成
   - ⚠️ 核心学习功能待完善

### ❌ 关键缺失项
1. **Neo4j查询逻辑不完善** (中优先级)
2. **缺少完整的学习路径可视化** (中优先级)
3. **用户测试与性能优化缺失** (低优先级)
4. **桌面端核心功能未完成** (中优先级)

---

## 🎯 开发计划 (分3个阶段)

### 阶段1: Neo4j集成验证与路径生成完善 (3天)

#### 任务1.1: 验证Neo4j连接与数据查询
**优先级**: 🔴 高  
**预计工时**: 0.5天

**执行步骤**:
1. 重启后端服务，验证Neo4j连接
2. 测试基础Cypher查询
3. 验证已导入数据的完整性

**验收标准**:
- [ ] `GET /api/v1/path/health` 返回healthy
- [ ] 能成功查询CourseUnit节点
- [ ] 能查询PROGRESSES_TO关系

**相关文件**:
- `backend/openmtscied/services/path_generator.py` (已修复)
- `backend/openmtscied/services/graph_service.py` (已修复)
- `.env` (已更新配置)

---

#### 任务1.2: 完善路径生成算法
**优先级**: 🔴 高  
**预计工时**: 1.5天

**当前问题**:
- `path_generator.py` 只查询单层关系，未实现多跳路径
- 缺少难度递进逻辑
- 未考虑用户历史完成情况

**改进方案**:
```python
# 增强版路径生成查询
query = """
MATCH path = (start:CourseUnit {id: $start_id})-[:PROGRESSES_TO*1..3]->(target)
WITH target, length(path) as hop_count
OPTIONAL MATCH (target)-[:HARDWARE_MAPS_TO]->(hp:HardwareProject)
WHERE hp.total_cost <= 50
RETURN target, hp, hop_count
ORDER BY hop_count, target.difficulty
LIMIT $max_nodes
"""
```

**验收标准**:
- [ ] 能生成3跳以内的完整学习路径
- [ ] 每个节点包含关联的硬件项目
- [ ] 路径按难度递进排序
- [ ] API响应时间 < 500ms

**相关文件**:
- `backend/openmtscied/services/path_generator.py`
- `backend/openmtscied/api/path_api.py`

---

#### 任务1.3: 添加路径推荐起点选择逻辑
**优先级**: 🟡 中  
**预计工时**: 1天

**需求**:
根据用户年龄和年级自动推荐起始单元

**实现逻辑**:
```python
def recommend_start_unit(self, age: int, grade_level: str) -> str:
    if age < 12:
        # 小学: 从 Elementary 单元开始
        return self._find_elementary_unit()
    elif age < 15:
        # 初中: 从 Middle School 单元开始
        return self._find_middle_unit(grade_level)
    else:
        # 高中: 从 High School 单元开始
        return self._find_high_school_unit()
```

**验收标准**:
- [ ] 不同年龄段返回不同的起始单元
- [ ] 起始单元必须有后续递进关系
- [ ] 单元测试覆盖率 > 80%

---



### 阶段2: 前端路径可视化与交互 (4天)

#### 任务3.1: 创建学习路径地图组件
**优先级**: 🔴 高  
**预计工时**: 2天

**功能需求**:
- 使用ECharts或D3.js绘制知识图谱
- 支持节点点击查看详情
- 显示路径进度 (已完成/进行中/未开始)

**技术选型**:
- 方案A: ECharts Graph (简单快速)
- 方案B: D3.js Force-Directed Graph (更灵活)

**验收标准**:
- [ ] 能渲染20+节点的路径图
- [ ] 节点颜色区分类型 (教程/课件/硬件)
- [ ] 连线显示关系类型
- [ ] 响应式设计 (支持移动端)

**相关文件**:
- 新建: `frontend/src/app/path-map/path-map.component.ts`
- 新建: `frontend/src/app/path-map/path-map.component.html`

---

#### 任务3.2: 路径详情侧边栏
**优先级**: 🟡 中  
**预计工时**: 1天

**功能**:
- 点击节点显示详细信息
- 教程单元: 显示实验清单、PDF链接
- 课件章节: 显示PDF下载按钮
- 硬件项目: 显示材料清单、Blockly编辑器入口

**验收标准**:
- [ ] 侧边栏动画流畅
- [ ] 信息加载 < 300ms
- [ ] PDF链接可正常打开

---

#### 任务3.3: 路径进度追踪
**优先级**: 🟡 中  
**预计工时**: 1天

**功能**:
- 记录用户完成的节点
- 显示完成百分比
- 解锁下一节点的条件检查

**API设计**:
```typescript
// 标记节点完成
POST /api/v1/path/complete-node
{
  "user_id": "user123",
  "node_id": "OS-Unit-001",
  "completion_rate": 100
}

// 获取进度
GET /api/v1/path/progress?user_id=user123
```

**验收标准**:
- [ ] 进度实时保存到数据库
- [ ] 刷新页面后进度不丢失
- [ ] 完成率计算准确

---

### 阶段3: 桌面端核心功能完善 (5天)

#### 任务4.1: Blockly图形化编程集成
**优先级**: 🔴 高  
**预计工时**: 2天

**当前状态**:
- `blockly_hardware_blocks.json` 已定义硬件块
- `blockly_generator.py` 已实现代码生成
- 需要在桌面端集成Blockly编辑器

**集成步骤**:
1. 在Tauri应用中嵌入Blockly编辑器
2. 加载硬件块定义
3. 实现代码预览和导出

**验收标准**:
- [ ] Blockly编辑器正常加载
- [ ] 能拖拽硬件块搭建程序
- [ ] 生成的Arduino代码语法正确

---

#### 任务4.2: WebUSB硬件烧录
**优先级**: 🔴 高  
**预计工时**: 2天

**当前状态**:
- `webusb_flash_service.py` 已实现
- 需要在桌面端调用

**集成方案**:
```typescript
// desktop-manager/src/app/features/hardware-flash/hardware-flash.component.ts
async flashDevice(code: string) {
  const device = await navigator.usb.requestDevice({
    filters: [{ vendorId: 0x2341 }] // Arduino
  });
  
  await device.open();
  // 调用Rust后端进行烧录
  await invoke('flash_arduino', { code, deviceId: device.deviceId });
}
```

**验收标准**:
- [ ] 能检测到连接的Arduino设备
- [ ] 烧录成功率 > 95%
- [ ] 烧录进度条显示

---

#### 任务4.3: 离线资源管理
**优先级**: 🟢 低  
**预计工时**: 1天

**功能**:
- 下载教程PDF到本地
- 缓存知识图谱数据
- 离线模式检测

**验收标准**:
- [ ] 无网络时能查看已下载资源
- [ ] 离线/在线状态切换流畅

---

## 📅 时间安排

| 阶段 | 任务数 | 预计工时 | 开始日期 | 结束日期 |
|------|--------|----------|----------|----------|
| 阶段1: Neo4j集成 | 3 | 3天 | 2026-04-19 | 2026-04-21 |
| 阶段2: 前端可视化 | 3 | 4天 | 2026-04-22 | 2026-04-25 |
| 阶段3: 桌面端完善 | 3 | 5天 | 2026-04-26 | 2026-04-30 |
| **总计** | **9** | **12天** | - | - |

---

## ✅ 验收标准 (MVP发布条件)

### 功能验收
- [ ] 用户能注册/登录系统
- [ ] 能生成个性化学习路径 (至少10个节点)
- [ ] 路径可视化清晰易懂
- [ ] 能查看教程/课件详情
- [ ] 桌面端能编写Blockly程序
- [ ] 桌面端能烧录Arduino设备

### 性能验收
- [ ] API响应时间 < 500ms (P95)
- [ ] 前端首屏加载 < 3s
- [ ] Neo4j查询响应 < 200ms
- [ ] 桌面端启动时间 < 5s

### 数据验收
- [ ] Neo4j节点总数 ≥ 500
- [ ] 关系总数 ≥ 1000
- [ ] 跨学科关联准确率 ≥ 90% (抽检)
- [ ] 硬件项目成本全部 ≤ 50元

### 稳定性验收
- [ ] 无Critical级别Bug
- [ ] 连续运行24小时无崩溃
- [ ] 并发用户100人时系统稳定

---

## 🔧 技术债务清理

### 高优先级
1. **统一环境变量命名**
   - 当前: `NEO4J_CONNECTION_URI` vs `NEO4J_URI`
   - 解决: 统一为 `NEO4J_URI`

2. **移除JSON文件依赖**
   - 当前: 部分服务仍读取JSON文件
   - 解决: 全部改为Neo4j查询

3. **错误处理规范化**
   - 当前: 部分API直接抛出异常
   - 解决: 统一使用HTTPException + 错误码

### 中优先级
4. **日志系统完善**
   - 添加结构化日志
   - 集成ELK或Grafana

5. **API文档完善**
   - 补充Swagger注释
   - 添加请求/响应示例

---

## 📝 下一步行动

### 立即执行 (今天)
1. ✅ 修复Neo4j配置 (已完成)
2. ⏳ 重启后端服务验证连接
3. ⏳ 运行测试查询验证数据

### 明天开始
1. 启动阶段1任务1.1: 验证Neo4j连接
2. 创建任务跟踪看板 (GitHub Projects)
3. 分配开发人员 (如果有团队)

---

## 💡 风险提示

### 技术风险
1. **Neo4j查询性能瓶颈**
   - 缓解: 添加索引，使用查询缓存

2. **WebUSB兼容性问题**
   - 缓解: 提供备用方案 (串口烧录)

### 进度风险
- 优先保证规则引擎路径生成功能可用

---

## 📞 联系方式

如有问题，请联系:
- 项目负责人: dev@openmtscied.org
- GitHub Issues: https://github.com/MatuX-ai/OpenMtSciED/issues

---

**最后更新**: 2026-04-18  
**下次审查**: 2026-04-25 (阶段1完成后)
