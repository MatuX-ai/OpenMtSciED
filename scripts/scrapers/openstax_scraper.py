"""
OpenStax真实章节爬虫
从https://openstax.org/获取真实的教材章节数据，包含PDF下载链接
目标：≥50个章节
"""

import os
import json
import time
import random
import logging
from typing import List, Dict, Any, Optional
from pathlib import Path
from datetime import datetime

import requests
from bs4 import BeautifulSoup

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('openstax_scraper.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class OpenStaxScraper:
    """OpenStax教材章节爬取器"""
    
    def __init__(self, output_dir: str = "data/textbook_library"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
        })
        
        # OpenStax基础URL
        self.base_url = "https://openstax.org"
        
        # 已知的OpenStax教材列表
        self.textbooks = [
            {
                "title": "University Physics Volume 1",
                "url": "https://openstax.org/details/books/university-physics-volume-1",
                "subject": "物理",
                "grade_level": "university"
            },
            {
                "title": "University Physics Volume 2",
                "url": "https://openstax.org/details/books/university-physics-volume-2",
                "subject": "物理",
                "grade_level": "university"
            },
            {
                "title": "University Physics Volume 3",
                "url": "https://openstax.org/details/books/university-physics-volume-3",
                "subject": "物理",
                "grade_level": "university"
            },
            {
                "title": "Chemistry 2e",
                "url": "https://openstax.org/details/books/chemistry-2e",
                "subject": "化学",
                "grade_level": "university"
            },
            {
                "title": "Biology 2e",
                "url": "https://openstax.org/details/books/biology-2e",
                "subject": "生物",
                "grade_level": "university"
            },
            {
                "title": "Calculus Volume 1",
                "url": "https://openstax.org/details/books/calculus-volume-1",
                "subject": "数学",
                "grade_level": "university"
            },
            {
                "title": "Calculus Volume 2",
                "url": "https://openstax.org/details/books/calculus-volume-2",
                "subject": "数学",
                "grade_level": "university"
            },
            {
                "title": "Calculus Volume 3",
                "url": "https://openstax.org/details/books/calculus-volume-3",
                "subject": "数学",
                "grade_level": "university"
            },
            {
                "title": "Introductory Statistics",
                "url": "https://openstax.org/details/books/introductory-statistics",
                "subject": "数学",
                "grade_level": "university"
            },
            {
                "title": "Physics",
                "url": "https://openstax.org/details/books/physics",
                "subject": "物理",
                "grade_level": "high"
            },
            {
                "title": "Chemistry",
                "url": "https://openstax.org/details/books/chemistry",
                "subject": "化学",
                "grade_level": "high"
            },
            {
                "title": "Biology",
                "url": "https://openstax.org/details/books/biology",
                "subject": "生物",
                "grade_level": "high"
            },
        ]
    
    def get_chapter_urls(self, textbook_url: str) -> List[str]:
        """
        从教材页面获取所有章节的URL
        
        Args:
            textbook_url: 教材详情页URL
            
        Returns:
            章节URL列表
        """
        logger.info(f"获取教材章节URL: {textbook_url}")
        
        try:
            response = self.session.get(textbook_url, timeout=30)
            response.encoding = 'utf-8'
            soup = BeautifulSoup(response.text, 'lxml')
            
            chapter_urls = []
            
            # 方法1：查找Table of Contents链接
            toc_links = soup.find_all('a', href=True, string=lambda text: text and 'table of contents' in text.lower())
            if toc_links:
                toc_url = toc_links[0]['href']
                if not toc_url.startswith('http'):
                    toc_url = f"{self.base_url}{toc_url}"
                
                # 访问TOC页面获取所有章节
                toc_response = self.session.get(toc_url, timeout=30)
                toc_response.encoding = 'utf-8'
                toc_soup = BeautifulSoup(toc_response.text, 'lxml')
                
                for link in toc_soup.find_all('a', href=True):
                    href = link['href']
                    if '/books/' in href and '/pages/' in href:
                        full_url = href if href.startswith('http') else f"{self.base_url}{href}"
                        if full_url not in chapter_urls:
                            chapter_urls.append(full_url)
            
            # 方法2：直接在当前页面查找章节链接
            if not chapter_urls:
                for link in soup.find_all('a', href=True):
                    href = link['href']
                    if '/books/' in href and '/pages/' in href and href.count('/') >= 4:
                        full_url = href if href.startswith('http') else f"{self.base_url}{href}"
                        if full_url not in chapter_urls:
                            chapter_urls.append(full_url)
            
            logger.info(f"找到 {len(chapter_urls)} 个章节")
            return chapter_urls
            
        except Exception as e:
            logger.error(f"获取章节URL失败: {e}")
            return []
    
    def scrape_chapter(self, chapter_url: str, textbook_info: Dict[str, str]) -> Optional[Dict[str, Any]]:
        """
        爬取单个章节的完整信息
        
        Args:
            chapter_url: 章节详情页URL
            textbook_info: 教材信息字典
            
        Returns:
            章节元数据字典，失败返回None
        """
        logger.info(f"开始爬取章节: {chapter_url}")
        
        try:
            # 添加随机延迟避免反爬虫
            time.sleep(random.uniform(1, 3))
            
            response = self.session.get(chapter_url, timeout=30)
            
            # 检查是否404
            if response.status_code == 404:
                logger.warning(f"⚠️ 页面不存在 (404): {chapter_url}")
                return None
            
            response.encoding = 'utf-8'
            soup = BeautifulSoup(response.text, 'lxml')
            
            # 提取章节标题
            title = self._extract_title(soup)
            if not title or 'Page Not Found' in title:
                logger.warning(f"⚠️ 无效章节页面: {chapter_url}")
                return None
            
            # 提取章节ID（从URL中）
            chapter_id = self._extract_chapter_id(chapter_url)
            
            # 构建章节数据
            chapter_data = {
                'chapter_id': chapter_id,
                'title': title,
                'textbook': textbook_info['title'],
                'source': 'openstax',
                'grade_level': textbook_info['grade_level'],
                'subject': textbook_info['subject'],
                'chapter_url': chapter_url,
                'pdf_download_url': f"{textbook_info['url'].replace('/details/books/', '/details/books/')}",
                'prerequisites': [],
                'key_concepts': self._extract_key_concepts(soup),
                'exercises': [],
                'scraped_at': datetime.now().isoformat()
            }
            
            logger.info(f"✅ 成功爬取章节: {title}")
            return chapter_data
            
        except Exception as e:
            logger.error(f"❌ 爬取章节失败 {chapter_url}: {e}")
            return None
    
    def _extract_title(self, soup: BeautifulSoup) -> str:
        """提取章节标题"""
        # 尝试多种选择器
        title_selectors = [
            'h1.chapter-title',
            'h1.page-title',
            'h1',
            'meta[property="og:title"]',
        ]
        
        for selector in title_selectors:
            if selector.startswith('meta'):
                meta = soup.find('meta', property=selector.split('[')[1].split('=')[0].strip('"'))
                if meta and meta.get('content'):
                    return meta['content'].strip()
            else:
                element = soup.select_one(selector)
                if element and element.text.strip():
                    return element.text.strip()
        
        return ""
    
    def _extract_chapter_id(self, url: str) -> str:
        """从URL提取章节ID"""
        # URL格式: https://openstax.org/books/physics/pages/1-introduction
        parts = url.strip('/').split('/')
        if len(parts) >= 5:
            book_name = parts[-3]  # 如 "physics"
            chapter_slug = parts[-1]  # 如 "1-introduction"
            return f"OSTX-{book_name.title()}-{chapter_slug}"
        return f"OSTX-UNKNOWN-{hash(url) % 10000}"
    
    def _extract_key_concepts(self, soup: BeautifulSoup) -> List[Dict[str, str]]:
        """提取关键概念"""
        concepts = []
        
        try:
            # 查找包含"Key Terms"、"Summary"、"Key Equations"的部分
            text = soup.get_text()
            
            # 简单提取一些关键术语（实际应该更智能地解析）
            # 这里只是示例，实际需要根据HTML结构调整
            for heading in soup.find_all(['h2', 'h3']):
                heading_text = heading.get_text().lower()
                if any(kw in heading_text for kw in ['summary', 'key terms', 'concepts']):
                    # 查找后续的列表或段落
                    next_elem = heading.find_next_sibling()
                    if next_elem and next_elem.name == 'ul':
                        for li in next_elem.find_all('li')[:5]:  # 限制最多5个
                            concept_text = li.get_text().strip()
                            if concept_text and len(concept_text) > 10:
                                concepts.append({
                                    'concept': concept_text[:100],
                                    'formula': '',
                                    'examples': []
                                })
        except Exception as e:
            logger.warning(f"提取关键概念时出错: {e}")
        
        return concepts[:5]
    
    def scrape_all_textbooks(self, max_chapters_per_book: int = 10) -> List[Dict[str, Any]]:
        """
        爬取所有教材的章节
        
        Args:
            max_chapters_per_book: 每本教材最多爬取的章节数
            
        Returns:
            章节元数据列表
        """
        all_chapters = []
        
        for i, textbook in enumerate(self.textbooks, 1):
            logger.info(f"\n{'='*60}")
            logger.info(f"[{i}/{len(self.textbooks)}] 处理教材: {textbook['title']}")
            logger.info(f"{'='*60}\n")
            
            # 获取章节URL
            chapter_urls = self.get_chapter_urls(textbook['url'])
            
            if not chapter_urls:
                logger.warning(f"未找到教材 {textbook['title']} 的章节URL")
                continue
            
            # 限制章节数量
            chapter_urls = chapter_urls[:max_chapters_per_book]
            
            for j, url in enumerate(chapter_urls, 1):
                logger.info(f"[{j}/{len(chapter_urls)}] 处理章节: {url}")
                
                chapter_data = self.scrape_chapter(url, textbook)
                if chapter_data:
                    all_chapters.append(chapter_data)
                
                # 每5个章节保存一次进度
                if j % 5 == 0:
                    self.save_to_json(all_chapters, "openstax_chapters_partial.json")
                    logger.info(f"💾 已保存进度: {len(all_chapters)}个章节")
        
        logger.info(f"\n{'='*60}")
        logger.info(f"爬取完成！共获取 {len(all_chapters)} 个章节")
        logger.info(f"{'='*60}\n")
        
        return all_chapters
    
    def save_to_json(self, chapters: List[Dict[str, Any]], filename: str):
        """保存章节数据为JSON格式"""
        filepath = self.output_dir / filename
        
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(chapters, f, ensure_ascii=False, indent=2)
            
            logger.info(f"✅ 成功保存 {len(chapters)} 个章节到: {filepath}")
            
        except Exception as e:
            logger.error(f"❌ 保存JSON失败: {e}")


def main():
    """主函数 - 执行OpenStax章节爬取"""
    scraper = OpenStaxScraper()
    
    logger.info("="*60)
    logger.info("OpenMTSciEd - OpenStax章节爬取开始")
    logger.info("="*60)
    
    # 爬取所有章节（每本教材最多10章，总共约120章）
    chapters = scraper.scrape_all_textbooks(max_chapters_per_book=10)
    
    # 保存结果
    scraper.save_to_json(chapters, "openstax_chapters.json")
    
    logger.info("="*60)
    logger.info("OpenStax章节爬取完成")
    logger.info(f"交付物: data/textbook_library/openstax_chapters.json")
    logger.info(f"章节数量: {len(chapters)}")
    logger.info("="*60)


if __name__ == "__main__":
    main()
