"""
OpenMTSciEd 课件库元数据解析器
解析OpenStax HTML教材、TED-Ed课程页面、STEM-PBL教学标准
统一为结构化元数据
"""

import os
import json
import csv
import logging
from typing import List, Dict, Any
from pathlib import Path

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('textbook_library_parser.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class TextbookLibraryParser:
    """课件库元数据解析器基类"""

    def __init__(self, output_dir: str = "data/textbook_library"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def parse_openstax_html(self, url: str = None, html_file: str = None) -> List[Dict[str, Any]]:
        """
        解析OpenStax HTML教材

        Args:
            url: 教材页面URL
            html_file: 本地HTML文件路径

        Returns:
            章节元数据列表
        """
        logger.info(f"开始解析OpenStax教材")

        try:
            from bs4 import BeautifulSoup
            import requests

            # 获取HTML内容
            if html_file:
                with open(html_file, 'r', encoding='utf-8') as f:
                    html_content = f.read()
            elif url:
                import time
                import random
                time.sleep(random.uniform(2, 5))

                session = requests.Session()
                session.headers.update({
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                })
                response = session.get(url, timeout=30)
                response.encoding = 'utf-8'
                html_content = response.text
            else:
                logger.error("请提供url或html_file参数")
                return []

            soup = BeautifulSoup(html_content, 'lxml')
            chapters = self._extract_openstax_chapters(soup)

            logger.info(f"解析完成,共提取{len(chapters)}个章节")
            return chapters

        except ImportError:
            logger.error("BeautifulSoup或lxml未安装")
            return []
        except Exception as e:
            logger.error(f"解析OpenStax教材失败: {e}")
            return []

    def _extract_openstax_chapters(self, soup) -> List[Dict[str, Any]]:
        """从OpenStax HTML中提取章节信息"""
        # TODO: 实现具体的HTML解析逻辑
        chapters = [
            {
                "id": "OST-Phys-Ch1",
                "title": "牛顿运动定律",
                "source": "OpenStax",
                "subject": "物理",
                "grade_level": "高中/大学",
                "chapter_number": 1,
                "prerequisites": [
                    "矢量运算基础",
                    "微积分入门(导数)"
                ],
                "key_concepts": [
                    "牛顿第一定律(惯性)",
                    "牛顿第二定律(F=ma)",
                    "牛顿第三定律(作用力与反作用力)"
                ],
                "typical_exercises": [
                    "计算斜面上物体的加速度",
                    "分析双体系统的受力情况"
                ],
                "estimated_hours": 8,
                "difficulty": 4
            },
            {
                "id": "OST-Bio-Ch5",
                "title": "生态学基础",
                "source": "OpenStax",
                "subject": "生物",
                "grade_level": "高中/大学",
                "chapter_number": 5,
                "prerequisites": [
                    "细胞生物学基础",
                    "光合作用与呼吸作用"
                ],
                "key_concepts": [
                    "生态系统能量流动",
                    "食物链与食物网",
                    "碳循环与氮循环"
                ],
                "typical_exercises": [
                    "绘制能量金字塔并计算能量传递效率",
                    "分析人类活动对碳循环的影响"
                ],
                "estimated_hours": 6,
                "difficulty": 3
            }
        ]

        logger.info(f"从HTML中提取了{len(chapters)}个示例章节(待完善解析逻辑)")
        return chapters

    def parse_ted_ed_json(self, json_file: str) -> List[Dict[str, Any]]:
        """
        解析TED-Ed课程JSON数据

        Args:
            json_file: JSON文件路径

        Returns:
            课程元数据列表
        """
        logger.info(f"开始解析TED-Ed课程: {json_file}")

        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)

            courses = self._extract_ted_ed_courses(data)
            logger.info(f"解析完成,共提取{len(courses)}个课程")
            return courses

        except Exception as e:
            logger.error(f"解析TED-Ed课程失败: {e}")
            return []

    def _extract_ted_ed_courses(self, data: Any) -> List[Dict[str, Any]]:
        """从TED-Ed数据中提取课程信息"""
        courses = [
            {
                "id": "TED-STEM-001",
                "title": "人工智能伦理",
                "source": "TED-Ed",
                "category": "工程与技术",
                "subject": "计算机科学",
                "related_ted_talk": "https://www.ted.com/talks/ai_ethics",
                "knowledge_summary": [
                    "机器学习基本概念",
                    "算法偏见与社会公平",
                    "AI决策的透明度"
                ],
                "duration_minutes": 15,
                "grade_level": "高中",
                "discussion_questions": [
                    "AI是否应该拥有道德责任?",
                    "如何避免算法歧视?"
                ]
            }
        ]

        logger.info(f"从JSON中提取了{len(courses)}个示例课程")
        return courses

    def parse_stem_pbl_standard(self, standard_file: str) -> Dict[str, Any]:
        """
        解析《STEM-PBL教学标准》

        Args:
            standard_file: 标准文档路径(JSON或PDF)

        Returns:
            教学标准元数据
        """
        logger.info(f"开始解析STEM-PBL教学标准: {standard_file}")

        # 示例数据结构
        standard = {
            "id": "STEM-PBL-Standard-2024",
            "title": "STEM项目式学习科创教育教学标准",
            "version": "1.0",
            "course_categories": [
                {
                    "category": "探究类",
                    "description": "基于科学探究的项目",
                    "examples": ["生态系统调查", "化学反应速率研究"]
                },
                {
                    "category": "设计类",
                    "description": "基于工程设计的项目",
                    "examples": ["搭建起重机", "设计智能浇花系统"]
                }
            ],
            "teaching_process": [
                {"step": 1, "phase": "问题定义", "activities": ["情境导入", "问题提出"]},
                {"step": 2, "phase": "方案设计", "activities": ["头脑风暴", "方案选择"]},
                {"step": 3, "phase": "实施验证", "activities": ["原型制作", "测试优化"]},
                {"step": 4, "phase": "展示评价", "activities": ["成果展示", "同伴互评"]}
            ],
            "evaluation_criteria": [
                {"criterion": "科学性", "weight": 0.3, "indicators": ["概念准确", "逻辑清晰"]},
                {"criterion": "创新性", "weight": 0.3, "indicators": ["思路新颖", "方法独特"]},
                {"criterion": "实用性", "weight": 0.2, "indicators": ["解决实际问题", "可推广应用"]},
                {"criterion": "团队协作", "weight": 0.2, "indicators": ["分工明确", "沟通顺畅"]}
            ]
        }

        logger.info("STEM-PBL教学标准解析完成(示例数据)")
        return standard

    def save_to_csv(self, data: List[Dict[str, Any]], filename: str):
        """保存数据为CSV格式"""
        filepath = self.output_dir / filename

        if not data:
            logger.warning(f"数据为空,跳过保存: {filename}")
            return

        try:
            keys = data[0].keys()
            with open(filepath, 'w', newline='', encoding='utf-8-sig') as f:
                writer = csv.DictWriter(f, fieldnames=keys)
                writer.writeheader()
                writer.writerows(data)

            logger.info(f"成功保存{len(data)}条记录到: {filepath}")

        except Exception as e:
            logger.error(f"保存CSV失败: {e}")

    def save_to_json(self, data: Any, filename: str):
        """保存数据为JSON格式"""
        filepath = self.output_dir / filename

        if not data:
            logger.warning(f"数据为空,跳过保存: {filename}")
            return

        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

            logger.info(f"成功保存数据到: {filepath}")

        except Exception as e:
            logger.error(f"保存JSON失败: {e}")


def main():
    """主函数 - 执行课件库元数据提取"""
    parser = TextbookLibraryParser()

    logger.info("=" * 60)
    logger.info("OpenMTSciEd 课件库元数据提取开始")
    logger.info("=" * 60)

    # 1. 解析OpenStax教材 (示例URL)
    openstax_url = "https://openstax.org/details/books/college-physics"
    openstax_chapters = parser.parse_openstax_html(url=openstax_url)
    parser.save_to_csv(openstax_chapters, "openstax_chapters.csv")

    # 2. 解析TED-Ed课程 (示例JSON)
    ted_ed_json = "data/raw/ted_ed_courses.json"
    if os.path.exists(ted_ed_json):
        ted_ed_courses = parser.parse_ted_ed_json(ted_ed_json)
    else:
        logger.warning(f"TED-Ed JSON文件不存在,使用示例数据")
        ted_ed_courses = parser._extract_ted_ed_courses({})

    parser.save_to_json(ted_ed_courses, "ted_ed_courses.json")

    # 3. 解析STEM-PBL教学标准
    stem_pbl_standard = parser.parse_stem_pbl_standard("data/raw/stem_pbl_standard.json")
    parser.save_to_json(stem_pbl_standard, "stem_pbl_standard.json")

    logger.info("=" * 60)
    logger.info("课件库元数据提取完成")
    logger.info(f"交付物:")
    logger.info(f"  - data/textbook_library/openstax_chapters.csv")
    logger.info(f"  - data/textbook_library/ted_ed_courses.json")
    logger.info(f"  - data/textbook_library/stem_pbl_standard.json")
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
