"""
OpenStax 题库爬虫
从 OpenStax 教材的 review-questions 页面抓取题目
"""

import re
import logging
from typing import Dict, Any, List
from bs4 import BeautifulSoup
import requests

from .base_question_crawler import BaseQuestionCrawler
from . import register_crawler

logger = logging.getLogger(__name__)


class OpenStaxQuestionCrawler(BaseQuestionCrawler):
    """OpenStax 题库爬虫"""
    
    def __init__(self):
        super().__init__(
            crawler_id="openstax_questions",
            name="OpenStax Questions",
            description="从 OpenStax 教材抓取复习题目"
        )
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def crawl_questions(self, config: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        爬取 OpenStax 题目
        
        Args:
            config: 配置参数
                - textbook: 教材名称 (e.g., 'biology-2e', 'physics')
                - chapters: 章节列表 (e.g., [1, 2, 3])
                - base_url: OpenStax 基础URL
                
        Returns:
            题目列表
        """
        textbook = config.get('textbook', 'biology-2e')
        chapters = config.get('chapters', list(range(1, 5)))  # 默认前4章
        base_url = config.get('base_url', 'https://openstax.org/books')
        
        all_questions = []
        
        for chapter_num in chapters:
            try:
                chapter_questions = self._crawl_chapter_questions(
                    base_url, textbook, chapter_num
                )
                all_questions.extend(chapter_questions)
                logger.info(f"✅ 第{chapter_num}章: 获取 {len(chapter_questions)} 道题目")
            except Exception as e:
                logger.error(f"❌ 第{chapter_num}章爬取失败: {str(e)}")
                continue
        
        return all_questions
    
    def _crawl_chapter_questions(self, base_url: str, textbook: str, chapter_num: int) -> List[Dict[str, Any]]:
        """爬取单个章节的题目"""
        # 构建复习题页面URL
        url = f"{base_url}/{textbook}/pages/{chapter_num}-review-questions"
        
        response = self.session.get(url, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        questions = []
        
        # 查找所有题目容器（OpenStax 使用特定的HTML结构）
        question_blocks = soup.find_all('div', class_='os-problem-container')
        
        for idx, block in enumerate(question_blocks):
            try:
                question = self._parse_question(block, textbook, chapter_num, idx + 1)
                if question:
                    questions.append(question)
            except Exception as e:
                logger.warning(f"解析题目失败: {str(e)}")
                continue
        
        return questions
    
    def _parse_question(self, block, textbook: str, chapter: int, num: int) -> Dict[str, Any]:
        """解析单个题目"""
        # 提取题目内容
        content_elem = block.find(['p', 'div'], class_='os-problem-content')
        if not content_elem:
            content_elem = block.find('p')
        
        if not content_elem:
            return None
        
        content = content_elem.get_text(strip=True)
        if len(content) < 10:  # 过滤太短的内容
            return None
        
        # 判断题目类型
        question_type = self._detect_question_type(block, content)
        
        # 提取选项（如果是选择题）
        options = []
        correct_answer = ""
        
        if question_type == 'multiple_choice':
            options, correct_answer = self._extract_multiple_choice(block)
        
        # 提取知识点标签
        knowledge_points = self._extract_knowledge_points(block, textbook, chapter)
        
        # 构建题目对象
        question = {
            "content": content,
            "question_type": question_type,
            "options_json": options,
            "correct_answer": correct_answer,
            "explanation": f"来自 OpenStax {textbook} 第{chapter}章复习题",
            "knowledge_points": knowledge_points,
            "source": "openstax",
            "metadata": {
                "textbook": textbook,
                "chapter": chapter,
                "question_number": num,
                "url": f"https://openstax.org/books/{textbook}/pages/{chapter}-review-questions"
            }
        }
        
        return question
    
    def _detect_question_type(self, block, content: str) -> str:
        """检测题目类型"""
        # 检查是否有选项
        if block.find('ol') or block.find('ul'):
            return 'multiple_choice'
        
        # 检查是否是判断题
        if any(keyword in content.lower() for keyword in ['true or false', '判断正误']):
            return 'true_false'
        
        # 默认为简答题
        return 'short_answer'
    
    def _extract_multiple_choice(self, block) -> tuple:
        """提取选择题选项和答案"""
        options = []
        correct_answer = ""
        
        # 查找选项列表
        option_list = block.find('ol') or block.find('ul')
        if option_list:
            for li in option_list.find_all('li'):
                option_text = li.get_text(strip=True)
                if option_text:
                    options.append(option_text)
        
        # 尝试提取正确答案（OpenStax 通常在答案部分标记）
        answer_section = block.find('div', class_='os-answer')
        if answer_section:
            correct_answer = answer_section.get_text(strip=True)
        
        return options, correct_answer
    
    def _extract_knowledge_points(self, block, textbook: str, chapter: int) -> List[str]:
        """提取知识点标签"""
        # 基于教材和章节生成基础知识点
        knowledge_points = [
            f"{textbook.replace('-', '_')}",
            f"chapter_{chapter}"
        ]
        
        # 尝试从标题中提取关键词
        title_elem = block.find_previous('h2') or block.find_previous('h3')
        if title_elem:
            title = title_elem.get_text(strip=True).lower()
            # 提取常见的科学术语
            keywords = ['energy', 'cell', 'force', 'motion', 'chemical', 'biological']
            for keyword in keywords:
                if keyword in title:
                    knowledge_points.append(keyword)
        
        return knowledge_points[:5]  # 限制最多5个知识点


def crawl_openstax_questions_wrapper(config: dict) -> dict:
    """OpenStax 题库爬虫包装器"""
    crawler = OpenStaxQuestionCrawler()
    result = crawler.run(config)
    return result


# 注册爬虫
register_crawler(
    crawler_id="openstax_questions",
    name="OpenStax Questions",
    handler=crawl_openstax_questions_wrapper,
    description="从 OpenStax 教材抓取复习题目"
)
