#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
清理 open_resources.json 中的重复资源
保留第一次出现的资源,删除后续重复的
"""

import json
from pathlib import Path

def clean_duplicates():
    json_path = Path(__file__).parent / "src-tauri" / "data" / "open_resources.json"

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f'清理前总资源数: {data["total_count"]}')

    # 清理每个source中的重复资源
    for source_name in data['sources']:
        resources = data['sources'][source_name]
        seen_ids = set()
        unique_resources = []

        for resource in resources:
            rid = resource['id']
            if rid not in seen_ids:
                seen_ids.add(rid)
                unique_resources.append(resource)
            else:
                print(f'  删除重复资源: {rid} ({resource["title"]})')

        data['sources'][source_name] = unique_resources

    # 更新总数
    total = sum(len(resources) for resources in data['sources'].values())
    data['total_count'] = total

    # 保存文件
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f'\n清理后总资源数: {total}')
    print(f'唯一资源数: {total}')
    print('\n各source资源数量:')
    for source_name, resources in data['sources'].items():
        print(f'  {source_name}: {len(resources)}个')

    print(f'\n✓ 清理完成!文件已保存')

if __name__ == '__main__':
    clean_duplicates()
