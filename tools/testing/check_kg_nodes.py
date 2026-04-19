import json

# 读取知识图谱文件
with open('g:/OpenMTSciEd/data/knowledge_graph.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f'Nodes count: {len(data["nodes"])}')
print(f'Links count: {len(data["links"])}')

# 显示节点类型分布
node_types = {}
for node in data['nodes']:
    node_type = node.get('category', 'unknown')
    if node_type not in node_types:
        node_types[node_type] = 0
    node_types[node_type] += 1

print(f'Node types distribution: {node_types}')

# 显示前几个节点示例
print('\nFirst few nodes:')
for i, node in enumerate(data['nodes'][:5]):
    print(f'  {i+1}. ID: {node["id"]}, Name: {node["name"]}, Category: {node["category"]}, Subject: {node["subject"]}')