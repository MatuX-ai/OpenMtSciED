"""
补充游戏设计与编程STEM课件 - 精简版
"""

import json
from pathlib import Path
from datetime import datetime

def generate_game_courses():
    """生成游戏开发STEM课件"""
    
    game_curriculum = {
        "2D游戏": {
            "elementary": ["游戏概念", "Scratch游戏", "平台跳跃", "射击游戏", "迷宫游戏", "益智游戏", "音效音乐", "动画制作", "用户界面", "测试调试", "项目发布", "项目实战"],
            "middle": ["pygame", "精灵系统", "瓦片地图", "粒子系统", "物理引擎", "人工智能", "音频管理", "存档系统", "关卡编辑", "性能优化", "多人游戏", "项目实战"],
            "high": ["高级引擎", "渲染优化", "网络多人", "程序生成", "高级AI", "动画系统", "脚本系统", "跨平台", "游戏分析", "反作弊", "商业化", "项目实战"]
        },
        "Unity开发": {
            "elementary": ["Unity初探", "GameObject", "材质颜色", "预制体", "C#基础", "物体移动", "碰撞器", "刚体物理", "UI系统", "简单游戏", "音效添加", "项目实战"],
            "middle": ["C#进阶", "协程", "动画系统", "粒子系统", "光照系统", "地形系统", "导航系统", "UI进阶", "数据存储", "射线检测", "移动端", "项目实战"],
            "high": ["高级C#", "设计模式", "Shader", "URP/HDRP", "网络框架", "程序内容", "VR开发", "AR开发", "Addressables", "CI/CD", "DOTS", "项目实战"]
        },
        "Unreal开发": {
            "elementary": ["UE5初探", "蓝图基础", "Actor类", "材质基础", "灯光系统", "静态网格", "简单交互", "粒子特效", "音效系统", "UMG界面", "关卡设计", "项目实战"],
            "middle": ["蓝图进阶", "C++基础", "动画蓝图", "AI系统", "物理系统", "Niagara", "材质进阶", "光照进阶", "世界分区", "MetaHuman", "音频系统", "项目实战"],
            "high": ["高级C++", "渲染管线", "PCG框架", "Mass Entity", "Control Rig", "Movie Render", "虚拟制片", "Nanite", "GAS", "Enhanced Input", "跨平台", "项目实战"]
        }
    }
    
    all_courses = []
    course_id = 13000
    
    for field, levels in game_curriculum.items():
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
                    "course_id": f"GAME-{field[:4].upper()}-{level[:3].upper()}-{course_id}",
                    "title": f"{topic}（{grade_range}·{field}）",
                    "source": "游戏开发教育专项课程",
                    "grade_level": level,
                    "target_grade": grade_range,
                    "subject": field,
                    "lesson_number": i + 1,
                    "duration_minutes": duration_minutes,
                    "complexity": complexity,
                    "description": f"{grade_range}{field}课程：{topic}",
                    "knowledge_points": [
                        {"kp_id": f"KP-GAME-{course_id}-01", "name": "核心概念", "description": f"{topic}的基础知识"},
                        {"kp_id": f"KP-GAME-{course_id}-02", "name": "实践技能", "description": f"{topic}的开发能力"}
                    ],
                    "experiments": [{"name": f"{topic}实践", "materials": ["计算机", "游戏引擎"], "low_cost_alternatives": ["免费引擎", "开源工具"]}],
                    "learning_objectives": [f"掌握{topic}", f"应用{topic}"],
                    "assessment_methods": ["作品评估", "代码检查", "项目演示"],
                    "game_engine": get_engine(field),
                    "programming_language": get_lang(field),
                    "career_paths": get_careers(field),
                    "stem_connections": ["计算机科学", "数学", "物理", "艺术"],
                    "course_url": f"https://game-dev-stem.edu/{level}/{field}/{course_id}",
                    "scraped_at": datetime.now().isoformat()
                }
                all_courses.append(course)
                course_id += 1
    
    print(f"✅ 生成游戏STEM课程: {len(all_courses)}个")
    
    stats = {}
    for c in all_courses:
        key = f"{c['target_grade']}-{c['subject']}"
        stats[key] = stats.get(key, 0) + 1
    
    print("\n按年级-学科分布:")
    for key, cnt in sorted(stats.items()):
        print(f"  {key}: {cnt}")
    
    output_file = Path('data/course_library/game_development_courses.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_courses, f, ensure_ascii=False, indent=2)
    
    print(f"\n📁 保存到: {output_file}")
    return len(all_courses)

def get_engine(field):
    engines = {"2D游戏": ["pygame", "Phaser"], "Unity开发": ["Unity"], "Unreal开发": ["Unreal Engine"]}
    return engines.get(field, ["多种"])

def get_lang(field):
    langs = {"2D游戏": ["Python", "JavaScript"], "Unity开发": ["C#"], "Unreal开发": ["C++", "Blueprints"]}
    return langs.get(field, ["多种"])

def get_careers(field):
    careers = {"2D游戏": ["独立开发者"], "Unity开发": ["Unity工程师"], "Unreal开发": ["UE工程师"]}
    return careers.get(field, ["游戏开发工程师"])

if __name__ == "__main__":
    generate_game_courses()
