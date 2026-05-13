# OpenMTSciEd 开发者门户

## 🌐 访问地址

启动后端服务后,访问:
```
http://localhost:3000/developer
```

## ✨ 功能特性

### 1. 资源概览
- 平台数据统计(知识点、课程单元、硬件项目数量)
- 核心特性介绍
- 快速开始指南

### 2. 教程浏览
- 实时从Neo4j加载教程列表
- 按学科、年级筛选
- 显示难度和时长信息

### 3. 硬件项目展示
- 浏览所有硬件项目
- 查看难度、类别、预计时间
- 关联的知识点信息

### 4. API文档
- 完整的端点列表
- 请求方法说明
- 参数示例

## 🚀 使用步骤

### 1. 启动后端
```bash
cd G:\OpenMTSciEd\backend-next
npm run dev
```

### 2. 访问开发者门户
打开浏览器访问: `http://localhost:3000/developer`

### 3. 浏览资源
- 点击"教程资源"标签查看所有教程
- 点击"硬件项目"标签查看实践项目
- 点击"API文档"标签查看集成方法

## 📋 页面结构

```
/developer
├── 概览 (Overview)
│   ├── 平台介绍
│   ├── 快速开始
│   ├── 核心特性
│   └── 数据统计
├── 教程资源 (Tutorials)
│   ├── 实时数据加载
│   ├── 卡片式展示
│   └── 刷新功能
├── 硬件项目 (Hardware)
│   ├── 项目列表
│   ├── 详细信息
│   └── 分类展示
└── API文档 (API Docs)
    ├── 基础信息
    ├── 端点列表
    └── 文档链接
```

## 🎨 UI特点

- **现代化设计**: 使用Tailwind CSS构建
- **响应式布局**: 支持桌面和移动设备
- **深色模式**: 自动适配系统主题
- **流畅动画**: 加载状态和过渡效果
- **直观导航**: Tab切换清晰明了

## 🔧 技术实现

- **框架**: Next.js 16 (App Router)
- **样式**: Tailwind CSS
- **数据获取**: Fetch API
- **状态管理**: React Hooks (useState, useEffect)
- **类型安全**: TypeScript

## 📊 数据来源

所有数据来自Neo4j图数据库:
- 教程: `/api/v1/tutorials`
- 硬件项目: `/api/v1/hardware-projects`
- 课件: `/api/v1/coursewares`
- 学习路径: `/api/v1/knowledge-graph/path`
- 推荐: `/api/v1/knowledge-graph/recommend`

## 🎯 目标用户

1. **STEM教育开发者**
   - 寻找优质教学资源
   - 集成到自己的教育平台

2. **学校教师**
   - 浏览可用的教程和课件
   - 了解API集成方式

3. **开源贡献者**
   - 了解项目架构
   - 参与资源建设

4. **教育科技公司**
   - 评估API能力
   - 规划集成方案

## 💡 使用场景

### 场景1: 开发者集成
```
1. 访问 /developer
2. 查看"快速开始"部分
3. 复制SDK安装命令
4. 参考API文档进行集成
```

### 场景2: 教师浏览资源
```
1. 访问 /developer
2. 点击"教程资源"标签
3. 浏览物理、数学等学科教程
4. 记录感兴趣的资源ID
```

### 场景3: 学生查找项目
```
1. 访问 /developer
2. 点击"硬件项目"标签
3. 按难度筛选(beginner/intermediate/advanced)
4. 查看项目详情和所需材料
```

## 🔄 未来扩展

计划添加的功能:
- [ ] 用户认证和个性化推荐
- [ ] 资源收藏和笔记功能
- [ ] 在线预览教程内容
- [ ] 社区讨论和评价
- [ ] 资源上传和贡献
- [ ] 多语言支持
- [ ] 高级搜索和过滤
- [ ] 学习进度追踪

## 📝 自定义

### 修改品牌信息
编辑 `app/developer/page.tsx`:
```tsx
<h1>您的平台名称</h1>
<p>您的平台描述</p>
```

### 添加新的Tab
在navigation数组中添加:
```tsx
{ id: 'courses', label: '课程', icon: '🎓' }
```

### 调整样式
修改Tailwind类名或添加自定义CSS。

## 🐛 故障排查

### 问题: 页面空白
**解决**: 检查后端是否正常运行
```bash
curl http://localhost:3000/api/health
```

### 问题: 数据加载失败
**解决**: 
1. 检查Neo4j连接
2. 查看浏览器控制台错误
3. 确认API端点可访问

### 问题: 样式异常
**解决**: 
1. 清除浏览器缓存
2. 重启开发服务器
3. 检查Tailwind配置

## 📚 相关文档

- **API文档**: `API_DOCUMENTATION.md`
- **快速参考**: `API_QUICK_REFERENCE.md`
- **前端集成**: `../FRONTEND_INTEGRATION_GUIDE.md`
- **测试报告**: `API_FINAL_TEST_REPORT.md`

## 🤝 贡献

欢迎贡献代码和资源!
- GitHub: https://github.com/openmtscied
- 问题反馈: Issues页面
- 文档改进: PRs welcome

---

**让STEM教育资源触手可及!** 🚀
