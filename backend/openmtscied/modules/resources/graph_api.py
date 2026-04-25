"""知识图谱管理 API"""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import os
import requests
import base64
import logging

# 配置日志
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/graph", tags=["知识图谱管理"])

@router.get("/test")
async def test_endpoint():
    """测试端点"""
    import sys
    print("TEST ENDPOINT CALLED!", file=sys.stderr)
    return {"message": "Graph API is working!"}

# Neo4j HTTP API 配置
# 注意：HTTP API 必须使用 https:// 格式，而不是 neo4j+s://
NEO4J_HTTP_URI = os.getenv("NEO4J_HTTP_URI", "https://4abd5ef9.databases.neo4j.io/db/4abd5ef9/query/v2")
NEO4J_USER = os.getenv("NEO4J_USER", "4abd5ef9")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "bXebDaB8hSalBxvvB5GhHmcvudO03ilZB7qItmI0Xbs")

def _get_neo4j_headers():
    auth_string = f"{NEO4J_USER}:{NEO4J_PASSWORD}"
    auth_bytes = auth_string.encode('ascii')
    auth_base64 = base64.b64encode(auth_bytes).decode('ascii')
    return {
        "Content-Type": "application/json",
        "Authorization": f"Basic {auth_base64}"
    }

@router.get("/overview")
async def get_graph_overview(limit: int = 100):
    """获取知识图谱概览数据（节点与关系）"""
    import sys
    print(f"\n\n=== GET_GRAPH_OVERVIEW CALLED ===", file=sys.stderr)
    print(f"Limit parameter: {limit}", file=sys.stderr)
    try:
        # 简化查询，确保能拿到数据
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

        logger.info(f"Connecting to Neo4j at: {NEO4J_HTTP_URI}")
        logger.info(f"Auth Header: Basic {auth_base64[:10]}...")

        response = requests.post(
            NEO4J_HTTP_URI, 
            headers=headers, 
            json={"statement": query, "parameters": {"limit": limit}}, 
            verify=False, 
            timeout=15
        )
        
        logger.info(f"Neo4j Response Status: {response.status_code}")
        if response.status_code != 200:
            logger.error(f"Neo4j Error Body: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            logger.info(f"Full Response Keys: {data.keys()}")
            import sys
            print(f"DEBUG: Response keys = {list(data.keys())}", file=sys.stderr)
            
            # Neo4j HTTP API v2 返回格式: {"data": {"fields": [...], "values": [...]}}
            if data.get('data'):
                neo4j_data = data['data']
                fields = neo4j_data.get('fields', [])
                values = neo4j_data.get('values', [])
                
                logger.info(f"Fields: {fields}")
                logger.info(f"Values length: {len(values)}")
                print(f"DEBUG: Fields = {fields}", file=sys.stderr)
                print(f"DEBUG: Values length = {len(values)}", file=sys.stderr)
                
                if values and len(values) > 0:
                    row = values[0]  # 第一行数据
                    nodes = row[0] if len(row) > 0 else []
                    relationships = row[1] if len(row) > 1 else []
                    logger.info(f"Nodes count: {len(nodes)}, Relationships count: {len(relationships)}")
                    print(f"DEBUG: Nodes count = {len(nodes)}, Relationships count = {len(relationships)}", file=sys.stderr)
                    return {"nodes": nodes, "relationships": relationships}
            else:
                logger.warning("No 'data' field in response")
                print(f"DEBUG: No 'data' field in response", file=sys.stderr)
        
        # 如果查询失败或没有数据，返回空结果而不是抛出异常
        return {"nodes": [], "relationships": []}
    except Exception as e:
        import traceback
        logger.error(f"Error in get_graph_overview: {str(e)}")
        traceback.print_exc()
        # 返回空结果而不是500错误，让前端能够正常显示
        return {"nodes": [], "relationships": [], "error": str(e)}
