"""
BNU Shanghai K12 爬虫包装器
"""

from . import register_crawler
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "scripts" / "scrapers"))


def crawl_bnu_shanghai_wrapper(config: dict) -> dict:
    """BNU Shanghai 爬虫包装器"""
    try:
        from scrape_bnu_shanghai_k12 import scrape_bnu_shanghai_k12
        
        courses = scrape_bnu_shanghai_k12()
        
        output_file = config.get('output_file', 'data/course_library/bnu_shanghai_k12_courses.json')
        Path(output_file).parent.mkdir(parents=True, exist_ok=True)
        
        import json
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(courses, f, ensure_ascii=False, indent=2)
        
        return {
            "success": True,
            "total_items": len(courses),
            "scraped_items": len(courses),
            "data": courses
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
    crawler_id="bnu_shanghai_k12",
    name="BNU Shanghai K12",
    handler=crawl_bnu_shanghai_wrapper,
    description="爬取北师大上海K12课程"
)
