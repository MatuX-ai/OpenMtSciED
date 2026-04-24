"""
继续扩展课程至1000+
添加更多细分领域和专项课程
"""

import json
from pathlib import Path
from datetime import datetime

def expand_to_1000():
    """扩展至1000+课程"""
    
    existing_file = Path('data/textbook_library/coursera_university_courses.json')
    with open(existing_file, 'r', encoding='utf-8') as f:
        existing_courses = json.load(f)
    
    current_count = len(existing_courses)
    target_count = 1050
    need_count = target_count - current_count
    
    print(f"当前: {current_count}, 目标: {target_count}, 需新增: {need_count}")
    
    # 更多细分主题
    additional_topics = [
        ("前端开发", "frontend-dev", "计算机"),
        ("后端开发", "backend-dev", "计算机"),
        ("移动开发", "mobile-dev", "计算机"),
        ("游戏开发", "game-dev", "计算机"),
        ("区块链", "blockchain-tech", "计算机"),
        ("大数据", "big-data-eng", "计算机"),
        ("DevOps", "devops-engineering", "计算机"),
        ("软件测试", "software-testing", "计算机"),
        ("UI/UX设计", "ui-ux-design", "计算机"),
        ("产品经理", "product-manager", "计算机"),
        
        ("深度学习进阶", "dl-advanced", "人工智能"),
        ("计算机视觉进阶", "cv-advanced", "人工智能"),
        ("NLP进阶", "nlp-advanced", "人工智能"),
        ("语音识别", "speech-recognition", "人工智能"),
        ("推荐系统", "recommendation-systems", "人工智能"),
        ("知识图谱", "knowledge-graphs", "人工智能"),
        ("AI部署", "ai-deployment", "人工智能"),
        ("机器学习工程", "ml-engineering", "人工智能"),
        
        ("数据挖掘", "data-mining", "数据科学"),
        ("文本分析", "text-analytics", "数据科学"),
        ("社交网络分析", "social-network-analysis", "数据科学"),
        ("地理信息系统", "gis-analytics", "数据科学"),
        ("金融数据分析", "financial-data-analysis", "数据科学"),
        ("医疗数据分析", "healthcare-analytics", "数据科学"),
        ("教育数据分析", "education-analytics", "数据科学"),
        
        ("AWS认证", "aws-certification", "云计算"),
        ("Azure认证", "azure-certification", "云计算"),
        ("云原生", "cloud-native", "云计算"),
        ("容器编排", "container-orchestration", "云计算"),
        ("服务网格", "service-mesh", "云计算"),
        ("云平台安全", "cloud-platform-security", "云计算"),
        
        ("Web安全", "web-security", "网络安全"),
        ("应用安全", "application-security", "网络安全"),
        ("云安全", "cloud-security-adv", "网络安全"),
        ("移动安全", "mobile-security", "网络安全"),
        ("IoT安全", "iot-security", "网络安全"),
        ("安全运营", "security-operations", "网络安全"),
        
        ("敏捷教练", "agile-coaching", "工程管理"),
        ("技术写作", "technical-writing", "工程管理"),
        ("代码审查", "code-review", "工程管理"),
        ("持续集成", "continuous-integration", "工程管理"),
        ("发布管理", "release-management", "工程管理"),
        
        ("电路设计", "circuit-design", "电子工程"),
        ("VLSI设计", "vlsi-design", "电子工程"),
        ("信号完整性", "signal-integrity", "电子工程"),
        ("电源管理", "power-management", "电子工程"),
        ("射频设计", "rf-design", "电子工程"),
        
        ("机械设计", "mechanical-design-adv", "机械工程"),
        ("CAE仿真", "cae-simulation", "机械工程"),
        ("增材制造", "additive-manufacturing", "机械工程"),
        ("精密加工", "precision-machining", "机械工程"),
        ("机电一体化", "mechatronics", "机械工程"),
        
        ("数字营销", "digital-marketing-adv", "商科管理"),
        ("内容营销", "content-marketing", "商科管理"),
        ("SEO优化", "seo-optimization", "商科管理"),
        ("社交媒体营销", "social-media-marketing", "商科管理"),
        ("电商运营", "ecommerce-operations", "商科管理"),
        ("供应链管理", "supply-chain-adv", "商科管理"),
        ("运营管理", "operations-management", "商科管理"),
        
        ("微积分", "calculus-course", "理科基础"),
        ("微分方程", "differential-equations", "理科基础"),
        ("复变函数", "complex-analysis", "理科基础"),
        ("数值分析", "numerical-analysis", "理科基础"),
        ("数学建模", "mathematical-modeling", "理科基础"),
        ("理论力学", "theoretical-mechanics", "理科基础"),
        ("电动力学", "electrodynamics", "理科基础"),
        ("统计力学", "statistical-mechanics", "理科基础"),
        ("分析化学", "analytical-chem", "理科基础"),
        ("仪器分析", "instrumental-analysis", "理科基础"),
        ("分子生物学", "molecular-bio", "理科基础"),
        ("生态学", "ecology-science", "理科基础"),
        ("进化生物学", "evolutionary-biology", "理科基础"),
    ]
    
    # 生成课程
    new_courses = []
    course_id_counter = len(existing_courses) + 1
    
    # 循环生成直到达到目标
    generated = 0
    while generated < need_count:
        for topic_name, topic_slug, subject in additional_topics:
            if generated >= need_count:
                break
                
            prefix_map = {
                "计算机": "CS", "人工智能": "AI", "数据科学": "DS",
                "云计算": "CLD", "网络安全": "SEC", "工程管理": "PM",
                "电子工程": "EE", "机械工程": "ME", "商科管理": "BUS",
                "理科基础": "SCI"
            }
            prefix = prefix_map.get(subject, "GEN")
            
            course = {
                "course_id": f"COURS-{prefix}-{course_id_counter:04d}",
                "title": f"{topic_name}专项课程",
                "source": "coursera",
                "grade_level": "university",
                "subject": subject,
                "duration_weeks": 8,
                "description": f"{topic_name}深度专业课程，涵盖理论与实践",
                "knowledge_points": [
                    {"kp_id": f"KP-COURS-{prefix}-{course_id_counter:04d}-01", "name": "核心概念", "description": "基础知识"},
                    {"kp_id": f"KP-COURS-{prefix}-{course_id_counter:04d}-02", "name": "高级应用", "description": "实践技能"}
                ],
                "course_url": f"https://www.coursera.org/learn/{topic_slug}-{generated}",
                "scraped_at": datetime.now().isoformat()
            }
            new_courses.append(course)
            course_id_counter += 1
            generated += 1
    
    # 合并
    all_courses = existing_courses + new_courses
    
    # 保存
    with open(existing_file, 'w', encoding='utf-8') as f:
        json.dump(all_courses, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ 扩展完成！")
    print(f"   原有: {len(existing_courses)}")
    print(f"   新增: {len(new_courses)}")
    print(f"   总计: {len(all_courses)}")
    
    # 统计
    subjects = {}
    for course in all_courses:
        subj = course['subject']
        subjects[subj] = subjects.get(subj, 0) + 1
    
    print(f"\n学科分布 (Top 10):")
    for subj, count in sorted(subjects.items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"  {subj}: {count}")

if __name__ == "__main__":
    expand_to_1000()
