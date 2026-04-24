# 爬虫代码归拢说明

## 当前状态

### 1. 分散的爬虫脚本（scripts/scrapers/）
- 16 个独立的爬虫脚本
- 每个脚本独立完成特定网站的爬取
- 无法统一管理、调度和监控

### 2. 爬虫管理 API（backend/openmtscied/api/crawler_api.py）
- 提供爬虫任务的 CRUD 操作
- 支持定时任务调度
- 但目前没有实际绑定爬虫逻辑

### 3. 爬虫配置文件（data/crawler_configs.json）
- 定义爬虫任务的元数据
- 包含 5 个预设爬虫任务

## 归拢方案

### 阶段 1：创建统一爬虫模块（已完成）
- ✅ 创建 `backend/openmtscied/crawlers/` 目录
- ✅ 实现爬虫注册表机制
- ✅ 添加 `get_available_crawlers()` 和 `get_crawler_handler()` 接口

### 阶段 2：迁移现有爬虫（待执行）

需要迁移的爬虫脚本：
```
scripts/scrapers/
├── openscied_scraper.py          → crawlers/openscied_crawler.py
├── openstax_scraper.py           → crawlers/openstax_crawler.py
├── scrape_bnu_shanghai_k12.py    → crawlers/bnu_crawler.py
├── generate_khan_academy.py      → crawlers/khan_crawler.py
├── generate_coursera_courses.py  → crawlers/coursera_crawler.py
└── ... (其他爬虫脚本)
```

### 阶段 3：改造爬虫为统一格式

每个爬虫需要改造成以下格式：

```python
# 示例：crawlers/openscied_crawler.py
from crawlers import register_crawler

def crawl_openscied(config: dict) -> dict:
    """
    爬取 OpenSciEd 教学单元
    
    Args:
        config: 爬虫配置，包含 target_url 等
        
    Returns:
        {
            "success": bool,
            "total_items": int,
            "scraped_items": int,
            "data": [...]
        }
    """
    # 爬虫逻辑
    pass

# 注册爬虫
register_crawler(
    crawler_id="openscied_units",
    name="OpenSciEd Units",
    handler=crawl_openscied,
    description="爬取 OpenSciEd 所有教学单元"
)
```

### 阶段 4：修改 crawler_api.py 调用爬虫

```python
@router.post("/crawlers/{crawler_id}/run")
async def run_crawler(crawler_id: str, background_tasks: BackgroundTasks):
    """运行指定爬虫"""
    try:
        # 获取爬虫配置
        configs = load_configs()
        crawler_config = next((c for c in configs if c['id'] == crawler_id), None)
        if not crawler_config:
            raise HTTPException(status_code=404, detail="Crawler not found")
        
        # 获取爬虫处理函数
        handler = get_crawler_handler(crawler_id)
        
        # 异步执行爬虫
        background_tasks.add_task(execute_crawl_with_handler, crawler_config, handler)
        
        return {"success": True, "message": f"Crawler {crawler_id} started"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def execute_crawl_with_handler(config: dict, handler):
    """使用注册的处理器执行爬虫"""
    try:
        result = await handler(config)
        # 更新状态和保存数据
        update_crawler_status(config['id'], result)
        save_crawled_data(config['type'], result['data'])
    except Exception as e:
        update_crawler_status(config['id'], {"success": False, "error": str(e)})
```

## 优势

1. **统一管理**：所有爬虫集中在 `crawlers/` 目录
2. **易于扩展**：新增爬虫只需实现 handler 并注册
3. **统一监控**：API 层统一处理状态、进度、错误
4. **代码复用**：避免重复的爬虫框架代码

## 下一步行动

1. 选择一个爬虫（建议从 openscied_scraper.py 开始）
2. 按照上述格式改造
3. 测试 API 调用
4. 逐步迁移其他爬虫
