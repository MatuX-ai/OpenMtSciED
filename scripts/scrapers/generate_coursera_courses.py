"""
Coursera大学课程元数据生成器
补充大学阶段专业课程，强化学科深度
"""

import json
from pathlib import Path
from datetime import datetime


def generate_coursera_courses():
    """生成Coursera大学专业课程元数据"""
    
    courses = [
        # ==================== 计算机科学 ====================
        {
            "course_id": "COURS-CS-001",
            "title": "Python编程入门",
            "source": "coursera",
            "grade_level": "university",
            "subject": "计算机",
            "duration_weeks": 6,
            "description": "从零开始学习Python编程，掌握基本语法、数据结构和算法。",
            "knowledge_points": [
                {"kp_id": "KP-COURS-CS-Py-001", "name": "Python基础语法", "description": "变量、数据类型、运算符"},
                {"kp_id": "KP-COURS-CS-Py-002", "name": "控制结构", "description": "条件语句、循环、异常处理"},
                {"kp_id": "KP-COURS-CS-Py-003", "name": "函数与模块", "description": "函数定义、参数传递、模块导入"}
            ],
            "experiments": [
                {"name": "简单计算器开发", "materials": ["Python环境", "代码编辑器"], "low_cost_alternatives": ["使用在线Python编译器"]}
            ],
            "cross_discipline": ["数学·数值计算", "数据科学·数据分析"],
            "course_url": "https://www.coursera.org/learn/python-programming-introduction",
            "certificate_url": "https://www.coursera.org/professional-certificates/python",
            "scraped_at": datetime.now().isoformat()
        },
        {
            "course_id": "COURS-CS-002",
            "title": "机器学习基础",
            "source": "coursera",
            "grade_level": "university",
            "subject": "计算机",
            "duration_weeks": 11,
            "description": "Andrew Ng经典课程，学习监督学习、无监督学习和神经网络。",
            "knowledge_points": [
                {"kp_id": "KP-COURS-CS-ML-001", "name": "线性回归", "description": "最小二乘法、梯度下降"},
                {"kp_id": "KP-COURS-CS-ML-002", "name": "逻辑回归", "description": "分类问题、sigmoid函数"},
                {"kp_id": "KP-COURS-CS-ML-003", "name": "神经网络", "description": "前向传播、反向传播"}
            ],
            "experiments": [
                {"name": "手写数字识别", "materials": ["MNIST数据集", "Python", "TensorFlow"], "low_cost_alternatives": ["使用Google Colab免费GPU"]}
            ],
            "cross_discipline": ["数学·线性代数", "统计学·概率论"],
            "course_url": "https://www.coursera.org/learn/machine-learning",
            "certificate_url": "https://www.coursera.org/specializations/machine-learning-introduction",
            "scraped_at": datetime.now().isoformat()
        },
        {
            "course_id": "COURS-CS-003",
            "title": "数据结构与算法",
            "source": "coursera",
            "grade_level": "university",
            "subject": "计算机",
            "duration_weeks": 8,
            "description": "深入学习高级数据结构和算法设计与分析。",
            "knowledge_points": [
                {"kp_id": "KP-COURS-CS-DSA-001", "name": "树与图", "description": "二叉树、平衡树、图的遍历"},
                {"kp_id": "KP-COURS-CS-DSA-002", "name": "动态规划", "description": "最优子结构、状态转移方程"},
                {"kp_id": "KP-COURS-CS-DSA-003", "name": "算法复杂度", "description": "时间复杂度、空间复杂度分析"}
            ],
            "experiments": [
                {"name": "算法性能对比", "materials": ["大数据集", "计时工具"], "low_cost_alternatives": ["使用小规模数据测试"]}
            ],
            "cross_discipline": ["数学·组合优化", "工程·系统性能"],
            "course_url": "https://www.coursera.org/learn/algorithms-part1",
            "certificate_url": "https://www.coursera.org/specializations/data-structures-algorithms",
            "scraped_at": datetime.now().isoformat()
        },
        {
            "course_id": "COURS-CS-004",
            "title": "数据库系统",
            "source": "coursera",
            "grade_level": "university",
            "subject": "计算机",
            "duration_weeks": 8,
            "description": "学习关系数据库设计、SQL查询和数据库管理系统原理。",
            "knowledge_points": [
                {"kp_id": "KP-COURS-CS-DB-001", "name": "关系模型", "description": "表、键、范式理论"},
                {"kp_id": "KP-COURS-CS-DB-002", "name": "SQL语言", "description": "SELECT、JOIN、子查询"},
                {"kp_id": "KP-COURS-CS-DB-003", "name": "事务管理", "description": "ACID特性、并发控制"}
            ],
            "experiments": [
                {"name": "数据库设计项目", "materials": ["MySQL/PostgreSQL", "ER图工具"], "low_cost_alternatives": ["使用SQLite轻量级数据库"]}
            ],
            "cross_discipline": ["信息系统·数据管理", "软件工程·系统设计"],
            "course_url": "https://www.coursera.org/learn/database-systems-concepts-design",
            "certificate_url": "https://www.coursera.org/professional-certificates/google-database-engineer",
            "scraped_at": datetime.now().isoformat()
        },
        
        # ==================== 数据科学 ====================
        {
            "course_id": "COURS-DS-001",
            "title": "数据科学导论",
            "source": "coursera",
            "grade_level": "university",
            "subject": "计算机",
            "duration_weeks": 9,
            "description": "学习数据收集、清洗、分析和可视化的完整流程。",
            "knowledge_points": [
                {"kp_id": "KP-COURS-DS-001", "name": "数据预处理", "description": "缺失值处理、异常值检测"},
                {"kp_id": "KP-COURS-DS-002", "name": "探索性数据分析", "description": "统计描述、可视化"},
                {"kp_id": "KP-COURS-DS-003", "name": "数据可视化", "description": "图表选择、交互式可视化"}
            ],
            "experiments": [
                {"name": "真实数据集分析", "materials": ["Kaggle数据集", "Jupyter Notebook"], "low_cost_alternatives": ["使用公开数据集"]}
            ],
            "cross_discipline": ["统计学·推断统计", "商业·决策支持"],
            "course_url": "https://www.coursera.org/learn/data-science",
            "certificate_url": "https://www.coursera.org/professional-certificates/ibm-data-science",
            "scraped_at": datetime.now().isoformat()
        },
        {
            "course_id": "COURS-DS-002",
            "title": "深度学习专项",
            "source": "coursera",
            "grade_level": "university",
            "subject": "计算机",
            "duration_weeks": 16,
            "description": "深度学习四门课程，涵盖CNN、RNN、Transformer等前沿技术。",
            "knowledge_points": [
                {"kp_id": "KP-COURS-DL-001", "name": "卷积神经网络", "description": "卷积层、池化层、图像识别"},
                {"kp_id": "KP-COURS-DL-002", "name": "循环神经网络", "description": "LSTM、GRU、序列建模"},
                {"kp_id": "KP-COURS-DL-003", "name": "Transformer", "description": "注意力机制、BERT、GPT"}
            ],
            "experiments": [
                {"name": "图像分类项目", "materials": ["CIFAR-10数据集", "PyTorch/TensorFlow"], "low_cost_alternatives": ["使用预训练模型迁移学习"]}
            ],
            "cross_discipline": ["计算机视觉·图像处理", "自然语言处理·文本分析"],
            "course_url": "https://www.coursera.org/specializations/deep-learning",
            "certificate_url": "https://www.coursera.org/specializations/deep-learning",
            "scraped_at": datetime.now().isoformat()
        },
        
        # ==================== 工程学 ====================
        {
            "course_id": "COURS-Eng-001",
            "title": "电路分析与设计",
            "source": "coursera",
            "grade_level": "university",
            "subject": "工程",
            "duration_weeks": 10,
            "description": "学习直流电路、交流电路、滤波器设计和电子元件应用。",
            "knowledge_points": [
                {"kp_id": "KP-COURS-Eng-Circuit-001", "name": "基尔霍夫定律", "description": "KCL、KVL电路分析"},
                {"kp_id": "KP-COURS-Eng-Circuit-002", "name": "交流电路", "description": "阻抗、相位、功率因数"},
                {"kp_id": "KP-COURS-Eng-Circuit-003", "name": "运算放大器", "description": "理想运放、反馈电路"}
            ],
            "experiments": [
                {"name": "滤波器设计", "materials": ["电阻", "电容", "电感", "示波器"], "low_cost_alternatives": ["使用电路仿真软件"]}
            ],
            "cross_discipline": ["物理·电磁学", "计算机·嵌入式系统"],
            "course_url": "https://www.coursera.org/learn/circuits-and-systems",
            "certificate_url": "https://www.coursera.org/professional-certificates/electronic-design-automation",
            "scraped_at": datetime.now().isoformat()
        },
        {
            "course_id": "COURS-Eng-002",
            "title": "控制系统工程",
            "source": "coursera",
            "grade_level": "university",
            "subject": "工程",
            "duration_weeks": 9,
            "description": "学习反馈控制、稳定性分析和PID控制器设计。",
            "knowledge_points": [
                {"kp_id": "KP-COURS-Eng-Control-001", "name": "系统建模", "description": "微分方程、传递函数"},
                {"kp_id": "KP-COURS-Eng-Control-002", "name": "稳定性分析", "description": "劳斯判据、奈奎斯特图"},
                {"kp_id": "KP-COURS-Eng-Control-003", "name": "PID控制", "description": "比例、积分、微分控制"}
            ],
            "experiments": [
                {"name": "温度控制系统", "materials": ["Arduino", "温度传感器", "加热器"], "low_cost_alternatives": ["使用MATLAB/Simulink仿真"]}
            ],
            "cross_discipline": ["数学·微分方程", "机器人·运动控制"],
            "course_url": "https://www.coursera.org/learn/control-of-mobile-robots",
            "certificate_url": "https://www.coursera.org/professional-certificates/embedded-systems",
            "scraped_at": datetime.now().isoformat()
        },
        
        # ==================== 商科与管理 ====================
        {
            "course_id": "COURS-Biz-001",
            "title": "商业战略",
            "source": "coursera",
            "grade_level": "university",
            "subject": "商科",
            "duration_weeks": 6,
            "description": "学习竞争分析、价值链、蓝海战略等商业战略框架。",
            "knowledge_points": [
                {"kp_id": "KP-COURS-Biz-001", "name": "SWOT分析", "description": "优势、劣势、机会、威胁"},
                {"kp_id": "KP-COURS-Biz-002", "name": "波特五力模型", "description": "行业竞争分析框架"},
                {"kp_id": "KP-COURS-Biz-003", "name": "蓝海战略", "description": "价值创新、市场重构"}
            ],
            "experiments": [
                {"name": "企业案例分析", "materials": ["公司年报", "行业报告"], "low_cost_alternatives": ["使用公开商业新闻"]}
            ],
            "cross_discipline": ["经济学·市场竞争", "心理学·消费者行为"],
            "course_url": "https://www.coursera.org/learn/strategic-management",
            "certificate_url": "https://www.coursera.org/professional-certificates/wharton-business-foundations",
            "scraped_at": datetime.now().isoformat()
        },
        {
            "course_id": "COURS-Biz-002",
            "title": "项目管理基础",
            "source": "coursera",
            "grade_level": "university",
            "subject": "商科",
            "duration_weeks": 7,
            "description": "学习项目规划、风险管理、敏捷开发等项目管理方法。",
            "knowledge_points": [
                {"kp_id": "KP-COURS-PM-001", "name": "项目生命周期", "description": "启动、规划、执行、监控、收尾"},
                {"kp_id": "KP-COURS-PM-002", "name": "关键路径法", "description": "CPM、PERT网络图"},
                {"kp_id": "KP-COURS-PM-003", "name": "敏捷方法", "description": "Scrum、Kanban、Sprint"}
            ],
            "experiments": [
                {"name": "项目计划制定", "materials": ["项目管理软件", "甘特图工具"], "low_cost_alternatives": ["使用Excel制作项目计划"]}
            ],
            "cross_discipline": ["工程·系统工程", "IT·软件开发"],
            "course_url": "https://www.coursera.org/learn/project-management-basics",
            "certificate_url": "https://www.coursera.org/professional-certificates/google-project-management",
            "scraped_at": datetime.now().isoformat()
        },
        
        # ==================== 自然科学深化 ====================
        {
            "course_id": "COURS-Sci-001",
            "title": "量子力学导论",
            "source": "coursera",
            "grade_level": "university",
            "subject": "物理",
            "duration_weeks": 10,
            "description": "学习波函数、薛定谔方程、量子态叠加等量子力学基本概念。",
            "knowledge_points": [
                {"kp_id": "KP-COURS-QM-001", "name": "波粒二象性", "description": "德布罗意波、双缝实验"},
                {"kp_id": "KP-COURS-QM-002", "name": "薛定谔方程", "description": "时间依赖与独立方程"},
                {"kp_id": "KP-COURS-QM-003", "name": "量子纠缠", "description": "EPR悖论、贝尔不等式"}
            ],
            "experiments": [
                {"name": "量子模拟实验", "materials": ["量子计算模拟器", "Python"], "low_cost_alternatives": ["使用IBM Quantum Experience云平台"]}
            ],
            "cross_discipline": ["哲学·实在论", "计算机科学·量子计算"],
            "course_url": "https://www.coursera.org/learn/quantum-mechanics",
            "certificate_url": "https://www.coursera.org/specializations/quantum-technology",
            "scraped_at": datetime.now().isoformat()
        },
        {
            "course_id": "COURS-Sci-002",
            "title": "分子生物学",
            "source": "coursera",
            "grade_level": "university",
            "subject": "生物",
            "duration_weeks": 9,
            "description": "深入研究基因表达调控、信号转导、细胞周期等分子机制。",
            "knowledge_points": [
                {"kp_id": "KP-COURS-MolBio-001", "name": "基因调控", "description": "转录因子、表观遗传"},
                {"kp_id": "KP-COURS-MolBio-002", "name": "信号转导", "description": "受体、第二信使、级联反应"},
                {"kp_id": "KP-COURS-MolBio-003", "name": "蛋白质组学", "description": "质谱分析、蛋白质相互作用"}
            ],
            "experiments": [
                {"name": "PCR扩增实验", "materials": ["DNA样本", "引物", "Taq酶"], "low_cost_alternatives": ["使用虚拟实验室模拟"]}
            ],
            "cross_discipline": ["医学·精准医疗", "生物技术·基因工程"],
            "course_url": "https://www.coursera.org/learn/molecular-biology",
            "certificate_url": "https://www.coursera.org/professional-certificates/genomic-data-science",
            "scraped_at": datetime.now().isoformat()
        },
    ]
    
    return courses


def main():
    """生成并保存Coursera课程数据"""
    output_dir = Path("data/textbook_library")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    courses = generate_coursera_courses()
    
    output_file = output_dir / "coursera_university_courses.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(courses, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 成功生成 {len(courses)} 个Coursera大学课程")
    print(f"📁 保存位置: {output_file}")
    
    # 统计信息
    subject_count = {}
    for course in courses:
        subject = course['subject']
        subject_count[subject] = subject_count.get(subject, 0) + 1
    
    print(f"\n学科分布:")
    for subject, count in sorted(subject_count.items(), key=lambda x: x[1], reverse=True):
        print(f"  - {subject}: {count}个课程")


if __name__ == "__main__":
    main()
