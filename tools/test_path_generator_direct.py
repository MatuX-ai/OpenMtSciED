import sys
from pathlib import Path

# 添加backend到路径
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from openmtscied.services.path_generator import PathGenerator
from openmtscied.models.user_profile import UserProfile, GradeLevel

# 创建测试用户
user = UserProfile(
    user_id="test_direct_001",
    age=13,
    grade_level=GradeLevel.MIDDLE
)

print("创建PathGenerator...")
generator = PathGenerator()

print("\n生成学习路径...")
try:
    nodes = generator.generate_path(user, max_nodes=3)
    print(f"✅ 成功！生成了 {len(nodes)} 个节点")
    
    if nodes:
        print(f"\n第一个节点:")
        print(f"  类型: {nodes[0].node_type}")
        print(f"  ID: {nodes[0].node_id}")
        print(f"  标题: {nodes[0].title}")
        print(f"  难度: {nodes[0].difficulty}")
        print(f"  预计学时: {nodes[0].estimated_hours}小时")
except Exception as e:
    print(f"❌ 失败: {str(e)}")
    import traceback
    traceback.print_exc()
