"""
Khan Academy可汗学院课程元数据生成器
补充K-12阶段高质量STEM课程
"""

import json
from pathlib import Path
from datetime import datetime


def generate_khan_academy_courses():
    """生成可汗学院K-12 STEM课程元数据"""
    
    courses = [
        # ==================== 数学 ====================
        {
            "course_id": "KA-Math-001",
            "title": "算术基础",
            "source": "khan_academy",
            "grade_level": "elementary",
            "subject": "数学",
            "duration_weeks": 8,
            "description": "学习加减乘除、分数、小数等基本算术运算，建立数学基础。",
            "knowledge_points": [
                {"kp_id": "KP-KA-Math-Arith-001", "name": "四则运算", "description": "加减乘除的基本规则"},
                {"kp_id": "KP-KA-Math-Arith-002", "name": "分数运算", "description": "分数的加减乘除"},
                {"kp_id": "KP-KA-Math-Arith-003", "name": "小数与百分数", "description": "小数的意义和转换"}
            ],
            "experiments": [
                {"name": "购物计算练习", "materials": ["模拟货币", "商品标签"], "low_cost_alternatives": ["用纸片制作货币"]}
            ],
            "cross_discipline": ["生活技能·理财", "工程·测量计算"],
            "course_url": "https://www.khanacademy.org/math/arithmetic",
            "video_url": "https://www.khanacademy.org/math/arithmetic/arith-review",
            "scraped_at": datetime.now().isoformat()
        },
        {
            "course_id": "KA-Math-002",
            "title": "代数基础",
            "source": "khan_academy",
            "grade_level": "middle",
            "subject": "数学",
            "duration_weeks": 10,
            "description": "学习变量、方程、不等式等代数概念，为高等数学打基础。",
            "knowledge_points": [
                {"kp_id": "KP-KA-Math-Alg-001", "name": "变量与表达式", "description": "用字母表示未知数"},
                {"kp_id": "KP-KA-Math-Alg-002", "name": "一元一次方程", "description": "解方程的基本方法"},
                {"kp_id": "KP-KA-Math-Alg-003", "name": "线性函数", "description": "y=kx+b的图像与性质"}
            ],
            "experiments": [
                {"name": "方程平衡演示", "materials": ["天平", "砝码"], "low_cost_alternatives": ["用衣架自制天平"]}
            ],
            "cross_discipline": ["物理·力学平衡", "计算机·编程逻辑"],
            "course_url": "https://www.khanacademy.org/math/algebra",
            "video_url": "https://www.khanacademy.org/math/algebra-basics",
            "scraped_at": datetime.now().isoformat()
        },
        {
            "course_id": "KA-Math-003",
            "title": "几何学",
            "source": "khan_academy",
            "grade_level": "middle",
            "subject": "数学",
            "duration_weeks": 9,
            "description": "探索平面几何和立体几何，学习角度、面积、体积的计算。",
            "knowledge_points": [
                {"kp_id": "KP-KA-Math-Geom-001", "name": "三角形性质", "description": "内角和、相似、全等"},
                {"kp_id": "KP-KA-Math-Geom-002", "name": "圆的性质", "description": "圆周率、弧长、扇形面积"},
                {"kp_id": "KP-KA-Math-Geom-003", "name": "立体图形", "description": "柱体、锥体、球体的表面积和体积"}
            ],
            "experiments": [
                {"name": "几何模型制作", "materials": ["纸板", "剪刀", "胶水"], "low_cost_alternatives": ["用废旧纸盒制作"]}
            ],
            "cross_discipline": ["艺术·透视画法", "工程·建筑设计"],
            "course_url": "https://www.khanacademy.org/math/geometry",
            "video_url": "https://www.khanacademy.org/math/geometry-home",
            "scraped_at": datetime.now().isoformat()
        },
        {
            "course_id": "KA-Math-004",
            "title": "三角学与预微积分",
            "source": "khan_academy",
            "grade_level": "high",
            "subject": "数学",
            "duration_weeks": 10,
            "description": "学习三角函数、指数对数、数列等，为微积分做准备。",
            "knowledge_points": [
                {"kp_id": "KP-KA-Math-Trig-001", "name": "三角函数", "description": "sin、cos、tan的定义与性质"},
                {"kp_id": "KP-KA-Math-Trig-002", "name": "指数与对数", "description": "指数运算和对数运算"},
                {"kp_id": "KP-KA-Math-Trig-003", "name": "数列与级数", "description": "等差数列、等比数列"}
            ],
            "experiments": [
                {"name": "三角函数绘图", "materials": ["坐标纸", "计算器", "量角器"], "low_cost_alternatives": ["用手机计算器APP"]}
            ],
            "cross_discipline": ["物理·波动分析", "工程·信号处理"],
            "course_url": "https://www.khanacademy.org/math/trigonometry",
            "video_url": "https://www.khanacademy.org/math/precalculus",
            "scraped_at": datetime.now().isoformat()
        },
        
        # ==================== 科学 ====================
        {
            "course_id": "KA-Sci-001",
            "title": "生物学基础",
            "source": "khan_academy",
            "grade_level": "high",
            "subject": "生物",
            "duration_weeks": 12,
            "description": "从细胞到生态系统，全面学习生命科学的核心概念。",
            "knowledge_points": [
                {"kp_id": "KP-KA-Bio-001", "name": "细胞结构与功能", "description": "细胞膜、细胞器、细胞分裂"},
                {"kp_id": "KP-KA-Bio-002", "name": "遗传与DNA", "description": "DNA复制、转录、翻译"},
                {"kp_id": "KP-KA-Bio-003", "name": "进化与自然选择", "description": "物种起源与演化"}
            ],
            "experiments": [
                {"name": "DNA提取实验", "materials": ["草莓", "洗涤剂", "酒精"], "low_cost_alternatives": ["用香蕉代替"]}
            ],
            "cross_discipline": ["化学·生物分子", "医学·基因技术"],
            "course_url": "https://www.khanacademy.org/science/biology",
            "video_url": "https://www.khanacademy.org/science/high-school-biology",
            "scraped_at": datetime.now().isoformat()
        },
        {
            "course_id": "KA-Sci-002",
            "title": "化学基础",
            "source": "khan_academy",
            "grade_level": "high",
            "subject": "化学",
            "duration_weeks": 11,
            "description": "学习原子结构、化学键、化学反应等核心化学概念。",
            "knowledge_points": [
                {"kp_id": "KP-KA-Chem-001", "name": "原子与元素", "description": "原子结构、元素周期表"},
                {"kp_id": "KP-KA-Chem-002", "name": "化学键", "description": "离子键、共价键、金属键"},
                {"kp_id": "KP-KA-Chem-003", "name": "化学反应", "description": "反应类型、化学计量"}
            ],
            "experiments": [
                {"name": "酸碱中和滴定", "materials": ["醋酸", "小苏打", "pH试纸"], "low_cost_alternatives": ["用食醋和鸡蛋壳"]}
            ],
            "cross_discipline": ["物理·能量守恒", "环境科学·污染控制"],
            "course_url": "https://www.khanacademy.org/science/chemistry",
            "video_url": "https://www.khanacademy.org/science/high-school-chemistry",
            "scraped_at": datetime.now().isoformat()
        },
        {
            "course_id": "KA-Sci-003",
            "title": "物理学基础",
            "source": "khan_academy",
            "grade_level": "high",
            "subject": "物理",
            "duration_weeks": 12,
            "description": "从力学到电磁学，系统学习经典物理学的核心内容。",
            "knowledge_points": [
                {"kp_id": "KP-KA-Phys-001", "name": "牛顿运动定律", "description": "三大定律及其应用"},
                {"kp_id": "KP-KA-Phys-002", "name": "能量与功", "description": "动能、势能、机械能守恒"},
                {"kp_id": "KP-KA-Phys-003", "name": "电磁学基础", "description": "电场、磁场、电磁感应"}
            ],
            "experiments": [
                {"name": "自由落体实验", "materials": ["小球", "计时器", "测量尺"], "low_cost_alternatives": ["用手机慢动作拍摄"]}
            ],
            "cross_discipline": ["工程·机械设计", "天文学·行星运动"],
            "course_url": "https://www.khanacademy.org/science/physics",
            "video_url": "https://www.khanacademy.org/science/high-school-physics",
            "scraped_at": datetime.now().isoformat()
        },
        {
            "course_id": "KA-Sci-004",
            "title": "有机化学",
            "source": "khan_academy",
            "grade_level": "high",
            "subject": "化学",
            "duration_weeks": 10,
            "description": "深入学习碳化合物的结构、性质和反应，理解生命化学基础。",
            "knowledge_points": [
                {"kp_id": "KP-KA-OrgChem-001", "name": "烃类化合物", "description": "烷烃、烯烃、炔烃、芳香烃"},
                {"kp_id": "KP-KA-OrgChem-002", "name": "官能团", "description": "醇、醛、酮、酸、酯"},
                {"kp_id": "KP-KA-OrgChem-003", "name": "生物分子", "description": "蛋白质、碳水化合物、脂质、核酸"}
            ],
            "experiments": [
                {"name": "酯化反应", "materials": ["乙醇", "乙酸", "浓硫酸"], "low_cost_alternatives": ["用水果发酵产生酯类气味"]}
            ],
            "cross_discipline": ["生物学·代谢途径", "药学·药物合成"],
            "course_url": "https://www.khanacademy.org/science/organic-chemistry",
            "video_url": "https://www.khanacademy.org/test-prep/mcat/chemical-processes",
            "scraped_at": datetime.now().isoformat()
        },
        
        # ==================== 计算机科学与编程 ====================
        {
            "course_id": "KA-CS-001",
            "title": "编程入门",
            "source": "khan_academy",
            "grade_level": "middle",
            "subject": "计算机",
            "duration_weeks": 8,
            "description": "使用JavaScript学习编程基础，包括变量、循环、条件语句等。",
            "knowledge_points": [
                {"kp_id": "KP-KA-CS-001", "name": "变量与数据类型", "description": "数字、字符串、布尔值"},
                {"kp_id": "KP-KA-CS-002", "name": "控制流程", "description": "if语句、for循环、while循环"},
                {"kp_id": "KP-KA-CS-003", "name": "函数", "description": "函数定义、参数、返回值"}
            ],
            "experiments": [
                {"name": "简单动画制作", "materials": ["电脑", "浏览器"], "low_cost_alternatives": ["使用免费在线编程环境"]}
            ],
            "cross_discipline": ["数学·逻辑思维", "艺术·数字艺术"],
            "course_url": "https://www.khanacademy.org/computing/computer-programming",
            "video_url": "https://www.khanacademy.org/computing/computer-programming/programming",
            "scraped_at": datetime.now().isoformat()
        },
        {
            "course_id": "KA-CS-002",
            "title": "算法与数据结构",
            "source": "khan_academy",
            "grade_level": "high",
            "subject": "计算机",
            "duration_weeks": 10,
            "description": "学习排序、搜索算法以及数组、链表、树等数据结构。",
            "knowledge_points": [
                {"kp_id": "KP-KA-CS-Algo-001", "name": "排序算法", "description": "冒泡排序、快速排序、归并排序"},
                {"kp_id": "KP-KA-CS-Algo-002", "name": "搜索算法", "description": "线性搜索、二分搜索"},
                {"kp_id": "KP-KA-CS-Algo-003", "name": "数据结构", "description": "数组、链表、栈、队列、树"}
            ],
            "experiments": [
                {"name": "算法可视化", "materials": ["卡片", "白板"], "low_cost_alternatives": ["用纸牌演示排序过程"]}
            ],
            "cross_discipline": ["数学·复杂度分析", "工程·系统优化"],
            "course_url": "https://www.khanacademy.org/computing/computer-science/algorithms",
            "video_url": "https://www.khanacademy.org/computing/computer-science",
            "scraped_at": datetime.now().isoformat()
        },
        {
            "course_id": "KA-CS-003",
            "title": "网页开发",
            "source": "khan_academy",
            "grade_level": "high",
            "subject": "计算机",
            "duration_weeks": 9,
            "description": "学习HTML、CSS和JavaScript，构建交互式网页。",
            "knowledge_points": [
                {"kp_id": "KP-KA-CS-Web-001", "name": "HTML结构", "description": "标签、属性、文档结构"},
                {"kp_id": "KP-KA-CS-Web-002", "name": "CSS样式", "description": "选择器、盒模型、布局"},
                {"kp_id": "KP-KA-CS-Web-003", "name": "JavaScript交互", "description": "DOM操作、事件处理"}
            ],
            "experiments": [
                {"name": "个人网站制作", "materials": ["文本编辑器", "浏览器"], "low_cost_alternatives": ["使用在线代码编辑器"]}
            ],
            "cross_discipline": ["设计·用户体验", "营销·网站建设"],
            "course_url": "https://www.khanacademy.org/computing/computer-programming/html-css",
            "video_url": "https://www.khanacademy.org/computing/computer-programming/html-css-js",
            "scraped_at": datetime.now().isoformat()
        },
        
        # ==================== 经济学与社会研究 ====================
        {
            "course_id": "KA-Econ-001",
            "title": "微观经济学",
            "source": "khan_academy",
            "grade_level": "high",
            "subject": "经济",
            "duration_weeks": 8,
            "description": "学习供需关系、市场均衡、消费者行为等微观经济原理。",
            "knowledge_points": [
                {"kp_id": "KP-KA-Econ-001", "name": "供需曲线", "description": "需求定律、供给定律"},
                {"kp_id": "KP-KA-Econ-002", "name": "市场均衡", "description": "均衡价格与数量"},
                {"kp_id": "KP-KA-Econ-003", "name": "弹性", "description": "价格弹性、收入弹性"}
            ],
            "experiments": [
                {"name": "模拟市场交易", "materials": ["商品卡片", "虚拟货币"], "low_cost_alternatives": ["用纸条代替货币"]}
            ],
            "cross_discipline": ["数学·函数图像", "社会学·市场行为"],
            "course_url": "https://www.khanacademy.org/economics-finance-domain/microeconomics",
            "video_url": "https://www.khanacademy.org/economics-finance-domain/ap-microeconomics",
            "scraped_at": datetime.now().isoformat()
        },
        {
            "course_id": "KA-Econ-002",
            "title": "宏观经济学",
            "source": "khan_academy",
            "grade_level": "high",
            "subject": "经济",
            "duration_weeks": 8,
            "description": "研究GDP、通货膨胀、失业、货币政策等宏观经济问题。",
            "knowledge_points": [
                {"kp_id": "KP-KA-Econ-Macro-001", "name": "国民收入核算", "description": "GDP、GNP计算方法"},
                {"kp_id": "KP-KA-Econ-Macro-002", "name": "通货膨胀", "description": "CPI、通胀原因与影响"},
                {"kp_id": "KP-KA-Econ-Macro-003", "name": "货币政策", "description": "中央银行、利率调控"}
            ],
            "experiments": [
                {"name": "通胀率计算", "materials": ["历史物价数据", "计算器"], "low_cost_alternatives": ["调查家庭日常开支"]}
            ],
            "cross_discipline": ["政治学·经济政策", "历史·经济危机"],
            "course_url": "https://www.khanacademy.org/economics-finance-domain/macroeconomics",
            "video_url": "https://www.khanacademy.org/economics-finance-domain/ap-macroeconomics",
            "scraped_at": datetime.now().isoformat()
        },
    ]
    
    return courses


def main():
    """生成并保存可汗学院课程数据"""
    output_dir = Path("data/course_library")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    courses = generate_khan_academy_courses()
    
    output_file = output_dir / "khan_academy_courses.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(courses, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 成功生成 {len(courses)} 个可汗学院课程")
    print(f"📁 保存位置: {output_file}")
    
    # 统计信息
    subject_count = {}
    grade_count = {}
    for course in courses:
        subject = course['subject']
        grade = course['grade_level']
        subject_count[subject] = subject_count.get(subject, 0) + 1
        grade_count[grade] = grade_count.get(grade, 0) + 1
    
    print(f"\n学科分布:")
    for subject, count in sorted(subject_count.items(), key=lambda x: x[1], reverse=True):
        print(f"  - {subject}: {count}个课程")
    
    print(f"\n年级分布:")
    for grade, count in sorted(grade_count.items()):
        print(f"  - {grade}: {count}个课程")


if __name__ == "__main__":
    main()
