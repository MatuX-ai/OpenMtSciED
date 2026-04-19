"""
OpenMTSciEd FastAPI 主应用 (MVP 极简版)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import path_api, auth_api, education_platform_routes, user_profile_api, async_example_api

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

app.include_router(auth_api.router)
app.include_router(path_api.router)
app.include_router(education_platform_routes.router)
app.include_router(user_profile_api.router)
app.include_router(async_example_api.router)


@app.get("/")
async def root():
    return {"service": "OpenMTSciEd", "version": "0.1.0", "status": "running"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.openmtscied.main:app", host="0.0.0.0", port=8000, reload=True)
