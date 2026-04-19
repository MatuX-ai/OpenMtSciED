import json
from pathlib import Path
from datetime import datetime

# 读取STEM云课程（已有99个，覆盖多年级）
with open('data/course_library/stemcloud_courses.json', encoding='utf-8') as f:
    stem_courses = json.load(f)

print(f"STEM云课程: {len(stem_courses)}")

# 读取OpenSciEd各学段
openscied_all = []
for fname in ['openscied_elementary_units.json', 'openscied_middle_units.json', 'openscied_high_school_units.json', 'openscied_additional_units.json']:
    fpath = Path('data/course_library') / fname
    if fpath.exists():
        with open(fpath, encoding='utf-8') as f:
            data = json.load(f)
            openscied_all.extend(data)
            print(f"{fname}: {len(data)}")
        
print(f"OpenSciEd总计: {len(openscied_all)}")

# 合并所有K-12课件
k12_courses = stem_courses + openscied_all
print(f"K-12课件总数: {len(k12_courses)}")

# 统计年龄段分布
ages = {}
for c in k12_courses:
    level = c.get('grade_level', 'unknown')
    ages[level] = ages.get(level, 0) + 1

print("\n年龄段分布:")
for level, count in sorted(ages.items()):
    print(f"  {level}: {count}")
