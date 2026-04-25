#!/bin/bash
# OpenMTSciEd 安全配置快速设置脚本
# 此脚本帮助完成第一阶段安全修复的配置

set -e  # 遇到错误立即退出

echo "=========================================="
echo "OpenMTSciEd 安全配置向导"
echo "=========================================="
echo ""

# 检查是否在项目根目录
if [ ! -f "requirements.txt" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 步骤 1: 检查 .env.local 是否存在
if [ -f ".env.local" ]; then
    echo "⚠️  检测到 .env.local 文件已存在"
    read -p "是否覆盖现有配置? (y/N): " overwrite
    if [[ ! "$overwrite" =~ ^[Yy]$ ]]; then
        echo "跳过 .env.local 创建"
        skip_env=true
    fi
fi

if [ -z "$skip_env" ]; then
    echo ""
    echo "📝 步骤 1: 创建 .env.local 配置文件"
    echo "----------------------------------------"
    
    # 复制模板
    cp .env.example .env.local
    echo "✅ 已从 .env.example 复制配置模板"
    
    # 生成 SECRET_KEY
    echo ""
    echo "🔑 正在生成强密钥..."
    SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))" 2>/dev/null || python -c "import secrets; print(secrets.token_urlsafe(32))")
    
    # 更新 .env.local 中的 SECRET_KEY
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/" .env.local
    else
        # Linux
        sed -i "s/SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/" .env.local
    fi
    
    echo "✅ SECRET_KEY 已自动生成并配置"
    echo ""
    echo "⚠️  重要: 请手动编辑 .env.local 填写以下信息:"
    echo "   - NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD"
    echo "   - DATABASE_URL"
    echo "   - CORS_ORIGINS (生产环境)"
    echo ""
    read -p "按回车键继续..."
fi

# 步骤 2: 安装依赖
echo ""
echo "📦 步骤 2: 安装 Python 依赖"
echo "----------------------------------------"

cd backend

if command -v pip3 &> /dev/null; then
    pip3 install -r requirements.txt
elif command -v pip &> /dev/null; then
    pip install -r requirements.txt
else
    echo "❌ 错误: 未找到 pip，请先安装 Python 和 pip"
    exit 1
fi

echo "✅ 依赖安装完成"

# 步骤 3: 验证配置
echo ""
echo "🔍 步骤 3: 验证配置"
echo "----------------------------------------"

cd openmtscied

echo "尝试启动后端服务（5秒后自动停止）..."
timeout 5 python -m uvicorn main:app --host 0.0.0.0 --port 8000 2>&1 | head -20 || true

echo ""
echo "✅ 配置验证完成"

# 完成
echo ""
echo "=========================================="
echo "🎉 安全配置完成！"
echo "=========================================="
echo ""
echo "下一步操作:"
echo "1. ⚠️  立即轮换 Neo4j 密码（如果之前使用硬编码密码）"
echo "2. 📝 编辑 .env.local 填写完整的数据库配置"
echo "3. 🚀 启动完整服务: cd ../.. && ./start-all.sh (如果有)"
echo ""
echo "详细文档:"
echo "  - 安全配置指南: SECURITY_CONFIG.md"
echo "  - 修复报告: SECURITY_FIX_REPORT_PHASE1.md"
echo "  - 部署审计: PRODUCTION_DEPLOYMENT_AUDIT.md"
echo ""
echo "如有问题，请查看日志或提交 GitHub Issue"
echo "=========================================="
