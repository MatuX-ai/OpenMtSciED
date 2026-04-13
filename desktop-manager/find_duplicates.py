import json
from collections import Counter

with open('src-tauri/data/open_resources.json', encoding='utf-8') as f:
    data = json.load(f)

# 统计所有ID出现次数
all_ids = []
for source_name, resources in data['sources'].items():
    for r in resources:
        all_ids.append(r['id'])

id_counts = Counter(all_ids)
duplicates = {id: count for id, count in id_counts.items() if count > 1}

print(f'总资源数: {len(all_ids)}')
print(f'唯一资源数: {len(set(all_ids))}')
print(f'\n重复的资源ID ({len(duplicates)}个):')
for id, count in sorted(duplicates.items()):
    print(f'  {id}: 出现{count}次')

# 找出每个重复ID的具体位置
print('\n重复资源的详细信息:')
for source_name, resources in data['sources'].items():
    seen_ids = {}
    for i, r in enumerate(resources):
        rid = r['id']
        if rid in duplicates:
            if rid not in seen_ids:
                seen_ids[rid] = []
            seen_ids[rid].append(i)

    if seen_ids:
        print(f'\n{source_name}:')
        for rid, positions in seen_ids.items():
            print(f'  {rid} 出现在索引: {positions}')
