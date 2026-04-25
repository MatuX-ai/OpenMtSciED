# OpenMTSciEd MVP 部署检查清单

**部署日期**: 2026-04-25  
**部署类型**: MVP（最小可行产品）  
**适用场景**: 内部测试、小范围使用

---

## ✅ 已完成项

### 1. 安全加固 ✅
- [x] SECRET_KEY 已配置且非默认值
- [x] bcrypt 密码哈希正常工作
- [x] JWT 认证机制启用
- [x] CORS 配置正确
- [x] 速率限制已启用（生产环境 5次/分钟）

### 2. 核心功能 ✅
- [x] 健康检查端点正常 (/health → 200 OK)
- [x] 用户注册 API 可用
- [x] 用户登录 API 可用
- [x] 数据库连接正常 (PostgreSQL)

### 3. 依赖完整性 ✅
- [x] Python 依赖已安装
  - bcrypt==4.0.1
  - python-json-logger
  - slowapi
  - passlib
- [x] 虚拟环境配置正确

### 4. 配置文件 ✅
- [x] .env.local 存在且配置完整
- [x] DATABASE_URL 已设置
- [x] NEO4J_URI 已设置（可选）
- [x] SECRET_KEY 已生成

---

## ⚠️ 已知限制

### 性能
- API 响应时间: ~2400ms（目标 < 200ms）
- 影响: 用户体验稍慢，但不影响功能
- 建议: 后续添加 Redis 缓存优化

### 前端服务
- Web 前端 (3000): 未启动
- Admin 后台 (4200): 未启动
- 建议: 根据需求启动相应前端

### Neo4j 图数据库
- 状态: 未配置或不可用
- 影响: 知识图谱功能不可用
- 建议: 如需使用，配置 NEO4J_HTTP_URI

---

## 🚀 部署步骤

### 方式一：Docker Compose（推荐）

```bash
# 1. 确保 .env.local 配置正确
cd g:\OpenMTSciEd

# 2. 构建并启动所有服务
docker-compose up -d --build

# 3. 检查服务状态
docker-compose ps

# 4. 查看日志
docker-compose logs -f backend
```

**访问地址**:
- 后端 API: http://localhost:8000
- 健康检查: http://localhost:8000/health
- API 文档: http://localhost:8000/docs

---

### 方式二：直接运行（开发/测试）

#### 后端服务
```bash
cd g:\OpenMTSciEd\backend
python -m uvicorn openmtscied.main:app --host 0.0.0.0 --port 8000
```

#### Web 前端（可选）
```bash
cd g:\OpenMTSciEd\website
python -m http.server 3000
```

#### Admin 后台（可选）
```bash
cd g:\OpenMTSciEd\admin-web
npm start
```

---

## 🧪 部署后验证

### 1. 健康检查
```bash
curl http://localhost:8000/health
```
预期输出:
```json
{
  "status": "healthy",
  "checks": {
    "database": "ok",
    "neo4j": "not configured"
  }
}
```

### 2. 用户登录测试
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -d "username=admin&password=12345678"
```
预期: 返回 JWT token

### 3. API 文档
浏览器访问: http://localhost:8000/docs
预期: 显示 Swagger UI

---

## 📊 监控建议

### 基础监控
1. **日志监控**
   ```bash
   # 实时查看后端日志
   docker-compose logs -f backend
   
   # 或
   tail -f backend/logs/app.log
   ```

2. **健康检查定时探测**
   ```bash
   # 每 30 秒检查一次
   while true; do
     curl -s http://localhost:8000/health | jq .status
     sleep 30
   done
   ```

3. **错误率监控**
   - 关注 5xx 错误
   - 监控速率限制触发频率

---

## 🔒 安全检查

### 生产环境必须项
- [x] SECRET_KEY 强密钥（已配置）
- [ ] HTTPS 证书（如公开访问需配置）
- [ ] 防火墙规则（仅开放必要端口）
- [ ] 数据库备份策略
- [ ] 定期更新依赖包

### 建议配置
```env
# .env.local 生产环境
APP_ENV=production
SECRET_KEY=<强随机密钥>
DATABASE_URL=postgresql://user:pass@host:5432/db
NEO4J_HTTP_URI=https://instance.databases.neo4j.io/query
ACCESS_TOKEN_EXPIRE_MINUTES=10080  # 7天
```

---

## 📝 回滚方案

### Docker 部署回滚
```bash
# 1. 停止当前版本
docker-compose down

# 2. 切换到上一个稳定版本
git checkout <previous-tag>

# 3. 重新构建
docker-compose up -d --build
```

### 直接运行回滚
```bash
# 1. 停止服务
Ctrl+C

# 2. 切换代码版本
git checkout <previous-tag>

# 3. 重新启动
python -m uvicorn openmtscied.main:app --host 0.0.0.0 --port 8000
```

---

## 🎯 下一步优化计划

### 短期（1-2周）
1. **性能优化**
   - 添加 Redis 缓存
   - 优化数据库查询
   - 目标: 响应时间 < 500ms

2. **前端部署**
   - 构建 Angular 应用
   - 配置 Nginx 静态文件服务

### 中期（1个月）
3. **监控完善**
   - 集成 Prometheus + Grafana
   - 配置告警规则
   - 错误追踪（Sentry）

4. **CI/CD**
   - GitHub Actions 自动化测试
   - 自动化部署流程

### 长期（3个月）
5. **高可用**
   - 负载均衡
   - 数据库主从复制
   - 多区域部署

---

## 📞 技术支持

### 常见问题

**Q: 后端启动失败？**
A: 检查 .env.local 配置，确保 DATABASE_URL 和 SECRET_KEY 正确

**Q: 数据库连接失败？**
A: 确认 PostgreSQL 服务运行，检查 DATABASE_URL 格式

**Q: 速率限制太严格？**
A: 修改 APP_ENV=development 或调整 auth_api.py 中的限制值

**Q: 如何重置管理员密码？**
A: 直接修改 MOCK_USERS 中的 password_hash

---

## ✅ 部署确认

- [ ] 后端服务正常运行
- [ ] 健康检查返回 200
- [ ] 用户可以正常登录
- [ ] 日志无严重错误
- [ ] 监控已配置

**签署**: _______________  
**日期**: 2026-04-25

---

*文档版本: 1.0*  
*最后更新: 2026-04-25 21:35*
