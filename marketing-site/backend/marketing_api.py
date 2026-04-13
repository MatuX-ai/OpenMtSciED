"""
Marketing Website API for OpenMTSciEd
Provides search and download endpoints.
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import json
import os

router = APIRouter(prefix="/api/marketing", tags=["marketing"])

# Load static graph data
DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'knowledge_graph.json')

def load_graph_data():
    if not os.path.exists(DATA_PATH):
        return {"nodes": [], "links": []}
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

@router.get("/search")
async def search_resources(keyword: str = "", category: str = ""):
    """Search nodes in the knowledge graph"""
    data = load_graph_data()
    results = []

    keyword_lower = keyword.lower()
    for node in data["nodes"]:
        match_keyword = keyword_lower in node["name"].lower() or keyword_lower in node.get("subject", "").lower()
        match_category = category == "" or node["category"] == int(category)

        if match_keyword and match_category:
            results.append(node)

    return {"results": results}

@router.get("/graph-data")
async def get_graph_data():
    """Return full graph data for ECharts visualization"""
    return load_graph_data()

@router.get("/download/{resource_id}")
async def download_resource(resource_id: str):
    """Mock download endpoint"""
    # In a real scenario, this would locate the file on disk or S3
    return {
        "message": f"Download initiated for {resource_id}",
        "url": f"/static/downloads/{resource_id}.pdf"
    }
