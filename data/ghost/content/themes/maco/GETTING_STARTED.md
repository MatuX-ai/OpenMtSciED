# Maco Theme - 快速上手指南

## 🎉 恭喜！

全新的 Mac 风格 Ghost 主题已经开发完成！现在你可以在 Ghost CMS 中激活它了。

## 📋 激活步骤

### 1. 确认主题已就绪

主题文件位置：
```
data/ghost/content/themes/maco/
```

包含文件：
- ✅ 核心布局 (default.hbs)
- ✅ 首页模板 (index.hbs)
- ✅ 文章页面 (post.hbs)
- ✅ 静态页面 (page.hbs)
- ✅ 标签页面 (tag.hbs)
- ✅ 作者页面 (author.hbs)
- ✅ 404 页面 (error.hbs)
- ✅ 全局样式 (global.css)
- ✅ JavaScript (main.js)
- ✅ 组件 partials

### 2. 在 Ghost Admin 中激活

**方法 A: 如果 Ghost 是本地运行**

1. 打开 Ghost Admin: `http://localhost:2368/ghost`
2. 进入 Settings → Theme
3. 点击 "Change theme"
4. 找到 "Maco" 主题
5. 点击 "Activate"

**方法 B: 如果是生产环境**

由于主题是直接添加到文件系统的，需要重启 Ghost:

```bash
# 如果使用 systemd
sudo systemctl restart ghost

# 如果使用 Docker
docker restart <container-name>

# 如果使用 PM2
pm2 restart ghost
```

然后访问 Ghost Admin 激活主题。

### 3. 自定义主题

激活后，在 Ghost Admin → Settings → Theme 中可以自定义：

#### Header 设置
```yaml
Header Style: light  # 可选：light, dark, transparent
```

#### Hero 区域设置
```yaml
Show Hero: ✓ (启用)
Hero Title: "欢迎来到 iMatu"
Hero Subtitle: "探索技术、创新与灵感的交汇点"
Hero CTA Text: "开始使用"
Hero CTA URL: "/getting-started"
Hero Secondary CTA Text: "了解更多"
Hero Secondary CTA URL: "/about"
```

#### 功能开关
```yaml
Show Featured Posts: ✓ (显示精选文章)
Enable Search: ✓ (启用搜索功能)
Accent Color: #007AFF (Apple Blue)
```

### 4. 配置导航菜单

在 Ghost Admin → Settings → Navigation 中设置菜单：

**Primary Navigation:**
```
Home (/) 
Blog (/blog/)
Features (/features/)
Pricing (/pricing/)
Contact (/contact/)
About (/about/)
```

### 5. 创建营销页面示例

#### 价格页面

创建新页面 `/pricing/`，使用以下 HTML：

```html
<div class="pricing-table">
  <div class="pricing-card">
    <h3 class="pricing-name">基础版</h3>
    <div class="pricing-price">¥0</div>
    <div class="pricing-period">永久免费</div>
    <ul class="pricing-features">
      <li>基础功能访问</li>
      <li>社区支持</li>
      <li>1GB 存储空间</li>
    </ul>
    <a href="/signup/?plan=basic" class="btn btn-secondary btn-large" style="width: 100%;">免费开始</a>
  </div>
  
  <div class="pricing-card featured">
    <h3 class="pricing-name">专业版</h3>
    <div class="pricing-price">¥99</div>
    <div class="pricing-period">每月</div>
    <ul class="pricing-features">
      <li>全部功能</li>
      <li>优先支持</li>
      <li>100GB 存储空间</li>
      <li>数据分析</li>
    </ul>
    <a href="/signup/?plan=pro" class="btn btn-primary btn-large" style="width: 100%;">立即试用</a>
  </div>
  
  <div class="pricing-card">
    <h3 class="pricing-name">企业版</h3>
    <div class="pricing-price">定制</div>
    <div class="pricing-period">联系销售</div>
    <ul class="pricing-features">
      <li>定制化解决方案</li>
      <li>专属客户经理</li>
      <li>无限存储</li>
      <li>SLA 保障</li>
    </ul>
    <a href="/contact-sales" class="btn btn-secondary btn-large" style="width: 100%;">联系我们</a>
  </div>
</div>
```

#### 功能展示页面

创建新页面 `/features/`：

```html
<div class="feature-grid">
  <div class="feature-card">
    <div class="feature-icon">
      <!-- SVG Icon Here -->
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
      </svg>
    </div>
    <h4>强大功能</h4>
    <p>内置丰富的功能模块，满足各种业务需求</p>
  </div>
  
  <div class="feature-card">
    <div class="feature-icon">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
    </div>
    <h4>安全可靠</h4>
    <p>企业级安全防护，保护您的数据安全</p>
  </div>
  
  <div class="feature-card">
    <div class="feature-icon">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
    </div>
    <h4>全球加速</h4>
    <p>CDN 全球节点，快速访问无延迟</p>
  </div>
</div>

<!-- CTA Section -->
<div class="cta-section">
  <h2 class="cta-title">准备好开始了吗？</h2>
  <p class="cta-description">加入数千名满意用户的行列，立即开启您的成功之旅</p>
  <div class="cta-actions">
    <a href="/signup/" class="btn btn-primary btn-large">免费注册</a>
    <a href="/demo/" class="btn btn-secondary btn-large">预约演示</a>
  </div>
</div>
```

### 6. 测试检查清单

激活主题后，请检查以下内容：

- [ ] 首页正常显示，Hero 区域可见
- [ ] 导航栏响应式工作（移动端汉堡菜单）
- [ ] 文章列表以卡片形式展示
- [ ] 点击文章能正常跳转
- [ ] 文章页面排版美观
- [ ] 图片懒加载生效
- [ ] 深色模式自动切换（如系统支持）
- [ ] 分页功能正常
- [ ] 404 页面可以正常访问
- [ ] 页脚链接正确

### 7. 性能优化建议

1. **图片优化**
   - 使用 WebP 格式
   - 压缩大图片
   - 添加适当的 alt 文本

2. **SEO 优化**
   - 为每篇文章添加 meta 描述
   - 使用语义化的标题
   - 添加结构化数据

3. **加载速度**
   - 启用 CDN
   - 开启 Gzip 压缩
   - 使用浏览器缓存

## 🎨 设计亮点

### Apple 风格元素

1. **渐变效果** - 微妙的渐变色背景
2. **毛玻璃效果** - 导航栏的 backdrop-filter
3. **平滑动画** - 所有交互都有流畅的过渡
4. **圆角设计** - 统一的圆角系统
5. **阴影层次** - 细腻的阴影层级

### 响应式断点

```css
/* Mobile First */
@media (max-width: 768px) {
  /* 移动端样式 */
}

@media (min-width: 769px) and (max-width: 1024px) {
  /* 平板样式 */
}

@media (min-width: 1025px) {
  /* 桌面样式 */
}
```

## 🔧 故障排除

### 主题不显示

1. 清除浏览器缓存
2. 重启 Ghost: `ghost restart`
3. 检查文件权限

### 样式不正常

1. 清除浏览器缓存 (Ctrl+Shift+R)
2. 检查 CSS 是否加载成功
3. 查看浏览器控制台错误

### 移动端菜单不工作

1. 检查 JavaScript 是否加载
2. 查看浏览器控制台错误
3. 确保 jQuery 未冲突

## 📞 技术支持

如有问题，请联系：
- Email: dev@imato.com
- GitHub: https://github.com/imato/maco-theme

---

**🍎 Enjoy your Mac-style Ghost theme!**
