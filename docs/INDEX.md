# iMatu 项目文档中心

欢迎来到 iMatu 教育平台的完整文档中心！本文档为您提供了项目的全面技术资料和使用指南。

## 📚 文档分类导航

### 🏗️ 项目概览与架构
- [**项目概览**](PROJECT_OVERVIEW.md) - 项目整体介绍、价值主张和功能模块
- [**系统架构**](SYSTEM_ARCHITECTURE.md) - 详细的技术架构设计和组件关系
- [**网站地图**](SITE_MAP.md) - 完整的前端页面和API端点映射

### 🎯 开发指南
- [**快速开始**](QUICK_START.md) - 项目搭建和环境配置指南
- [**前端路由详解**](FRONTEND_ROUTING.md) - Angular路由结构和组件映射
- [**后端API映射**](BACKEND_API_MAPPING.md) - FastAPI端点和服务模块对照

### 🔧 技术专项文档
- [**AI推荐系统**](AI_RECOMMENDATION_SYSTEM.md) - 智能推荐算法实现
- [**电商支付系统**](E_COMMERCE_PAYMENT_SYSTEM.md) - 支付流程和集成方案
- [**硬件认证系统**](HARDWARE_CERTIFICATION_SYSTEM.md) - IoT设备接入管理
- [**多租户部署**](MULTITENANT_DEPLOYMENT_GUIDE.md) - SaaS架构部署指南
- [**许可证管理**](API_LICENSE_MANAGEMENT.md) - 软件授权方案设计

### 🔐 安全与认证
- [**认证系统实现**](AUTH_SYSTEM_IMPLEMENTATION_REPORT.md) - JWT和OAuth2集成
- [**权限控制**](AUTH_SYSTEM_DOCUMENTATION.md) - RBAC权限管理体系
- [**AI认证集成**](AI_AUTH_INTEGRATION.md) - AI服务的安全接入

### 📊 API文档
- [**API总览**](API_DOCUMENTATION.md) - RESTful API设计规范
- [**用户批量导入**](API_USER_BULK_IMPORT.md) - 批量数据处理接口
- [**组织仪表板**](ORGANIZATION_DASHBOARD_GUIDE.md) - 管理界面API

### 🎨 设计系统
- [**组件样式指南**](component-style-guide.md) - Design System使用手册
- [**样式CI/CD**](STYLE_CI_CD_INTEGRATION.md) - 前端样式自动化流程
- [**暗色模式实现**](DARK_MODE_IMPLEMENTATION_REPORT.md) - 主题切换方案

### 🚀 部署与运维
- [**部署指南**](DEPLOYMENT_GUIDE.md) - 生产环境部署流程
- [**许可证系统部署**](DEPLOYMENT_LICENSE_SYSTEM.md) - 授权系统的上线方案
- [**微信QQ集成**](WECHAT_QQ_INTEGRATION_GUIDE.md) - 第三方登录集成

### 🧪 测试与质量
- [**认证模块测试**](AUTH_MODULE_TEST_SUMMARY.md) - 安全模块测试报告
- [**支付系统测试**](PAYMENT_SYSTEM_TEST_REPORT.md) - 电商功能验证
- [**用户导入测试**](USER_BULK_IMPORT_GUIDE.md) - 数据迁移测试

## 🗺️ 快速查找指引

### 我是...
- **新开发者** → 从 [快速开始](QUICK_START.md) 和 [项目概览](PROJECT_OVERVIEW.md) 开始
- **前端工程师** → 查看 [前端路由](FRONTEND_ROUTING.md) 和 [设计系统](component-style-guide.md)
- **后端工程师** → 阅读 [后端API映射](BACKEND_API_MAPPING.md) 和 [系统架构](SYSTEM_ARCHITECTURE.md)
- **产品经理** → 参考 [项目概览](PROJECT_OVERVIEW.md) 和 [网站地图](SITE_MAP.md)
- **运维工程师** → 查看 [部署指南](DEPLOYMENT_GUIDE.md) 和相关运维文档
- **测试工程师** → 关注各模块的测试报告和指南

### 我想了解...
- **技术架构** → [系统架构文档](SYSTEM_ARCHITECTURE.md)
- **API接口** → [后端API映射](BACKEND_API_MAPPING.md)
- **页面结构** → [网站地图](SITE_MAP.md)
- **开发环境** → [快速开始](QUICK_START.md)
- **安全机制** → [认证系统文档](AUTH_SYSTEM_DOCUMENTATION.md)
- **部署流程** → [部署指南](DEPLOYMENT_GUIDE.md)

## 📁 演示资源

### HTML演示页面
- [`auth-demo.html`](auth-demo.html) - 认证系统功能演示
- [`auth-interactive-demo.html`](auth-interactive-demo.html) - 交互式认证流程
- [`dashboard-demo.html`](dashboard-demo.html) - 仪表板界面展示
- [`playground.html`](playground.html) - Design System组件游乐场
- [`simple-playground.html`](simple-playground.html) - 精简版组件演示

### 代码示例
- [Arduino测试代码](arduino_test_sketch.ino) - 硬件认证示例
- [用户导入模板](user_import_template.csv) - 批量数据格式示例

## 🔧 开发工具

### 本地开发命令
```bash
# 前端开发
npm start                    # 启动开发服务器
npm run build               # 生产构建
npm run lint:css           # CSS代码检查

# 后端开发
cd backend
python main.py             # 启动后端服务
uvicorn main:app --reload  # 热重载模式

# 文档相关
npm run docs:styles        # 生成样式文档
npm run docs:serve         # 启动文档服务器
```

### 测试命令
```bash
# 运行测试
python -m pytest backend/tests/     # 后端测试
ng test                            # 前端单元测试
npm run e2e                       # 端到端测试
```

## 📊 项目统计信息

### 技术栈概览
- **前端**: Angular 16 + TypeScript + SCSS
- **后端**: FastAPI + Python 3.9
- **数据库**: PostgreSQL + Redis
- **移动端**: Flutter
- **部署**: Docker + Nginx

### 文档完整性
- ✅ 项目概览文档
- ✅ 系统架构文档  
- ✅ 前后端路由/API映射
- ✅ 专项技术文档
- ✅ 部署运维指南
- ✅ 测试质量报告

## 🔄 文档更新记录

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| v1.0 | 2026-02-26 | 初始文档集合创建，包含完整的技术文档体系 |

## 📞 技术支持

如需技术支持或发现文档问题，请联系：
- 技术负责人: [待填写]
- 文档维护: [待填写]
- 问题反馈: [待填写]

---
*iMatu 文档中心 | 版本 v1.0 | 最后更新 2026年2月*