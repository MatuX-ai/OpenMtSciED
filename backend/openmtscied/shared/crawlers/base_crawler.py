"""
爬虫基类
提供通用的爬虫功能
"""

import os
import json
import logging
import requests
from typing import Dict, Any, Optional
from pathlib import Path
from abc import ABC, abstractmethod
from datetime import datetime

logger = logging.getLogger(__name__)


class BaseCrawler(ABC):
    """爬虫基类"""
    
    def __init__(self, crawler_id: str, name: str, description: str = ""):
        self.crawler_id = crawler_id
        self.name = name
        self.description = description
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        })
    
    @abstractmethod
    def crawl(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        执行爬取
        
        Args:
            config: 爬虫配置
            
        Returns:
            {
                "success": bool,
                "total_items": int,
                "scraped_items": int,
                "data": list,
                "error": str (optional)
            }
        """
        pass
    
    def save_data(self, data: list, output_file: str):
        """保存爬取的数据"""
        output_path = Path(output_file)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # 如果文件已存在，合并数据
        existing_data = []
        if output_path.exists():
            try:
                with open(output_path, 'r', encoding='utf-8') as f:
                    existing_data = json.load(f)
            except:
                pass
        
        existing_data.extend(data)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(existing_data, f, ensure_ascii=False, indent=2)
        
        logger.info(f"Saved {len(data)} items to {output_file}")
    
    def load_session_from_config(self, config: Dict[str, Any]):
        """从配置加载会话参数"""
        if 'headers' in config:
            self.session.headers.update(config['headers'])
        if 'timeout' in config:
            self.session.timeout = config['timeout']
