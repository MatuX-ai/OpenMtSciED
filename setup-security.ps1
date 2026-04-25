# OpenMTSciEd 安全配置快速设置脚本 (Windows PowerShell)
# 此脚本帮助完成第一阶段安全修复的配置

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "OpenMTSciEd 安全配置向导" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否在项目根目录
if (-Not (Test-Path "requirements.txt")) {
    Write-Host "❌ 错误: 请在项目根目录运行此脚本" -ForegroundColor Red
    exit 1
}

# 步骤 1: 检查 .env.local 是否存在
$skip_env = $false
if (Test-Path ".env.local") {
    Write-Host "⚠️  检测到 .env.local 文件已存在" -ForegroundColor Yellow
    $overwrite = Read-Host "是否覆盖现有配置? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "跳过 .env.local 创建" -ForegroundColor Gray
        $skip_env = $true
    }
}

if (-not $skip_env) {
    Write-Host ""
    Write-Host "📝 步骤 1: 创建 .env.local 配置文件" -ForegroundColor Green
    Write-Host "----------------------------------------"
    
    # 复制模板
    Copy-Item ".env.example" ".env.local"
    Write-Host "✅ 已从 .env.example 复制配置模板" -ForegroundColor Green
    
    # 生成 SECRET_KEY
    Write-Host ""
    Write-Host "🔑 正在生成强密钥..." -ForegroundColor Green
    
    try {
        $bytes = New-Object byte[] 32
        (New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes)
        $SECRET_KEY = [Convert]::ToBase64String($bytes) -replace '[+/=]', ''
    } catch {
        # 备用方法
        $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        $SECRET_KEY = -join ((1..32) | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
    }
    
    # 更新 .env.local 中的 SECRET_KEY
    $content = Get-Content ".env.local" -Raw
    $content = $content -replace 'SECRET_KEY=.*', "SECRET_KEY=$SECRET_KEY"
    Set-Content ".env.local" $content -NoNewline
    
    Write-Host "✅ SECRET_KEY 已自动生成并配置" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  重要: 请手动编辑 .env.local 填写以下信息:" -ForegroundColor Yellow
    Write-Host "   - NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD"
    Write-Host "   - DATABASE_URL"
    Write-Host "   - CORS_ORIGINS (生产环境)"
    Write-Host ""
    Read-Host "按回车键继续"
}

# 步骤 2: 安装依赖
Write-Host ""
Write-Host "📦 步骤 2: 安装 Python 依赖" -ForegroundColor Green
Write-Host "----------------------------------------"

Set-Location backend

try {
    pip install -r requirements.txt
    Write-Host "✅ 依赖安装完成" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误: 依赖安装失败" -ForegroundColor Red
    Write-Host "请确保已安装 Python 和 pip" -ForegroundColor Red
    exit 1
}

# 步骤 3: 验证配置
Write-Host ""
Write-Host "🔍 步骤 3: 验证配置" -ForegroundColor Green
Write-Host "----------------------------------------"

Set-Location openmtscied

Write-Host "尝试验证配置..." -ForegroundColor Gray

# 简单验证：尝试导入模块
try {
    python -c "from dotenv import load_dotenv; from passlib.context import CryptContext; from slowapi import Limiter; print('✅ 所有依赖导入成功')"
} catch {
    Write-Host "❌ 依赖验证失败" -ForegroundColor Red
    exit 1
}

# 完成
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🎉 安全配置完成！" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "下一步操作:" -ForegroundColor Yellow
Write-Host "1. ⚠️  立即轮换 Neo4j 密码（如果之前使用硬编码密码）"
Write-Host "2. 📝 编辑 .env.local 填写完整的数据库配置"
Write-Host "3. 🚀 启动后端服务测试"
Write-Host ""
Write-Host "详细文档:" -ForegroundColor Cyan
Write-Host "  - 安全配置指南: SECURITY_CONFIG.md"
Write-Host "  - 修复报告: SECURITY_FIX_REPORT_PHASE1.md"
Write-Host "  - 部署审计: PRODUCTION_DEPLOYMENT_AUDIT.md"
Write-Host ""
Write-Host "如有问题，请查看日志或提交 GitHub Issue"
Write-Host "=========================================="
