import json

with open('src-tauri/data/open_resources.json', encoding='utf-8') as f:
    data = json.load(f)

print('JSON中的所有资源ID:')
all_ids = []
for source_name, resources in data['sources'].items():
    for r in resources:
        all_ids.append(r['id'])
        print(f"{r['id']}: {r['title']}")

print(f'\nJSON中的总数: {len(all_ids)}')

# 数据库中已有的ID
db_ids = [
    'gw-001', 'gw-002', 'gw-003', 'gw-004', 'gw-005', 'gw-006',
    'os-bio-001', 'os-bio-002', 'os-bio-003', 'os-bio-004',
    'os-chem-001', 'os-chem-002',
    'os-phy-001', 'os-phy-002', 'os-phy-003',
    'sc-001', 'sc-002', 'sc-003', 'sc-004', 'sc-005', 'sc-006'
]

missing = [id for id in all_ids if id not in db_ids]
print(f'\n缺少的资源 ({len(missing)}个):')
for id in missing:
    print(f'  {id}')
