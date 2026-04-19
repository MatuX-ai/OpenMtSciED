"""
初始化 NeonDB 表结构
"""
import sys
import os

# 将 backend 目录加入系统路径
backend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

try:
    from openmtscied.database import engine, Base
    from openmtscied.models.user import User
except ImportError as e:
    print(f"❌ 导入失败: {e}")
    print("请确保已安装 sqlalchemy, psycopg2-binary 等依赖。")
    sys.exit(1)

def init_db():
    print("🔄 正在连接 NeonDB 并创建表结构...")
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ 成功！'users' 表已在 NeonDB 中创建。")
    except Exception as e:
        print(f"❌ 失败: {e}")
        print("请检查 .env.local 中的 DATABASE_URL 是否正确，以及网络是否通畅。")

if __name__ == "__main__":
    init_db()
