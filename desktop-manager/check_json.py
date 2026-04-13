import json

with open('src-tauri/data/open_resources.json', encoding='utf-8') as f:
    data = json.load(f)

print(f'JSON中的总资源数: {data.get("total_count", 0)}')

total = 0
for source_name, resources in data['sources'].items():
    count = len(resources)
    total += count
    print(f'{source_name}: {count}个')

print(f'\n实际总数: {total}')
