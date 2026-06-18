# OpenMTSciEd API 快速启动指南

> **状态**: 2026-06-18 更新 (Neo4j → PostgreSQL/Prisma 迁移完成)

## 🚀 5分钟快速开始

### 1. 检查环境准备

确保已安装:
- Node.js 18+ 
- npm 或 yarn
- PostgreSQL 数据库(本地或云端，推荐 Neon)

### 2. 配置环境变量

编辑 `G:\OpenMTSciEd\backend-next\.env.local`:

```env
# PostgreSQL 数据库配置 (必须)
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"

# JWT 认证配置
JWT_SECRET="your_jwt_secret_here"
```

**获取 PostgreSQL 连接串**:
- 如果使用 Neon (推荐): 登录 https://console.neon.tech/ 创建项目,复制 Connection String
- 如果使用本地 PostgreSQL: 格式为 `postgresql://user:password@localhost:5432/dbname`

### 3. 安装依赖 + 同步数据库

```powershell
cd G:\OpenMTSciEd\backend-next
npm install
npx prisma generate
npx prisma db push
```

### 4. 启动开发服务器

```powershell
npm run dev
```

等待看到以下输出表示启动成功:
```
✓ Ready in 2.3s
- Local:        http://localhost:3000
```

### 5. 验证服务

打开浏览器访问: http://localhost:3000/api/health

应该看到:
```json
{
  "status": "ok",
  "timestamp": "2026-05-13T...",
  "service": "OpenMTSciEd API",
  "version": "1.0.0"
}
```

### 6. 运行完整测试

```powershell
.\test-openmtscied-apis.ps1
```

这将测试所有9个API端点,输出类似:
```
========================================
OpenMTSciEd API 测试
========================================

1. 测试健康检查 API...
✅ 健康检查成功:
{
  "status": "ok",
  ...
}

2. 测试获取教程列表 API...
✅ 教程列表获取成功:
总数: 0, 当前页: 1
...
```

## 📝 常用API调用示例

### 获取教程列表

```powershell
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/tutorials?page=1&size=10" -Method Get
```

```bash
# Bash/Curl
curl http://localhost:3000/api/v1/tutorials?page=1&size=10
```

### 创建教程

```powershell
$body = @{
    id = "tutorial_001"
    title = "牛顿运动定律"
    grade_level = "9-12"
    subject = "physics"
    duration_minutes = 60
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/tutorials" `
    -Method Post -Body $body -ContentType "application/json"
```

### 生成学习路径

```powershell
$body = @{
    user_id = 1
    current_grade = "9-12"
    subjects = @("physics")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/knowledge-graph/path" `
    -Method Post -Body $body -ContentType "application/json"
```

## 🔍 故障排查

### 问题1: PostgreSQL 连接失败

**错误信息**: `P1001: Can't reach database server`

**解决方案**:
1. 检查 `.env.local` 中的 `DATABASE_URL` 是否正确
2. 确认 PostgreSQL 服务正在运行
3. 验证网络连接 (Neon 需要 SSL)

### 问题2: 端口3000已被占用

**错误信息**: `Port 3000 is already in use`

**解决方案**:
```powershell
# 查找占用端口的进程
netstat -ano | findstr :3000

# 终止进程(替换 PID 为实际进程ID)
taskkill /PID <PID> /F

# 或者使用其他端口
npm run dev -- -p 3001
```

### 问题3: TypeScript 编译错误

**解决方案**:
```powershell
# 清理并重新构建
Remove-Item -Recurse -Force .next
npm run build
```

### 问题4: 依赖安装失败

**解决方案**:
```powershell
# 清除缓存
npm cache clean --force

# 删除 node_modules 和 package-lock.json
Remove-Item -Recurse -Force node_modules, package-lock.json

# 重新安装
npm install
```

## 📚 下一步

1. **查看完整文档**: 阅读 `API_DOCUMENTATION.md` 了解所有API端点
2. **填充测试数据**: 在 PostgreSQL 中创建一些 Tutorial、Courseware 记录用于测试
3. **集成前端**: 将API集成到 iMato 或其他前端应用
4. **部署生产**: 参考 `VERCEL_DEPLOYMENT.md` 进行部署

## 💡 提示

- **开发模式**: `npm run dev` 支持热重载,修改代码后自动刷新
- **生产构建**: `npm run build && npm start` 用于生产环境
- **日志查看**: 终端会显示所有API请求和错误信息
- **API测试工具**: 推荐使用 Postman 或 Insomnia 进行可视化测试

## 🆘 获取帮助

如遇问题:
1. 检查 `API_DEVELOPMENT_COMPLETE.md` 了解实现细节
2. 查看终端输出的错误信息
3. 查阅 Prisma 官方文档: https://www.prisma.io/docs/
4. 查阅 PostgreSQL 官方文档: https://www.postgresql.org/docs/

---

**祝开发顺利!** 🎉
