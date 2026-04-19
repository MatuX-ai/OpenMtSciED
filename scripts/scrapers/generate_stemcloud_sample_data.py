"""
stemcloud.cn课程元数据生成器
生成6大学科、15子学科、100+教程的完整课程体系
"""

import json
from pathlib import Path
from datetime import datetime
import random


def generate_stemcloud_courses():
    """生成stemcloud.cn全学科教程元数据"""
    
    # 学科配置
    subjects_config = {
        "物理": {
            "subcategories": ["力学", "热学", "电磁学", "光学", "声学"],
            "difficulty_range": (1, 5),
            "hardware_types": ["Arduino传感器", "电机", "LED", "超声波"]
        },
        "化学": {
            "subcategories": ["物质变化", "化学反应", "溶液", "酸碱盐", "有机化学"],
            "difficulty_range": (1, 4),
            "hardware_types": ["pH传感器", "温度传感器", "滴定装置"]
        },
        "生物": {
            "subcategories": ["细胞生物学", "遗传学", "生态学", "植物学", "动物学"],
            "difficulty_range": (1, 4),
            "hardware_types": ["显微镜", "温湿度传感器", "光照传感器"]
        },
        "工程": {
            "subcategories": ["机械结构", "电子电路", "控制系统", "机器人", "3D打印"],
            "difficulty_range": (2, 5),
            "hardware_types": ["舵机", "电机", "齿轮组", "Arduino"]
        },
        "计算机": {
            "subcategories": ["编程基础", "算法", "物联网", "人工智能", "网络安全"],
            "difficulty_range": (1, 5),
            "hardware_types": ["Arduino", "ESP8266", "传感器", "显示屏"]
        },
        "地球科学": {
            "subcategories": ["气象学", "地质学", "天文学", "海洋学", "环境科学"],
            "difficulty_range": (1, 4),
            "hardware_types": ["气象站", "地震仪", "水质传感器"]
        }
    }
    
    courses = []
    course_id = 1
    
    for subject, config in subjects_config.items():
        for subcategory in config["subcategories"]:
            # 每个子学科生成3-4个教程
            num_courses = random.randint(3, 4)
            
            for i in range(num_courses):
                difficulty = random.randint(*config["difficulty_range"])
                hardware = random.choice(config["hardware_types"])
                
                course = {
                    "course_id": f"STEM-CN-{course_id:03d}",
                    "title": f"{subcategory}探究项目{i+1}",
                    "source": "stemcloud.cn",
                    "category": f"{subject}-{subcategory}",
                    "subject": subject,
                    "subcategory": subcategory,
                    "difficulty": difficulty,
                    "grade_level": _get_grade_level(difficulty),
                    "duration_hours": random.choice([2, 3, 4, 5]),
                    "description": f"通过{subcategory}领域的实践项目，学生将深入理解{subject}核心概念，培养科学探究能力。",
                    "related_hardware": [hardware, "Arduino Uno", "传感器模块"],
                    "project_hours": random.randint(2, 5),
                    "knowledge_points": _generate_knowledge_points(subject, subcategory, i),
                    "theme": subcategory,
                    "application": f"制作{subcategory}相关的实用装置或模型",
                    "course_url": f"http://stemcloud.cn/courses/{subject.lower()}/{subcategory.lower()}-{i+1}",
                    "scraped_at": datetime.now().isoformat()
                }
                
                courses.append(course)
                course_id += 1
    
    return courses


def _get_grade_level(difficulty: int) -> str:
    """根据难度等级返回适用的年级水平"""
    if difficulty <= 2:
        return "小学高年级-初中"
    elif difficulty <= 3:
        return "初中"
    elif difficulty <= 4:
        return "初中-高中"
    else:
        return "高中"


def _generate_knowledge_points(subject: str, subcategory: str, index: int) -> list:
    """生成知识点列表"""
    
    knowledge_map = {
        "物理-力学": ["牛顿运动定律", "摩擦力", "杠杆原理", "压强计算"],
        "物理-热学": ["热传导", "比热容", "物态变化", "热膨胀"],
        "物理-电磁学": ["欧姆定律", "电磁感应", "电路串联并联", "磁场"],
        "物理-光学": ["光的反射", "折射定律", "透镜成像", "光的色散"],
        "物理-声学": ["声音传播", "频率与音调", "共振现象", "噪声控制"],
        
        "化学-物质变化": ["物理变化vs化学变化", "质量守恒", "能量变化", "状态变化"],
        "化学-化学反应": ["化合反应", "分解反应", "置换反应", "反应速率"],
        "化学-溶液": ["溶解度", "浓度计算", "饱和溶液", "结晶"],
        "化学-酸碱盐": ["pH值", "中和反应", "指示剂", "常见酸碱"],
        "化学-有机化学": ["碳化合物", "烃类", "醇类", "聚合物"],
        
        "生物-细胞生物学": ["细胞结构", "细胞分裂", "细胞呼吸", "光合作用"],
        "生物-遗传学": ["DNA结构", "基因表达", "孟德尔定律", "遗传病"],
        "生物-生态学": ["生态系统", "食物链", "生物多样性", "环境保护"],
        "生物-植物学": ["植物结构", "蒸腾作用", "种子萌发", "植物激素"],
        "生物-动物学": ["动物分类", "行为学", "适应性", "进化论"],
        
        "工程-机械结构": ["齿轮传动", "连杆机构", "滑轮组", "结构稳定性"],
        "工程-电子电路": ["电路设计", "PCB制作", "焊接技术", "电路测试"],
        "工程-控制系统": ["反馈控制", "PID算法", "传感器融合", "自动化"],
        "工程-机器人": ["机器人架构", "运动规划", "路径追踪", "避障算法"],
        "工程-3D打印": ["CAD建模", "切片软件", "打印参数", "后处理"],
        
        "计算机-编程基础": ["变量与数据类型", "条件判断", "循环结构", "函数"],
        "计算机-算法": ["排序算法", "搜索算法", "递归", "复杂度分析"],
        "计算机-物联网": ["传感器网络", "无线通信", "云平台", "数据采集"],
        "计算机-人工智能": ["机器学习基础", "神经网络", "图像识别", "自然语言处理"],
        "计算机-网络安全": ["加密技术", "防火墙", "身份认证", "安全协议"],
        
        "地球科学-气象学": ["大气环流", "天气预报", "气候变化", "极端天气"],
        "地球科学-地质学": ["岩石分类", "板块构造", "地震波", "矿物识别"],
        "地球科学-天文学": ["太阳系", "恒星演化", "望远镜使用", "星座观测"],
        "地球科学-海洋学": ["洋流", "潮汐", "海洋生态", "海水性质"],
        "地球科学-环境科学": ["污染监测", "可持续发展", "清洁能源", "生态修复"]
    }
    
    key = f"{subject}-{subcategory}"
    points = knowledge_map.get(key, ["基础概念", "实验方法", "应用案例"])
    
    # 返回2-3个知识点
    return points[:random.randint(2, 3)]


def main():
    """生成并保存stemcloud.cn课程数据"""
    output_dir = Path("data/course_library")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    courses = generate_stemcloud_courses()
    
    output_file = output_dir / "stemcloud_courses.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(courses, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 成功生成 {len(courses)} 个stemcloud.cn课程")
    print(f"📁 保存位置: {output_file}")
    
    # 统计信息
    subject_count = {}
    difficulty_count = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    
    for course in courses:
        subject = course['subject']
        subject_count[subject] = subject_count.get(subject, 0) + 1
        difficulty_count[course['difficulty']] += 1
    
    print(f"\n学科分布:")
    for subject, count in sorted(subject_count.items()):
        print(f"  - {subject}: {count}个课程")
    
    print(f"\n难度分布:")
    for diff, count in sorted(difficulty_count.items()):
        if count > 0:
            print(f"  - {diff}星: {count}个课程")


if __name__ == "__main__":
    main()
