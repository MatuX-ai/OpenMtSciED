# OpenMTSciEd - 开放STEM教育资源平台

[![API Status](https://img.shields.io/badge/API-v1.0.0-green)](http://localhost:3000/api/health)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)
[![Neo4j](https://img.shields.io/badge/Database-Neo4j_Aura-purple)](https://neo4j.com/cloud/)
[![Next.js](https://img.shields.io/badge/Framework-Next.js_16-black)](https://nextjs.org/)

> **Open Science & Technology Education** - 为教育者、开发者和学习者提供开放的STEM教育资源

---

## 🌟 特性

- 📚 **丰富资源**: 4,623+知识点, 2,225+课程单元, 15个学科覆盖
- 🧠 **智能推荐**: 基于Neo4j知识图谱的个性化学习路径
- 🔧 **实践项目**: Arduino、机器人等硬件项目
- ⚡ **开放API**: RESTful API供第三方集成
- 🎨 **现代UI**: 响应式设计,支持深色模式
- 🌍 **开源免费**: MIT许可证,社区驱动

---

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/openmtscied/openmtscied.git
cd openmtscied
```

### 2. 启动API服务
```bash
cd backend-next
npm install
npm run dev
```

### 3. 访问应用
```bash
# 打开website目录
# 双击 index.html 或用静态服务器
cd website
python -m http.server 8080  # Python
# 或
npx serve .  # Node.js
```

- **主页**: http://localhost:8080
- **开发者门户**: http://localhost:8080/developer.html
- **API文档**: http://localhost:8080/developer.html → API文档Tab

### 4. 测试API
```bash
# 健康检查
curl http://localhost:3000/api/health

# 获取教程列表
curl http://localhost:3000/api/v1/tutorials?page=1&size=5

# 获取硬件项目
curl http://localhost:3000/api/v1/hardware-projects?page=1&size=5
```

---

## 📖 文档导航

### 🎯 新手入门
- **[项目总览](PROJECT_OVERVIEW.md)** - 了解系统架构和功能
- **[快速开始指南](FRONTEND_INTEGRATION_README.md)** - 5分钟集成API
- **[Website说明](website/README.md)** - 网站结构和使用

### 🔧 开发者文档
- **[前端集成指南](FRONTEND_INTEGRATION_GUIDE.md)** - Angular集成详细步骤
- **[集成检查清单](INTEGRATION_CHECKLIST.md)** - 逐步验证流程
- **[API完整文档](backend-next/API_DOCUMENTATION.md)** - 所有端点参考
- **[API快速参考](backend-next/API_QUICK_REFERENCE.md)** - 常用命令和示例

### 📊 技术文档
- **[API实施指南](OPENMTSCIED_API_IMPLEMENTATION.md)** - 原始设计文档
- **[测试报告](backend-next/API_FINAL_TEST_REPORT.md)** - API测试结果
- **[完成报告](FRONTEND_INTEGRATION_COMPLETE.md)** - 本次更新总结

---

## 🏗️ 系统架构

```
┌─────────────────┐         ┌──────────────────┐
│  iMato Frontend │         │   Website        │
│   (Angular)     │         │  (Static HTML)   │
└────────┬────────┘         └────────┬─────────┘
         │                           │
         ───────────┬───────────────┘
                     │ HTTP/REST
            ┌────────▼────────┐
            │  Backend APIs   │
            │  Next.js :3000  │
            └────────┬────────┘
                     │ Neo4j Driver
            ┌────────▼────────┐
            │  Neo4j Aura     │
            │  Cloud Database │
            └─────────────────┘
```

### 目录结构
```
OpenMTSciEd/
├── website/              ← 唯一的前端站点
│   ├── index.html        ← 营销首页
│   ├── developer.html    ← 开发者门户
│   ├── dashboard.html    ← 学习仪表盘
│   ├── profile.html      ← 个人中心
│   ├── css/              ← 样式文件
│   ├── js/               ← JavaScript
│   └── docs/             ← 文档页面
│
├── backend-next/         ← 纯API后端服务
│   ├── app/api/          ← REST API路由
│   ├── lib/              ← 数据库/认证库
│   └── package.json
│
└── docs/                 ← 项目文档
    ├── FRONTEND_INTEGRATION_GUIDE.md
    ├── PROJECT_OVERVIEW.md
    └── ...
```


---

## 📦 核心模块

### 1. 教程管理
```typescript
GET  /api/v1/tutorials?page=1&size=20&subject=physics
POST /api/v1/tutorials
GET  /api/v1/tutorials/:id
PUT  /api/v1/tutorials/:id
DELETE /api/v1/tutorials/:id
```

### 2. 课件管理
```typescript
GET  /api/v1/coursewares?page=1&size=20&type=pdf
POST /api/v1/coursewares
```

### 3. 知识图谱
```typescript
POST /api/v1/knowledge-graph/path        # 生成学习路径
GET  /api/v1/knowledge-graph/path?user_id=1
POST /api/v1/knowledge-graph/recommend   # 资源推荐
GET  /api/v1/knowledge-graph/recommend?user_id=1
```

### 4. 硬件项目
```typescript
GET  /api/v1/hardware-projects?page=1&size=20&difficulty=beginner
POST /api/v1/hardware-projects
```

---

## 💻 前端集成示例

### Angular服务
```typescript
import { OpenMtSciEdService } from './services/openmt-scied.service';

constructor(private openMtService: OpenMtSciEdService) {}

// 获取教程
this.openMtService.getTutorials(1, 10, 'physics').subscribe({
  next: (data) => console.log(data.items),
  error: (err) => console.error(err)
});

// 生成学习路径
this.openMtService.generateLearningPath(1, '9-12', ['physics'])
  .subscribe(path => {
    console.log(`路径包含 ${path.nodes.length} 个节点`);
  });
```

### React Hooks
```typescript
const [tutorials, setTutorials] = useState([]);

useEffect(() => {
  fetch('/api/v1/tutorials?page=1&size=10')
    .then(res => res.json())
    .then(data => setTutorials(data.items));
}, []);
```

---

## 📊 平台数据

| 资源类型 | 数量 |
|---------|------|
| 知识点 | 4,623 |
| 课程单元 | 2,225 |
| 题目 | 1,080 |
| 教材章节 | 1,058 |
| 课程 | 540 |
| 学科 | 15 |
| 硬件项目 | 14 |

**关系统计**:
- PROGRESSES_TO: 28,380条
- CONTAINS: 4,612条
- BELONGS_TO: 539条

---

## 🛠️ 技术栈

### 后端
- **框架**: Next.js 16.2.4 (App Router) - 纯API服务
- **语言**: TypeScript
- **数据库**: Neo4j Aura + Prisma ORM
- **驱动**: neo4j-driver 6.0.1
- **API**: RESTful JSON

### 前端
- **主网站**: 静态HTML/CSS/JS (website目录)
- **iMato集成**: Angular 17+ (独立项目)
- **HTTP**: Fetch API / HttpClient
- **状态**: RxJS Observables

### 工具
- **包管理**: npm
- **版本控制**: Git
- **部署**: Vercel (API) + 静态托管 (Website)

---

## 🎯 目标用户

### 👨‍💻 开发者
- 集成STEM教育资源到自己的应用
- 使用API构建教育平台
- 贡献代码和资源

### 👩‍🏫 教师
- 获取优质教学材料
- 浏览教程和课件
- 设计课程计划

### 👨‍🎓 学生
- 获取个性化学习路径
- 参与硬件项目实践
- 接收智能推荐

### 🏢 教育科技公司
- 评估API能力
- 集成到现有产品
- 定制化开发

---

## 🤝 贡献指南

我们欢迎所有形式的贡献!

### 贡献领域
- 📝 文档改进
- 🐛 Bug修复
- ✨ 新功能开发
- 🎨 UI/UX优化
- 🧪 测试用例
- 🌍 国际化
- 📚 添加新资源

### 贡献步骤
1. Fork仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

详见 [贡献指南](CONTRIBUTING.md) (待创建)

---

## 📄 许可证

本项目采用 [MIT许可证](LICENSE) - 自由使用、修改和分发

---

## 📞 联系方式

- **GitHub**: https://github.com/openmtscied
- **Issues**: [报告问题](https://github.com/openmtscied/issues)
- **Discussions**: [参与讨论](https://github.com/openmtscied/discussions)
- **邮箱**: contact@openmtscied.org (待设置)

---

## 🙏 致谢

感谢以下开源项目:
- [Next.js](https://nextjs.org/) - React框架
- [Neo4j](https://neo4j.com/) - 图数据库
- [Angular](https://angular.io/) - 前端框架
- [Tailwind CSS](https://tailwindcss.com/) - 实用CSS框架
- [TypeScript](https://www.typescriptlang.org/) - 类型安全

---

## 📈 路线图

### ✅ Phase 1: 基础建设 (已完成)
- [x] Next.js后端搭建
- [x] Neo4j连接配置
- [x] 核心API开发
- [x] Website静态站点
- [x] 开发者门户整合
- [x] 前端集成指南
- [x] 架构优化(前后端分离)

### 🔄 Phase 2: 功能增强 (进行中)
- [ ] 用户认证系统
- [ ] 更多Tutorial数据
- [ ] 缓存层(Redis)
- [ ] API速率限制
- [ ] 错误监控

### 📋 Phase 3: 高级功能 (计划)
- [ ] AI辅助内容生成
- [ ] 学习进度追踪
- [ ] 社区功能
- [ ] 多语言支持
- [ ] 移动端App

### 🔮 Phase 4: 生态建设 (未来)
- [ ] SDK发布(npm package)
- [ ] 插件系统
- [ ] 第三方集成
- [ ] 数据分析仪表板

---

## 📝 更新日志

### v2.0.0 (2026-05-13)
- ✅ 站点架构优化:前后端完全分离
- ✅ Website静态站点整合开发者门户
- ✅ 清理backend-next重复前端代码
- ✅ 统一导航组件系统
- ✅ API服务专注纯后端功能

### v1.0.0 (2026-05-13)
- ✅ 初始版本发布
- ✅ 8个核心API模块
- ✅ 开发者门户上线
- ✅ 前端集成指南完成
- ✅ Neo4j索引优化
- ✅ 完整文档体系

---

**让STEM教育资源触手可及!** 🚀

*Made with ❤️ for educators and developers*
