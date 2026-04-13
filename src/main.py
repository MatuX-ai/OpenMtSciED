"""
iMato AI Service 主应用入口
提供AI代码生成和其他AI功能的FastAPI服务
"""

import asyncio
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from config.settings import Settings
from middleware import (
    APMMiddleware,
    init_apm,
    PermissionMiddleware,
    LicenseMiddleware,
    license_exception_handler,
    CircuitBreakerConfig,
    CircuitBreakerMiddleware
)
from routes import (
    ai_recommend_routes,
    ai_routes,
    ar_lab_routes,
    ar_rewards,
    ar_vr_mock_routes,
    ar_vr_routes,
    auth_routes,
    blockchain_gateway_routes,
    # celery_monitoring_routes,  # TODO: 文件不存在
    collaborative_editor_routes,
    course_routes,
    course_version_routes,
    creativity_routes,
    digital_twin_routes,
    dynamic_course_routes,
    # edu_data_routes,  # 暂时注释，需要修复配置
    educational_institution_routes,
    # federated_routes,  # 暂时注释，需要修复导入
    # gesture_recognition,  # 暂时注释，缺少 cv2 依赖
    # hardware_alert_routes,  # 暂时注释，缺少 hardware 模块
    hardware_certification_routes,
    # hardware_module_routes,  # 暂时注释，导入错误
    learning_behavior_routes,
    learning_source_routes,
    license_routes,
    material_routes,  # 统一课件库
    model_benchmark_routes,
    model_update_routes,
    multimedia_routes,
    payment_routes,
    permission_routes,
    # pretrain_model_routes,  # TODO: 依赖的模型不存在
    # recommendation_routes,  # TODO: 依赖缺失
    sponsorship_routes,
    subscription_routes,
    tenant_config_routes,
    unified_learning_record_routes,
    user_license_routes,
    user_organization_routes,
    # xr_gesture_routes,  # TODO: 文件不存在
    ai_edu_progress_routes,  # AI教育学习进度
)
from routes import ai_capabilities_routes  # XEduHub AI 能力组件
from routes import openhydra_routes  # OpenHydra AI 沙箱环境
from routes import admin_settings_routes  # Admin 后台全局设置
from routes import finance_routes  # 财务管理
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

# 配置APM监控中间件
app.add_middleware(APMMiddleware, service_name=settings.APP_NAME)

# 配置许可证验证中间件
app.add_middleware(LicenseMiddleware)

# 配置熔断器中间件
if settings.CIRCUIT_BREAKER_ENABLED:
    circuit_config = CircuitBreakerConfig(
        failure_threshold=getattr(settings, "CIRCUIT_BREAKER_FAILURE_THRESHOLD", 5),
        timeout=getattr(settings, "CIRCUIT_BREAKER_TIMEOUT", 60),
        half_open_attempts=getattr(settings, "CIRCUIT_BREAKER_HALF_OPEN_ATTEMPTS", 3),
    )
    app.add_middleware(CircuitBreakerMiddleware, config=circuit_config)

# 配置权限验证中间件
app.add_middleware(PermissionMiddleware)

# 配置日志
logger = setup_logger(settings.LOG_LEVEL, settings.LOG_FILE)

# 包含路由
app.include_router(ai_routes.router, prefix="/api/v1", tags=["AI服务"])
app.include_router(
    ai_recommend_routes.router, prefix="/api/v1", tags=["AI 推荐服务"]
)  # 新增 AI 推荐路由
app.include_router(auth_routes.router, prefix="/api/v1/auth", tags=["认证"])
# app.include_router(recommendation_routes.router, prefix="/api/v1", tags=["推荐系统"])  # TODO: 依赖缺失
# app.include_router(pretrain_model_routes.router, prefix="/api/v1", tags=["预训练模型"])  # TODO: 依赖的模型不存在
app.include_router(payment_routes.router, prefix="/api/v1", tags=["支付系统"])
app.include_router(subscription_routes.router, prefix="/api/v1", tags=["订阅系统"])
app.include_router(
    hardware_certification_routes.router, prefix="/api/v1/hardware", tags=["硬件认证"]
)
app.include_router(license_routes.router, prefix="/api/v1", tags=["许可证管理"])
app.include_router(user_license_routes.router, prefix="/api/v1", tags=["用户许可证"])
app.include_router(course_routes.router, tags=["课程管理"])
app.include_router(tenant_config_routes.router, tags=["租户配置管理"])
app.include_router(educational_institution_routes.router, tags=["教育机构管理"])
app.include_router(permission_routes.router, tags=["权限管理"])
app.include_router(course_version_routes.router, tags=["课程版本控制"])
app.include_router(collaborative_editor_routes.router, tags=["协作编辑"])
app.include_router(multimedia_routes.router, tags=["多媒体资源"])
app.include_router(creativity_routes.router, tags=["创意引擎"])
app.include_router(
    dynamic_course_routes.router, prefix="/api/v1", tags=["动态课程生成"]
)
app.include_router(ar_lab_routes.router)
# app.include_router(hardware_module_routes.router, tags=["硬件模块管理"])  # TODO: 未定义
# app.include_router(edu_data_routes.router, tags=["教育数据联邦学习"])  # TODO: 未定义
app.include_router(sponsorship_routes.router, tags=["企业赞助管理"])
app.include_router(model_benchmark_routes.router, tags=["模型基准测试"])
app.include_router(
    blockchain_gateway_routes.router, prefix="/api/v1", tags=["区块链网关"]
)
# app.include_router(
#     hardware_alert_routes.router, prefix="/api/v1", tags=["硬件告警管理"]
# )  # TODO: 未定义
app.include_router(
    learning_behavior_routes.router, prefix="/api/v1", tags=["学习行为特征"]
)

# 多来源学习关联管理路由
app.include_router(
    learning_source_routes.router, prefix="/api/v1", tags=["学习来源管理"]
)
app.include_router(
    user_organization_routes.router, prefix="/api/v1", tags=["用户组织管理"]
)
app.include_router(
    unified_learning_record_routes.router, prefix="/api/v1", tags=["统一学习记录"]
)

# app.include_router(
#     celery_monitoring_routes.router, prefix="/api/v1", tags=["Celery 任务监控"]
# )  # TODO: 文件不存在
app.include_router(ar_rewards.router, prefix="/api/v1", tags=["AR 奖励系统"])
# app.include_router(gesture_recognition.router, prefix="/api/v1", tags=["手势识别系统"])  # TODO: 未定义
# OpenHydra AI 沙箱环境 API 路由
# 提供容器生命周期管理、Jupyter 环境访问等功能
app.include_router(openhydra_routes.router, tags=["AI 实验室"])
# XEduHub AI 能力组件 API 路由
# 封装视觉分析、NLP 对话、ML 预测等 SOTA 模型能力
app.include_router(ai_capabilities_routes.router, tags=["AI 能力组件"])

# 财务管理 API 路由
# 提供学费、薪酬、定价、消课等财务相关接口
app.include_router(finance_routes.router, tags=["财务管理"])
# Admin 后台全局设置 API 路由
# 提供全局配置的增删改查和测试连接功能
app.include_router(admin_settings_routes.router, tags=["Admin 设置管理"])

# 统一课件库 API 路由
# 支持24种课件类型的完整CRUD操作、统计分析、批量操作等功能
app.include_router(material_routes.router, tags=["统一课件库"])

# AI教育学习进度 API 路由
# 提供学习进度的上报、查询和统计分析功能
app.include_router(ai_edu_progress_routes.router, tags=["AI教育学习进度"])

# AR 奖励系统API路由
# 处理 AR 场景完成、元件验证等奖励事件
# 集成成就徽章和积分奖励系统
# 手势识别系统API路由
# 处理 MediaPipe 手势识别和复杂手势序列检测
# 支持隐藏任务触发和奖励发放

# 可选路由注册 (根据配置启用)
if settings.ENABLE_AR_VR_ROUTES:
    app.include_router(ar_vr_routes.router, tags=["AR/VR 课程"])
    logger.info("✅ AR/VR 课程内容管理路由已启用")

if settings.ENABLE_AR_VR_MOCK_ROUTES:
    app.include_router(ar_vr_mock_routes.mock_router, tags=["AR/VR Mock服务"])
    logger.info("✅ AR/VR Mock服务路由已启用")

if settings.ENABLE_DIGITAL_TWIN_ROUTES:
    app.include_router(digital_twin_routes.router, tags=["数字孪生实验室"])
    logger.info("✅ 数字孪生实验室路由已启用")

if settings.ENABLE_FEDERATED_ROUTES:
    app.include_router(federated_routes.router, tags=["联邦学习"])
    logger.info("✅ 联邦学习 API 路由已启用")

if settings.ENABLE_MODEL_UPDATE_ROUTES:
    app.include_router(model_update_routes.router, tags=["模型更新"])
    logger.info("✅ AI 模型热更新路由已启用")

# if settings.ENABLE_XR_GESTURE_ROUTES:  # TODO: 文件不存在
#     app.include_router(xr_gesture_routes.router, tags=["XR 手势识别"])
#     logger.warning(
#         "⚠️ XR 手势识别路由与 gesture_recognition 功能重复，请确认是否需要启用"
#     )


@app.on_event("startup")
async def startup_event():
    """应用启动事件"""
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")

    # 导入所有模型以确保它们被注册到 Base.metadata
    # 按依赖顺序导入：先导入基础模型，再导入依赖模型
    from models.license import Organization, License
    from models.sponsorship import Sponsorship  # 赞助模型，必须在Organization之前导入
    from models.user import User
    from models.ar_vr_content import ARVRContent
    from models.content_store import ContentItem
    from models.course_version import CourseVersion
    from models.dynamic_course import GeneratedCourse
    from models.hardware_certification import HardwareCertificationDB
    from models.hardware_module import HardwareModule
    from models.learning_source import LearningSource
    from models.payment import Payment
    from models.permission import Permission
    from models.subscription import SubscriptionPlan
    from models.subscription_fsm import SubscriptionFSM
    from models.unified_learning_record import UnifiedLearningRecord
    from models.user_license import UserLicense
    from models.user_organization import UserOrganization
    from models.ai_request import AIRequest
    from models.unified_material import UnifiedMaterial  # 统一课件库模型

    # 初始化 APM 监控
    init_apm()

    # 创建数据库表
    await create_db_and_tables()
    logger.info("Database tables created successfully")

    # 初始化测试数据（仅开发环境）
    if settings.DEBUG:
        try:
            from utils.init_test_data import initialize_test_data
            initialize_test_data()
        except Exception as e:
            logger.error(f"测试数据初始化失败：{e}")
            import traceback
            traceback.print_exc()

    # 初始化数据库模块注册表
    try:
        logger.info("正在初始化数据库模块注册表...")
        registry_manager = init_registry_manager()
        await registry_manager.initialize_registry(auto_discover=True)

        # 输出注册表统计信息
        stats = registry_manager.get_registry_config()
        logger.info(f"数据库模块注册表初始化完成: {stats}")

        # 执行健康检查
        health = await registry_manager.health_check()
        logger.info(f"注册表健康检查: {health['registry_status']}")

        if health['issues']:
            for issue in health['issues']:
                logger.warning(f"注册表警告: {issue}")

    except Exception as e:
        logger.error(f"数据库模块注册表初始化失败: {str(e)}")
        import traceback
        traceback.print_exc()


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


# 添加许可证异常处理器
app.add_exception_handler(401, license_exception_handler)
app.add_exception_handler(403, license_exception_handler)


@app.get("/")
async def root():
    """根路径健康检查"""
    # 构建已激活的可选功能列表
    optional_features = []
    if settings.ENABLE_AR_VR_ROUTES:
        optional_features.append("AR/VR 课程 (已启用)")
    if settings.ENABLE_AR_VR_MOCK_ROUTES:
        optional_features.append("AR/VR Mock服务 (已启用)")
    if settings.ENABLE_DIGITAL_TWIN_ROUTES:
        optional_features.append("数字孪生实验室 (已启用)")
    if settings.ENABLE_FEDERATED_ROUTES:
        optional_features.append("联邦学习 API (已启用)")
    if settings.ENABLE_MODEL_UPDATE_ROUTES:
        optional_features.append("AI 模型热更新 (已启用)")
    if settings.ENABLE_XR_GESTURE_ROUTES:
        optional_features.append(
            "XR 手势识别 (已启用，注意：与 gesture_recognition 重复)"
        )

    # 获取注册表信息
    registry_info = {}
    try:
        from database import get_registry_manager
        registry_manager = get_registry_manager()
        registry_info = registry_manager.get_registry_config()
    except Exception as e:
        registry_info = {"error": str(e)}

    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "status": "healthy",
        "database_registry": registry_info,
        "core_features": [
            "AI 服务",
            "认证系统",
            "推荐系统",
            "支付系统",
            "订阅系统",
            "硬件认证",
            "许可证管理",
            "课程管理",
            "课程版本控制",
            "多租户配置",
            "教育机构管理",
            "权限管理",
            "协作编辑",
            "多媒体资源",
            "创意引擎",
            "AR 实验室",
            "教育数据联邦学习",
            "模型基准测试",
            "区块链网关",
            "学习行为特征",
            "Celery 任务监控",
        ],
        "optional_features": optional_features if optional_features else ["无"],
        "configuration_note": "可选功能通过环境变量控制，详见.env.example",
    }


@app.get("/health")
async def health_check():
    """健康检查端点"""
    health_info = {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }

    # 添加注册表健康信息
    try:
        from database import get_registry_manager
        registry_manager = get_registry_manager()
        registry_health = await registry_manager.health_check()
        health_info["database_registry"] = registry_health

        # 如果注册表有问题，调整整体状态
        if registry_health['registry_status'] != 'healthy':
            health_info['status'] = registry_health['registry_status']

    except Exception as e:
        health_info["database_registry_error"] = str(e)
        health_info["status"] = "degraded"

    return health_info


@app.get("/registry/stats")
async def registry_stats():
    """注册表统计信息端点"""
    try:
        from database import get_registry_manager
        registry_manager = get_registry_manager()
        stats = registry_manager.get_registry_config()
        categorized = registry_manager.list_modules_by_category()

        return {
            "registry_stats": stats,
            "modules_by_category": categorized,
            "total_categories": len(categorized)
        }
    except Exception as e:
        return {"error": str(e)}


@app.get("/registry/modules")
async def list_registry_modules(category: str = None):
    """列出注册表中的模块"""
    try:
        from database import get_database_registry
        registry = get_database_registry()

        if category:
            modules = registry.get_modules_by_category(category)
        else:
            modules = registry.list_modules()

        return {
            "modules": [
                {
                    "name": m.name,
                    "table_name": m.table_name,
                    "category": m.category,
                    "version": m.version,
                    "is_active": m.is_active,
                    "description": m.description
                }
                for m in modules
            ],
            "filter_category": category
        }
    except Exception as e:
        return {"error": str(e)}


@app.get("/test/faulty")
async def faulty_endpoint():
    """故障测试端点 - 用于熔断器测试"""
    import random

    if random.random() < 0.7:  # 70%概率失败
        raise ConnectionError("Simulated connection failure")
    return {
        "message": "success",
        "timestamp": __import__("datetime").datetime.utcnow().isoformat(),
    }


@app.get("/test/success")
async def success_endpoint():
    """成功测试端点"""
    return {
        "message": "success",
        "timestamp": __import__("datetime").datetime.utcnow().isoformat(),
    }


@app.get("/metrics")
async def metrics_endpoint():
    """Prometheus指标端点 - 支持fallback模式"""
    try:
        from prometheus_client import CONTENT_TYPE_LATEST, generate_latest
        from starlette.responses import Response

        return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
    except ImportError:
        # Fallback: 返回简单的文本响应
        return PlainTextResponse(
            "# Prometheus metrics not available\n# Install prometheus_client for metrics support\nmetrics_placeholder_info: Database registry system active\n",
            status_code=200
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )
