"""
OpenStax 爬虫包装器
"""

from .base_crawler import BaseCrawler
from . import register_crawler
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "scripts" / "scrapers"))


def crawl_openstax_wrapper(config: dict) -> dict:
    """OpenStax 爬虫包装器"""
    try:
        from openstax_scraper import OpenStaxScraper
        
        scraper = OpenStaxScraper()
        chapters = scraper.scrape_all_textbooks()
        
        output_file = config.get('output_file', 'data/textbook_library/openstax_chapters.json')
        scraper.save_chapters(chapters, output_file)
        
        return {
            "success": True,
            "total_items": len(scraper.textbooks),
            "scraped_items": len(chapters),
            "data": chapters
        }
    except Exception as e:
        return {
            "success": False,
            "total_items": 0,
            "scraped_items": 0,
            "error": str(e),
            "data": []
        }


register_crawler(
    crawler_id="openstax_textbooks",
    name="OpenStax Textbooks",
    handler=crawl_openstax_wrapper,
    description="爬取 OpenStax 教材章节"
)
