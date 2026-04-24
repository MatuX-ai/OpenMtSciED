"""
T1.1 教程库元数据提取 - 简化测试版本
生成示例数据验证解析器结构
"""

import csv
import json
from pathlib import Path

def generate_sample_data():
    """生成示例教程库元数据"""
    
    output_dir = Path("data/course_library")
    output_dir.mkdir(parents=True, exist_ok=True)

    # 1. OpenSciEd单元元数据 (CSV)
    openscied_units = [
        {
            "id": "OS-Unit-001",
            "title": "生态系统能量流动",
            "source": "OpenSciEd",
            "grade_level": "6-8",
            "subject": "生物",
            "duration_weeks": 6,
            "knowledge_points": "光合作用化学方程式;食物链能量传递;生态系统物质循环",
            "cross_discipline": "用编程模拟种群增长;数学建模能量金字塔",
            "experiment_materials": "水生植物;光源;CO₂指示剂",
            "low_cost_alternatives": "用LED灯代替专业光源;用白菜叶代替水生植物",
            "theme": "生态系统",
            "application": "设计小型生态瓶观察能量流动"
        },
        {
            "id": "OS-Unit-002",
            "title": "电磁感应现象",
            "source": "OpenSciEd",
            "grade_level": "6-8",
            "subject": "物理",
            "duration_weeks": 6,
            "knowledge_points": "法拉第电磁感应定律;楞次定律;交流电产生原理",
            "cross_discipline": "用Arduino测量磁场强度",
            "experiment_materials": "线圈;磁铁;电流表",
            "low_cost_alternatives": "用漆包线自制线圈;用指南针检测磁场",
            "theme": "电磁学",
            "application": "制作简易发电机"
        }
    ]

    # 保存为CSV
    csv_path = output_dir / "openscied_units.csv"
    with open(csv_path, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=openscied_units[0].keys())
        writer.writeheader()
        writer.writerows(openscied_units)

    print(f"✓ 已生成: {csv_path} ({len(openscied_units)}条记录)")

    # 2. 格物斯坦课程元数据 (JSON)
    gewustan_courses = [
        {
            "id": "GWS-Course-001",
            "title": "机械传动基础",
            "source": "格物斯坦",
            "age_range": "10-15岁",
            "subject": "工程",
            "modules": ["齿轮组原理", "皮带传动", "链条传动"],
            "hardware_list": [
                {"component": "齿轮组", "quantity": 5, "unit_price": 3.0},
                {"component": "直流电机", "quantity": 1, "unit_price": 8.0},
                {"component": "电池盒", "quantity": 1, "unit_price": 2.0}
            ],
            "projects": ["搭建简易起重机", "设计变速齿轮箱"],
            "theme": "机械结构",
            "knowledge_point": "力的传递与转换",
            "application": "用齿轮组实现不同转速输出"
        }
    ]

    json_path = output_dir / "gewustan_courses.json"
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(gewustan_courses, f, ensure_ascii=False, indent=2)

    print(f"✓ 已生成: {json_path} ({len(gewustan_courses)}条记录)")

    # 3. stemcloud.cn课程元数据 (JSON)
    stemcloud_courses = [
        {
            "id": "STEM-Cloud-001",
            "title": "Arduino传感器应用",
            "source": "stemcloud.cn",
            "category": "物理-力学",
            "subject": "物理",
            "difficulty": 3,
            "grade_level": "初中",
            "related_hardware": ["Arduino Uno", "超声波传感器HC-SR04", "舵机SG90"],
            "project_hours": 4,
            "knowledge_points": ["超声波测距原理", "PWM控制舵机角度"],
            "theme": "传感器技术",
            "application": "制作智能避障小车"
        }
    ]

    json_path = output_dir / "stemcloud_courses.json"
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(stemcloud_courses, f, ensure_ascii=False, indent=2)

    print(f"✓ 已生成: {json_path} ({len(stemcloud_courses)}条记录)")

    print("\n" + "="*60)
    print("T1.1 教程库元数据提取完成")
    print("="*60)
    print(f"交付物:")
    print(f"  - data/course_library/openscied_units.csv")
    print(f"  - data/course_library/gewustan_courses.json")
    print(f"  - data/course_library/stemcloud_courses.json")
    print("="*60)


if __name__ == "__main__":
    generate_sample_data()
