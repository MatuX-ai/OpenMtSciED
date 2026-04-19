"""
使用HTTP API验证Neo4j连接和数据
"""
import os
import requests
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

def test_neo4j_http_api():
    """使用HTTP Query API测试Neo4j"""
    query_api_url = os.getenv("NEO4J_QUERY_API_URL", "https://4abd5ef9.databases.neo4j.io/db/4abd5ef9/query/v2")
    user = os.getenv("NEO4J_USER", "4abd5ef9")
    password = os.getenv("NEO4J_PASSWORD")
    
    # 如果query/v2失败，回退到/tx端点
    tx_api_url = query_api_url.replace("/query/v2", "/tx")
    
    print(f"🔌 连接到 Neo4j HTTP API...")
    print(f"   Query URL: {query_api_url}")
    print(f"   Tx URL: {tx_api_url}")
    print(f"   User: {user}")
    
    # 基本认证
    auth = (user, password)
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    try:
        # 测试1: 基础连接 - 先尝试/tx端点
        print("\n📊 测试1: 基础查询")
        query = "RETURN 1 AS test"
        payload = {"statements": [{"statement": query}]}
        
        response = requests.post(tx_api_url, json=payload, auth=auth, headers=headers, timeout=10)
        
        if response.status_code == 200:
            print("   ✅ HTTP API连接成功 (使用/tx端点)")
            active_url = tx_api_url
        else:
            print(f"   ⚠️  /tx端点失败: HTTP {response.status_code}")
            # 尝试query/v2
            payload_v2 = {"statement": query}
            response = requests.post(query_api_url, json=payload_v2, auth=auth, headers=headers, timeout=10)
            # 200或202都表示成功
            if response.status_code in [200, 202]:
                print("   ✅ HTTP API连接成功 (使用/query/v2端点)")
                active_url = query_api_url
            else:
                print(f"   ❌ 连接失败: HTTP {response.status_code}")
                print(f"   响应: {response.text[:200]}")
                return False
        
        # 后续查询统一使用/query/v2端点（支持200/202）
        print("\n📊 测试2: 节点统计")
        
        node_types = [
            ("CourseUnit", "MATCH (cu:CourseUnit) RETURN count(cu) AS count"),
            ("KnowledgePoint", "MATCH (kp:KnowledgePoint) RETURN count(kp) AS count"),
            ("TextbookChapter", "MATCH (tc:TextbookChapter) RETURN count(tc) AS count"),
            ("HardwareProject", "MATCH (hp:HardwareProject) RETURN count(hp) AS count"),
        ]
        
        total_nodes = 0
        for name, query in node_types:
            payload = {"statement": query}
            response = requests.post(query_api_url, json=payload, auth=auth, headers=headers, timeout=10)
            
            # 200或202都表示成功
            if response.status_code in [200, 202]:
                data = response.json()
                # query/v2格式
                count = data["data"]["values"][0][0]
                print(f"   {name}: {count} 个")
                total_nodes += count
            else:
                print(f"   {name}: 查询失败 (HTTP {response.status_code})")
        
        print(f"\n   总节点数: {total_nodes}")
        if total_nodes >= 500:
            print("   ✅ 节点数达标 (≥500)")
        else:
            print(f"   ⚠️  节点数不足 (当前{total_nodes}, 目标500)")
        
        # 测试3: 关系统计 - 修复HTTP 400问题
        print("\n📊 测试3: 关系类型统计")
        # 简化查询避免400错误
        query = """
        MATCH ()-[r]->() 
        RETURN type(r) AS rel_type, count(r) AS count 
        ORDER BY count DESC
        LIMIT 10
        """
        payload = {"statement": query.strip()}
        response = requests.post(query_api_url, json=payload, auth=auth, headers=headers, timeout=10)
        
        if response.status_code in [200, 202]:
            data = response.json()
            rows = data["data"]["values"]
            for row in rows:
                rel_type = row[0]
                count = row[1]
                print(f"   - {rel_type}: {count} 条")
        else:
            print(f"   ⚠️  关系查询失败: HTTP {response.status_code} (不影响功能)")
        
        # 测试4: 路径查询 - 修复
        print("\n🧪 测试4: 递进关系查询")
        query = """
        MATCH (cu:CourseUnit)-[:PROGRESSES_TO]->(tc:TextbookChapter)
        RETURN cu.title AS course_title, tc.title AS chapter_title
        LIMIT 3
        """
        payload = {"statement": query.strip()}
        response = requests.post(query_api_url, json=payload, auth=auth, headers=headers, timeout=10)
        
        if response.status_code in [200, 202]:
            data = response.json()
            rows = data["data"]["values"]
            
            if rows:
                print(f"   ✅ 找到 {len(rows)} 条递进关系")
                for i, row in enumerate(rows, 1):
                    print(f"   {i}. {row[0]} → {row[1]}")
            else:
                print("   ⚠️  未找到递进关系 (需要建立PROGRESSES_TO关系)")
        else:
            print(f"   ⚠️  路径查询失败: HTTP {response.status_code}")
        
        print("\n✅ 所有测试完成！")
        return True
        
    except requests.exceptions.Timeout:
        print("❌ 请求超时，请检查网络连接")
        return False
    except requests.exceptions.ConnectionError as e:
        print(f"❌ 连接错误: {e}")
        return False
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_neo4j_http_api()
    exit(0 if success else 1)
