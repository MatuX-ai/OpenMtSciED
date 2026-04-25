# 🧪 OpenMTSciEd 部署前测试 - 快速参考卡

## 🚀 5分钟快速检查

```bash
cd tests
python quick_health_check.py
```

**预期**: 所有服务显示 ✅

---

## 📋 30分钟完整测试

```bash
cd tests
python deployment_pre_check.py
```

**查看报告**: `deployment_test_report.json`

---

## 🎯 关键测试项速查

### 后端 API
- [ ] `/health` - 健康检查
- [ ] `/api/v1/auth/login` - 登录
- [ ] `/api/v1/auth/me` - 获取用户信息
- [ ] `/api/v1/resources/resources/summary` - 资源汇总

### 前端页面
- [ ] http://localhost:3000/index.html - 营销首页
- [ ] http://localhost:3000/dashboard.html - 仪表盘
- [ ] http://localhost:3000/profile.html - 个人中心
- [ ] http://localhost:4200 - Admin后台

### Docker
```bash
docker-compose up -d
docker-compose ps
curl http://localhost:8000/health
```

---

## ⚠️ 常见问题快速解决

### 后端无法启动
```bash
pip install -r requirements.txt
cat .env.local | grep SECRET_KEY
```

### 数据库连接失败
```bash
docker-compose up -d postgres
docker-compose exec postgres pg_isready
```

### CORS 错误
```bash
# 编辑 .env.local
CORS_ORIGINS=http://localhost:3000,http://localhost:4200
# 重启后端
```

### Docker 端口冲突
```bash
netstat -ano | findstr :8000
# 修改 docker-compose.yml 端口映射
```

---

## 📊 评估标准

| 通过率 | 建议 |
|--------|------|
| ≥ 95% | 🟢 可以部署 |
| 85-94% | 🟡 修复问题后部署 |
| < 85% | 🔴 不建议部署 |

---

## 📞 紧急联系

- **项目负责人**: [姓名] - [电话]
- **测试负责人**: [姓名] - [电话]
- **DevOps**: [姓名] - [电话]

---

## 📚 详细文档

- 完整指南: `DEPLOYMENT_TEST_GUIDE.md`
- 任务分配: `TEST_ASSIGNMENT_PLAN.md`
- 部署文档: `../DEPLOYMENT_QUICKSTART.md`

---

**打印此卡片，贴在测试工位！** 📌
