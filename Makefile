.PHONY: help build up down restart logs clean test lint format db-backup db-restore

# 默认目标
help:
	@echo "OpenMTSciEd 常用命令"
	@echo ""
	@echo "开发环境:"
	@echo "  make build       - 构建 Docker 镜像"
	@echo "  make up          - 启动所有服务"
	@echo "  make down        - 停止所有服务"
	@echo "  make restart     - 重启所有服务"
	@echo "  make logs        - 查看日志"
	@echo "  make clean       - 清理容器和镜像"
	@echo ""
	@echo "数据库管理:"
	@echo "  make db-backup   - 备份数据库"
	@echo "  make db-restore  - 恢复数据库"
	@echo "  make db-shell    - 进入数据库命令行"
	@echo ""
	@echo "代码质量:"
	@echo "  make test        - 运行测试"
	@echo "  make lint        - 代码检查"
	@echo "  make format      - 格式化代码"
	@echo ""
	@echo "生产部署:"
	@echo "  make deploy      - 部署到生产环境"
	@echo "  make ssl         - 配置 SSL 证书"

# 构建 Docker 镜像
build:
	docker-compose build

# 启动服务
up:
	docker-compose up -d
	@echo "服务已启动！"
	@echo "后端 API: http://localhost:8000"
	@echo "API 文档: http://localhost:8000/docs"
	@echo "健康检查: http://localhost:8000/health"

# 停止服务
down:
	docker-compose down

# 重启服务
restart:
	docker-compose restart

# 查看日志
logs:
	docker-compose logs -f

# 查看特定服务日志
logs-backend:
	docker-compose logs -f backend

logs-nginx:
	docker-compose logs -f nginx

logs-postgres:
	docker-compose logs -f postgres

# 清理
clean:
	docker-compose down -v
	docker system prune -f

# 深度清理（删除所有镜像）
clean-all:
	docker-compose down -v --rmi all
	docker system prune -af

# 运行测试
test:
	docker-compose exec backend pytest tests/ -v

# 代码检查
lint:
	docker-compose exec backend flake8 openmtscied/
	docker-compose exec backend black --check openmtscied/

# 格式化代码
format:
	docker-compose exec backend black openmtscied/
	docker-compose exec backend isort openmtscied/

# 数据库备份
db-backup:
	@mkdir -p backups
	docker-compose exec postgres pg_dump -U $${POSTGRES_USER:-openmtscied_user} $${POSTGRES_DB:-openmtscied} > backups/db_$$(date +%Y%m%d_%H%M%S).sql
	@echo "数据库备份完成！"
	@ls -lh backups/

# 数据库恢复
db-restore:
	@if [ -z "$(FILE)" ]; then \
		echo "请指定备份文件: make db-restore FILE=backups/db_20260425_120000.sql"; \
		exit 1; \
	fi
	cat $(FILE) | docker-compose exec -T postgres psql -U $${POSTGRES_USER:-openmtscied_user} -d $${POSTGRES_DB:-openmtscied}
	@echo "数据库恢复完成！"

# 进入数据库命令行
db-shell:
	docker-compose exec postgres psql -U $${POSTGRES_USER:-openmtscied_user} -d $${POSTGRES_DB:-openmtscied}

# 进入后端容器
shell-backend:
	docker-compose exec backend bash

# 配置 SSL 证书（Let's Encrypt）
ssl:
	@echo "请确保域名已解析到此服务器"
	@echo "运行以下命令获取证书："
	@echo "  sudo certbot certonly --nginx -d yourdomain.com"
	@echo ""
	@echo "然后将证书复制到 ssl/ 目录："
	@echo "  sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/"
	@echo "  sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/"

# 部署到生产环境
deploy:
	@echo "正在部署到生产环境..."
	git pull
	docker-compose build --no-cache
	docker-compose up -d
	@echo "部署完成！"
	@echo "请验证服务: curl https://yourdomain.com/health"

# 查看服务状态
status:
	docker-compose ps
	@echo ""
	docker stats --no-stream

# 更新服务
update:
	git pull
	docker-compose up -d --build
	@echo "服务已更新！"
