"""
OpenMTSciEd FastAPI 主应用
学习路径生成服务入口
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import path_api, auth_api

# 创建FastAPI应用
app = FastAPI(
    title="OpenMTSciEd - 学习路径生成服务",
    description="STEM连贯学习路径引擎 API",
    version="0.1.0",
)

# 配置CORS (从环境变量读取允许的域名)
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth_api.router)
app.include_router(path_api.router)


@app.get("/")
async def root():
    """根路径"""
    return {
        "service": "OpenMTSciEd Path Generator",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/api/v1/path/health",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.openmtscied.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
