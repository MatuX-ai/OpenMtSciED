# OpenMTSciEd 部署前测试执行指南

**文档版本**: 1.0  
**最后更新**: 2026-04-25  
**适用对象**: 测试工程师、DevOps 工程师

---

## 📋 测试概述

本文档指导测试工程师执行 OpenMTSciEd 项目的部署前全面测试，确保系统达到生产环境标准。

### 测试目标
- ✅ 验证所有核心功能正常工作
- ✅ 确认安全性配置正确
- ✅ 评估性能是否满足要求
- ✅ 检查 Docker 容器化部署
- ✅ 生成详细的测试报告

### 预计耗时
- **快速健康检查**: 5 分钟
- **完整测试套件**: 30-45 分钟
- **Docker 部署测试**: 额外 15-20 分钟

---

## 🚀 快速开始

### 前置条件

1. **环境要求**
   ```bash
   Python 3.12+
   Node.js 18+
   Docker 20.10+ (可选，用于容器测试)
   ```

2. **安装依赖**
   ```bash
   cd G:\OpenMTSciEd
   pip install requests pytest pytest-cov
   ```

3. **启动服务**
   ```bash
   # 在项目根目录执行
   # 后端服务
   cd backend
   python -m uvicorn openmtscied.main:app --host 0.0.0.0 --port 8000 --reload
   
   # Web 前端 (新终端)
   cd website
   python -m http.server 3000
   
   # Admin 后台 (新终端)
   cd admin-web
   npm start
   ```

---

## 🧪 测试执行步骤

### 阶段 1: 快速健康检查（5分钟）

**目的**: 快速验证基本服务状态

```bash
cd tests
python quick_health_check.py
```

**预期输出**:
```
✅ 根路径: 正常 (HTTP 200)
✅ 健康检查: 正常 (HTTP 200)
✅ 营销首页: 正常 (HTTP 200)
...
🟢 所有服务正常运行！
```

**如果失败**:
- 检查服务是否启动
- 检查端口是否正确
- 查看服务日志

---

### 阶段 2: 完整部署前测试（30-45分钟）

**目的**: 全面验证系统功能和安全性

```bash
cd tests
python deployment_pre_check.py
```

**测试内容包括**:
1. ✅ 环境配置验证
2. ✅ API 功能测试（注册、登录、资源查询等）
3. ✅ 安全性测试（速率限制、CORS、Token验证）
4. ✅ 性能测试（响应时间、并发请求）
5. ✅ 前端页面可访问性
6. ✅ Docker 配置检查

**预期结果**:
- 通过率 ≥ 90%: 🟢 可以部署
- 通过率 75-89%: 🟡 有条件部署（需修复问题）
- 通过率 < 75%: 🔴 不建议部署

**测试报告**:
- 自动生成 `deployment_test_report.json`
- 包含详细的测试结果和问题列表

---

### 阶段 3: Docker 容器化部署测试（可选，15-20分钟）

**目的**: 验证容器化部署流程

#### 3.1 构建和启动容器

```bash
cd G:\OpenMTSciEd

# 确保 .env.local 已配置
copy .env.example .env.local
# 编辑 .env.local 填写实际配置

# 启动所有服务
docker-compose up -d

# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f backend
```

#### 3.2 验证容器健康

```bash
# 检查健康检查端点
curl http://localhost:8000/health

# 测试数据库连接
docker-compose exec postgres pg_isready

# 测试 Redis（如果启用）
docker-compose exec redis redis-cli ping
```

#### 3.3 数据持久化测试

```bash
# 1. 在容器中创建测试数据
docker-compose exec backend python -c "
import requests
response = requests.post('http://localhost:8000/api/v1/auth/register', json={
    'username': 'docker_test_user',
    'email': 'docker@test.com',
    'password': 'Test123!',
    'full_name': 'Docker Test'
})
print(f'Register status: {response.status_code}')
"

# 2. 重启容器
docker-compose restart backend

# 3. 验证数据仍然存在
curl http://localhost:8000/api/v1/auth/login \
  -d "username=docker_test_user&password=Test123!"
```

#### 3.4 清理测试环境

```bash
# 停止并删除容器
docker-compose down

# 如需完全清理（包括数据卷）
docker-compose down -v
```

---

### 阶段 4: 手动功能测试清单

**目的**: 验证用户交互流程

#### 4.1 Web 端用户流程

| 步骤 | 操作 | 预期结果 | 状态 |
|------|------|----------|------|
| 1 | 访问 http://localhost:3000/index.html | 营销首页正常加载 | □ |
| 2 | 点击"登录"按钮 | 跳转到登录页面 | □ |
| 3 | 输入用户名 admin，密码 12345678 | 登录成功，跳转到仪表盘 | □ |
| 4 | 查看学习仪表盘 | 显示统计卡片和推荐内容 | □ |
| 5 | 进入个人中心 | 显示用户信息 | □ |
| 6 | 编辑个人资料并保存 | 保存成功，显示提示 | □ |
| 7 | 修改密码 | 密码修改成功 | □ |
| 8 | 退出登录 | 返回登录页面 | □ |

#### 4.2 Admin 后台管理流程

| 步骤 | 操作 | 预期结果 | 状态 |
|------|------|----------|------|
| 1 | 访问 http://localhost:4200 | Admin 登录页面加载 | □ |
| 2 | 使用 admin 账号登录 | 登录成功，进入管理后台 | □ |
| 3 | 查看用户列表 | 显示所有用户 | □ |
| 4 | 查看课程库 | 显示课程列表 | □ |
| 5 | 查看题库 | 显示题目列表 | □ |
| 6 | 尝试添加新课程 | 表单提交成功 | □ |

#### 4.3 Desktop Manager 测试

```bash
cd desktop-manager
npm run tauri dev
```

| 步骤 | 操作 | 预期结果 | 状态 |
|------|------|----------|------|
| 1 | 启动桌面应用 | 应用窗口打开 | □ |
| 2 | 登录账户 | 登录成功 | □ |
| 3 | 浏览本地资源 | 显示 SQLite 中的数据 | □ |
| 4 | 同步云端数据 | 同步成功 | □ |

---

## 📊 测试结果记录

### 测试记录表

创建一个 Excel 或 Markdown 表格记录测试结果：

```markdown
| 测试类别 | 测试项 | 结果 | 问题描述 | 优先级 | 负责人 |
|---------|--------|------|----------|--------|--------|
| API功能 | 用户注册 | ✅ 通过 | - | - | 张三 |
| API功能 | 用户登录 | ❌ 失败 | 返回500错误 | P0 | 李四 |
| 安全性 | 速率限制 | ✅ 通过 | - | - | 张三 |
| 性能 | 响应时间 | ⚠️ 警告 | 平均250ms | P2 | 王五 |
```

### 问题跟踪

对于发现的问题，创建 GitHub Issue 或使用项目管理工具跟踪：

**Issue 模板**:
```markdown
标题: [部署前测试] XXX功能异常

描述:
- 测试步骤: ...
- 预期结果: ...
- 实际结果: ...
- 错误日志: ...

严重程度: P0/P1/P2/P3
指派给: @developer
```

---

## 🔍 常见问题排查

### 问题 1: 后端服务无法启动

**症状**: `python -m uvicorn` 报错

**排查步骤**:
```bash
# 1. 检查 Python 版本
python --version  # 应为 3.12+

# 2. 检查依赖安装
pip list | grep fastapi
pip list | grep uvicorn

# 3. 检查 .env.local 配置
cat .env.local | grep SECRET_KEY

# 4. 查看详细错误日志
python -m uvicorn openmtscied.main:app --log-level debug
```

**解决方案**:
- 重新安装依赖: `pip install -r requirements.txt`
- 配置正确的环境变量

---

### 问题 2: 数据库连接失败

**症状**: API 返回数据库连接错误

**排查步骤**:
```bash
# 1. 检查 PostgreSQL 是否运行
docker-compose ps postgres

# 2. 检查 Neo4j 是否运行
docker-compose ps neo4j

# 3. 测试数据库连接
docker-compose exec postgres psql -U openmtscied_user -d openmtscied -c "SELECT 1;"

# 4. 检查 DATABASE_URL 配置
echo $DATABASE_URL
```

**解决方案**:
- 启动数据库服务: `docker-compose up -d postgres`
- 修正 `.env.local` 中的数据库连接字符串

---

### 问题 3: CORS 跨域错误

**症状**: 前端调用 API 时浏览器报 CORS 错误

**排查步骤**:
```bash
# 1. 检查后端 CORS 配置
grep -A 5 "CORS_ORIGINS" backend/openmtscied/main.py

# 2. 检查 .env.local 中的 CORS_ORIGINS
cat .env.local | grep CORS_ORIGINS

# 3. 测试跨域请求
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS http://localhost:8000/api/v1/auth/login -v
```

**解决方案**:
- 在 `.env.local` 中添加前端域名:
  ```env
  CORS_ORIGINS=http://localhost:3000,http://localhost:4200
  ```
- 重启后端服务

---

### 问题 4: Docker 容器启动失败

**症状**: `docker-compose up` 报错

**排查步骤**:
```bash
# 1. 查看容器日志
docker-compose logs backend

# 2. 检查配置文件语法
docker-compose config

# 3. 检查端口占用
netstat -ano | findstr :8000
netstat -ano | findstr :5432

# 4. 重新构建镜像
docker-compose build --no-cache
```

**解决方案**:
- 释放占用的端口
- 修正 `docker-compose.yml` 配置
- 重新构建镜像

---

## 📝 测试报告模板

测试完成后，生成正式测试报告：

```markdown
# OpenMTSciEd 部署前测试报告

**测试日期**: 2026-04-25
**测试人员**: [姓名]
**测试版本**: v0.1.0

## 执行摘要

- 总测试数: XX
- 通过: XX (XX%)
- 失败: XX (XX%)
- 警告: XX (XX%)

## 测试结果汇总

### ✅ 通过的测试
- 列出主要通过的测试项

### ❌ 失败的测试
- 列出失败的测试项及原因

### ⚠️ 警告项
- 列出需要注意但不影响部署的问题

## 关键发现

1. **安全性**: [评估]
2. **性能**: [评估]
3. **稳定性**: [评估]
4. **可用性**: [评估]

## 部署建议

□ 可以部署到生产环境
□ 有条件部署（需修复以下问题）
□ 不建议部署（存在严重问题）

## 待修复问题清单

| 问题 | 严重程度 | 预计修复时间 | 负责人 |
|------|---------|-------------|--------|
| ... | P0 | 1天 | ... |

## 附录

- 详细测试日志: `tests/deployment_test_report.json`
- 性能测试数据: [链接]
- 安全扫描报告: [链接]
```

---

## 🎯 验收标准

### 必须满足的条件（P0）

- [ ] 所有 P0 级别测试通过
- [ ] 无严重安全漏洞
- [ ] 核心 API 响应时间 < 500ms
- [ ] 数据库连接稳定
- [ ] Docker 容器能正常启动

### 建议满足的条件（P1）

- [ ] 所有 P1 级别测试通过
- [ ] API 响应时间 < 200ms
- [ ] 并发请求成功率 > 95%
- [ ] 前端页面无明显错误
- [ ] 日志记录完整

### 可选优化（P2）

- [ ] 性能达到最优
- [ ] 用户体验流畅
- [ ] 文档完善
- [ ] 监控告警配置完成

---

## 📞 支持与联系

**遇到问题时**:

1. 查看项目文档: `docs/`
2. 检查日志: `logs/` 或 `docker-compose logs`
3. 搜索已有 Issue: GitHub Issues
4. 联系开发团队: dev@openmtscied.org

**紧急问题**:
- 立即停止测试
- 记录错误信息
- 通知项目负责人
- 创建高优先级 Issue

---

## 📚 相关文档

- [DEPLOYMENT_QUICKSTART.md](../DEPLOYMENT_QUICKSTART.md) - 部署快速指南
- [SECURITY_CONFIG.md](../SECURITY_CONFIG.md) - 安全配置说明
- [PRODUCTION_DEPLOYMENT_AUDIT.md](../PRODUCTION_DEPLOYMENT_AUDIT.md) - 部署审计报告
- [CONTRIBUTING.md](../CONTRIBUTING.md) - 贡献指南

---

**祝测试顺利！** 🚀
