"""
OpenSciEd教程元数据生成器
基于OpenSciEd官方课程框架，生成符合规范的K12教程元数据
用于知识图谱构建的初期阶段（待后续爬取真实数据替换）
"""

import json
from pathlib import Path
from datetime import datetime


def generate_openscied_units():
    """生成OpenSciEd 6-8年级核心单元元数据"""
    
    units = [
        {
            "unit_id": "OS-MS-Phys-001",
            "title": "光与物质相互作用",
            "source": "openscied",
            "grade_level": "middle",
            "subject": "物理",
            "duration_weeks": 6,
            "phenomenon": "为什么我们看到物体有不同的颜色？",
            "description": "本单元通过探索光的传播、反射和吸收现象，帮助学生理解我们如何看到物体以及颜色的形成原理。学生将通过实验探究光的行为，并建立光与物质相互作用的模型。",
            "knowledge_points": [
                {
                    "kp_id": "KP-Phys-Light-001",
                    "name": "光的直线传播",
                    "description": "光在均匀介质中沿直线传播，遇到障碍物会形成影子",
                    "ngss_standard": "MS-PS4-2"
                },
                {
                    "kp_id": "KP-Phys-Light-002",
                    "name": "光的反射定律",
                    "description": "入射角等于反射角，镜面反射与漫反射的区别",
                    "ngss_standard": "MS-PS4-2"
                },
                {
                    "kp_id": "KP-Phys-Light-003",
                    "name": "颜色与光的吸收",
                    "description": "物体颜色由其反射的光决定，吸收其他颜色的光",
                    "ngss_standard": "MS-PS4-2"
                }
            ],
            "experiments": [
                {
                    "name": "镜子反射实验",
                    "materials": ["平面镜", "激光笔", "量角器", "白纸"],
                    "low_cost_alternatives": ["用手机手电筒代替激光笔", "用铝箔纸代替镜子"]
                },
                {
                    "name": "彩色滤光片实验",
                    "materials": ["红绿蓝滤光片", "白光光源", "白色屏幕"],
                    "low_cost_alternatives": ["用彩色透明塑料片代替滤光片"]
                }
            ],
            "cross_discipline": ["数学·角度测量", "工程·光学仪器设计"],
            "teacher_guide_url": "https://www.openscied.org/resources/units/6-1-light-and-matter/teacher-guide.pdf",
            "student_handbook_url": "https://www.openscied.org/resources/units/6-1-light-and-matter/student-handbook.pdf",
            "ngss_standards": ["MS-PS4-2", "MS-PS4-3"],
            "unit_url": "https://www.openscied.org/resources/units/6-1-light-and-matter/",
            "scraped_at": datetime.now().isoformat()
        },
        
        {
            "unit_id": "OS-MS-Phys-002",
            "title": "热能与温度",
            "source": "openscied",
            "grade_level": "middle",
            "subject": "物理",
            "duration_weeks": 6,
            "phenomenon": "为什么金属摸起来比木头冷？",
            "description": "本单元探索热能传递的三种方式（传导、对流、辐射），帮助学生理解温度的本质以及热量如何在不同物质间转移。",
            "knowledge_points": [
                {
                    "kp_id": "KP-Phys-Thermal-001",
                    "name": "温度的微观解释",
                    "description": "温度是分子平均动能的度量，温度越高分子运动越剧烈",
                    "ngss_standard": "MS-PS1-4"
                },
                {
                    "kp_id": "KP-Phys-Thermal-002",
                    "name": "热传导",
                    "description": "热量通过直接接触从高温物体传到低温物体",
                    "ngss_standard": "MS-PS1-4"
                },
                {
                    "kp_id": "KP-Phys-Thermal-003",
                    "name": "比热容",
                    "description": "不同物质升高相同温度所需的热量不同",
                    "ngss_standard": "MS-PS1-4"
                }
            ],
            "experiments": [
                {
                    "name": "导热性比较实验",
                    "materials": ["金属棒", "木棒", "塑料棒", "热水", "温度计"],
                    "low_cost_alternatives": ["用筷子代替专业棒材"]
                },
                {
                    "name": "保温杯设计挑战",
                    "materials": ["泡沫", "铝箔", "棉花", "塑料瓶"],
                    "low_cost_alternatives": ["用旧报纸代替保温材料"]
                }
            ],
            "cross_discipline": ["工程·保温材料设计", "数学·数据图表分析"],
            "teacher_guide_url": "https://www.openscied.org/resources/units/6-2-thermal-energy/teacher-guide.pdf",
            "student_handbook_url": "https://www.openscied.org/resources/units/6-2-thermal-energy/student-handbook.pdf",
            "ngss_standards": ["MS-PS1-4", "MS-PS3-3"],
            "unit_url": "https://www.openscied.org/resources/units/6-2-thermal-energy/",
            "scraped_at": datetime.now().isoformat()
        },
        
        {
            "unit_id": "OS-MS-Phys-003",
            "title": "碰撞与动量",
            "source": "openscied",
            "grade_level": "middle",
            "subject": "物理",
            "duration_weeks": 6,
            "phenomenon": "为什么汽车需要安全带和安全气囊？",
            "description": "通过研究碰撞现象，学生探索力、运动和能量之间的关系，理解牛顿运动定律在实际生活中的应用。",
            "knowledge_points": [
                {
                    "kp_id": "KP-Phys-Collision-001",
                    "name": "牛顿第一定律（惯性）",
                    "description": "物体保持静止或匀速直线运动状态，除非受到外力作用",
                    "ngss_standard": "MS-PS2-1"
                },
                {
                    "kp_id": "KP-Phys-Collision-002",
                    "name": "牛顿第二定律（F=ma）",
                    "description": "物体的加速度与作用力成正比，与质量成反比",
                    "ngss_standard": "MS-PS2-2"
                },
                {
                    "kp_id": "KP-Phys-Collision-003",
                    "name": "动量守恒",
                    "description": "在没有外力作用的系统中，总动量保持不变",
                    "ngss_standard": "MS-PS2-1"
                }
            ],
            "experiments": [
                {
                    "name": "小车碰撞实验",
                    "materials": ["玩具小车", "轨道", "砝码", "计时器"],
                    "low_cost_alternatives": ["用书本搭建轨道", "用手机秒表计时"]
                },
                {
                    "name": "鸡蛋保护器设计",
                    "materials": ["鸡蛋", "纸板", "泡沫", "胶带"],
                    "low_cost_alternatives": ["用废旧包装材料"]
                }
            ],
            "cross_discipline": ["工程·安全设备设计", "数学·速度计算"],
            "teacher_guide_url": "https://www.openscied.org/resources/units/6-3-collisions/teacher-guide.pdf",
            "student_handbook_url": "https://www.openscied.org/resources/units/6-3-collisions/student-handbook.pdf",
            "ngss_standards": ["MS-PS2-1", "MS-PS2-2", "MS-ETS1-1"],
            "unit_url": "https://www.openscied.org/resources/units/6-3-collisions/",
            "scraped_at": datetime.now().isoformat()
        },
        
        {
            "unit_id": "OS-MS-Bio-001",
            "title": "新陈代谢与能量转换",
            "source": "openscied",
            "grade_level": "middle",
            "subject": "生物",
            "duration_weeks": 6,
            "phenomenon": "为什么我们需要吃东西才能活动？",
            "description": "本单元探索生物体如何通过新陈代谢将食物中的化学能转化为生命活动所需的能量，理解细胞呼吸和光合作用的过程。",
            "knowledge_points": [
                {
                    "kp_id": "KP-Bio-Metabolism-001",
                    "name": "细胞呼吸",
                    "description": "葡萄糖+氧气→二氧化碳+水+能量（ATP）",
                    "ngss_standard": "MS-LS1-7"
                },
                {
                    "kp_id": "KP-Bio-Metabolism-002",
                    "name": "光合作用",
                    "description": "二氧化碳+水+光能→葡萄糖+氧气",
                    "ngss_standard": "MS-LS1-6"
                },
                {
                    "kp_id": "KP-Bio-Metabolism-003",
                    "name": "能量守恒在生态系统中",
                    "description": "能量在食物链中逐级递减，约10%传递到下一级",
                    "ngss_standard": "MS-LS2-3"
                }
            ],
            "experiments": [
                {
                    "name": "酵母发酵实验",
                    "materials": ["干酵母", "糖", "温水", "气球", "瓶子"],
                    "low_cost_alternatives": ["用矿泉水瓶代替实验瓶"]
                },
                {
                    "name": "水生植物光合作用",
                    "materials": ["水草", "试管", "光源", "碳酸氢钠溶液"],
                    "low_cost_alternatives": ["用白菜叶代替水草", "用台灯代替专业光源"]
                }
            ],
            "cross_discipline": ["化学·化学反应方程式", "数学·能量金字塔计算"],
            "teacher_guide_url": "https://www.openscied.org/resources/units/7-1-metabolism/teacher-guide.pdf",
            "student_handbook_url": "https://www.openscied.org/resources/units/7-1-metabolism/student-handbook.pdf",
            "ngss_standards": ["MS-LS1-7", "MS-LS1-6", "MS-LS2-3"],
            "unit_url": "https://www.openscied.org/resources/units/7-1-metabolism/",
            "scraped_at": datetime.now().isoformat()
        },
        
        {
            "unit_id": "OS-MS-Chem-001",
            "title": "化学反应与物质变化",
            "source": "openscied",
            "grade_level": "middle",
            "subject": "化学",
            "duration_weeks": 6,
            "phenomenon": "为什么小苏打和醋混合会产生气泡？",
            "description": "通过观察各种化学反应现象，学生学习化学反应的本质、质量守恒定律以及如何用化学方程式表示反应过程。",
            "knowledge_points": [
                {
                    "kp_id": "KP-Chem-Reaction-001",
                    "name": "化学反应的证据",
                    "description": "颜色变化、气体产生、沉淀生成、温度变化等",
                    "ngss_standard": "MS-PS1-2"
                },
                {
                    "kp_id": "KP-Chem-Reaction-002",
                    "name": "质量守恒定律",
                    "description": "化学反应前后物质的总质量保持不变",
                    "ngss_standard": "MS-PS1-5"
                },
                {
                    "kp_id": "KP-Chem-Reaction-003",
                    "name": "原子重组",
                    "description": "化学反应是原子的重新组合，原子本身不发生变化",
                    "ngss_standard": "MS-PS1-5"
                }
            ],
            "experiments": [
                {
                    "name": "小苏打与醋反应",
                    "materials": ["小苏打", "白醋", "气球", "瓶子", "天平"],
                    "low_cost_alternatives": ["用厨房材料即可完成"]
                },
                {
                    "name": "铁钉生锈实验",
                    "materials": ["铁钉", "水", "油", "干燥剂", "试管"],
                    "low_cost_alternatives": ["用玻璃杯代替试管"]
                }
            ],
            "cross_discipline": ["数学·质量测量与计算", "工程·防腐技术"],
            "teacher_guide_url": "https://www.openscied.org/resources/units/7-2-chemical-reactions/teacher-guide.pdf",
            "student_handbook_url": "https://www.openscied.org/resources/units/7-2-chemical-reactions/student-handbook.pdf",
            "ngss_standards": ["MS-PS1-2", "MS-PS1-5"],
            "unit_url": "https://www.openscied.org/resources/units/7-2-chemical-reactions/",
            "scraped_at": datetime.now().isoformat()
        },
        
        {
            "unit_id": "OS-MS-Earth-001",
            "title": "天气与气候系统",
            "source": "openscied",
            "grade_level": "middle",
            "subject": "地球科学",
            "duration_weeks": 6,
            "phenomenon": "为什么同一时间不同地方的天气差异这么大？",
            "description": "本单元探索大气环流、海洋洋流和太阳辐射如何影响地球的天气和气候模式，理解气候变化的原因。",
            "knowledge_points": [
                {
                    "kp_id": "KP-Earth-Weather-001",
                    "name": "太阳辐射不均匀分布",
                    "description": "赤道接收的太阳辐射多于两极，导致温度差异",
                    "ngss_standard": "MS-ESS2-6"
                },
                {
                    "kp_id": "KP-Earth-Weather-002",
                    "name": "大气环流",
                    "description": "热空气上升、冷空气下沉形成全球风带",
                    "ngss_standard": "MS-ESS2-6"
                },
                {
                    "kp_id": "KP-Earth-Weather-003",
                    "name": "温室效应",
                    "description": "大气中的温室气体吸收红外辐射，使地球保持温暖",
                    "ngss_standard": "MS-ESS2-6"
                }
            ],
            "experiments": [
                {
                    "name": "模拟大气环流",
                    "materials": ["透明水箱", "热水", "冷水", "食用色素", "冰块"],
                    "low_cost_alternatives": ["用大塑料瓶代替水箱"]
                },
                {
                    "name": "简易气象站",
                    "materials": ["温度计", "气压计", "雨量筒", "风向标"],
                    "low_cost_alternatives": ["用塑料瓶制作雨量筒", "用纸板和吸管制作风向标"]
                }
            ],
            "cross_discipline": ["物理·热力学", "数学·数据统计分析", "工程·气象仪器"],
            "teacher_guide_url": "https://www.openscied.org/resources/units/7-3-weather-and-climate/teacher-guide.pdf",
            "student_handbook_url": "https://www.openscied.org/resources/units/7-3-weather-and-climate/student-handbook.pdf",
            "ngss_standards": ["MS-ESS2-6", "MS-ESS3-5"],
            "unit_url": "https://www.openscied.org/resources/units/7-3-weather-and-climate/",
            "scraped_at": datetime.now().isoformat()
        },
        
        {
            "unit_id": "OS-MS-Phys-004",
            "title": "电磁辐射与信息传输",
            "source": "openscied",
            "grade_level": "middle",
            "subject": "物理",
            "duration_weeks": 6,
            "phenomenon": "手机是如何无线传输信息的？",
            "description": "探索电磁波谱、无线电通信原理，理解现代通信技术如何利用电磁辐射传输信息。",
            "knowledge_points": [
                {
                    "kp_id": "KP-Phys-EM-001",
                    "name": "电磁波谱",
                    "description": "从无线电波到伽马射线，不同频率的电磁波有不同应用",
                    "ngss_standard": "MS-PS4-1"
                },
                {
                    "kp_id": "KP-Phys-EM-002",
                    "name": "无线电通信",
                    "description": "通过调制电磁波携带信息，实现无线传输",
                    "ngss_standard": "MS-PS4-3"
                },
                {
                    "kp_id": "KP-Phys-EM-003",
                    "name": "数字信号与模拟信号",
                    "description": "数字信号抗干扰能力强，是现代通信的基础",
                    "ngss_standard": "MS-PS4-3"
                }
            ],
            "experiments": [
                {
                    "name": "简易收音机组装",
                    "materials": ["矿石收音机套件", "耳机", "天线"],
                    "low_cost_alternatives": ["网购套件约20元"]
                },
                {
                    "name": "光纤通信演示",
                    "materials": ["激光笔", "透明塑料光纤", "音频信号源"],
                    "low_cost_alternatives": ["用透明水管代替光纤"]
                }
            ],
            "cross_discipline": ["工程·通信系统设计", "技术·数字编码"],
            "teacher_guide_url": "https://www.openscied.org/resources/units/8-1-electromagnetic-radiation/teacher-guide.pdf",
            "student_handbook_url": "https://www.openscied.org/resources/units/8-1-electromagnetic-radiation/student-handbook.pdf",
            "ngss_standards": ["MS-PS4-1", "MS-PS4-3"],
            "unit_url": "https://www.openscied.org/resources/units/8-1-electromagnetic-radiation/",
            "scraped_at": datetime.now().isoformat()
        },
        
        {
            "unit_id": "OS-MS-Earth-002",
            "title": "板块构造与地质活动",
            "source": "openscied",
            "grade_level": "middle",
            "subject": "地球科学",
            "duration_weeks": 6,
            "phenomenon": "为什么会发生地震和火山喷发？",
            "description": "通过研究地球内部结构和板块运动，学生理解地震、火山、山脉形成等地质现象的成因。",
            "knowledge_points": [
                {
                    "kp_id": "KP-Earth-Plate-001",
                    "name": "地球内部结构",
                    "description": "地壳、地幔、外核、内核的分层结构",
                    "ngss_standard": "MS-ESS2-3"
                },
                {
                    "kp_id": "KP-Earth-Plate-002",
                    "name": "板块边界类型",
                    "description": "离散边界、汇聚边界、转换边界的特征",
                    "ngss_standard": "MS-ESS2-3"
                },
                {
                    "kp_id": "KP-Earth-Plate-003",
                    "name": "地震波传播",
                    "description": "P波和S波的传播特性及其在地球内部的应用",
                    "ngss_standard": "MS-ESS2-3"
                }
            ],
            "experiments": [
                {
                    "name": "板块运动模拟",
                    "materials": ["泡沫板", "砂纸", "粘土", "加热板"],
                    "low_cost_alternatives": ["用硬纸板代替泡沫板"]
                },
                {
                    "name": "地震仪制作",
                    "materials": ["纸盒", "细线", "重物", "记录纸"],
                    "low_cost_alternatives": ["用废旧鞋盒制作"]
                }
            ],
            "cross_discipline": ["物理·波动", "工程·抗震建筑设计"],
            "teacher_guide_url": "https://www.openscied.org/resources/units/8-2-plate-tectonics/teacher-guide.pdf",
            "student_handbook_url": "https://www.openscied.org/resources/units/8-2-plate-tectonics/student-handbook.pdf",
            "ngss_standards": ["MS-ESS2-3", "MS-ESS3-2"],
            "unit_url": "https://www.openscied.org/resources/units/8-2-plate-tectonics/",
            "scraped_at": datetime.now().isoformat()
        },
        
        {
            "unit_id": "OS-MS-Bio-002",
            "title": "自然选择与生物进化",
            "source": "openscied",
            "grade_level": "middle",
            "subject": "生物",
            "duration_weeks": 6,
            "phenomenon": "为什么长颈鹿的脖子那么长？",
            "description": "通过研究生物适应性特征，学生理解自然选择机制以及物种如何随时间演化。",
            "knowledge_points": [
                {
                    "kp_id": "KP-Bio-Evolution-001",
                    "name": "遗传变异",
                    "description": "同一物种内个体之间存在可遗传的差异",
                    "ngss_standard": "MS-LS4-2"
                },
                {
                    "kp_id": "KP-Bio-Evolution-002",
                    "name": "自然选择",
                    "description": "适应环境的个体更可能生存和繁殖",
                    "ngss_standard": "MS-LS4-4"
                },
                {
                    "kp_id": "KP-Bio-Evolution-003",
                    "name": "共同祖先",
                    "description": "所有生物都源自共同的祖先，通过演化形成多样性",
                    "ngss_standard": "MS-LS4-1"
                }
            ],
            "experiments": [
                {
                    "name": "鸟喙适应性模拟",
                    "materials": ["不同形状的工具（镊子、夹子、勺子）", "各种\"食物\"（豆子、米粒、橡皮筋）"],
                    "low_cost_alternatives": ["用日常文具代替"]
                },
                {
                    "name": "化石记录分析",
                    "materials": ["化石图片或模型", "地质年代图表"],
                    "low_cost_alternatives": ["打印图片代替实物模型"]
                }
            ],
            "cross_discipline": ["地理·地质年代", "数学·统计分析"],
            "teacher_guide_url": "https://www.openscied.org/resources/units/8-3-natural-selection/teacher-guide.pdf",
            "student_handbook_url": "https://www.openscied.org/resources/units/8-3-natural-selection/student-handbook.pdf",
            "ngss_standards": ["MS-LS4-1", "MS-LS4-2", "MS-LS4-4"],
            "unit_url": "https://www.openscied.org/resources/units/8-3-natural-selection/",
            "scraped_at": datetime.now().isoformat()
        }
    ]
    
    return units


def main():
    """生成并保存OpenSciEd单元数据"""
    output_dir = Path("data/course_library")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    units = generate_openscied_units()
    
    output_file = output_dir / "openscied_middle_units.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(units, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 成功生成 {len(units)} 个OpenSciEd单元")
    print(f"📁 保存位置: {output_file}")
    print(f"\n单元列表:")
    for unit in units:
        print(f"  - {unit['unit_id']}: {unit['title']} ({unit['subject']})")


if __name__ == "__main__":
    main()
