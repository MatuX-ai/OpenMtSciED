"""知识图谱管理 API - 简化版本"""

from fastapi import APIRouter
import os
import requests
import base64

router = APIRouter(prefix="/graph", tags=["知识图谱管理"])

# Neo4j HTTP API 配置
NEO4J_HTTP_URI = os.getenv("NEO4J_HTTP_URI", "https://4abd5ef9.databases.neo4j.io/db/4abd5ef9/query/v2")
NEO4J_USER = os.getenv("NEO4J_USER", "4abd5ef9")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "bXebDaB8hSalBxvvB5GhHmcvudO03ilZB7qItmI0Xbs")

@router.get("/overview")
async def get_graph_overview(limit: int = 100):
    """获取知识图谱概览数据（节点与关系）"""
    try:
        query = """
        MATCH (n)
        WITH n LIMIT $limit
        OPTIONAL MATCH (n)-[r]->(m)
        WHERE m IS NOT NULL
        RETURN 
            collect(DISTINCT {id: toString(id(n)), labels: labels(n), title: coalesce(n.title, n.name, 'Unknown')}) AS nodes,
            collect(DISTINCT {source: toString(id(startNode(r))), target: toString(id(endNode(r))), type: type(r)}) AS relationships
        """
        
        auth_string = f"{NEO4J_USER}:{NEO4J_PASSWORD}"
        auth_bytes = auth_string.encode('ascii')
        auth_base64 = base64.b64encode(auth_bytes).decode('ascii')
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Basic {auth_base64}"
        }

        response = requests.post(
            NEO4J_HTTP_URI, 
            headers=headers, 
            json={"statement": query, "parameters": {"limit": limit}}, 
            verify=False, 
            timeout=15
        )
        
        if response.status_code in [200, 202]:
            data = response.json()
            
            # Neo4j HTTP API v2 返回格式: {"data": {"fields": [...], "values": [...]}}
            if data.get('data'):
                neo4j_data = data['data']
                values = neo4j_data.get('values', [])
                
                if values and len(values) > 0:
                    row = values[0]
                    nodes = row[0] if len(row) > 0 else []
                    relationships = row[1] if len(row) > 1 else []
                    return {"nodes": nodes, "relationships": relationships}
        
        # 如果查询失败或没有数据，返回空结果
        return {"nodes": [], "relationships": []}
    except Exception as e:
        # 返回空结果而不是500错误
        return {"nodes": [], "relationships": [], "error": str(e)}

@router.post("/sync-questions")
async def sync_questions_to_graph():
    """将数据库中的题目知识点同步到 Neo4j，建立深度关联"""
    try:
        from shared.models.db_models import SessionLocal, Question
        db = SessionLocal()
        questions = db.query(Question).limit(100).all() # 每次同步 100 条
        
        auth_string = f"{NEO4J_USER}:{NEO4J_PASSWORD}"
        auth_bytes = auth_string.encode('ascii')
        auth_base64 = base64.b64encode(auth_bytes).decode('ascii')
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Basic {auth_base64}"
        }

        for q in questions:
            if q.knowledge_points:
                for point in q.knowledge_points:
                    # 创建知识点节点并关联题目
                    query = """
                    MERGE (p:KnowledgePoint {name: $point})
                    MERGE (q:Question {id: $qid})
                    SET q.content = $content
                    MERGE (q)-[:TESTS]->(p)
                    """
                    requests.post(
                        NEO4J_HTTP_URI, 
                        headers=headers, 
                        json={"statement": query, "parameters": {"point": point, "qid": str(q.id), "content": q.content}}, 
                        verify=False, 
                        timeout=10
                    )
        
        db.close()
        return {"success": True, "message": f"Synced {len(questions)} questions to Neo4j"}
    except Exception as e:
        return {"success": False, "error": str(e)}
