"""测试 Neo4j Aura 连接"""
from neo4j import GraphDatabase
import ssl

uri = "bolt+s://4abd5ef9.databases.neo4j.io"
username = "4abd5ef9"
password = "bXebDaB8hSalBxvvB5GhHmcvudO03ilZB7qItmI0Xbs"

print(f"尝试连接到: {uri}")
print(f"用户名: {username}")

try:
    # 方法1: 直接使用URI，不传递额外SSL参数
    print("\n[方法1] 直接使用URI...")
    driver = GraphDatabase.driver(uri, auth=(username, password))
    with driver.session() as session:
        result = session.run("RETURN 1 AS test")
        record = result.single()
        print(f"✅ 连接成功! 结果: {record['test']}")
    driver.close()
except Exception as e:
    print(f"❌ 方法1失败: {e}")

try:
    # 方法2: 使用不验证证书的SSL上下文
    print("\n[方法2] 使用不验证证书的SSL上下文...")
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    
    driver = GraphDatabase.driver(
        uri.replace("bolt+s://", "bolt://"),  # 改为非加密URI，手动配置SSL
        auth=(username, password),
        encrypted=True,
        ssl_context=ssl_context
    )
    # 先尝试不指定数据库名（使用默认）
    with driver.session() as session:
        result = session.run("RETURN 1 AS test")
        record = result.single()
        print(f"✅ 连接成功! 结果: {record['test']}")
        
        # 查询可用数据库列表
        print("\n查询数据库列表:")
        db_result = session.run("SHOW DATABASES")
        for rec in db_result:
            print(f"  - {rec['name']} ({rec['type']})")
    driver.close()
except Exception as e:
    print(f"❌ 方法2失败: {e}")
