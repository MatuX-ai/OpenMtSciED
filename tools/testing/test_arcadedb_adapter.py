"""
ArcadeDB 快速测试脚本
用于快速验证 ArcadeDB 连接和基本功能
"""

import sys
import os

# 添加 src 目录到路径
src_path = os.path.join(os.path.dirname(__file__), 'src')
if src_path not in sys.path:
    sys.path.insert(0, src_path)

from ai_service.arcadedb_adapter import ArcadeDBAdapter


def quick_test():
    """快速测试 ArcadeDB 连接"""
    
    print("\n" + "=" * 70)
    print("ArcadeDB 快速连接测试")
    print("=" * 70)
    
    # 创建适配器
    adapter = ArcadeDBAdapter(
        host="localhost",
        port=2480,
        database="OpenMTSciEd",
        username="root",
        password="playwithdata"
    )
    
    if adapter._mock_mode:
        print("\n❌ 无法连接到 ArcadeDB 服务器")
        print("\n请先启动 ArcadeDB:")
        print("  docker run --rm -p 2480:2480 -p 2424:2424 \\")
        print("    -e JAVA_OPTS=\"-Darcadedb.server.rootPassword=playwithdata\" \\")
        print("    arcadedata/arcadedb:latest")
        return False
    
    print("\n✅ 成功连接到 ArcadeDB!")
    
    # 测试基本查询
    print("\n🧪 执行测试查询...")
    try:
        result = adapter.client.execute_cypher("RETURN 1 AS test")
        print(f"   Cypher 查询结果: {result}")
        
        result = adapter.client.execute_sql("SELECT 1 AS test")
        print(f"   SQL 查询结果: {result}")
        
    except Exception as e:
        print(f"   ❌ 查询失败: {e}")
        return False
    
    # 获取统计信息
    print("\n📊 数据库统计:")
    stats = adapter.get_statistics()
    print(f"   总节点数: {stats.get('total_nodes', 0)}")
    print(f"   总关系数: {stats.get('total_relationships', 0)}")
    
    # 清理
    adapter.close()
    
    print("\n✅ 所有测试通过!")
    return True


if __name__ == "__main__":
    success = quick_test()
    sys.exit(0 if success else 1)
