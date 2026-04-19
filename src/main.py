"""
iMato AI Service 主应用入口
提供AI代码生成和其他AI功能的FastAPI服务
"""

import asyncio
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from config.settings import Settings
from routes import (
    auth_routes,
    hardware_project_routes,  # 硬件项目管理
    material_routes,  # 统一课件库
    user_management_routes,  # 用户管理
)
from database import init_registry_manager
from utils.database import create_db_and_tables
from utils.logger import setup_logger

# 加载环境变量
settings = Settings()

# 创建FastAPI应用实例
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="iMato AI Service - 提供AI代码生成、个性化推荐、电商支付、硬件认证和其他智能功能",
    docs_url="/docs",
    redoc_url="/redoc",
)

# 配置 CORS 中间件
if isinstance(settings.ALLOWED_ORIGINS, str):
    allowed_origins = settings.ALLOWED_ORIGINS.split(",")
else:
    allowed_origins = settings.ALLOWED_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 配置日志
logger = setup_logger(settings.LOG_LEVEL, settings.LOG_FILE)

# 包含核心路由
app.include_router(auth_routes.router, prefix="/api/v1/auth", tags=["认证"])
app.include_router(hardware_project_routes.router, tags=["硬件项目管理"])
app.include_router(material_routes.router, tags=["统一课件库"])
app.include_router(user_management_routes.router, tags=["用户管理"])

# 可选路由注册 (根据配置启用)
if settings.ENABLE_AR_VR_ROUTES:
    # TODO: 引入 ar_vr_routes
    logger.info("✅ AR/VR 课程内容管理路由已启用")


@app.on_event("startup")
async def startup_event():
    """应用启动事件"""
    logger.info(f"Starting OpenMTSciEd v{settings.APP_VERSION}")

    # 导入核心模型
    from models.user import User
    from models.hardware_project import HardwareProjectTemplate
    from models.unified_material import UnifiedMaterial

    # 创建数据库表
    await create_db_and_tables()
    logger.info("Database tables initialized.")


@app.on_event("shutdown")
async def shutdown_event():
    """应用关闭事件"""
    logger.info(f"Shutting down {settings.APP_NAME}")

    # 清理注册表资源
    try:
        from database import get_registry_manager
        registry_manager = get_registry_manager()
        await registry_manager.registry.cleanup_all()
        logger.info("数据库模块注册表资源已清理")
    except Exception as e:
        logger.error(f"清理注册表资源失败: {str(e)}")


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    """HTTP异常处理器"""
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    """请求验证异常处理器"""
    return JSONResponse(status_code=422, content={"detail": exc.errors()})


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """全局异常处理器 - 捕获所有未处理的异常"""
    import traceback
    error_traceback = traceback.format_exc()
    logger.error(f"全局异常捕获:\n{error_traceback}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "type": type(exc).__name__,
            "message": str(exc) if settings.DEBUG else None
        }
    )


@app.get("/")
async def root():
    """根路径健康检查"""
    return {
        "message": "Welcome to OpenMTSciEd",
        "version": settings.APP_VERSION,
        "status": "healthy",
        "features": [
            "用户认证 (Auth)",
            "硬件项目管理 (Hardware Projects)",
            "统一课件库 (Materials)",
            "STEM 路径生成 (Path Generator)"
        ],
    }


@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {
        "status": "healthy",
        "service": "OpenMTSciEd",
        "version": settings.APP_VERSION,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )
