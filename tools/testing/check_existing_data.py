import json
from pathlib import Path

files = {
    'khan_academy_courses.json': '可汗学院',
    'stemcloud_courses.json': 'STEM云课程',
    'gewustan_tutorials.json': '格物斯坦教程'
}

print("现有教育资源统计:\n")
for filename, name in files.items():
    filepath = Path('data/course_library') / filename
    if filepath.exists():
        with open(filepath, encoding='utf-8') as f:
            data = json.load(f)
        print(f"{name}: {len(data)}条")
    else:
        print(f"{name}: 文件不存在")

print("\n总计:", sum(len(json.load(open(Path('data/course_library') / f, encoding='utf-8'))) 
                   for f in files.keys() if (Path('data/course_library') / f).exists()))
