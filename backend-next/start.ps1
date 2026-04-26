# OpenMTSciEd Next.js 后端启动脚本

Write-Host "🚀 启动 OpenMTSciEd Next.js 后端..." -ForegroundColor Green

# 检查 node_modules
if (-Not (Test-Path "node_modules")) {
    Write-Host "⚠️  检测到未安装依赖，开始安装..." -ForegroundColor Yellow
    npm install
}

# 生成 Prisma 客户端
Write-Host "📦 生成 Prisma 客户端..." -ForegroundColor Cyan
npx prisma generate

# 启动开发服务器
Write-Host "🌐 启动开发服务器..." -ForegroundColor Green
npm run dev
