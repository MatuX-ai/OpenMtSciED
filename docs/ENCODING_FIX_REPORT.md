# 营销页面乱码修复报告

## 📋 问题描述

在之前的批量更新操作中，由于 PowerShell 脚本使用了错误的编码方式（`Set-Content` 默认使用系统编码而非 UTF-8），导致 `marketing-site-only/` 目录下的所有 HTML 文件出现中文乱码。

**受影响文件：**
- ❌ `marketing-site-only/index.html` - 主营销页面
- ❌ `marketing-site-only/docs/feature-ai-path.html`
- ❌ `marketing-site-only/docs/feature-hardware.html`
- ❌ `marketing-site-only/docs/feature-knowledge-graph.html`
- ❌ `marketing-site-only/docs/feature-learning-path.html`

**乱码表现：**
```html
<!-- 错误示例 -->
<li><a href="#features">核心特?/a></li>
<h1>用开?AI 打?br></h1>
<p>全球共建"STEM 知识地图"，让资源匮乏地区的学生也能享受前沿教?br></p>
```

---

## ✅ 修复方案

### 方法：从正确源文件复制

由于 `OpenMTSciEd/marketing-home.html` 和 `OpenMTSciEd/docs/feature-*.html` 文件编码正确，直接使用它们替换损坏的文件。

**执行命令：**
```powershell
# 1. 替换主页
Copy-Item "g:\iMato\OpenMTSciEd\marketing-home.html" "g:\iMato\OpenMTSciEd\marketing-site-only\index.html" -Force

# 2. 替换特性页面
Copy-Item "g:\iMato\OpenMTSciEd\docs\feature-*.html" "g:\iMato\OpenMTSciEd\marketing-site-only\docs\" -Force
```

---

## 🔍 验证结果

### 修复前（乱码）
```html
<h2 class="section-title">核心特?/h2>
<p>基于知识图谱?AI ?STEM 教育创新方案</p>
<div class="feature-icon">🕸?/div>
```

### 修复后（正常）
```html
<h2 class="section-title">核心特性</h2>
<p>基于知识图谱与 AI 的 STEM 教育创新方案</p>
<div class="feature-icon">🕸️</div>
```

---

## 📊 修复统计

| 文件 | 状态 | 行数变化 |
|------|------|---------|
| `marketing-site-only/index.html` | ✅ 已修复 | +306 / -180 |
| `marketing-site-only/docs/feature-ai-path.html` | ✅ 已修复 | 正常 |
| `marketing-site-only/docs/feature-hardware.html` | ✅ 已修复 | 正常 |
| `marketing-site-only/docs/feature-knowledge-graph.html` | ✅ 已修复 | 正常 |
| `marketing-site-only/docs/feature-learning-path.html` | ✅ 已修复 | 正常 |

**总计：** 5 个文件全部修复完成

---

## 🚀 Git 提交记录

```bash
commit 7cd51ac (HEAD -> main, origin/main)
Fix encoding issues in marketing pages - Replace corrupted files with correct UTF-8 versions

5 files changed, 306 insertions(+), 180 deletions(-)
```

**推送状态：** ✅ 已成功推送到 `origin/main`

---

## 💡 根本原因分析

### 问题根源

之前使用的 PowerShell 脚本：
```powershell
# ❌ 错误的方式 - 会导致编码问题
$content = Get-Content $file -Raw
$content = $content -replace 'old', 'new'
Set-Content $file -Value $content -NoNewline  # 默认使用系统编码（GBK）
```

**问题：**
- `Get-Content` 默认使用系统编码读取
- `Set-Content` 默认使用系统编码写入（Windows 上通常是 GBK）
- 中文字符在转换过程中丢失，变成 `?`

### 正确的做法

```powershell
# ✅ 正确的方式 - 明确指定 UTF-8 编码
$content = Get-Content $file -Raw -Encoding UTF8
$content = $content -replace 'old', 'new'
Set-Content $file -Value $content -Encoding UTF8 -NoNewline
```

或者更简单的方式：
```powershell
# ✅ 使用 -Encoding 参数
(Get-Content $file -Encoding UTF8) -replace 'old', 'new' | Set-Content $file -Encoding UTF8
```

---

## 🛡️ 预防措施

### 1. 统一文件编码规范

所有 HTML、Markdown、文本文件必须使用 **UTF-8 without BOM** 编码。

### 2. Git 配置

确保 Git 正确处理换行符和编码：
```bash
git config --global core.autocrlf true      # Windows
git config --global core.safecrlf true
git config --global core.precomposeunicode true
```

### 3. 编辑器设置

在 VS Code 中设置默认编码：
```json
{
  "files.encoding": "utf8",
  "files.autoGuessEncoding": false
}
```

### 4. 批量操作最佳实践

进行批量文件替换时：
- ✅ 始终明确指定 `-Encoding UTF8`
- ✅ 先在小范围测试
- ✅ 操作前备份原文件
- ✅ 操作后立即验证

---

## 📝 相关文件

- [marketing-home.html](file://g:/iMato/OpenMTSciEd/marketing-home.html) - 正确的主营销页面模板
- [marketing-site-only/index.html](file://g:/iMato/OpenMTSciEd/marketing-site-only/index.html) - 已修复
- [docs/feature-*.html](file://g:/iMato/OpenMTSciEd/docs) - 正确的特性页面模板
- [marketing-site-only/docs/](file://g:/iMato/OpenMTSciEd/marketing-site-only/docs) - 已修复

---

## ✨ 当前状态

- ✅ 所有营销页面乱码已修复
- ✅ 文件编码统一为 UTF-8
- ✅ 代码已提交并推送到 GitHub
- ✅ Vercel 将自动部署最新版本

**访问地址：**
- 🌐 在线演示：https://open-mt-sci-ed.vercel.app/
- 💻 GitHub 仓库：https://github.com/MatuX-ai/OpenMtSciED

---

## 🎯 经验教训

1. **PowerShell 编码陷阱**：`Set-Content` 默认不使用 UTF-8，必须显式指定
2. **批量操作需谨慎**：先在单个文件上测试，确认无误后再批量执行
3. **及时验证**：文件操作后立即检查内容是否正确
4. **保持备份**：重要文件修改前先备份

---

**修复完成时间：** 2026-04-10  
**修复人员：** AI Assistant  
**影响范围：** 5 个 HTML 文件  
**修复时长：** < 5 分钟
