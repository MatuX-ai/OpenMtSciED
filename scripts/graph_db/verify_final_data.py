"""
验证Neo4j知识图谱最终数据
"""

import requests
import base64


def verify_neo4j_data():
    """验证Neo4j中的数据"""
    
    url = "https://4abd5ef9.databases.neo4j.io/db/4abd5ef9/query/v2"
    auth_string = "4abd5ef9:bXebDaB8hSalBxvvB5GhHmcvudO03ilZB7qItmI0Xbs"
    auth_bytes = auth_string.encode('ascii')
    auth_base64 = base64.b64encode(auth_bytes).decode('ascii')
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Basic {auth_base64}"
    }
    
    queries = {
        "CourseUnit节点数": "MATCH (cu:CourseUnit) RETURN count(cu) AS count",
        "KnowledgePoint节点数": "MATCH (kp:KnowledgePoint) RETURN count(kp) AS count",
        "TextbookChapter节点数": "MATCH (tc:TextbookChapter) RETURN count(tc) AS count",
        "CONTAINS关系数": "MATCH ()-[:CONTAINS]->() RETURN count(*) AS count",
        "PROGRESSES_TO关系数": "MATCH ()-[:PROGRESSES_TO]->() RETURN count(*) AS count",
    }
    
    print("=" * 60)
    print("Neo4j知识图谱数据统计")
    print("=" * 60)
    
    total_nodes = 0
    total_relationships = 0
    
    for name, query in queries.items():
        data = {"statement": query}
        response = requests.post(url, headers=headers, json=data, timeout=10)
        
        if response.status_code in [200, 202]:
            result = response.json()
            if result.get("data") and result["data"].get("values"):
                count = result["data"]["values"][0][0]
                print(f"{name}: {count}")
                
                if "节点" in name:
                    total_nodes += count
                elif "关系" in name:
                    total_relationships += count
        else:
            print(f"{name}: 查询失败 ({response.status_code})")
    
    print("=" * 60)
    print(f"总节点数: {total_nodes}")
    print(f"总关系数: {total_relationships}")
    print("=" * 60)
    
    # 统计学科分布
    print("\n教程单元学科分布:")
    subject_query = """
    MATCH (cu:CourseUnit)
    RETURN cu.subject AS subject, count(cu) AS count
    ORDER BY count DESC
    """
    data = {"statement": subject_query}
    response = requests.post(url, headers=headers, json=data, timeout=10)
    if response.status_code in [200, 202]:
        result = response.json()
        if result.get("data") and result["data"].get("values"):
            rows = result["data"]["values"]
            for row in rows:
                subject = row[0]
                count = row[1]
                print(f"  - {subject}: {count}个单元")
    
    # 统计年级分布
    print("\n教程单元年级分布:")
    grade_query = """
    MATCH (cu:CourseUnit)
    RETURN cu.grade_level AS grade, count(cu) AS count
    ORDER BY grade
    """
    data = {"statement": grade_query}
    response = requests.post(url, headers=headers, json=data, timeout=10)
    if response.status_code in [200, 202]:
        result = response.json()
        if result.get("data") and result["data"].get("values"):
            rows = result["data"]["values"]
            for row in rows:
                grade = row[0]
                count = row[1]
                print(f"  - {grade}: {count}个单元")
    
    # 教材章节学科分布
    print("\n教材章节学科分布:")
    chapter_subject_query = """
    MATCH (tc:TextbookChapter)
    RETURN tc.subject AS subject, count(tc) AS count
    ORDER BY count DESC
    """
    data = {"statement": chapter_subject_query}
    response = requests.post(url, headers=headers, json=data, timeout=10)
    if response.status_code in [200, 202]:
        result = response.json()
        if result.get("data") and result["data"].get("values"):
            rows = result["data"]["values"]
            for row in rows:
                subject = row[0]
                count = row[1]
                print(f"  - {subject}: {count}个章节")


if __name__ == "__main__":
    verify_neo4j_data()
