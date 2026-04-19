"""
测试哪个模块在导入时尝试连接数据库
"""
import sys
import os

# 添加 src 目录到路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

print("开始测试导入...")

try:
    print("1. 导入 config.settings...")
    from config.settings import Settings
    settings = Settings()
    print(f"   DATABASE_URL: {settings.DATABASE_URL[:50]}...")
    print("   ✅ 成功")
except Exception as e:
    print(f"   ❌ 失败: {e}")
    sys.exit(1)

try:
    print("\n2. 导入 utils.database...")
    from utils.database import engine, AsyncSessionLocal
    print("   ✅ 成功")
except Exception as e:
    print(f"   ❌ 失败: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

try:
    print("\n3. 导入 models.user...")
    from models.user import User
    print("   ✅ 成功")
except Exception as e:
    print(f"   ❌ 失败: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

try:
    print("\n4. 导入 routes.auth_routes...")
    from routes import auth_routes
    print("   ✅ 成功")
except Exception as e:
    print(f"   ❌ 失败: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

try:
    print("\n5. 导入 ai_service...")
    from ai_service import AIManager
    print("   ✅ 成功")
except Exception as e:
    print(f"   ❌ 失败: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n✅ 所有导入测试通过！")
