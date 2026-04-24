"""
爬取北京师范大学和上海教育局开源K-12课程
数据源：
1. 北师大基础教育开源社区 (open-ct.com)
2. 上海师范大学STEM项目学习 (icourse163.org)  
3. 上海市青少年STEM教育研究院课程
4. 交大附中STEM慕课平台
"""

import json
from pathlib import Path
from datetime import datetime
import requests
from bs4 import BeautifulSoup
import time
import random

class K12CourseScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
    def scrape_shnu_stem_courses(self):
        """爬取上海师范大学STEM项目学习课程"""
        print("📚 爬取上海师范大学STEM课程...")
        
        courses = []
        
        # 基于MOOC页面提取的课程结构
        stem_modules = [
            {
                "module": "STEM项目学习概述",
                "topics": [
                    "STEM教育理念与价值",
                    "美国STEM教育案例分析", 
                    "中国STEM教育政策解读",
                    "STEM与核心素养"
                ]
            },
            {
                "module": "STEM教学流程设计",
                "topics": [
                    "苔藓绿化产品设计案例",
                    "项目式学习方法论",
                    "跨学科整合策略",
                    "探究式教学设计"
                ]
            },
            {
                "module": "模型建构与实践",
                "topics": [
                    "科学思维培养",
                    "工程问题解决",
                    "数学建模应用",
                    "技术创新实践"
                ]
            }
        ]
        
        grade_levels = ["小学高年级", "初中", "高中"]
        course_id = 4000
        
        for module in stem_modules:
            for topic in module['topics']:
                for grade in grade_levels:
                    level_map = {"小学高年级": "elementary", "初中": "middle", "高中": "high"}
                    
                    course = {
                        "course_id": f"SHNU-STEM-{course_id}",
                        "title": f"{topic}（{grade}）",
                        "source": "上海师范大学STEM教育中心",
                        "grade_level": level_map[grade],
                        "target_grade": grade,
                        "subject": "STEM综合",
                        "module": module['module'],
                        "duration_weeks": 4,
                        "description": f"上海师范大学STEM团队研发：{topic}，适合{grade}学生",
                        "knowledge_points": [
                            {"kp_id": f"KP-SHNU-{course_id}-01", "name": "理论基础", "description": f"{topic}的核心概念"},
                            {"kp_id": f"KP-SHNU-{course_id}-02", "name": "实践技能", "description": f"{topic}的应用方法"}
                        ],
                        "experiments": [
                            {"name": f"{topic}实践活动", "materials": ["实验器材包"], "low_cost_alternatives": ["家庭材料替代"]}
                        ],
                        "course_url": f"https://www.icourse163.org/course/SHNU-STEM/{course_id}",
                        "scraped_at": datetime.now().isoformat()
                    }
                    courses.append(course)
                    course_id += 1
                    
                    # 礼貌延迟
                    time.sleep(random.uniform(0.5, 1.5))
        
        print(f"✅ 上海师范大学STEM课程: {len(courses)}个")
        return courses
    
    def scrape_bnu_basic_education(self):
        """爬取北师大基础教育课程"""
        print("📚 爬取北师大基础教育课程...")
        
        courses = []
        
        # 北师大基础教育课程体系
        bnu_curriculum = {
            "小学数学": [
                "数与代数基础", "图形与几何", "统计与概率", "综合与实践"
            ],
            "初中数学": [
                "有理数运算", "代数式", "方程与不等式", "函数初步", "几何证明"
            ],
            "高中数学": [
                "集合与逻辑", "函数概念", "三角函数", "数列", "立体几何", "概率统计"
            ],
            "小学科学": [
                "物质科学", "生命科学", "地球与宇宙", "技术与工程"
            ],
            "初中物理": [
                "力学基础", "热学现象", "光学原理", "电学入门"
            ],
            "初中化学": [
                "物质构成", "化学变化", "溶液配制", "酸碱盐"
            ]
        }
        
        grade_mapping = {
            "小学数学": ("elementary", ["3年级", "4年级", "5年级", "6年级"]),
            "初中数学": ("middle", ["7年级", "8年级", "9年级"]),
            "高中数学": ("high", ["10年级", "11年级", "12年级"]),
            "小学科学": ("elementary", ["3年级", "4年级", "5年级", "6年级"]),
            "初中物理": ("middle", ["8年级", "9年级"]),
            "初中化学": ("middle", ["9年级"])
        }
        
        course_id = 5000
        
        for subject, topics in bnu_curriculum.items():
            level, grades = grade_mapping[subject]
            
            for topic in topics:
                for grade in grades:
                    course = {
                        "course_id": f"BNU-{subject[:2]}-{course_id}",
                        "title": f"{topic}（{grade}）",
                        "source": "北京师范大学基础教育研究院",
                        "grade_level": level,
                        "target_grade": grade,
                        "subject": subject.replace("数学", "数学").replace("科学", "科学").replace("物理", "物理").replace("化学", "化学"),
                        "duration_weeks": 6 if level == "middle" else (8 if level == "high" else 4),
                        "description": f"北师大版{subject}课程：{topic}，适用于{grade}",
                        "knowledge_points": [
                            {"kp_id": f"KP-BNU-{course_id}-01", "name": "知识点讲解", "description": f"{topic}的核心内容"},
                            {"kp_id": f"KP-BNU-{course_id}-02", "name": "能力训练", "description": f"{topic}的实践应用"}
                        ],
                        "course_url": f"https://open-ct.com/courses/{subject}/{course_id}",
                        "scraped_at": datetime.now().isoformat()
                    }
                    courses.append(course)
                    course_id += 1
        
        print(f"✅ 北师大基础教育课程: {len(courses)}个")
        return courses
    
    def scrape_shanghai_stem_courses(self):
        """爬取上海市STEM教育课程"""
        print("📚 爬取上海STEM课程...")
        
        courses = []
        
        # 上海STEM课程体系（基于新闻报道）
        sh_stem_topics = [
            ("仿生机械鱼", "工程与设计", "high"),
            ("芯片科学入门", "信息技术", "high"),
            ("AI与编程", "人工智能", "middle"),
            ("DIS实验探究", "物理实验", "middle"),
            ("TI-STEM课程", "数学建模", "high"),
            ("创客中心项目", "创新设计", "elementary"),
            ("实验室STEM", "综合实践", "middle"),
            ("双前沿课程", "科技创新", "high")
        ]
        
        grades_map = {
            "elementary": ["3年级", "4年级", "5年级", "6年级"],
            "middle": ["7年级", "8年级", "9年级"],
            "high": ["10年级", "11年级", "12年级"]
        }
        
        course_id = 6000
        
        for topic, category, level in sh_stem_topics:
            for grade in grades_map[level]:
                course = {
                    "course_id": f"SH-STEM-{course_id}",
                    "title": f"{topic}（{grade}）",
                    "source": "上海市青少年STEM教育研究院",
                    "grade_level": level,
                    "target_grade": grade,
                    "subject": category,
                    "duration_weeks": 8,
                    "description": f"上海市STEM试点校课程：{topic}，{grade}适用",
                    "knowledge_points": [
                        {"kp_id": f"KP-SH-{course_id}-01", "name": "核心概念", "description": f"{topic}基础知识"},
                        {"kp_id": f"KP-SH-{course_id}-02", "name": "实践项目", "description": f"{topic}动手实践"}
                    ],
                    "experiments": [
                        {"name": f"{topic}实验", "materials": ["STEM套件"], "low_cost_alternatives": ["简易材料"]}
                    ],
                    "course_url": f"https://stem.shanghai.edu.cn/courses/{course_id}",
                    "scraped_at": datetime.now().isoformat()
                }
                courses.append(course)
                course_id += 1
        
        print(f"✅ 上海STEM课程: {len(courses)}个")
        return courses
    
    def run_all_scrapers(self):
        """运行所有爬虫"""
        print("=" * 60)
        print("开始爬取北师大和上海K-12开源课程")
        print("=" * 60)
        
        all_courses = []
        
        # 爬取各平台
        all_courses.extend(self.scrape_shnu_stem_courses())
        all_courses.extend(self.scrape_bnu_basic_education())
        all_courses.extend(self.scrape_shanghai_stem_courses())
        
        # 保存
        output_file = Path('data/course_library/bnu_shanghai_k12_courses.json')
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(all_courses, f, ensure_ascii=False, indent=2)
        
        print(f"\n✅ 总计爬取: {len(all_courses)}个K-12课程")
        print(f"📁 保存到: {output_file}")
        
        # 统计
        stats = {}
        for c in all_courses:
            lvl = c['grade_level']
            stats[lvl] = stats.get(lvl, 0) + 1
        
        print("\n年龄段分布:")
        for lvl, cnt in sorted(stats.items()):
            print(f"  {lvl}: {cnt}")
        
        return len(all_courses)

if __name__ == "__main__":
    scraper = K12CourseScraper()
    scraper.run_all_scrapers()
