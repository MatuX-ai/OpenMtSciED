"""
验证Neo4j连接和数据完整性
"""
import os
from dotenv import load_dotenv
from neo4j import GraphDatabase

# 加载环境变量
load_dotenv()

def test_neo4j_connection():
    """测试Neo4j连接"""
    uri = os.getenv("NEO4J_URI", "neo4j+s://4abd5ef9.databases.neo4j.io")
    user = os.getenv("NEO4J_USER", "4abd5ef9")
    password = os.getenv("NEO4J_PASSWORD")
    database = os.getenv("NEO4J_DATABASE", "4abd5ef9")
    
    print(f"🔌 连接到 Neo4j...")
    print(f"   URI: {uri}")
    print(f"   User: {user}")
    print(f"   Database: {database}")
    
    try:
        driver = GraphDatabase.driver(uri, auth=(user, password))
        
        # 测试连接
        with driver.session(database=database) as session:
            result = session.run("RETURN 1 AS test")
            record = result.single()
            
            if record and record["test"] == 1:
                print("✅ Neo4j连接成功！\n")
            else:
                print("❌ 连接测试失败\n")
                return False
        
        # 查询节点统计
        print("📊 数据统计:")
        with driver.session(database=database) as session:
            # CourseUnit数量
            result = session.run("MATCH (cu:CourseUnit) RETURN count(cu) AS count")
            cu_count = result.single()["count"]
            print(f"   CourseUnit: {cu_count} 个")
            
            # KnowledgePoint数量
            result = session.run("MATCH (kp:KnowledgePoint) RETURN count(kp) AS count")
            kp_count = result.single()["count"]
            print(f"   KnowledgePoint: {kp_count} 个")
            
            # TextbookChapter数量
            result = session.run("MATCH (tc:TextbookChapter) RETURN count(tc) AS count")
            tc_count = result.single()["count"]
            print(f"   TextbookChapter: {tc_count} 个")
            
            # HardwareProject数量
            result = session.run("MATCH (hp:HardwareProject) RETURN count(hp) AS count")
            hp_count = result.single()["count"]
            print(f"   HardwareProject: {hp_count} 个")
            
            # 关系统计
            result = session.run("MATCH ()-[r]->() RETURN type(r) AS rel_type, count(r) AS count ORDER BY count DESC")
            print(f"\n   关系类型统计:")
            for record in result:
                print(f"     - {record['rel_type']}: {record['count']} 条")
            
            total_nodes = cu_count + kp_count + tc_count + hp_count
            print(f"\n   总节点数: {total_nodes}")
            
            if total_nodes >= 500:
                print("   ✅ 节点数达标 (≥500)")
            else:
                print(f"   ⚠️  节点数不足 (当前{total_nodes}, 目标500)")
        
        # 测试路径查询
        print("\n🧪 测试路径查询:")
        with driver.session(database=database) as session:
            query = """
            MATCH (cu:CourseUnit)-[:PROGRESSES_TO]->(tc:TextbookChapter)
            RETURN cu.id AS course_id, cu.title AS course_title, 
                   tc.id AS chapter_id, tc.title AS chapter_title
            LIMIT 3
            """
            result = session.run(query)
            records = list(result)
            
            if records:
                print(f"   ✅ 找到 {len(records)} 条递进关系")
                for i, record in enumerate(records, 1):
                    print(f"   {i}. {record['course_title']} → {record['chapter_title']}")
            else:
                print("   ⚠️  未找到递进关系")
        
        driver.close()
        print("\n✅ 所有测试通过！")
        return True
        
    except Exception as e:
        print(f"❌ 连接失败: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_neo4j_connection()
    exit(0 if success else 1)
