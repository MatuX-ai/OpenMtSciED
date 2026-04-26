"""OpenMTSciEd FastAPI 主应用 (MVP 极简版)"""

import sys
import os
sys.path.append(os.path.dirname(__file__))

from dotenv import load_dotenv

# 加载环境变量 (从项目根目录的 .env.local)
env_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env.local')
if os.path.exists(env_path):
    load_dotenv(env_path, override=True)
    print(f"[OK] Loaded environment variables from {env_path}")
else:
    print(f"[WARN] .env.local not found at {env_path}")

# 配置结构化日志
from shared.logging_config import setup_logging, get_logger
logger = setup_logging()
logger.info("Starting OpenMTSciEd API service")

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
from modules.auth import auth_api, user_management_api, settings_api
from modules.learning import path_api, question_api
from modules.resources import crawler_api, export_api, library_api, association_api
from modules.resources.graph_api_simple import router as graph_api_router

# 初始化速率限制器
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="OpenMTSciEd",
    description="STEM 连贯学习路径引擎 API",
    version="0.1.0",
)

# 将 limiter 添加到 app state
app.state.limiter = limiter

# 添加速率限制异常处理器
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    from fastapi.responses import JSONResponse
    return JSONResponse(
        status_code=429,
        content={"detail": "请求过于频繁，请稍后再试"}
    )

# CORS 配置 - 生产环境应限制为特定域名
ALLOWED_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:4200,http://localhost:3000").split(",")
print(f"[INFO] CORS allowed origins: {ALLOWED_ORIGINS}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)

app.include_router(auth_api.router, prefix="/api/v1/auth", tags=["认证"])
app.include_router(user_management_api.router, prefix="/api/v1/users", tags=["用户管理"])
app.include_router(settings_api.router, prefix="/api/v1/admin/settings", tags=["系统设置"])
app.include_router(path_api.router)
app.include_router(export_api.router)
app.include_router(crawler_api.router, prefix="/api/v1/admin", tags=["爬虫管理"])
app.include_router(library_api.router, prefix="/api/v1/libraries", tags=["教程与课件库"])
app.include_router(graph_api_router, prefix="/api/v1/admin", tags=["知识图谱管理"])
app.include_router(association_api.router, prefix="/api/v1/resources", tags=["资源关联"])
app.include_router(question_api.router, prefix="/api/v1/learning", tags=["题库与练习"])


@app.get("/")
async def root():
    return {"service": "OpenMTSciEd", "version": "0.1.0", "status": "running"}


@app.get("/health")
async def health_check():
    """
    健康检查端点 - 用于负载均衡器和监控系统
    """
    from datetime import datetime
    
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "0.1.0",
        "checks": {}
    }
    
    # 检查数据库连接
    try:
        from sqlalchemy import text
        from shared.models.db_models import SessionLocal
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        health_status["checks"]["database"] = "ok"
    except Exception as e:
        health_status["checks"]["database"] = f"error: {str(e)}"
        health_status["status"] = "degraded"
    
    # 检查 Neo4j 连接
    try:
        import requests
        neo4j_uri = os.getenv("NEO4J_HTTP_URI", "")
        if neo4j_uri:
            response = requests.post(
                neo4j_uri,
                json={"statement": "RETURN 1"},
                timeout=5
            )
            if response.status_code == 200:
                health_status["checks"]["neo4j"] = "ok"
            else:
                health_status["checks"]["neo4j"] = f"error: HTTP {response.status_code}"
                health_status["status"] = "degraded"
        else:
            health_status["checks"]["neo4j"] = "not configured"
    except Exception as e:
        health_status["checks"]["neo4j"] = f"error: {str(e)}"
        health_status["status"] = "degraded"
    
    # 返回状态码
    status_code = 200 if health_status["status"] == "healthy" else 503
    
    from fastapi.responses import JSONResponse
    return JSONResponse(content=health_status, status_code=status_code)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)

# Vercel Serverless 部署需要导出 app
app = app
