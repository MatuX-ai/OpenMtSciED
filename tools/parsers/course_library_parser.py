"""
OpenMTSciEd 课程库元数据解析器
解析OpenSciEd PDF、格物斯坦HTML、stemcloud.cn课程数据
统一为三级结构: 主题 → 知识点 → 应用
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
        logging.FileHandler('course_library_parser.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class CourseLibraryParser:
    """课程库元数据解析器基类"""

    def __init__(self, output_dir: str = "data/course_library"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def parse_openscied_pdf(self, pdf_path: str) -> List[Dict[str, Any]]:
        """
        解析OpenSciEd PDF文档

        Args:
            pdf_path: PDF文件路径

        Returns:
            单元元数据列表
        """
        logger.info(f"开始解析OpenSciEd PDF: {pdf_path}")

        try:
            import PyPDF2

            units = []
            with open(pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)

                # 尝试不同的编码
                for encoding in ['utf-8', 'gbk', 'latin-1']:
                    try:
                        text = ""
                        for page in reader.pages:
                            text += page.extract_text() or ""

                        # 解析文本提取单元信息
                        units = self._extract_openscied_units(text)
                        if units:
                            logger.info(f"成功使用{encoding}编码解析PDF")
                            break
                    except Exception as e:
                        logger.warning(f"使用{encoding}编码失败: {e}")
                        continue

            logger.info(f"解析完成,共提取{len(units)}个单元")
            return units

        except ImportError:
            logger.error("PyPDF2未安装,请运行: pip install PyPDF2")
            return []
        except Exception as e:
            logger.error(f"解析PDF失败: {e}")
            return []

    def _extract_openscied_units(self, text: str) -> List[Dict[str, Any]]:
        """从OpenSciEd文本中提取单元信息"""
        # TODO: 实现具体的文本解析逻辑
        # 这里提供示例数据结构
        units = [
            {
                "id": "OS-Unit-001",
                "title": "生态系统能量流动",
                "source": "OpenSciEd",
                "grade_level": "6-8",
                "subject": "生物",
                "duration_weeks": 6,
                "knowledge_points": [
                    "光合作用化学方程式",
                    "食物链能量传递",
                    "生态系统物质循环"
                ],
                "cross_discipline": [
                    "用编程模拟种群增长",
                    "数学建模能量金字塔"
                ],
                "experiment_materials": [
                    "水生植物",
                    "光源",
                    "CO₂指示剂"
                ],
                "low_cost_alternatives": [
                    "用LED灯代替专业光源",
                    "用白菜叶代替水生植物"
                ],
                "theme": "生态系统",
                "application": "设计小型生态瓶观察能量流动"
            }
        ]

        logger.info(f"从文本中提取了{len(units)}个示例单元(待完善解析逻辑)")
        return units

    def parse_gewustan_html(self, url: str = None, html_file: str = None) -> List[Dict[str, Any]]:
        """
        解析格物斯坦课程页面

        Args:
            url: 课程页面URL
            html_file: 本地HTML文件路径

        Returns:
            课程元数据列表
        """
        logger.info(f"开始解析格物斯坦课程")

        try:
            from bs4 import BeautifulSoup
            import requests

            # 获取HTML内容
            if html_file:
                with open(html_file, 'r', encoding='utf-8') as f:
                    html_content = f.read()
            elif url:
                # 添加随机延迟避免反爬虫
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
            courses = self._extract_gewustan_courses(soup)

            logger.info(f"解析完成,共提取{len(courses)}个课程")
            return courses

        except ImportError:
            logger.error("BeautifulSoup或lxml未安装,请运行: pip install beautifulsoup4 lxml")
            return []
        except Exception as e:
            logger.error(f"解析格物斯坦课程失败: {e}")
            return []

    def _extract_gewustan_courses(self, soup) -> List[Dict[str, Any]]:
        """从格物斯坦HTML中提取课程信息"""
        # TODO: 实现具体的HTML解析逻辑
        courses = [
            {
                "id": "GWS-Course-001",
                "title": "机械传动基础",
                "source": "格物斯坦",
                "age_range": "10-15岁",
                "subject": "工程",
                "modules": [
                    "齿轮组原理",
                    "皮带传动",
                    "链条传动"
                ],
                "hardware_list": [
                    {"component": "齿轮组", "quantity": 5, "unit_price": 3.0},
                    {"component": "直流电机", "quantity": 1, "unit_price": 8.0},
                    {"component": "电池盒", "quantity": 1, "unit_price": 2.0}
                ],
                "projects": [
                    "搭建简易起重机",
                    "设计变速齿轮箱"
                ],
                "theme": "机械结构",
                "knowledge_point": "力的传递与转换",
                "application": "用齿轮组实现不同转速输出"
            }
        ]

        logger.info(f"从HTML中提取了{len(courses)}个示例课程(待完善解析逻辑)")
        return courses

    def parse_stemcloud_json(self, json_file: str) -> List[Dict[str, Any]]:
        """
        解析stemcloud.cn课程JSON数据

        Args:
            json_file: JSON文件路径

        Returns:
            课程元数据列表
        """
        logger.info(f"开始解析stemcloud.cn课程: {json_file}")

        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)

            courses = self._extract_stemcloud_courses(data)
            logger.info(f"解析完成,共提取{len(courses)}个课程")
            return courses

        except Exception as e:
            logger.error(f"解析stemcloud.cn课程失败: {e}")
            return []

    def _extract_stemcloud_courses(self, data: Any) -> List[Dict[str, Any]]:
        """从stemcloud.cn数据中提取课程信息"""
        # TODO: 根据实际JSON结构调整解析逻辑
        courses = [
            {
                "id": "STEM-Cloud-001",
                "title": "Arduino传感器应用",
                "source": "stemcloud.cn",
                "category": "物理-力学",
                "subject": "物理",
                "difficulty": 3,
                "grade_level": "初中",
                "related_hardware": [
                    "Arduino Uno",
                    "超声波传感器HC-SR04",
                    "舵机SG90"
                ],
                "project_hours": 4,
                "knowledge_points": [
                    "超声波测距原理",
                    "PWM控制舵机角度"
                ],
                "theme": "传感器技术",
                "application": "制作智能避障小车"
            }
        ]

        logger.info(f"从JSON中提取了{len(courses)}个示例课程(待完善解析逻辑)")
        return courses

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

    def save_to_json(self, data: List[Dict[str, Any]], filename: str):
        """保存数据为JSON格式"""
        filepath = self.output_dir / filename

        if not data:
            logger.warning(f"数据为空,跳过保存: {filename}")
            return

        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

            logger.info(f"成功保存{len(data)}条记录到: {filepath}")

        except Exception as e:
            logger.error(f"保存JSON失败: {e}")


def main():
    """主函数 - 执行课程库元数据提取"""
    parser = CourseLibraryParser()

    logger.info("=" * 60)
    logger.info("OpenMTSciEd 课程库元数据提取开始")
    logger.info("=" * 60)

    # 1. 解析OpenSciEd PDF (示例路径,需替换为实际文件)
    openscied_pdf = "data/raw/openscied_units.pdf"
    if os.path.exists(openscied_pdf):
        openscied_units = parser.parse_openscied_pdf(openscied_pdf)
        parser.save_to_csv(openscied_units, "openscied_units.csv")
    else:
        logger.warning(f"OpenSciEd PDF文件不存在: {openscied_pdf},使用示例数据")
        # 生成示例数据用于测试
        openscied_units = parser._extract_openscied_units("")
        parser.save_to_csv(openscied_units, "openscied_units.csv")

    # 2. 解析格物斯坦课程 (示例URL,需替换为实际地址)
    gewustan_url = "https://www.gewustan.com/courses"
    gewustan_courses = parser.parse_gewustan_html(url=gewustan_url)
    parser.save_to_json(gewustan_courses, "gewustan_courses.json")

    # 3. 解析stemcloud.cn课程 (示例JSON,需替换为实际文件)
    stemcloud_json = "data/raw/stemcloud_courses.json"
    if os.path.exists(stemcloud_json):
        stemcloud_courses = parser.parse_stemcloud_json(stemcloud_json)
    else:
        logger.warning(f"stemcloud.cn JSON文件不存在: {stemcloud_json},使用示例数据")
        stemcloud_courses = parser._extract_stemcloud_courses({})

    parser.save_to_json(stemcloud_courses, "stemcloud_courses.json")

    logger.info("=" * 60)
    logger.info("课程库元数据提取完成")
    logger.info(f"交付物:")
    logger.info(f"  - data/course_library/openscied_units.csv")
    logger.info(f"  - data/course_library/gewustan_courses.json")
    logger.info(f"  - data/course_library/stemcloud_courses.json")
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
