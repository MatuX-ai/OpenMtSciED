from neo4j import GraphDatabase

class Neo4jService:
    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()

    def get_related_concepts(self, concept_name):
        with self.driver.session() as session:
            result = session.run(
                "MATCH (c:Concept {name: $name})-[:RELATED_TO]->(r) RETURN r.name AS name",
                name=concept_name
            )
            return [record["name"] for record in result]

    def get_learning_path(self, start_node_id):
        with self.driver.session() as session:
            result = session.run(
                "MATCH path = (start {id: $id})-[:NEXT*..5]->(end) RETURN nodes(path) AS nodes",
                id=start_node_id
            )
            return [record["nodes"] for record in result]
