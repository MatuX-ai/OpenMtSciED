"""
Neo4j连接测试脚本
用于诊断连接问题
"""

import ssl
from neo4j import GraphDatabase

uri = "neo4j+s://4abd5ef9.databases.neo4j.io"
username = "4abd5ef9"
password = "bXebDaB8hSalBxvvB5GhHmcvudO03ilZB7qItmI0Xbs"

print("测试1: 标准连接（推荐方式）")
try:
    driver = GraphDatabase.driver(uri, auth=(username, password))
    with driver.session(database="neo4j") as session:
        result = session.run("RETURN 1 AS test")
        record = result.single()
        print(f"✅ 连接成功！测试结果: {record['test']}")
    driver.close()
except Exception as e:
    print(f"❌ 连接失败: {type(e).__name__}: {e}")

print("\n测试2: 检查Python SSL证书路径")
import certifi
print(f"certifi证书路径: {certifi.where()}")

print("\n测试3: 检查SSL默认上下文")
ctx = ssl.create_default_context()
print(f"SSL验证模式: {ctx.verify_mode}")
print(f"检查主机名: {ctx.check_hostname}")
