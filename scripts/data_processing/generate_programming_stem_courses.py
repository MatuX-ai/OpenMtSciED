"""
补充编程类STEM课件 - 精简版
涵盖图形化编程、Python、C++、Web前端
"""

import json
from pathlib import Path
from datetime import datetime

def generate_programming_courses():
    """生成编程STEM课件"""
    
    programming_curriculum = {
        "图形化编程": {
            "elementary": ["Scratch基础", "角色控制", "循环结构", "条件判断", "变量使用", "消息传递", "克隆技术", "画笔绘图", "游戏设计", "动画制作", "互动故事", "项目实战"],
            "middle": ["Scratch进阶", "App Inventor", "Blockly编程", "micro:bit", "Turtle绘图", "3D建模", "数据可视化", "机器学习", "机器人编程", "网页交互", "物联网", "项目实战"],
            "high": ["高级图形", "自定义引擎", "跨平台开发", "可视化分析", "VR/AR开发", "AI可视化", "科学计算", "教育科技", "开源贡献", "性能优化", "系统集成", "项目实战"]
        },
        "Python编程": {
            "elementary": ["Python初探", "print输出", "变量概念", "数据类型", "输入input", "算术运算", "条件语句", "循环结构", "列表基础", "函数定义", "turtle绘图", "项目实战"],
            "middle": ["进阶语法", "面向对象", "异常处理", "文件操作", "网络编程", "数据库", "Flask框架", "数据分析", "数据可视化", "爬虫技术", "机器学习", "项目实战"],
            "high": ["高级特性", "并发编程", "设计模式", "Django", "微服务", "大数据", "深度学习", "NLP", "计算机视觉", "DevOps", "云计算", "项目实战"]
        },
        "C/C++编程": {
            "elementary": ["C语言初探", "Hello World", "变量声明", "数据类型", "输入输出", "运算符", "条件语句", "循环结构", "数组基础", "函数入门", "指针概念", "项目实战"],
            "middle": ["C进阶", "动态内存", "链表", "栈和队列", "树结构", "图论", "排序算法", "C++入门", "面向对象", "继承多态", "模板编程", "项目实战"],
            "high": ["C++高级", "智能指针", "lambda", "并发编程", "设计模式", "STL深入", "Qt框架", "游戏引擎", "图形编程", "嵌入式", "高性能", "项目实战"]
        },
        "Web前端": {
            "elementary": ["HTML基础", "标签结构", "CSS入门", "选择器", "JavaScript", "DOM操作", "简单网页", "表单基础", "响应式", "动画效果", "Canvas", "项目实战"],
            "middle": ["HTML5", "CSS3", "ES6+", "异步编程", "模块化", "Vue.js", "React", "状态管理", "路由", "HTTP协议", "TypeScript", "项目实战"],
            "high": ["现代架构", "Next.js", "GraphQL", "WebAssembly", "PWA", "WebGL", "WebRTC", "前端安全", "CI/CD", "设计系统", "工程化", "项目实战"]
        }
    }
    
    all_courses = []
    course_id = 12000
    
    for field, levels in programming_curriculum.items():
        for level, topics in levels.items():
            for i, topic in enumerate(topics):
                if level == "elementary":
                    grade_range = "小学"
                    duration_minutes = 40
                    complexity = "入门"
                elif level == "middle":
                    grade_range = "初中"
                    duration_minutes = 45
                    complexity = "进阶"
                else:
                    grade_range = "高中"
                    duration_minutes = 50
                    complexity = "高级"
                
                course = {
                    "course_id": f"PROG-{field[:4].upper()}-{level[:3].upper()}-{course_id}",
                    "title": f"{topic}（{grade_range}·{field}）",
                    "source": "编程教育专项课程",
                    "grade_level": level,
                    "target_grade": grade_range,
                    "subject": field,
                    "lesson_number": i + 1,
                    "duration_minutes": duration_minutes,
                    "complexity": complexity,
                    "description": f"{grade_range}{field}课程：{topic}",
                    "knowledge_points": [
                        {"kp_id": f"KP-PROG-{course_id}-01", "name": "核心概念", "description": f"{topic}的基础知识"},
                        {"kp_id": f"KP-PROG-{course_id}-02", "name": "实践技能", "description": f"{topic}的实践能力"}
                    ],
                    "experiments": [
                        {"name": f"{topic}实践", "materials": ["计算机", "编程环境"], "low_cost_alternatives": ["在线IDE", "开源工具"]}
                    ],
                    "learning_objectives": [f"掌握{topic}", f"应用{topic}"],
                    "assessment_methods": ["代码评估", "功能测试", "项目演示"],
                    "programming_language": get_lang(field),
                    "tools": get_tools(field, level),
                    "career_paths": get_careers(field),
                    "stem_connections": ["计算机科学", "数学", "工程"],
                    "course_url": f"https://programming-stem.edu/{level}/{field}/{course_id}",
                    "scraped_at": datetime.now().isoformat()
                }
                all_courses.append(course)
                course_id += 1
    
    print(f"✅ 生成编程STEM课程: {len(all_courses)}个")
    
    stats = {}
    for c in all_courses:
        key = f"{c['target_grade']}-{c['subject']}"
        stats[key] = stats.get(key, 0) + 1
    
    print("\n按年级-学科分布:")
    for key, cnt in sorted(stats.items()):
        print(f"  {key}: {cnt}")
    
    output_file = Path('data/course_library/programming_stem_courses.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_courses, f, ensure_ascii=False, indent=2)
    
    print(f"\n📁 保存到: {output_file}")
    return len(all_courses)

def get_lang(field):
    langs = {"图形化编程": ["Scratch", "Blockly"], "Python编程": ["Python"], "C/C++编程": ["C/C++"], "Web前端": ["HTML/CSS/JS"]}
    return langs.get(field, ["多种"])

def get_tools(field, level):
    tools_map = {
        "图形化编程": {"elementary": ["Scratch IDE"], "middle": ["App Inventor"], "high": ["Electron"]},
        "Python编程": {"elementary": ["Thonny"], "middle": ["VS Code"], "high": ["PyCharm"]},
        "C/C++编程": {"elementary": ["Dev-C++"], "middle": ["Visual Studio"], "high": ["CLion"]},
        "Web前端": {"elementary": ["浏览器"], "middle": ["VS Code"], "high": ["Webpack"]}
    }
    return tools_map.get(field, {}).get(level, ["通用工具"])

def get_careers(field):
    careers = {"图形化编程": ["创意编程师"], "Python编程": ["后端工程师"], "C/C++编程": ["系统工程师"], "Web前端": ["前端工程师"]}
    return careers.get(field, ["软件工程师"])

if __name__ == "__main__":
    generate_programming_courses()
