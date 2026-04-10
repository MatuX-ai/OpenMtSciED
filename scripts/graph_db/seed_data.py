"""
Seed data script for OpenMTSciEd
Initializes the database with sample knowledge graph nodes and relationships.
"""

from neo4j import GraphDatabase
import json
import os

def seed_neo4j(uri, user, password):
    driver = GraphDatabase.driver(uri, auth=(user, password))
    try:
        with driver.session() as session:
            # Create sample Course Units
            session.run("""
            CREATE (u1:CourseUnit {id: 'OS-Unit-001', title: 'Ecosystems', subject: 'Biology'})
            CREATE (u2:CourseUnit {id: 'GS-Unit-001', title: 'Mechanical Transmission', subject: 'Engineering'})

            CREATE (c1:TextbookChapter {id: 'OST-Bio-Ch01', title: 'Introduction to Ecology', difficulty: 3})
            CREATE (c2:TextbookChapter {id: 'OST-Phys-Ch01', title: 'Newton\'s Laws', difficulty: 2})

            CREATE (p1:HardwareProject {id: 'HW-Sensor-001', name: 'Ultrasonic Rangefinder', difficulty: 2})

            CREATE (u1)-[:PROGRESSES_TO]->(c1)
            CREATE (u2)-[:PROGRESSES_TO]->(c2)
            CREATE (u1)-[:HARDWARE_MAPS_TO]->(p1)
            """)
            print("Neo4j seed data completed.")
    finally:
        driver.close()

if __name__ == "__main__":
    uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    user = os.getenv("NEO4J_USER", "neo4j")
    password = os.getenv("NEO4J_PASSWORD", "password")
    seed_neo4j(uri, user, password)
