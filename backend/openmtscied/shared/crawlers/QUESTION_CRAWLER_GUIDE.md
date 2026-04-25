# 题库爬虫系统使用指南

## 📋 系统概述

题库爬虫系统用于从各大教育平台自动获取题目数据，并提供质量评估、去重和标准化处理功能。

### 核心功能

1. **自动化爬取**: 从OpenStax等教育平台抓取复习题目
2. **质量评估**: 自动检查题目完整性、估算难度
3. **去重处理**: 基于内容哈希的智能去重
4. **标准化**: 统一题目格式和元数据
5. **批量导入**: 将爬取的题目导入数据库

---

## 🏗️ 架构设计

```
backend/openmtscied/shared/crawlers/
├── base_question_crawler.py      # 题库爬虫基类
│   ├── QuestionQualityChecker    # 质量检查器
│   └── BaseQuestionCrawler       # 爬虫基类
├── openstax_question_crawler.py  # OpenStax题库爬虫
└── __init__.py                    # 爬虫注册表

scripts/data_processing/
└── import_question_data.py        # 题库数据导入脚本

data/question_library/             # 爬取的题目数据存储目录
```

---

## 🚀 快速开始

### 1. 运行测试

```bash
# 测试质量检查器（无需网络）
python tests/test_question_crawler.py

# 完整测试（需要网络连接）
python tests/test_question_crawler.py
# 当提示时输入 y
```

### 2. 爬取题目

#### 方式一：使用Python脚本

```python
from backend.openmtscied.shared.crawlers.openstax_question_crawler import OpenStaxQuestionCrawler

crawler = OpenStaxQuestionCrawler()

config = {
    'textbook': 'biology-2e',      # 教材名称
    'chapters': [1, 2, 3],         # 章节列表
    'output_file': 'biology_questions.json'
}

result = crawler.run(config)
print(f"成功爬取 {result['scraped_items']} 道题目")
```

#### 方式二：通过API调用

```bash
# 启动后端服务后，调用爬虫API
curl -X POST http://localhost:8000/api/v1/admin/crawlers/openstax_questions/run
```

### 3. 导入数据库

```bash
# 导入单个文件
python scripts/data_processing/import_question_data.py \
  --file data/question_library/openstax_biology_questions.json \
  --bank-id 1

# 导入所有题库文件
python scripts/data_processing/import_question_data.py --all
```

---

## 📖 配置说明

### 爬虫配置参数

| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| textbook | string | 教材名称 | `biology-2e`, `physics` |
| chapters | list | 章节列表 | `[1, 2, 3]` |
| base_url | string | 基础URL | `https://openstax.org/books` |
| output_file | string | 输出文件名 | `biology_questions.json` |

### 质量评估标准

题目质量评分（满分100分）：

- **题目内容** (30分): 必须有完整的题干
- **正确答案** (30分): 必须提供正确答案
- **题目类型** (20分): 必须指定题型
- **选择题选项** (20分): 选择题至少2个选项
- **题目解析** (10分): 建议提供解析

**合格标准**: ≥60分

---

## 🔧 扩展现有系统

### 添加新的题库爬虫

1. 创建新的爬虫类，继承 `BaseQuestionCrawler`

```python
from .base_question_crawler import BaseQuestionCrawler
from . import register_crawler

class MyQuestionCrawler(BaseQuestionCrawler):
    def __init__(self):
        super().__init__(
            crawler_id="my_questions",
            name="My Questions",
            description="我的题库爬虫"
        )
    
    def crawl_questions(self, config):
        # 实现爬取逻辑
        questions = []
        # ... 爬取代码 ...
        return questions

def crawl_my_questions_wrapper(config):
    crawler = MyQuestionCrawler()
    return crawler.run(config)

# 注册爬虫
register_crawler(
    crawler_id="my_questions",
    name="My Questions",
    handler=crawl_my_questions_wrapper,
    description="我的题库爬虫"
)
```

2. 在 `__init__.py` 中导入新爬虫

```python
from .my_question_crawler import *
```

3. 添加到配置文件 `data/crawler_configs.json`

```json
{
  "id": "my_questions",
  "name": "My Questions",
  "description": "我的题库爬虫",
  "type": "question_bank",
  "status": "idle"
}
```

---

## 📊 数据格式

### 题目数据结构

```json
{
  "content": "题目内容",
  "question_type": "multiple_choice",
  "options_json": ["选项A", "选项B", "选项C", "选项D"],
  "correct_answer": "选项B",
  "explanation": "题目解析",
  "difficulty": 0.6,
  "knowledge_points": ["biology", "cell"],
  "source": "openstax",
  "metadata": {
    "textbook": "biology-2e",
    "chapter": 1,
    "question_number": 5
  }
}
```

### 支持的题型

- `multiple_choice`: 选择题
- `true_false`: 判断题
- `short_answer`: 简答题
- `essay`: 论述题

---

## 🛠️ 常见问题

### Q1: 爬取速度慢怎么办？

A: 可以调整并发策略或减少每次爬取的章节数：

```python
config = {
    'chapters': [1],  # 每次只爬取1章
    # ...
}
```

### Q2: 如何处理反爬虫？

A: 在爬虫基类中添加请求延迟：

```python
import time
time.sleep(2)  # 每次请求间隔2秒
```

### Q3: 题目重复率高怎么办？

A: 系统已内置去重机制，基于内容哈希自动过滤重复题目。如需调整去重策略，修改 `generate_question_hash` 方法。

### Q4: 如何验证导入的数据？

```python
from backend.openmtscied.shared.models.db_models import SessionLocal, QuestionBank, Question

db = SessionLocal()

# 查看题库统计
banks = db.query(QuestionBank).all()
for bank in banks:
    print(f"{bank.name}: {bank.total_questions} 题")

db.close()
```

---

## 📈 性能优化建议

1. **批量处理**: 使用 `batch_size` 参数控制数据库提交频率
2. **增量爬取**: 记录已爬取的章节，避免重复爬取
3. **缓存机制**: 对已爬取的页面进行本地缓存
4. **异步处理**: 未来可改为异步爬虫提升速度

---

## 🔍 监控和维护

### 查看爬取日志

```bash
# 查看最近的爬取记录
ls -lt data/question_library/

# 检查导入状态
python scripts/data_processing/import_question_data.py --all
```

### 数据质量检查

```python
from backend.openmtscied.shared.crawlers.base_question_crawler import QuestionQualityChecker

checker = QuestionQualityChecker()

# 检查单道题目
quality = checker.check_completeness(question_data)
print(f"质量评分: {quality['score']}")
```

---

## 📝 待办事项

- [ ] 添加更多教育平台爬虫（Khan Academy, edX等）
- [ ] 实现智能难度分级算法
- [ ] 添加题目图片支持
- [ ] 实现题目版本管理
- [ ] 添加人工审核流程

---

## 🤝 贡献指南

欢迎提交新的题库爬虫或改进现有功能！

1. Fork 项目
2. 创建功能分支
3. 提交代码
4. 发起 Pull Request

---

**最后更新**: 2026-04-25  
**版本**: v1.0
