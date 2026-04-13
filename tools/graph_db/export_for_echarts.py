"""
Export Knowledge Graph data for ECharts visualization.
Generates a static JSON file containing nodes and links.
"""

import json
import os
from neo4j import GraphDatabase

def export_graph_data(uri, user, password):
    driver = GraphDatabase.driver(uri, auth=(user, password))
    nodes = []
    links = []

    try:
        with driver.session() as session:
            # Export Nodes
            result = session.run("""
            MATCH (n)
            RETURN n.id AS id, n.title AS name, labels(n)[0] AS category, n.subject AS subject
            """)

            categories = {"CourseUnit": 0, "TextbookChapter": 1, "KnowledgePoint": 2, "HardwareProject": 3}

            for record in result:
                nodes.append({
                    "id": record["id"],
                    "name": record["name"] or record["id"],
                    "category": categories.get(record["category"], 0),
                    "subject": record["subject"] or "General"
                })

            # Export Links
            result = session.run("""
            MATCH (a)-[r]->(b)
            RETURN a.id AS source, b.id AS target, type(r) AS relation
            """)

            for record in result:
                links.append({
                    "source": record["source"],
                    "target": record["target"],
                    "relation": record["relation"]
                })

        graph_data = {
            "nodes": nodes,
            "links": links,
            "categories": [{"name": k} for k in categories.keys()]
        }

        output_path = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'knowledge_graph.json')
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(graph_data, f, indent=2, ensure_ascii=False)

        print(f"Successfully exported graph data to {output_path}")

    finally:
        driver.close()

if __name__ == "__main__":
    uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    user = os.getenv("NEO4J_USER", "neo4j")
    password = os.getenv("NEO4J_PASSWORD", "password")
    export_graph_data(uri, user, password)
