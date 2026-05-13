# OpenMTSciEd 项目总览

## 🎯 项目定位

**OpenMTSciEd** (Open Science & Technology Education) 是一个开放的STEM教育资源平台,为教育者、开发者和学习者提供:

- 📚 **高质量教程**: 物理、化学、数学等学科的完整教程
- 🎓 **智能学习**: 基于知识图谱的学习路径和个性化推荐
- 🔧 **实践项目**: Arduino、机器人等硬件项目
- ⚡ **开放API**: RESTful API供第三方集成

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────┐
│           Frontend Applications              │
├──────────────────┬──────────────────────────┤
│  iMato (Angular) │ Developer Portal (Next)  │
│  - 学生学习端     │  - 资源浏览              │
│  - 教师管理端     │  - API文档               │
│  - Admin后台      │  - SDK下载               │
└────────┬─────────┴──────────┬───────────────┘
         │                    │
         └────────┬───────────┘
                  │ HTTP/REST
         ┌────────▼───────────┐
         │   Backend APIs      │
         │  Next.js (Port 3000)│
         ├────────────────────┤
         │ - Tutorial API     │
         │ - Courseware API   │
         │ - Knowledge Graph  │
         │ - Hardware Project │
         └────────┬───────────┘
                  │ Neo4j Driver
         ┌────────▼───────────┐
         │   Neo4j Aura       │
         │  (Cloud Database)  │
         ├────────────────────┤
         │ - 4,623 Knowledge  │
         │   Points           │
         │ - 2,225 Course     │
         │   Units            │
         │ - 14 Hardware      │
         │   Projects         │
         └────────────────────┘
```

---

## 📁 项目结构

```
OpenMTSciEd/
├── backend-next/                 # Next.js后端
│   ├── app/
│   │   ├── api/v1/              # API端点
│   │   │   ├── tutorials/       # 教程管理
│   │   │   ├── coursewares/     # 课件管理
│   │   │   ├── hardware-projects/ # 硬件项目
│   │   │   └── knowledge-graph/ # 知识图谱
│   │   │       ├── path/        # 学习路径
│   │   │       └── recommend/   # 资源推荐
│   │   ├── developer/           # 开发者门户页面
│   │   ├── page.tsx             # 主页
│   │   └── layout.tsx           # 布局
│   ├── lib/
│   │   └── neo4j.ts             # Neo4j工具库
│   ├── scripts/
│   │   └── create-neo4j-indexes.js # 索引创建脚本
│   ├── .env.local               # 环境变量
│   ├── package.json
│   └── [文档文件...]
│
├── iMato/                        # Angular前端(独立项目)
│   └── src/
│       ├── app/
│       │   ├── services/
│       │   │   └── openmt-scied.service.ts # API服务
│       │   └── components/
│       └── environments/
│
├── docs/                         # 文档
│   ├── OPENMTSCIED_API_IMPLEMENTATION.md
│   ├── FRONTEND_INTEGRATION_GUIDE.md
│   ├── INTEGRATION_CHECKLIST.md
│   └── PROJECT_OVERVIEW.md (本文件)
│
└── README.md                     # 项目说明
```

---

## 🚀 快速开始

### 1. 启动后端

```bash
cd G:\OpenMTSciEd\backend-next
npm run dev
```

访问:
- **主页**: http://localhost:3000
- **开发者门户**: http://localhost:3000/developer
- **健康检查**: http://localhost:3000/api/health

### 2. 测试API

```powershell
# PowerShell
.\test-openmtscied-apis.ps1
```

或使用浏览器访问:
- http://localhost:3000/api/v1/tutorials?page=1&size=5
- http://localhost:3000/api/v1/hardware-projects?page=1&size=5

### 3. 前端集成

参考 `FRONTEND_INTEGRATION_GUIDE.md` 将API集成到iMato或其他前端应用。

---

## ✨ 核心功能

### 1. 教程管理系统

**API端点**:
- `GET /api/v1/tutorials` - 获取教程列表
- `POST /api/v1/tutorials` - 创建教程
- `GET /api/v1/tutorials/:id` - 获取详情
- `PUT /api/v1/tutorials/:id` - 更新教程
- `DELETE /api/v1/tutorials/:id` - 删除教程

**特性**:
- 分页支持
- 按学科、年级筛选
- 难度级别分类

### 2. 课件管理

**API端点**:
- `GET /api/v1/coursewares` - 获取课件列表
- `POST /api/v1/coursewares` - 创建课件

**支持的类型**:
- PDF文档
- 视频课程
- 交互式内容

### 3. 知识图谱引擎

#### 学习路径生成
```typescript
POST /api/v1/knowledge-graph/path
{
  "user_id": 1,
  "current_grade": "9-12",
  "subjects": ["physics"],
  "learning_goals": ["mechanics"]
}
```

**算法**:
- 基于Neo4j图遍历
- 考虑先修关系(PROGRESSES_TO)
- 难度递进优化
- 跨学科关联

#### 资源推荐
```typescript
POST /api/v1/knowledge-graph/recommend
{
  "user_id": 1,
  "limit": 10,
  "subjects": ["physics", "mathematics"]
}
```

**策略**:
- 协同过滤
- 基于内容的推荐
- 热门内容补充

### 4. 硬件项目管理

**API端点**:
- `GET /api/v1/hardware-projects` - 获取项目列表
- `POST /api/v1/hardware-projects` - 创建项目

**项目信息**:
- 难度级别(beginner/intermediate/advanced)
- 类别(electronics/robotics/programming)
- 所需硬件清单
- 关联知识点
- 预计完成时间

---

## 📊 数据统计

| 指标 | 数量 |
|------|------|
| 知识点(KnowledgePoint) | 4,623 |
| 课程单元(CourseUnit) | 2,225 |
| 题目(Question) | 1,080 |
| 教材章节(TextbookChapter) | 1,058 |
| 课程(Course) | 540 |
| 学科(Subject) | 15 |
| 硬件项目(HardwareProject) | 14 |
| 教程(Tutorial) | 1+ (持续增长) |

**关系统计**:
- PROGRESSES_TO: 28,380条
- CONTAINS: 4,612条
- BELONGS_TO: 539条
- RELATED_TO_SUBJECT: 154条

---

## 🛠️ 技术栈

### 后端
- **框架**: Next.js 16.2.4 (App Router)
- **语言**: TypeScript
- **数据库**: Neo4j Aura (云图数据库)
- **驱动**: neo4j-driver 6.0.1
- **样式**: Tailwind CSS

### 前端(iMato)
- **框架**: Angular 17+
- **HTTP客户端**: HttpClient
- **状态管理**: RxJS Observables
- **样式**: SCSS/Tailwind

### 基础设施
- **部署**: Vercel (计划)
- **数据库**: Neo4j Aura Free Tier
- **版本控制**: Git
- **包管理**: npm

---

## 📖 文档导航

### 开发者文档
1. **[开发者门户](backend-next/DEVELOPER_PORTAL_README.md)** - 在线资源浏览
2. **[API文档](backend-next/API_DOCUMENTATION.md)** - 完整API参考
3. **[快速参考](backend-next/API_QUICK_REFERENCE.md)** - 常用命令和示例
4. **[测试报告](backend-next/API_FINAL_TEST_REPORT.md)** - API测试结果

### 集成指南
5. **[前端集成指南](FRONTEND_INTEGRATION_GUIDE.md)** - Angular集成步骤
6. **[集成检查清单](INTEGRATION_CHECKLIST.md)** - 逐步验证清单
7. **[快速开始](FRONTEND_INTEGRATION_README.md)** - 5分钟集成

### 实施文档
8. **[API实施指南](OPENMTSCIED_API_IMPLEMENTATION.md)** - 原始设计文档

---

## 🎯 目标用户

### 1. STEM教育开发者
**需求**: 寻找优质教学资源  
**使用场景**:
- 浏览教程和课件
- 通过API集成到自己的平台
- 利用知识图谱生成学习路径

### 2. 学校教师
**需求**: 获取教学材料  
**使用场景**:
- 搜索特定主题的教程
- 下载课件资源
- 查看硬件项目方案

### 3. 学生/自学者
**需求**: 系统化学习  
**使用场景**:
- 获取个性化学习路径
- 接收资源推荐
- 参与硬件项目实践

### 4. 教育科技公司
**需求**: 集成教育资源  
**使用场景**:
- 评估API能力
- 集成到现有产品
- 定制化开发

### 5. 开源贡献者
**需求**: 参与项目建设  
**使用场景**:
- 贡献代码
- 添加新资源
- 改进文档

---

## 🔐 安全与认证

### 当前状态(开发环境)
- ✅ API无需认证
- ✅ CORS已配置
- ✅ 所有端点公开访问

### 生产环境计划
- [ ] JWT认证
- [ ] API密钥管理
- [ ] 速率限制
- [ ] 用户权限控制
- [ ] HTTPS强制

---

## 📈 性能指标

| API端点 | 平均响应时间 | 评级 |
|---------|-------------|------|
| Health Check | 285ms | ⭐⭐⭐⭐⭐ |
| Tutorials List | 864ms | ⭐⭐⭐⭐ |
| Hardware Projects | 879ms | ⭐⭐⭐⭐⭐ |
| Learning Path | 1.4s | ⭐⭐⭐⭐ |
| Recommendations | <1s | ⭐⭐⭐⭐⭐ |

**优化措施**:
- ✅ 6个Neo4j索引已创建
- ✅ 查询优化完成
- ✅ 整数类型问题修复

---

## 🗺️ 路线图

### Phase 1: 基础建设 ✅ (已完成)
- [x] Next.js后端搭建
- [x] Neo4j连接配置
- [x] 核心API开发
- [x] 开发者门户
- [x] 前端集成指南

### Phase 2: 功能增强 (进行中)
- [ ] 用户认证系统
- [ ] 更多Tutorial数据
- [ ] 缓存层(Redis)
- [ ] API速率限制
- [ ] 错误监控

### Phase 3: 高级功能 (计划)
- [ ] AI辅助内容生成
- [ ] 学习进度追踪
- [ ] 社区功能(评论、评分)
- [ ] 多语言支持
- [ ] 移动端App

### Phase 4: 生态建设 (未来)
- [ ] SDK发布(npm package)
- [ ] 插件系统
- [ ] 第三方集成
- [ ] 数据分析仪表板
- [ ] 商业化方案

---

## 🤝 贡献指南

### 如何贡献
1. Fork仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

### 贡献领域
- 📝 文档改进
- 🐛 Bug修复
- ✨ 新功能开发
- 🎨 UI/UX优化
- 🧪 测试用例
- 🌍 国际化

---

## 📞 联系方式

- **GitHub**: https://github.com/openmtscied
- **邮箱**: (待添加)
- **文档**: http://localhost:3000/developer

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 LICENSE 文件

---

## 🙏 致谢

感谢以下开源项目:
- Next.js
- Neo4j
- Angular
- Tailwind CSS
- TypeScript

---

**让STEM教育资源触手可及!** 🚀

*最后更新: 2026-05-13*
