# 数据获取指南

本指南说明如何为 OpenMTSciEd 项目获取真实的教育资源数据，替换当前的示例数据。

## 📚 课程库资源

### 1. OpenSciEd (K-12 现象驱动课程)

**官方资源**: https://www.openscied.org/

#### 获取方式

**选项 A: 手动下载（推荐初期使用）**
```bash
# 1. 访问 https://www.openscied.org/curriculum/
# 2. 选择年级（6-8年级为主）
# 3. 下载每个单元的 PDF 文件（教师手册、学生手册、实验清单）
# 4. 保存到 data/raw/openscied/ 目录

mkdir -p data/raw/openscied
# 手动下载后放置于此
```

**选项 B: 联系官方获取 API（长期方案）**
```bash
# 发送邮件至 curriculum@openscied.org
# 请求内容：
# - 课程单元元数据（JSON/CSV格式）
# - 知识点列表
# - 实验材料清单
# - 跨学科关联信息
```

**解析脚本**: `scripts/parsers/course_library_parser.py`
```python
# 当前状态: 示例实现
# 待完善: 实现真实的 PDF 文本提取逻辑
# 需要安装: pip install PyPDF2 pdfplumber
```

---

### 2. 格物斯坦开源硬件课程

**官方资源**: https://www.gewustan.com/courses

#### 获取方式

**Web 爬取**
```bash
# 1. 使用 BeautifulSoup 解析课程页面
# 2. 提取课程模块、硬件清单、项目任务
# 3. 保存为 JSON 格式

python scripts/parsers/course_library_parser.py --source gewustan
```

**注意事项**:
- 遵守 robots.txt 规则
- 添加请求延迟（`time.sleep(1)`）避免服务器压力
- 仅爬取公开课程信息

---

### 3. stemcloud.cn 全学科课程

**官方资源**: http://stemcloud.cn/

#### 获取方式

**API 请求（如有）**
```python
import requests

response = requests.get("http://stemcloud.cn/api/courses")
courses = response.json()

# 保存到 data/raw/stemcloud_courses.json
with open("data/raw/stemcloud_courses.json", "w", encoding="utf-8") as f:
    json.dump(courses, f, ensure_ascii=False, indent=2)
```

**手动整理**
- 若无公开 API，需手动浏览网站并记录课程分类、难度、关联硬件等信息

---

## 📖 课件库资源

### 1. OpenStax 大学/高中教材

**官方资源**: https://openstax.org/subjects

**许可证**: CC BY 4.0（可自由使用、修改、分发）

#### 获取方式

**直接下载 HTML/PDF**
```bash
# 1. 访问 https://openstax.org/details/books
# 2. 选择学科（物理、化学、生物、工程）
# 3. 下载 Web View HTML 或 PDF 版本
# 4. 保存到 data/raw/openstax/

mkdir -p data/raw/openstax/physics
mkdir -p data/raw/openstax/chemistry
mkdir -p data/raw/openstax/biology
```

**解析章节结构**
```python
# 使用 BeautifulSoup 解析 HTML
from bs4 import BeautifulSoup

with open("data/raw/openstax/physics/chapter1.html", "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f, "html.parser")
    
    # 提取章节标题、先修知识点、习题
    chapters = soup.find_all("section", class_="chapter")
```

**优势**: 
- ✅ 完全免费且开放许可
- ✅ 结构化良好（HTML 格式）
- ✅ 包含例题、习题、教师资源包

---

### 2. TED-Ed STEM 课程

**官方资源**: https://ed.ted.com/lessons?category=STEM

**使用条款**: 合理使用（Fair Use），仅限教育目的

#### 获取方式

**Web 爬取**
```python
import requests
from bs4 import BeautifulSoup

url = "https://ed.ted.com/lessons?category=STEM"
response = requests.get(url)
soup = BeautifulSoup(response.text, "html.parser")

# 提取课程主题、关联演讲、知识点摘要
lessons = []
for lesson in soup.find_all("div", class_="lesson-card"):
    title = lesson.find("h3").text
    link = lesson.find("a")["href"]
    lessons.append({"title": title, "link": link})
```

**注意事项**:
- ⚠️ 不得用于商业用途
- ⚠️ 需标注来源
- ⚠️ 建议仅提取元数据（标题、摘要），不存储视频内容

---

### 3. 《STEM-PBL教学标准》

**获取方式**: 
- 联系中国教育学会或相关标准化组织
- 或通过学术数据库（CNKI、万方）检索相关文献

---

## 🛠️ 数据处理流程

### 步骤 1: 原始数据收集

```bash
# 创建目录结构
mkdir -p data/raw/{openscied,gewustan,stemcloud,openstax,ted_ed}

# 下载/爬取数据到对应目录
```

### 步骤 2: 运行解析器

```bash
# 课程库解析
python scripts/parsers/course_library_parser.py

# 课件库解析
python scripts/parsers/textbook_library_parser.py
```

### 步骤 3: 验证输出

```bash
# 检查生成的 CSV/JSON 文件
ls -lh data/course_library/
ls -lh data/textbook_library/

# 查看示例数据
head -n 5 data/course_library/openscied_units.csv
```

### 步骤 4: 导入 Neo4j

```bash
# 执行图谱数据导入
python scripts/graph_db/data_importer.py

# 运行验证测试
python scripts/graph_db/validation_tests.py
```

---

## 📊 数据质量标准

### 必需字段

**课程库单元** (`openscied_units.csv`)
```csv
id,title,source,grade_level,duration_weeks,knowledge_points,hardware_materials,cross_disciplinary_links
OS-Unit-001,生态系统能量流动,OpenSciEd,7年级,6,"光合作用;食物链","传感器;Arduino","编程模拟种群增长"
```

**课件库章节** (`openstax_chapters.csv`)
```csv
id,title,source,subject,prerequisites,key_formulas,example_problems
OS-Physics-Ch05,牛顿运动定律,OpenStax,物理,"矢量运算;微积分","F=ma;∑F=dp/dt","简谐运动推导"
```

### 完整性检查

```python
# 验证脚本示例
import pandas as pd

df = pd.read_csv("data/course_library/openscied_units.csv")

# 检查必填字段
required_fields = ["id", "title", "knowledge_points"]
missing = df[required_fields].isnull().sum()
print(f"缺失值统计:\n{missing}")

# 检查重复 ID
duplicates = df["id"].duplicated().sum()
print(f"重复ID数量: {duplicates}")
```

---

## 🔗 知识图谱关联规则

### 递进关系示例

```cypher
// OpenSciEd 电路基础 → OpenStax 大学物理电路分析
MATCH (course:CourseUnit {id: "OS-Unit-003"}),
      (textbook:TextbookChapter {id: "OS-Physics-Ch12"})
CREATE (course)-[:LEADS_TO {strength: 0.9}]->(textbook)
```

### 硬件映射示例

```cypher
// 课程库项目 → 课件库理论
MATCH (project:HardwareProject {id: "HW-Arduino-Weather"}),
      (theory:TextbookChapter {id: "OS-Physics-Ch08"})
CREATE (project)-[:APPLIES_THEORY {concept: "传感器原理"}]->(theory)
```

---

## ⚠️ 法律与合规注意事项

### 版权许可

| 资源 | 许可证 | 商用 | 修改 | 分发 | 署名要求 |
|------|--------|------|------|------|---------|
| OpenStax | CC BY 4.0 | ✅ | ✅ | ✅ | 必须 |
| OpenSciEd | CC BY 4.0 | ✅ | ✅ | ✅ | 必须 |
| TED-Ed | Fair Use | ❌ | ❌ | ❌ | 必须 |
| 格物斯坦 | 未知 | 需确认 | 需确认 | 需确认 | 需确认 |
| stemcloud.cn | 未知 | 需确认 | 需确认 | 需确认 | 需确认 |

### 最佳实践

1. **仅提取元数据**: 不存储完整教材内容，仅记录章节结构、知识点列表
2. **提供原文链接**: 在知识图谱中存储资源 URL，而非内容副本
3. **标注来源**: 所有数据必须包含 `source` 字段
4. **遵守 robots.txt**: 爬取前检查网站的爬虫协议

---

## 📞 获取帮助

- **技术问题**: 提交 GitHub Issue
- **数据合作**: 联系 contact@imato.edu
- **法律咨询**: 参考各资源的官方许可协议

---

**最后更新**: 2026-04-10  
**维护者**: OpenMTSciEd 数据团队
