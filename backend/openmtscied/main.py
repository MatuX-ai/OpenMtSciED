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

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from modules.auth import auth_api, user_management_api, settings_api
from modules.learning import path_api
from modules.resources import crawler_api, export_api

app = FastAPI(
    title="OpenMTSciEd",
    description="STEM 连贯学习路径引擎 API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_api.router, prefix="/api/v1/auth", tags=["认证"])
app.include_router(user_management_api.router, prefix="/api/v1/users", tags=["用户管理"])
app.include_router(settings_api.router, prefix="/api/v1/admin/settings", tags=["系统设置"])
app.include_router(path_api.router)
app.include_router(export_api.router)
app.include_router(crawler_api.router, prefix="/api/v1/admin", tags=["爬虫管理"])


@app.get("/")
async def root():
    return {"service": "OpenMTSciEd", "version": "0.1.0", "status": "running"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
