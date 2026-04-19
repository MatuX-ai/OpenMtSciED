"""
OpenStax课件元数据生成器
基于OpenStax官方教材，生成大学/高中阶段的课件元数据
包含PDF下载链接等关键信息
"""

import json
from pathlib import Path
from datetime import datetime


def generate_openstax_chapters():
    """生成OpenStax大学/高中教材章节元数据"""
    
    chapters = [
        # 大学物理 - 第1卷
        {
            "chapter_id": "OSTX-UPhys-Ch01",
            "title": "单位与测量",
            "textbook": "University Physics Volume 1",
            "source": "openstax",
            "grade_level": "university",
            "subject": "物理",
            "chapter_url": "https://openstax.org/books/university-physics-volume-1/pages/1-introduction",
            "pdf_download_url": "https://openstax.org/details/books/university-physics-volume-1",
            "prerequisites": ["基础代数", "三角函数"],
            "key_concepts": [
                {
                    "concept": "国际单位制(SI)",
                    "formula": "",
                    "examples": ["米、千克、秒的定义"]
                },
                {
                    "concept": "有效数字",
                    "formula": "",
                    "examples": ["测量精度的表示方法"]
                }
            ],
            "exercises": [
                {
                    "problem": "将光速3×10^8 m/s转换为km/h",
                    "difficulty": 1,
                    "solution_url": "https://openstax.org/books/university-physics-volume-1/pages/1-problems"
                }
            ],
            "instructor_resources": {
                "slides_url": "https://openstax.org/details/books/university-physics-volume-1/instructor-resources",
                "test_bank_url": "https://openstax.org/details/books/university-physics-volume-1/instructor-resources"
            },
            "scraped_at": datetime.now().isoformat()
        },
        
        {
            "chapter_id": "OSTX-UPhys-Ch02",
            "title": "矢量",
            "textbook": "University Physics Volume 1",
            "source": "openstax",
            "grade_level": "university",
            "subject": "物理",
            "chapter_url": "https://openstax.org/books/university-physics-volume-1/pages/2-introduction",
            "pdf_download_url": "https://openstax.org/details/books/university-physics-volume-1",
            "prerequisites": ["三角函数", "坐标系"],
            "key_concepts": [
                {
                    "concept": "矢量加法",
                    "formula": "C = A + B",
                    "examples": ["力的合成", "速度叠加"]
                },
                {
                    "concept": "矢量分解",
                    "formula": "Ax = A·cos(θ), Ay = A·sin(θ)",
                    "examples": ["斜面上的重力分解"]
                },
                {
                    "concept": "点积与叉积",
                    "formula": "A·B = |A||B|cos(θ)",
                    "examples": ["功的计算", "力矩计算"]
                }
            ],
            "exercises": [
                {
                    "problem": "两个力F1=3N向东，F2=4N向北，求合力大小和方向",
                    "difficulty": 2,
                    "solution_url": "https://openstax.org/books/university-physics-volume-1/pages/2-problems"
                }
            ],
            "instructor_resources": {
                "slides_url": "https://openstax.org/details/books/university-physics-volume-1/instructor-resources",
                "test_bank_url": "https://openstax.org/details/books/university-physics-volume-1/instructor-resources"
            },
            "scraped_at": datetime.now().isoformat()
        },
        
        {
            "chapter_id": "OSTX-UPhys-Ch03",
            "title": "直线运动",
            "textbook": "University Physics Volume 1",
            "source": "openstax",
            "grade_level": "university",
            "subject": "物理",
            "chapter_url": "https://openstax.org/books/university-physics-volume-1/pages/3-introduction",
            "pdf_download_url": "https://openstax.org/details/books/university-physics-volume-1",
            "prerequisites": ["矢量", "微积分基础"],
            "key_concepts": [
                {
                    "concept": "位移、速度、加速度",
                    "formula": "v = dx/dt, a = dv/dt",
                    "examples": ["自由落体运动"]
                },
                {
                    "concept": "匀加速运动方程",
                    "formula": "v = v0 + at, x = x0 + v0t + ½at²",
                    "examples": ["汽车刹车距离计算"]
                }
            ],
            "exercises": [
                {
                    "problem": "一个物体从静止开始以2m/s²加速，5秒后的速度和位移是多少？",
                    "difficulty": 2,
                    "solution_url": "https://openstax.org/books/university-physics-volume-1/pages/3-problems"
                }
            ],
            "instructor_resources": {
                "slides_url": "https://openstax.org/details/books/university-physics-volume-1/instructor-resources",
                "test_bank_url": "https://openstax.org/details/books/university-physics-volume-1/instructor-resources"
            },
            "scraped_at": datetime.now().isoformat()
        },
        
        {
            "chapter_id": "OSTX-UPhys-Ch04",
            "title": "二维与三维运动",
            "textbook": "University Physics Volume 1",
            "source": "openstax",
            "grade_level": "university",
            "subject": "物理",
            "chapter_url": "https://openstax.org/books/university-physics-volume-1/pages/4-introduction",
            "pdf_download_url": "https://openstax.org/details/books/university-physics-volume-1",
            "prerequisites": ["矢量", "直线运动"],
            "key_concepts": [
                {
                    "concept": "抛体运动",
                    "formula": "x = v0·cos(θ)·t, y = v0·sin(θ)·t - ½gt²",
                    "examples": ["投篮轨迹分析"]
                },
                {
                    "concept": "圆周运动",
                    "formula": "ac = v²/r",
                    "examples": ["卫星轨道运动"]
                }
            ],
            "exercises": [
                {
                    "problem": "以30°角、20m/s初速度抛出的物体，最大高度和水平射程是多少？",
                    "difficulty": 3,
                    "solution_url": "https://openstax.org/books/university-physics-volume-1/pages/4-problems"
                }
            ],
            "instructor_resources": {
                "slides_url": "https://openstax.org/details/books/university-physics-volume-1/instructor-resources",
                "test_bank_url": "https://openstax.org/details/books/university-physics-volume-1/instructor-resources"
            },
            "scraped_at": datetime.now().isoformat()
        },
        
        {
            "chapter_id": "OSTX-UPhys-Ch05",
            "title": "牛顿运动定律",
            "textbook": "University Physics Volume 1",
            "source": "openstax",
            "grade_level": "university",
            "subject": "物理",
            "chapter_url": "https://openstax.org/books/university-physics-volume-1/pages/5-introduction",
            "pdf_download_url": "https://openstax.org/details/books/university-physics-volume-1",
            "prerequisites": ["矢量", "运动学"],
            "key_concepts": [
                {
                    "concept": "牛顿第一定律（惯性）",
                    "formula": "",
                    "examples": ["安全带的作用原理"]
                },
                {
                    "concept": "牛顿第二定律",
                    "formula": "F = ma",
                    "examples": ["电梯中的视重变化"]
                },
                {
                    "concept": "牛顿第三定律",
                    "formula": "FAB = -FBA",
                    "examples": ["火箭推进原理"]
                },
                {
                    "concept": "摩擦力",
                    "formula": "f = μN",
                    "examples": ["汽车刹车距离"]
                }
            ],
            "exercises": [
                {
                    "problem": "质量为10kg的物体受到50N的水平拉力，摩擦系数0.3，求加速度",
                    "difficulty": 3,
                    "solution_url": "https://openstax.org/books/university-physics-volume-1/pages/5-problems"
                }
            ],
            "instructor_resources": {
                "slides_url": "https://openstax.org/details/books/university-physics-volume-1/instructor-resources",
                "test_bank_url": "https://openstax.org/details/books/university-physics-volume-1/instructor-resources"
            },
            "scraped_at": datetime.now().isoformat()
        },
        
        # 大学化学
        {
            "chapter_id": "OSTX-Chem-Ch01",
            "title": "物质的本质",
            "textbook": "Chemistry 2e",
            "source": "openstax",
            "grade_level": "university",
            "subject": "化学",
            "chapter_url": "https://openstax.org/books/chemistry-2e/pages/1-introduction",
            "pdf_download_url": "https://openstax.org/details/books/chemistry-2e",
            "prerequisites": ["基础数学"],
            "key_concepts": [
                {
                    "concept": "物质的三态",
                    "formula": "",
                    "examples": ["固液气转化"]
                },
                {
                    "concept": "元素与化合物",
                    "formula": "",
                    "examples": ["水的组成H₂O"]
                }
            ],
            "exercises": [
                {
                    "problem": "区分混合物和化合物",
                    "difficulty": 1,
                    "solution_url": "https://openstax.org/books/chemistry-2e/pages/1-exercises"
                }
            ],
            "instructor_resources": {
                "slides_url": "https://openstax.org/details/books/chemistry-2e/instructor-resources",
                "test_bank_url": "https://openstax.org/details/books/chemistry-2e/instructor-resources"
            },
            "scraped_at": datetime.now().isoformat()
        },
        
        {
            "chapter_id": "OSTX-Chem-Ch02",
            "title": "原子结构与元素周期表",
            "textbook": "Chemistry 2e",
            "source": "openstax",
            "grade_level": "university",
            "subject": "化学",
            "chapter_url": "https://openstax.org/books/chemistry-2e/pages/2-introduction",
            "pdf_download_url": "https://openstax.org/details/books/chemistry-2e",
            "prerequisites": ["物质的本质"],
            "key_concepts": [
                {
                    "concept": "原子结构",
                    "formula": "",
                    "examples": ["质子、中子、电子"]
                },
                {
                    "concept": "同位素",
                    "formula": "",
                    "examples": ["碳-12和碳-14"]
                },
                {
                    "concept": "元素周期律",
                    "formula": "",
                    "examples": ["周期性性质变化"]
                }
            ],
            "exercises": [
                {
                    "problem": "计算氯的平均原子质量（Cl-35占75%，Cl-37占25%）",
                    "difficulty": 2,
                    "solution_url": "https://openstax.org/books/chemistry-2e/pages/2-exercises"
                }
            ],
            "instructor_resources": {
                "slides_url": "https://openstax.org/details/books/chemistry-2e/instructor-resources",
                "test_bank_url": "https://openstax.org/details/books/chemistry-2e/instructor-resources"
            },
            "scraped_at": datetime.now().isoformat()
        },
        
        # 大学生物
        {
            "chapter_id": "OSTX-Bio-Ch01",
            "title": "生物学研究",
            "textbook": "Biology 2e",
            "source": "openstax",
            "grade_level": "university",
            "subject": "生物",
            "chapter_url": "https://openstax.org/books/biology-2e/pages/1-introduction",
            "pdf_download_url": "https://openstax.org/details/books/biology-2e",
            "prerequisites": ["基础科学素养"],
            "key_concepts": [
                {
                    "concept": "生命的特征",
                    "formula": "",
                    "examples": ["新陈代谢、生长、繁殖"]
                },
                {
                    "concept": "生物组织层次",
                    "formula": "",
                    "examples": ["细胞→组织→器官→系统"]
                }
            ],
            "exercises": [
                {
                    "problem": "列举生命的基本特征",
                    "difficulty": 1,
                    "solution_url": "https://openstax.org/books/biology-2e/pages/1-review-questions"
                }
            ],
            "instructor_resources": {
                "slides_url": "https://openstax.org/details/books/biology-2e/instructor-resources",
                "test_bank_url": "https://openstax.org/details/books/biology-2e/instructor-resources"
            },
            "scraped_at": datetime.now().isoformat()
        },
        
        {
            "chapter_id": "OSTX-Bio-Ch02",
            "title": "生命的化学基础",
            "textbook": "Biology 2e",
            "source": "openstax",
            "grade_level": "university",
            "subject": "生物",
            "chapter_url": "https://openstax.org/books/biology-2e/pages/2-introduction",
            "pdf_download_url": "https://openstax.org/details/books/biology-2e",
            "prerequisites": ["基础化学"],
            "key_concepts": [
                {
                    "concept": "原子与化学键",
                    "formula": "",
                    "examples": ["共价键、离子键"]
                },
                {
                    "concept": "水的特性",
                    "formula": "",
                    "examples": ["极性、氢键、高比热容"]
                },
                {
                    "concept": "生物大分子",
                    "formula": "",
                    "examples": ["碳水化合物、脂质、蛋白质、核酸"]
                }
            ],
            "exercises": [
                {
                    "problem": "解释水为何是生命必需的溶剂",
                    "difficulty": 2,
                    "solution_url": "https://openstax.org/books/biology-2e/pages/2-review-questions"
                }
            ],
            "instructor_resources": {
                "slides_url": "https://openstax.org/details/books/biology-2e/instructor-resources",
                "test_bank_url": "https://openstax.org/details/books/biology-2e/instructor-resources"
            },
            "scraped_at": datetime.now().isoformat()
        },
        
        # 高中AP物理
        {
            "chapter_id": "OSTX-HSPhys-Ch01",
            "title": "运动学",
            "textbook": "Physics",
            "source": "openstax",
            "grade_level": "high_school",
            "subject": "物理",
            "chapter_url": "https://openstax.org/books/physics/pages/2-introduction",
            "pdf_download_url": "https://openstax.org/details/books/physics",
            "prerequisites": ["代数", "三角函数基础"],
            "key_concepts": [
                {
                    "concept": "速度与加速度",
                    "formula": "v = Δx/Δt, a = Δv/Δt",
                    "examples": ["汽车加速过程"]
                },
                {
                    "concept": "自由落体",
                    "formula": "h = ½gt²",
                    "examples": ["物体下落时间计算"]
                }
            ],
            "exercises": [
                {
                    "problem": "从10米高处自由下落的物体，落地时间和速度是多少？",
                    "difficulty": 2,
                    "solution_url": "https://openstax.org/books/physics/pages/2-problems"
                }
            ],
            "instructor_resources": {
                "slides_url": "https://openstax.org/details/books/physics/instructor-resources",
                "test_bank_url": "https://openstax.org/details/books/physics/instructor-resources"
            },
            "scraped_at": datetime.now().isoformat()
        },
        
        {
            "chapter_id": "OSTX-HSPhys-Ch02",
            "title": "力与牛顿定律",
            "textbook": "Physics",
            "source": "openstax",
            "grade_level": "high_school",
            "subject": "物理",
            "chapter_url": "https://openstax.org/books/physics/pages/4-introduction",
            "pdf_download_url": "https://openstax.org/details/books/physics",
            "prerequisites": ["运动学", "矢量基础"],
            "key_concepts": [
                {
                    "concept": "牛顿三大定律",
                    "formula": "F = ma",
                    "examples": ["推箱子、火箭发射"]
                },
                {
                    "concept": "重力",
                    "formula": "F = mg",
                    "examples": ["体重计算"]
                }
            ],
            "exercises": [
                {
                    "problem": "质量为5kg的物体受到的重力是多少？",
                    "difficulty": 1,
                    "solution_url": "https://openstax.org/books/physics/pages/4-problems"
                }
            ],
            "instructor_resources": {
                "slides_url": "https://openstax.org/details/books/physics/instructor-resources",
                "test_bank_url": "https://openstax.org/details/books/physics/instructor-resources"
            },
            "scraped_at": datetime.now().isoformat()
        }
    ]
    
    return chapters


def main():
    """生成并保存OpenStax章节数据"""
    output_dir = Path("data/textbook_library")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    chapters = generate_openstax_chapters()
    
    output_file = output_dir / "openstax_chapters.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(chapters, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 成功生成 {len(chapters)} 个OpenStax章节")
    print(f"📁 保存位置: {output_file}")
    print(f"\n章节列表:")
    for chapter in chapters:
        print(f"  - {chapter['chapter_id']}: {chapter['title']} ({chapter['grade_level']})")
        print(f"    PDF下载: {chapter['pdf_download_url']}")


if __name__ == "__main__":
    main()
