# 真实数据爬取模块使用指南

## 快速开始

### 1. 环境准备

确保已安装所需依赖：

```bash
pip install requests beautifulsoup4 lxml
```

### 2. 运行爬虫

#### OpenSciEd单元爬取

```bash
python scripts/scrapers/openscied_scraper.py
```

**输出文件：**
- `data/course_library/openscied_all_units.json` - 所有单元汇总
- `data/course_library/openscied_elementary_units.json` - 小学单元
- `data/course_library/openscied_middle_units.json` - 初中单元
- `data/course_library/openscied_high_school_units.json` - 高中单元

#### OpenStax章节生成

```bash
python scripts/scrapers/openstax_real_generator.py
```

**输出文件：**
- `data/textbook_library/openstax_chapters.json` - 所有章节数据

### 3. 验证数据

```bash
# 运行数据验证
python scripts/validate_data.py

# 运行综合测试
python scripts/test_real_data.py
```

## 数据结构

### OpenSciEd单元结构

```json
{
  "unit_id": "OS-6-1-light-and-matter",
  "title": "Light and Matter",
  "source": "openscied",
  "grade_level": "middle",
  "subject": "物理",
  "duration_weeks": 6,
  "phenomenon": "现象描述...",
  "description": "单元描述...",
  "knowledge_points": [...],
  "experiments": [...],
  "cross_discipline": ["数学", "工程"],
  "teacher_guide_url": "https://...",
  "student_handbook_url": "https://...",
  "ngss_standards": ["MS-PS2-3"],
  "unit_url": "https://www.openscied.org/resources/units/...",
  "scraped_at": "2026-04-18T..."
}
```

### OpenStax章节结构

```json
{
  "chapter_id": "OSTX-UPhys1-Ch1",
  "title": "单位和测量",
  "textbook": "University Physics Volume 1",
  "source": "openstax",
  "grade_level": "university",
  "subject": "物理",
  "chapter_url": "https://openstax.org/books/university-physics-volume-1/pages/1-introduction",
  "pdf_download_url": "https://openstax.org/details/books/university-physics-volume-1",
  "prerequisites": ["基础代数"],
  "key_concepts": [
    {
      "concept": "国际单位制",
      "formula": "",
      "examples": ["米、千克、秒"]
    }
  ],
  "exercises": [
    {
      "problem": "将光速转换为km/h",
      "difficulty": 1
    }
  ],
  "scraped_at": "2026-04-18T..."
}
```

## 自定义配置

### 修改爬取范围

编辑 `scripts/scrapers/openscied_scraper.py` 中的 `main()` 函数：

```python
# 只爬取特定年级
middle_units = scraper.scrape_all_units(grade_levels=['middle'])

# 爬取所有年级
all_units = []
for grade in ['elementary', 'middle', 'high']:
    units = scraper.scrape_all_units(grade_levels=[grade])
    all_units.extend(units)
```

### 添加新教材

编辑 `scripts/scrapers/openstax_real_generator.py` 中的 `textbooks_data` 列表：

```python
{
    "title": "新教材名称",
    "base_url": "https://openstax.org/books/...",
    "pdf_url": "https://openstax.org/details/books/...",
    "subject": "学科",
    "grade_level": "university",  # 或 "high"
    "chapters": [
        {"num": "1", "title": "章节标题", "slug": "1-chapter-name"},
        ...
    ]
}
```

## 故障排除

### 问题1：爬取速度慢

**解决方案：**
- 减少随机延迟时间（修改 `time.sleep(random.uniform(2, 5))`）
- 注意：不要设置太低，避免被网站封禁

### 问题2：404错误过多

**解决方案：**
- 检查URL是否正确
- 更新已知URL列表
- 网站可能已更改结构，需要调整爬虫逻辑

### 问题3：数据字段缺失

**解决方案：**
- 运行验证脚本检查具体问题
- 查看日志文件了解详细错误信息
- 手动修复有问题的数据条目

### 问题4：内存不足

**解决方案：**
- 分批处理数据
- 定期保存进度
- 增加系统虚拟内存

## 最佳实践

1. **定期更新数据**：建议每月运行一次爬虫获取最新内容
2. **备份数据**：爬取前备份现有数据文件
3. **检查日志**：每次运行后查看日志文件确认无错误
4. **验证数据**：运行验证脚本确保数据质量
5. **渐进式爬取**：首次运行时先测试少量数据

## 技术支持

如遇到问题，请检查：
1. 网络连接是否正常
2. 目标网站是否可访问
3. Python依赖是否完整安装
4. 日志文件中的错误信息

查看详细报告：`REAL_DATA_CRAWLER_COMPLETION_REPORT.md`
