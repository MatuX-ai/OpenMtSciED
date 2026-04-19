"""
合并OpenSciEd初中和高中单元数据
"""

import json
from pathlib import Path


def merge_openscied_data():
    """合并小学、初中、高中和补充单元数据"""
    
    all_units = []
    
    # 读取小学数据
    elem_file = Path("data/course_library/openscied_elementary_units.json")
    if elem_file.exists():
        with open(elem_file, 'r', encoding='utf-8') as f:
            elem_units = json.load(f)
        print(f"小学单元数: {len(elem_units)}")
        all_units.extend(elem_units)
    
    # 读取初中数据
    middle_file = Path("data/course_library/openscied_middle_units.json")
    if middle_file.exists():
        with open(middle_file, 'r', encoding='utf-8') as f:
            middle_units = json.load(f)
        print(f"初中单元数: {len(middle_units)}")
        all_units.extend(middle_units)
    
    # 读取高中数据
    high_file = Path("data/course_library/openscied_high_school_units.json")
    if high_file.exists():
        with open(high_file, 'r', encoding='utf-8') as f:
            high_units = json.load(f)
        print(f"高中单元数: {len(high_units)}")
        all_units.extend(high_units)
    
    # 读取补充数据
    additional_file = Path("data/course_library/openscied_additional_units.json")
    if additional_file.exists():
        with open(additional_file, 'r', encoding='utf-8') as f:
            additional_units = json.load(f)
        print(f"补充单元数: {len(additional_units)}")
        all_units.extend(additional_units)
    
    # 保存合并后的数据
    output_file = Path("data/course_library/openscied_all_units.json")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_units, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ 合并完成！总计 {len(all_units)} 个单元")
    print(f"📁 保存位置: {output_file}")
    
    # 统计信息
    subject_count = {}
    grade_count = {}
    for unit in all_units:
        subject = unit['subject']
        grade = unit['grade_level']
        subject_count[subject] = subject_count.get(subject, 0) + 1
        grade_count[grade] = grade_count.get(grade, 0) + 1
    
    print(f"\n学科分布:")
    for subject, count in sorted(subject_count.items(), key=lambda x: x[1], reverse=True):
        print(f"  - {subject}: {count}个单元")
    
    print(f"\n年级分布:")
    for grade, count in sorted(grade_count.items()):
        print(f"  - {grade}: {count}个单元")


if __name__ == "__main__":
    merge_openscied_data()
