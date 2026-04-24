"""
爬虫模块索引
统一管理所有爬虫任务
"""

from typing import Dict, Callable, List

# 爬虫注册表
CRAWLER_REGISTRY: Dict[str, Dict] = {}


def register_crawler(crawler_id: str, name: str, handler: Callable, description: str = ""):
    """注册爬虫到全局注册表"""
    CRAWLER_REGISTRY[crawler_id] = {
        "name": name,
        "handler": handler,
        "description": description
    }


def get_available_crawlers() -> List[Dict]:
    """获取所有已注册的爬虫"""
    return [
        {
            "id": crawler_id,
            "name": info["name"],
            "description": info["description"]
        }
        for crawler_id, info in CRAWLER_REGISTRY.items()
    ]


def get_crawler_handler(crawler_id: str) -> Callable:
    """获取指定爬虫的处理函数"""
    if crawler_id not in CRAWLER_REGISTRY:
        raise ValueError(f"爬虫 {crawler_id} 未注册")
    return CRAWLER_REGISTRY[crawler_id]["handler"]


# 导入所有爬虫，触发注册
from .openscied_crawler import *
from .openstax_crawler import *
from .khan_crawler import *
from .coursera_crawler import *
from .bnu_crawler import *
