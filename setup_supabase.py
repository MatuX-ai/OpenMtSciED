#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Supabase 数据库配置助手
帮助快速配置 Supabase 连接到本地和 Vercel 环境
"""

import os
import sys
from pathlib import Path

def print_header(text):
    """打印标题"""
    print("\n" + "=" * 60)
    print(f"  {text}")
    print("=" * 60 + "\n")

def print_step(step_num, text):
    """打印步骤"""
    print(f"\n{'─' * 60}")
    print(f"步骤 {step_num}: {text}")
    print(f"{'─' * 60}")

def get_user_input(prompt, required=True):
    """获取用户输入"""
    while True:
        value = input(f"\n{prompt}: ").strip()
        if value or not required:
            return value
        print("❌ 此字段为必填项，请重新输入")

def validate_database_url(url):
    """验证数据库连接字符串格式"""
    if not url.startswith("postgresql://"):
        return False, "数据库URL必须以 'postgresql://' 开头"

    if "[YOUR-PASSWORD]" in url or "your-project-id" in url:
        return False, "请替换占位符为实际值"

    return True, "格式正确"

def create_backend_env(project_id, password, secret_key):
    """创建后端 .env 文件"""
    env_path = Path("backend/.env")

    content = f"""# ============================================
# Supabase 数据库配置
# ============================================

# Supabase 项目配置
SUPABASE_URL=https://{project_id}.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# 直接使用 PostgreSQL 连接字符串（推荐用于后端）
DATABASE_URL=postgresql://postgres:{password}@db.{project_id}.supabase.co:5432/postgres

# 应用配置
APP_NAME=iMato AI Service
APP_VERSION=1.0.0
DEBUG=True
HOST=0.0.0.0
PORT=8000

# JWT配置
SECRET_KEY={secret_key}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS配置
ALLOWED_ORIGINS=http://localhost:4200,http://localhost:8000

# 日志配置
LOG_LEVEL=INFO
LOG_FILE=logs/ai_service.log

# Neo4j 图数据库配置（禁用）
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password
NEO4J_DATABASE=iMato-DB
NEO4J_ENABLED=False

# 可选路由配置
ENABLE_AR_VR_ROUTES=False
ENABLE_AR_VR_MOCK_ROUTES=False
ENABLE_DIGITAL_TWIN_ROUTES=False
ENABLE_FEDERATED_ROUTES=False
ENABLE_MODEL_UPDATE_ROUTES=False
ENABLE_XR_GESTURE_ROUTES=False
"""

    with open(env_path, 'w', encoding='utf-8') as f:
        f.write(content)

    return env_path

def main():
    """主函数"""
    print_header("🚀 Supabase 数据库配置助手")

    print("本工具将帮助你配置 Supabase 数据库连接到：")
    print("  ✓ 本地开发环境 (backend/.env)")
    print("  ✓ Vercel 部署环境 (提供配置说明)")
    print("\n在开始之前，请确保：")
    print("  1. 已在 Supabase 上创建项目")
    print("  2. 已执行数据库迁移脚本（创建表结构）")
    print("  3. 已获取数据库连接信息")

    input("\n按 Enter 键继续...")

    # 步骤 1: 获取 Supabase 项目信息
    print_step(1, "输入 Supabase 项目信息")

    project_id = get_user_input("Supabase Project ID (例如: abcdefghijklmnop)")
    db_password = get_user_input("数据库密码 (你在创建项目时设置的)")

    # 构建并验证数据库URL
    db_url = f"postgresql://postgres:{db_password}@db.{project_id}.supabase.co:5432/postgres"
    is_valid, message = validate_database_url(db_url)

    if not is_valid:
        print(f"\n❌ 验证失败: {message}")
        print("请检查输入是否正确")
        return

    print(f"\n✓ 数据库URL格式验证通过")

    # 步骤 2: 生成密钥
    print_step(2, "生成安全密钥")

    import secrets
    secret_key = secrets.token_urlsafe(32)

    print(f"\n生成的 SECRET_KEY:")
    print(f"  {secret_key}")
    print("\n⚠️  请妥善保存此密钥！它将被写入配置文件。")

    # 步骤 3: 创建后端配置文件
    print_step(3, "创建后端配置文件")

    env_path = create_backend_env(project_id, db_password, secret_key)
    print(f"\n✓ 已创建配置文件: {env_path}")
    print(f"  位置: {Path.cwd() / env_path}")

    # 步骤 4: Vercel 配置说明
    print_step(4, "配置 Vercel 环境变量")

    vercel_config = f"""
请在 Vercel Dashboard 中添加以下环境变量：

┌─────────────────────┬──────────────────────────────────────────────────────────┐
│ 变量名              │ 值                                                        │
├─────────────────────┼──────────────────────────────────────────────────────────┤
│ DATABASE_URL        │ postgresql://postgres:{db_password[:3]}***@db.{project_id}.supabase.co:5432/postgres │
│ SECRET_KEY          │ {secret_key}                                              │
│ ALLOWED_ORIGINS     │ https://your-app.vercel.app                               │
│ DEBUG               │ False                                                     │
│ NEO4J_ENABLED       │ False                                                     │
└─────────────────────┴──────────────────────────────────────────────────────────┘

操作步骤：
  1. 访问 https://vercel.com/dashboard
  2. 选择你的项目
  3. 进入 Settings → Environment Variables
  4. 添加上述变量（Production, Preview, Development 三个环境）
  5. 点击 Save 保存
"""

    print(vercel_config)

    # 步骤 5: 验证配置
    print_step(5, "验证配置")

    print("\n接下来请执行以下步骤验证配置：\n")
    print("1️⃣  启动后端服务:")
    print("   cd backend")
    print("   python main.py\n")

    print("2️⃣  测试数据库连接:")
    print("   访问 http://localhost:8000/docs")
    print("   或运行健康检查脚本\n")

    print("3️⃣  查看完整配置指南:")
    print("   打开 docs/SUPABASE_SETUP_GUIDE.md\n")

    # 完成
    print_header("✅ 配置完成！")

    print("📋 摘要:")
    print(f"  • Supabase Project ID: {project_id}")
    print(f"  • 后端配置文件: {env_path}")
    print(f"  • 配置指南: docs/SUPABASE_SETUP_GUIDE.md")
    print("\n⚠️  重要提醒:")
    print("  • 不要将 .env 文件提交到版本控制系统")
    print("  • 妥善保管数据库密码和 SECRET_KEY")
    print("  • 定期更新密钥以提高安全性")
    print("\n🎉 现在可以开始开发了！\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  用户中断操作")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ 发生错误: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
