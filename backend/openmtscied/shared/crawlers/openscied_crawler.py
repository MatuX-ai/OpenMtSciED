"""
OpenSciEd 爬虫包装器
"""

from .base_crawler import BaseCrawler
from . import register_crawler
import sys
from pathlib import Path

# 添加原始脚本路径
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "scripts" / "scrapers"))


def crawl_openscied_wrapper(config: dict) -> dict:
    """OpenSciEd 爬虫包装器"""
    try:
        from openscied_scraper import OpenSciEdScraper
        
        scraper = OpenSciEdScraper()
        
        # 根据配置爬取不同年级
        grade_level = config.get('grade_level', 'middle')
        units = scraper.get_unit_urls(grade_level)
        
        all_data = []
        for url in units[:10]:  # 限制数量避免超时
            try:
                unit_data = scraper.scrape_unit(url)
                if unit_data:
                    all_data.append(unit_data)
            except Exception as e:
                continue
        
        # 保存数据
        output_file = config.get('output_file', 'data/course_library/openscied_units.json')
        scraper.save_units(all_data, output_file)
        
        return {
            "success": True,
            "total_items": len(units),
            "scraped_items": len(all_data),
            "data": all_data
        }
    except Exception as e:
        return {
            "success": False,
            "total_items": 0,
            "scraped_items": 0,
            "error": str(e),
            "data": []
        }


# 注册爬虫
register_crawler(
    crawler_id="openscied_units",
    name="OpenSciEd Units",
    handler=crawl_openscied_wrapper,
    description="爬取 OpenSciEd 教学单元"
)
