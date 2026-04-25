# OpenMTSciEd 快速部署指南

本文档提供 OpenMTSciEd 的快速部署步骤，5分钟内即可启动服务。

---

## 🚀 快速开始（Docker）

### 前置要求

- Docker 20.10+
- Docker Compose 2.0+

### 步骤 1: 克隆项目

```bash
git clone https://github.com/MatuX-ai/OpenMtSciED.git
cd OpenMtSciED
```

### 步骤 2: 配置环境变量

```bash
# 复制配置模板
cp .env.example .env.local

# 编辑配置文件
# Windows: notepad .env.local
# Linux/Mac: nano .env.local
```

**必须配置的项目**:

```env
# JWT 密钥（生成命令：python -c "import secrets; print(secrets.token_urlsafe(32))"）
SECRET_KEY=your_generated_secret_key_here

# Neo4j 数据库
NEO4J_URI=bolt+s://your-instance.databases.neo4j.io
NEO4J_USERNAME=your_username
NEO4J_PASSWORD=your_password

# PostgreSQL 数据库（使用 Neon 或本地）
DATABASE_URL=postgresql+psycopg2://user:password@host/dbname?sslmode=require

# CORS 允许的域名
CORS_ORIGINS=http://localhost:4200,http://localhost:3000

# PostgreSQL 密码（仅本地部署需要）
POSTGRES_PASSWORD=your_postgres_password
```

### 步骤 3: 启动服务

```bash
# 启动所有服务（后台运行）
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f backend
```

### 步骤 4: 验证部署

```bash
# 测试健康检查
curl http://localhost:8000/health

# 预期响应：
# {
#   "status": "healthy",
#   "timestamp": "2026-04-25T10:30:45.123456",
#   "version": "0.1.0",
#   "checks": {
#     "database": "ok",
#     "neo4j": "ok"
#   }
# }

# 访问 API 文档
# http://localhost:8000/docs
```

---

## 🔧 常用命令

### 服务管理

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f [service_name]

# 进入容器
docker-compose exec backend bash
```

### 数据库管理

```bash
# 查看数据库日志
docker-compose logs -f postgres

# 连接到数据库
docker-compose exec postgres psql -U openmtscied_user -d openmtscied

# 备份数据库
docker-compose exec postgres pg_dump -U openmtscied_user openmtscied > backup.sql

# 恢复数据库
cat backup.sql | docker-compose exec -T postgres psql -U openmtscied_user -d openmtscied
```

### 清理

```bash
# 停止并删除容器
docker-compose down

# 停止并删除容器 + 数据卷（⚠️ 会删除所有数据）
docker-compose down -v

# 删除未使用的镜像
docker image prune -a
```

---

## 🌐 生产环境部署

### 1. 准备 SSL 证书

**选项 A: Let's Encrypt（免费）**

```bash
# 安装 certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot certonly --nginx -d yourdomain.com

# 证书位置
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem

# 复制到项目目录
mkdir -p ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/
```

**选项 B: 商业证书**

将证书文件放入 `ssl/` 目录：
- `fullchain.pem` - 完整证书链
- `privkey.pem` - 私钥

### 2. 更新 Nginx 配置

编辑 `nginx.conf`，替换域名：

```nginx
server_name yourdomain.com www.yourdomain.com;
```

### 3. 更新环境变量

编辑 `.env.local`：

```env
# 生产环境配置
APP_ENV=production
DEBUG=false
LOG_LEVEL=INFO

# CORS 配置（仅允许你的域名）
CORS_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com
```

### 4. 启动生产环境

```bash
# 启动服务
docker-compose up -d

# 验证 HTTPS
curl https://yourdomain.com/health
```

---

## 📊 监控与维护

### 健康检查

```bash
# 检查所有服务状态
docker-compose ps

# 检查后端健康
curl http://localhost:8000/health

# 检查数据库连接
docker-compose exec postgres pg_isready
```

### 日志查看

```bash
# 实时查看所有日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f nginx
docker-compose logs -f postgres

# 查看最近 100 行日志
docker-compose logs --tail=100 backend
```

### 资源监控

```bash
# 查看容器资源使用
docker stats

# 查看磁盘使用
docker system df
```

---

## 🐛 故障排查

### 问题 1: 容器无法启动

```bash
# 查看详细日志
docker-compose logs backend

# 检查配置文件
docker-compose config

# 重新构建镜像
docker-compose build --no-cache
```

### 问题 2: 数据库连接失败

```bash
# 检查数据库是否运行
docker-compose ps postgres

# 查看数据库日志
docker-compose logs postgres

# 测试数据库连接
docker-compose exec backend python -c "
from shared.models.db_models import SessionLocal
db = SessionLocal()
db.execute('SELECT 1')
print('Database connection OK')
db.close()
"
```

### 问题 3: Neo4j 连接失败

```bash
# 检查 NEO4J_HTTP_URI 配置
echo $NEO4J_HTTP_URI

# 测试 Neo4j 连接
docker-compose exec backend python -c "
import requests
import os
uri = os.getenv('NEO4J_HTTP_URI')
response = requests.post(uri, json={'statement': 'RETURN 1'})
print(f'Neo4j status: {response.status_code}')
"
```

### 问题 4: 端口冲突

```bash
# 查看端口占用
netstat -tulpn | grep :8000
netstat -tulpn | grep :5432
netstat -tulpn | grep :80

# 修改 docker-compose.yml 中的端口映射
# 例如：将 8000:8000 改为 8001:8000
```

---

## 📚 相关文档

- [安全配置指南](SECURITY_CONFIG.md)
- [第一阶段安全修复报告](SECURITY_FIX_REPORT_PHASE1.md)
- [第二阶段基础设施报告](INFRASTRUCTURE_FIX_REPORT_PHASE2.md)
- [生产环境部署审计](PRODUCTION_DEPLOYMENT_AUDIT.md)

---

## 💡 最佳实践

### 1. 定期更新

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build
```

### 2. 定期备份

```bash
# 创建备份脚本 backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec postgres pg_dump -U openmtscied_user openmtscied > backups/db_$DATE.sql
echo "Backup created: db_$DATE.sql"

# 设置定时任务（每天凌晨2点备份）
crontab -e
0 2 * * * /path/to/backup.sh
```

### 3. 监控告警

建议集成：
- Prometheus + Grafana（指标监控）
- Sentry（错误追踪）
- ELK Stack（日志聚合）

---

## 📞 获取帮助

- GitHub Issues: https://github.com/MatuX-ai/OpenMtSciED/issues
- 邮箱: dev@openmtscied.org

---

**最后更新**: 2026-04-25
