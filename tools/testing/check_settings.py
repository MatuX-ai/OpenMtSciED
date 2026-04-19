"""检查settings是否正确加载DATABASE_URL"""
import os
import sys

# 添加src到路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

print("=" * 60)
print("当前工作目录:", os.getcwd())
print("=" * 60)

# 检查.env文件是否存在
env_paths = [
    os.path.join(os.path.dirname(__file__), '.env'),
    os.path.join(os.path.dirname(__file__), 'src', '.env'),
]

for path in env_paths:
    if os.path.exists(path):
        print(f"✅ 找到.env文件: {path}")
        # 读取DATABASE_URL
        with open(path, 'r', encoding='utf-8') as f:
            for line in f:
                if line.startswith('DATABASE_URL='):
                    print(f"DATABASE_URL from file: {line.strip()}")
    else:
        print(f"❌ 未找到.env文件: {path}")

print("\n" + "=" * 60)
print("导入settings检查:")
print("=" * 60)

try:
    from config.settings import settings
    print(f"settings.DATABASE_URL = {settings.DATABASE_URL}")
    print(f"settings.DATABASE_URL包含neon: {'neon' in settings.DATABASE_URL.lower()}")
except Exception as e:
    print(f"❌ 导入settings失败: {e}")
    import traceback
    traceback.print_exc()
