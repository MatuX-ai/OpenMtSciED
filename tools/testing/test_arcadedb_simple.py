"""
ArcadeDB 适配器独立测试脚本
不依赖项目其他模块，可以独立运行
"""

import sys
import os

# 确保可以导入 arcadedb_adapter
sys.path.insert(0, os.path.dirname(__file__))

# 直接导入适配器模块，避免触发 __init__.py
import importlib.util
spec = importlib.util.spec_from_file_location(
    "arcadedb_adapter", 
    os.path.join(os.path.dirname(__file__), "src", "ai_service", "arcadedb_adapter.py")
)
arcadedb_adapter = importlib.util.module_from_spec(spec)
spec.loader.exec_module(arcadedb_adapter)

ArcadeDBAdapter = arcadedb_adapter.ArcadeDBAdapter


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
        print("  docker run --rm -p 2480:2480 -p 2424:2424 ^")
        print("    -e JAVA_OPTS=\"-Darcadedb.server.rootPassword=playwithdata\" ^")
        print("    arcadedata/arcadedb:latest")
        print("\n或者下载并运行:")
        print("  Windows: bin\\server.bat")
        print("  Linux/Mac: bin/server.sh")
        return False
    
    print("\n✅ 成功连接到 ArcadeDB!")
    
    # 测试基本查询
    print("\n🧪 执行测试查询...")
    try:
        result = adapter.client.execute_cypher("RETURN 1 AS test")
        print(f"   ✅ Cypher 查询成功")
        
        result = adapter.client.execute_sql("SELECT 1 AS test")
        print(f"   ✅ SQL 查询成功")
        
    except Exception as e:
        print(f"   ❌ 查询失败: {e}")
        return False
    
    # 获取统计信息
    print("\n📊 数据库统计:")
    stats = adapter.get_statistics()
    print(f"   总节点数: {stats.get('total_nodes', 0)}")
    print(f"   总关系数: {stats.get('total_relationships', 0)}")
    print(f"   节点类型: {list(stats.get('nodes', {}).keys())}")
    print(f"   关系类型: {list(stats.get('relationships', {}).keys())}")
    
    # 清理
    adapter.close()
    
    print("\n✅ 所有测试通过!")
    return True


def demo_usage():
    """演示使用方法"""
    
    print("\n" + "=" * 70)
    print("ArcadeDB 适配器使用示例")
    print("=" * 70)
    
    adapter = ArcadeDBAdapter(
        host="localhost",
        port=2480,
        database="OpenMTSciEd",
        username="root",
        password="playwithdata"
    )
    
    if adapter._mock_mode:
        print("\n⚠️  运行在模拟模式下（ArcadeDB 未启动）")
        print("\n以下是代码示例，实际使用时需要先启动 ArcadeDB 服务器\n")
        
        # 显示示例代码
        example_code = '''
# 1. 创建知识点节点
node_data = {
    "node_id": "python_basics",
    "title": "Python基础语法",
    "description": "Python编程语言基础概念",
    "category": "programming",
    "difficulty_level": "beginner",
    "estimated_hours": 10.0,
    "prerequisites": [],
    "learning_outcomes": ["掌握变量和数据类型"],
    "tags": ["python", "basics"]
}
adapter.create_knowledge_node(node_data)

# 2. 创建关系
adapter.create_relationship(
    from_node_id="python_basics",
    to_node_id="python_oop",
    relationship_type="PREREQUISITE",
    weight=1.0,
    description="学习OOP前需要掌握基础"
)

# 3. 批量创建
nodes = [...]  # 节点列表
adapter.batch_create_nodes(nodes)

# 4. 查找路径
path = adapter.find_shortest_path("python_basics", "python_expert")
print(f"学习路径: {' -> '.join(path)}")

# 5. 获取推荐
recommendations = adapter.get_node_recommendations("python_basics", limit=5)

# 6. 获取统计
stats = adapter.get_statistics()
print(f"节点数: {stats['total_nodes']}")
        '''
        print(example_code)
        return True
    
    # 如果连接成功，运行完整示例
    print("\n📝 创建示例数据...")
    success = arcadedb_adapter.create_sample_data(adapter)
    
    adapter.close()
    return success


if __name__ == "__main__":
    print("\n选择测试模式:")
    print("1. 快速连接测试")
    print("2. 完整功能演示")
    
    choice = input("\n请选择 (1/2，默认1): ").strip() or "1"
    
    if choice == "1":
        success = quick_test()
    elif choice == "2":
        success = demo_usage()
    else:
        print("无效选择")
        success = False
    
    sys.exit(0 if success else 1)
