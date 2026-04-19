import json
from pathlib import Path

print("=== 课件库统计 ===\n")

# textbook_library
tb_dir = Path('data/textbook_library')
tb_files = {
    'openstax_chapters.json': 'OpenStax章节',
    'coursera_university_courses.json': 'Coursera课程'
}

tb_total = 0
for fname, name in tb_files.items():
    fpath = tb_dir / fname
    if fpath.exists():
        with open(fpath, encoding='utf-8') as f:
            data = json.load(f)
        print(f"{name}: {len(data)}")
        tb_total += len(data)

print(f"\ntextbook_library总计: {tb_total}")

# course_library  
cl_dir = Path('data/course_library')
cl_files = {
    'khan_academy_courses.json': '可汗学院',
    'stemcloud_courses.json': 'STEM云课程',
    'gewustan_tutorials.json': '格物斯坦教程',
    'openscied_elementary_units.json': 'OpenSciEd小学',
    'openscied_high_school_units.json': 'OpenSciEd高中',
    'openscied_middle_units.json': 'OpenSciEd初中'
}

cl_total = 0
for fname, name in cl_files.items():
    fpath = cl_dir / fname
    if fpath.exists():
        with open(fpath, encoding='utf-8') as f:
            data = json.load(f)
        print(f"{name}: {len(data)}")
        cl_total += len(data)

print(f"\ncourse_library总计: {cl_total}")
print(f"\n=== 课件总数: {tb_total + cl_total} ===")
