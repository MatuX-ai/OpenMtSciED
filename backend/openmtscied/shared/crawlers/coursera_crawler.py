"""
Coursera 爬虫包装器
"""

from . import register_crawler
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "scripts" / "scrapers"))


def crawl_coursera_wrapper(config: dict) -> dict:
    """Coursera 爬虫包装器"""
    try:
        from generate_coursera_courses import generate_coursera_courses
        
        courses = generate_coursera_courses()
        
        output_file = config.get('output_file', 'data/course_library/coursera_courses.json')
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
    crawler_id="coursera_stem",
    name="Coursera STEM Courses",
    handler=crawl_coursera_wrapper,
    description="生成 Coursera 理工科课程"
)
