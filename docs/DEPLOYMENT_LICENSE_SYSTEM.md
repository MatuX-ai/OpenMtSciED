# 许可证管理系统部署指南

## 系统要求

### 硬件要求
- **CPU**: 2核以上
- **内存**: 4GB以上
- **存储**: 10GB可用空间
- **网络**: 稳定的网络连接

### 软件依赖
- Python 3.8+
- Redis 6.0+
- PostgreSQL 12+ (或 SQLite for development)
- Node.js 16+ (前端构建)

## 部署架构

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Nginx     │    │  FastAPI    │    │   Redis     │
│  (反向代理)  │◄──►│   Backend   │◄──►│  (缓存)     │
└─────────────┘    └─────────────┘    └─────────────┘
                         │
                         ▼
                   ┌─────────────┐
                   │ PostgreSQL  │
                   │  (数据库)    │
                   └─────────────┘
```

## 部署步骤

### 1. 环境准备

#### 安装系统依赖
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3 python3-pip redis-server postgresql nginx

# CentOS/RHEL
sudo yum install python3 python3-pip redis postgresql-server nginx
```

#### 创建项目目录
```bash
sudo mkdir -p /opt/imato
sudo chown $USER:$USER /opt/imato
cd /opt/imato
```

### 2. 后端部署

#### 克隆代码
```bash
git clone <repository-url> imato-backend
cd imato-backend/backend
```

#### 创建虚拟环境
```bash
python3 -m venv venv
source venv/bin/activate
```

#### 安装依赖
```bash
pip install -r requirements.txt
```

#### 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库和Redis连接
nano .env
```

关键配置项：
```env
# 数据库配置
DATABASE_URL=postgresql://user:password@localhost:5432/imato_license

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# 应用配置
SECRET_KEY=your-secret-key-here
DEBUG=False
```

#### 初始化数据库
```bash
# 运行数据库迁移
python migrations/001_create_license_tables.py

# 或使用Alembic（如果配置了）
alembic upgrade head
```

#### 启动服务
```bash
# 开发环境
uvicorn main:app --host 0.0.0.0 --port 8000

# 生产环境使用Gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000
```

### 3. Redis配置

#### 启动Redis服务
```bash
sudo systemctl start redis
sudo systemctl enable redis
```

#### Redis安全配置
```bash
# 编辑Redis配置文件
sudo nano /etc/redis/redis.conf

# 设置密码认证
requirepass your_redis_password

# 绑定本地地址
bind 127.0.0.1

# 重启Redis
sudo systemctl restart redis
```

### 4. 数据库配置

#### PostgreSQL设置
```bash
# 启动PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 创建数据库和用户
sudo -u postgres psql
```

```sql
CREATE USER imato_user WITH PASSWORD 'your_password';
CREATE DATABASE imato_license OWNER imato_user;
GRANT ALL PRIVILEGES ON DATABASE imato_license TO imato_user;
\q
```

### 5. Nginx配置

#### 创建Nginx配置文件
```bash
sudo nano /etc/nginx/sites-available/imato-license
```

配置内容：
```nginx
upstream imato_backend {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name your-domain.com;
    
    # SSL配置（推荐）
    # listen 443 ssl;
    # ssl_certificate /path/to/certificate.crt;
    # ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://imato_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket支持（如果需要）
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    # 静态文件（如果有的话）
    location /static/ {
        alias /opt/imato/backend/static/;
    }
    
    # 健康检查
    location /health {
        access_log off;
        proxy_pass http://imato_backend;
    }
}
```

#### 启用配置
```bash
sudo ln -s /etc/nginx/sites-available/imato-license /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. 系统服务配置

#### 创建Systemd服务文件
```bash
sudo nano /etc/systemd/system/imato-license.service
```

```ini
[Unit]
Description=iMato License Management Service
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=imato
WorkingDirectory=/opt/imato/backend
Environment=PATH=/opt/imato/backend/venv/bin
ExecStart=/opt/imato/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

#### 启动服务
```bash
sudo systemctl daemon-reload
sudo systemctl start imato-license
sudo systemctl enable imato-license
```

### 7. 前端部署（可选）

#### 构建Angular应用
```bash
cd /opt/imato/frontend
npm install
npm run build --prod
```

#### 配置Nginx服务前端
```nginx
server {
    listen 80;
    server_name frontend.your-domain.com;
    
    root /opt/imato/frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://backend.your-domain.com/api/;
    }
}
```

## 监控和维护

### 健康检查脚本
```bash
#!/bin/bash
# health_check.sh

BACKEND_URL="http://localhost:8000/api/v1/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "Backend is healthy"
else
    echo "Backend is unhealthy - HTTP $RESPONSE"
    # 发送告警邮件或通知
fi
```

### 日志轮转配置
```bash
sudo nano /etc/logrotate.d/imato-license
```

```conf
/opt/imato/backend/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 imato imato
    postrotate
        systemctl reload imato-license
    endscript
}
```

### 备份策略

#### 数据库备份
```bash
#!/bin/bash
# backup_db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/imato"
DB_NAME="imato_license"

mkdir -p $BACKUP_DIR

# 备份数据库
pg_dump -U imato_user -h localhost $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# 压缩备份
gzip $BACKUP_DIR/db_backup_$DATE.sql

# 删除7天前的备份
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete
```

#### Redis备份
```bash
# 在Redis配置中启用持久化
save 900 1
save 300 10
save 60 10000
```

## 安全配置

### 防火墙设置
```bash
# UFW配置
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw deny 5432       # PostgreSQL (仅本地)
sudo ufw deny 6379       # Redis (仅本地)
sudo ufw enable
```

### SSL证书配置
```bash
# 使用Let's Encrypt免费SSL证书
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 性能调优

### Gunicorn配置
```python
# gunicorn.conf.py
bind = "0.0.0.0:8000"
workers = 4
worker_class = "uvicorn.workers.UvicornWorker"
worker_connections = 1000
timeout = 30
keepalive = 2
max_requests = 1000
max_requests_jitter = 100
preload_app = True
```

### 数据库连接池
```python
# 在数据库配置中
pool_size = 20
max_overflow = 30
pool_recycle = 3600
pool_pre_ping = True
```

### Redis优化
```conf
# redis.conf
maxmemory 2gb
maxmemory-policy allkeys-lru
tcp-keepalive 300
timeout 0
```

## 故障排除

### 常见问题

1. **服务无法启动**
   ```bash
   # 检查服务状态
   sudo systemctl status imato-license
   
   # 查看详细日志
   sudo journalctl -u imato-license -f
   ```

2. **数据库连接失败**
   ```bash
   # 检查PostgreSQL状态
   sudo systemctl status postgresql
   
   # 测试数据库连接
   psql -U imato_user -d imato_license -h localhost
   ```

3. **Redis连接问题**
   ```bash
   # 检查Redis状态
   sudo systemctl status redis
   
   # 测试Redis连接
   redis-cli ping
   ```

4. **Nginx配置错误**
   ```bash
   # 测试Nginx配置
   sudo nginx -t
   
   # 重新加载配置
   sudo systemctl reload nginx
   ```

### 性能监控

#### 系统资源监控
```bash
# 安装htop
sudo apt install htop

# 实时监控
htop
```

#### 应用性能监控
```bash
# 安装并配置Prometheus和Grafana
# 或使用APM工具如New Relic, DataDog等
```

## 升级和维护

### 版本升级流程
```bash
# 1. 备份当前版本
sudo cp -r /opt/imato /opt/imato.backup.$(date +%Y%m%d)

# 2. 停止服务
sudo systemctl stop imato-license

# 3. 拉取新代码
cd /opt/imato/backend
git pull origin main

# 4. 更新依赖
source venv/bin/activate
pip install -r requirements.txt

# 5. 运行数据库迁移
python migrations/upgrade_script.py

# 6. 启动服务
sudo systemctl start imato-license

# 7. 验证服务
curl http://localhost:8000/api/v1/health
```

### 定期维护任务
```bash
# 每日：检查服务状态
# 每周：清理日志文件
# 每月：数据库维护和优化
# 每季度：安全更新和漏洞扫描
```

## 联系支持

如遇部署问题，请联系技术支持：
- 邮箱: support@imatuproject.com
- 文档: https://docs.imatuproject.com
- GitHub: https://github.com/imatuproject/license-management