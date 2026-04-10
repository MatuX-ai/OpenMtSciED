# OpenMTSciEd 安装指南

本指南将帮助你本地部署或开发 OpenMTSciEd 项目。

## 环境要求

- Python 3.11+
- Node.js 20+
- Docker & Docker Compose (推荐)
- Neo4j (如果使用本地数据库)

## 方式一：Docker 快速启动 (推荐)

1. **克隆仓库**
   ```bash
   git clone https://github.com/iMato/OpenMTSciEd.git
   cd OpenMTSciEd
   ```

2. **配置环境变量**
   复制 `.env.example` 为 `.env` 并根据需要修改（通常默认即可）。

3. **启动服务**
   ```bash
   docker-compose up -d
   ```
   启动后，前端访问 `http://localhost`，后端 API 访问 `http://localhost:8000`。

## 方式二：本地开发部署

### 1. 后端设置

```bash
# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 启动后端服务
uvicorn backend.openmtscied.main:app --reload
```

### 2. 前端设置

```bash
cd frontend
npm install
npm run dev
```

### 3. 数据库准备

确保你已运行 `scripts/graph_db/schema_creation.cypher` 来初始化 Neo4j 数据库结构。

## 常见问题

- **端口冲突**: 如果 8000 或 80 端口被占用，请在 `docker-compose.yml` 中修改映射端口。
- **Neo4j 连接失败**: 检查 `NEO4J_URI` 环境变量是否正确指向你的数据库地址。
