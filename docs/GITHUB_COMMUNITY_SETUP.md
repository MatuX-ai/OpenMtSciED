# GitHub Community Discussion 配置指南

## 📋 启用 GitHub Discussions 功能

### 1. 在 GitHub 仓库中启用 Discussions

**操作步骤：**
1. 访问仓库：https://github.com/MatuX-ai/OpenMtSciED
2. 点击顶部导航栏的 **"Settings"**（设置）
3. 在左侧菜单找到 **"Features"** 部分
4. 勾选 **☑️ Discussions**
5. 点击 **"Save"** 保存

**完成后：**
- 仓库顶部会新增 "Discussions" 标签
- 访问地址：https://github.com/MatuX-ai/OpenMtSciED/discussions

---

## 💬 创建 Discussion 分类

### 推荐分类设置

| 分类名称 | Emoji | 描述 | 用途 |
|---------|-------|------|------|
| 📢 Announcements | 📢 | 项目公告 | 版本发布、重要通知 |
| 💡 Ideas | 💡 | 功能建议 | 用户提出新功能想法 |
| 🙋 Q&A | 🙋 | 问题讨论 | 技术问题解答 |
| 🐛 Bug Reports | 🐛 | Bug 反馈 | 问题报告（可关联 Issue） |
| 🤝 Show and Tell | 🤝 | 成果展示 | 用户分享项目成果 |
| 📚 Resources | 📚 | 学习资源 | 教育资料分享 |

**配置方法：**
1. 进入 Discussions 页面
2. 点击右上角 **"⚙️"** 设置图标
3. 选择 **"Manage labels"**
4. 点击 **"Edit"** 添加/编辑分类

---

## 📧 邮件订阅功能实现方案

### 方案 1：GitHub 内置通知（最简单）

**优点：**
- ✅ 无需额外配置
- ✅ GitHub 自动管理
- ✅ 支持多种通知类型

**使用方法：**
1. 用户访问 Discussions 页面
2. 点击右上角 **"🔔 Watch"** 按钮
3. 选择通知级别：
   - **All Activity** - 接收所有活动通知
   - **Participating & @mentions** - 仅接收参与的话题
   - **Custom** - 自定义通知类别

### 方案 2：使用 GitHub Actions + 邮件服务

**技术栈：**
- GitHub Actions（自动化）
- SendGrid / Mailgun（邮件发送）
- JSON 文件存储订阅者列表

**实现步骤：**

#### 2.1 创建订阅者数据文件

```json
// subscribers.json
{
  "subscribers": [
    {
      "email": "user@example.com",
      "subscribed_at": "2026-04-10T12:00:00Z",
      "preferences": ["announcements", "releases"]
    }
  ]
}
```

#### 2.2 创建订阅表单后端 API

```javascript
// api/subscribe.js (可以使用 Vercel Serverless Functions)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  
  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // 添加到订阅列表（这里简化处理，实际应使用数据库）
  const fs = require('fs');
  const path = require('path');
  const subscribersFile = path.join(process.cwd(), 'subscribers.json');
  
  let data = { subscribers: [] };
  if (fs.existsSync(subscribersFile)) {
    data = JSON.parse(fs.readFileSync(subscribersFile, 'utf8'));
  }

  // 检查是否已订阅
  if (data.subscribers.some(s => s.email === email)) {
    return res.status(409).json({ error: 'Already subscribed' });
  }

  // 添加新订阅者
  data.subscribers.push({
    email,
    subscribed_at: new Date().toISOString(),
    preferences: ['all']
  });

  fs.writeFileSync(subscribersFile, JSON.stringify(data, null, 2));
  
  return res.status(200).json({ message: 'Subscribed successfully' });
}
```

#### 2.3 创建 GitHub Action 发送更新邮件

```yaml
# .github/workflows/send-update-email.yml
name: Send Update Email

on:
  release:
    types: [published]
  discussion:
    types: [created]

jobs:
  send-email:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Get Subscribers
        id: subscribers
        run: |
          echo "::set-output name=list::$(cat subscribers.json)"
      
      - name: Send Email via SendGrid
        uses: dawidd6/action-send-mail@v3
        with:
          server_address: smtp.sendgrid.net
          server_port: 587
          username: ${{ secrets.SENDGRID_USERNAME }}
          password: ${{ secrets.SENDGRID_API_KEY }}
          subject: "OpenMTSciEd 更新通知"
          body: |
            新版本已发布！
            
            版本: ${{ github.event.release.tag_name }}
            链接: ${{ github.event.release.html_url }}
            
            查看完整更新日志了解详细信息。
          to: ${{ steps.subscribers.outputs.list }}
          from: OpenMTSciEd Team <noreply@open-mt-sci-ed.vercel.app>
```

### 方案 3：使用第三方服务（推荐）

**推荐服务：**

| 服务 | 免费额度 | 特点 | 集成难度 |
|------|---------|------|---------|
| **Mailchimp** | 500 联系人 | 功能强大，模板丰富 | ⭐⭐ |
| **ConvertKit** | 1000 订阅者 | 开发者友好 | ⭐ |
| **Buttondown** | 100 订阅者 | 极简主义 | ⭐ |
| **Substack** | 无限 | 适合内容创作者 | ⭐ |

**以 ConvertKit 为例：**

#### 3.1 注册并获取表单代码

1. 访问 https://convertkit.com
2. 注册账号（免费）
3. 创建 Landing Page 或 Form
4. 复制嵌入代码

#### 3.2 替换营销页面的订阅表单

```html
<!-- 将现有的 subscribe-form 替换为 ConvertKit 代码 -->
<form action="https://app.convertkit.com/forms/YOUR_FORM_ID/subscriptions" 
      method="post" 
      class="seva-form formkit-form">
  <input type="email" 
         name="email_address" 
         placeholder="your@email.com" 
         required />
  <button type="submit" class="btn btn-primary">订阅</button>
</form>
```

---

## 🔗 营销页面导航链接优化

### 当前状态

✅ 已在导航栏添加"社区"链接
✅ 已添加社区板块（GitHub Discussions + Issue Tracker + 邮件订阅）
✅ GitHub 链接指向正确地址：`https://github.com/MatuX-ai/OpenMtSciED`

### 链接清单

| 位置 | 链接文本 | 目标 URL | 状态 |
|------|---------|----------|------|
| 导航栏 | 社区 | `#community` | ✅ |
| 导航栏 | GitHub | `https://github.com/MatuX-ai/OpenMtSciED` | ✅ |
| Hero 区域 | 🚀 快速开始 | `https://github.com/MatuX-ai/OpenMtSciED` | ✅ |
| 社区卡片 | 参与讨论 | `https://github.com/MatuX-ai/OpenMtSciED/discussions` | ✅ |
| 社区卡片 | 提交 Issue | `https://github.com/MatuX-ai/OpenMtSciED/issues` | ✅ |
| 页脚 | GitHub | `https://github.com/MatuX-ai/OpenMtSciED` | ✅ |
| 页脚 | 联系我们 | `mailto:3936318150@qq.com` | ✅ |

---

## 📊 社区运营最佳实践

### 1. 欢迎新用户

**创建 Welcome Discussion：**
```markdown
标题：👋 欢迎来到 OpenMTSciEd 社区！

大家好！这里是 OpenMTSciEd 开源项目的官方讨论区。

## 🎯 你可以在这里：
- 💡 提出功能建议和想法
- 🙋 询问技术问题
- 🤝 分享你的项目成果
- 📚 交流 STEM 教育资源

## 🚀 快速开始：
1. 浏览 [README](https://github.com/MatuX-ai/OpenMtSciED/blob/main/README.md) 了解项目
2. 查看 [贡献指南](CONTRIBUTING.md) 参与开发
3. 阅读 [部署文档](DEPLOYMENT_GUIDE.md) 搭建自己的实例

## 📧 联系方式：
- 邮箱：3936318150@qq.com
- 在线演示：https://open-mt-sci-ed.vercel.app/

期待你的参与！🎉
```

### 2. 定期发布公告

**发布频率：**
- 📅 每周：开发进度更新
- 📅 每月：版本发布公告
- 📅 每季度：路线图回顾

### 3. 鼓励用户贡献

**激励措施：**
- 🏆 在 README 中列出贡献者
- 🎖️ 为活跃贡献者授予特殊徽章
- 📝 撰写博客文章介绍优秀贡献

### 4. 及时响应

**响应时间目标：**
- 🐛 Bug 报告：24 小时内回复
- 💡 功能建议：48 小时内回复
- 🙋 技术问题：12 小时内回复

---

## 🎯 下一步行动清单

### 立即可做：
- [ ] 在 GitHub Settings 中启用 Discussions
- [ ] 创建 6 个讨论分类（Announcements, Ideas, Q&A, etc.）
- [ ] 发布第一条 Welcome Discussion
- [ ] 测试营销页面的订阅表单

### 短期（1-2 周）：
- [ ] 选择邮件订阅服务（推荐 ConvertKit）
- [ ] 集成邮件订阅表单到营销页面
- [ ] 设置 GitHub Actions 自动发送更新邮件
- [ ] 创建贡献者指南文档

### 中期（1 个月）：
- [ ] 建立社区管理规范
- [ ] 招募首批核心贡献者
- [ ] 举办线上 AMA（Ask Me Anything）活动
- [ ] 创建 Discord/Slack 即时通讯群组

---

## 📞 技术支持

如有任何问题，请联系：
- 📧 邮箱：3936318150@qq.com
- 💬 GitHub Issues：https://github.com/MatuX-ai/OpenMtSciED/issues
- 🌐 网站：https://open-mt-sci-ed.vercel.app/
