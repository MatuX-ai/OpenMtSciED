# 安全配置指南

本文档说明如何正确配置 OpenMTSciEd 的安全相关环境变量。

## 🔑 生成强密钥

### JWT SECRET_KEY

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

示例输出：
```
xK8vL2mN9pQ4rS7tU1wX3yZ5aB6cD8eF0gH2iJ4kL6m
```

## 📝 配置步骤

### 1. 创建 .env.local 文件

```bash
cp .env.example .env.local
```

### 2. 编辑 .env.local

打开 `.env.local` 文件，填写以下关键配置：

#### JWT 认证
```env
SECRET_KEY=上面生成的强密钥
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

#### Neo4j 数据库
```env
NEO4J_URI=bolt+s://your-instance.databases.neo4j.io
NEO4J_USERNAME=your_username
NEO4J_PASSWORD=your_strong_password
```

**⚠️ 重要**: 
- 如果使用了 Neo4j Aura，请确保密码已轮换（因为之前的密码已在代码中暴露）
- 登录 Neo4j Aura 控制台修改密码
- 更新 `.env.local` 中的新密码

#### PostgreSQL 数据库
```env
DATABASE_URL=postgresql+asyncpg://user:password@host/dbname?sslmode=require
```

#### CORS 配置
```env
# 开发环境
CORS_ORIGINS=http://localhost:4200,http://localhost:3000

# 生产环境（替换为你的域名）
CORS_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com
```

### 3. 验证配置

启动后端服务：

```bash
cd backend/openmtscied
python -m uvicorn main:app --reload
```

如果配置正确，应该看到：
```
[OK] Loaded environment variables from .../.env.local
[INFO] CORS allowed origins: ['http://localhost:4200', 'http://localhost:3000']
```

如果出现错误：
```
EnvironmentError: SECRET_KEY 环境变量未设置！
```

说明 `.env.local` 文件未正确配置。

## 🔒 安全最佳实践

### 1. 永远不要提交 .env.local

`.env.local` 已在 `.gitignore` 中，但请确认：

```bash
git check-ignore .env.local
```

应该输出：`.env.local`

### 2. 定期轮换密钥

建议每 90 天轮换一次：
- JWT SECRET_KEY
- 数据库密码
- API 密钥

### 3. 使用密钥管理服务（生产环境）

生产环境建议使用：
- AWS Secrets Manager
- HashiCorp Vault
- Azure Key Vault

而不是本地 `.env` 文件。

### 4. 限制文件权限

```bash
chmod 600 .env.local  # 仅所有者可读写
```

## 🚨 紧急响应

### 如果发现密钥泄露

1. **立即轮换所有暴露的密钥**
   - 修改 Neo4j 密码
   - 生成新的 JWT SECRET_KEY
   - 修改 PostgreSQL 密码

2. **更新 .env.local**

3. **重启所有服务**

4. **通知用户重新登录**（JWT token 失效）

## 📋 检查清单

部署前确认：

- [ ] `.env.local` 文件存在且配置完整
- [ ] `SECRET_KEY` 是强随机密钥（至少 32 字节）
- [ ] 所有数据库密码已轮换（如果之前硬编码过）
- [ ] `CORS_ORIGINS` 限制为特定域名
- [ ] `.env.local` 未被提交到 Git
- [ ] 文件权限设置为 600

## 🔍 故障排查

### 问题：启动时报 "SECRET_KEY 未设置"

**原因**: `.env.local` 文件不存在或格式错误

**解决**:
1. 确认文件存在：`ls -la .env.local`
2. 检查格式：每行应该是 `KEY=VALUE`，无空格
3. 确认路径：后端从项目根目录加载 `.env.local`

### 问题：CORS 错误

**原因**: 前端域名不在白名单中

**解决**:
在 `.env.local` 中添加前端域名：
```env
CORS_ORIGINS=http://localhost:4200,https://yourdomain.com
```

然后重启后端服务。

## 📚 相关文档

- [生产环境部署审计报告](../PRODUCTION_DEPLOYMENT_AUDIT.md)
- [安全政策](../docs/02-开发指南/SECURITY.md)
- [.env.example](../.env.example)
