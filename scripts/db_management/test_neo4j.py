from openmtscied.services.path_generator import PathGenerator

p = PathGenerator()

# 1. 检查是否存在 OS-MS-Phys-001
query1 = 'MATCH (n:CourseUnit {id: "OS-MS-Phys-001"}) RETURN n'
print("Checking for OS-MS-Phys-001...")
r1 = p._execute_cypher(query1)
print(f"Result 1: {r1}")

# 2. 查找任意一个 CourseUnit
query2 = 'MATCH (n:CourseUnit) RETURN n LIMIT 1'
print("\nChecking any CourseUnit...")
r2 = p._execute_cypher(query2)
print(f"Result 2: {r2}")

# 3. 检查 PROGRESSES_TO 关系
query3 = 'MATCH ()-[r:PROGRESSES_TO]->() RETURN count(r)'
print("\nChecking PROGRESSES_TO relationships...")
r3 = p._execute_cypher(query3)
print(f"Result 3: {r3}")
