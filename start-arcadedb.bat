@echo off
REM ========================================
REM ArcadeDB 快速启动脚本 (Windows)
REM ========================================

echo.
echo ========================================
echo   ArcadeDB 服务器启动工具
echo ========================================
echo.

REM 检查 Docker 是否安装
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [错误] Docker 未安装或未添加到 PATH
    echo.
    echo 请先安装 Docker Desktop:
    echo https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)

echo [信息] 检测到 Docker，准备启动 ArcadeDB...
echo.

REM 检查端口是否被占用
netstat -ano | findstr ":2480" >nul
if %ERRORLEVEL% EQU 0 (
    echo [警告] 端口 2480 已被占用
    echo.
    set /p CONTINUE="是否继续？这可能会导致冲突 (y/n): "
    if /i not "%CONTINUE%"=="y" exit /b 1
)

echo [信息] 正在下载并启动 ArcadeDB...
echo [信息] 首次运行可能需要几分钟下载镜像
echo.

REM 启动 ArcadeDB 容器
docker run --rm ^
  -p 2480:2480 ^
  -p 2424:2424 ^
  -e JAVA_OPTS="-Darcadedb.server.rootPassword=playwithdata -Darcadedb.server.defaultDatabases=OpenMTSciEd[root]" ^
  --name arcadedb-server ^
  arcadedata/arcadedb:latest

echo.
echo ========================================
echo   ArcadeDB 服务器已停止
echo ========================================
echo.
pause
