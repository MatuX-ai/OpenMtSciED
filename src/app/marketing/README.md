# 营销页面模块 (Marketing Module)

基于 Angular + Angular Material 构建的企业级营销页面系统。

## 📁 目录结构

```
src/app/marketing/
├── marketing.module.ts              # 营销模块定义
├── marketing-routing.module.ts      # 营销路由配置
├── marketing-home/                  # 营销首页
│   └── marketing-home.component.ts
├── product-showcase/                # 产品展示页
│   └── product-showcase.component.ts
├── pricing-page/                    # 价格方案页
│   └── pricing-page.component.ts
├── contact-us/                      # 联系我们页
│   └── contact-us.component.ts
├── about-us/                        # 关于我们页
│   └── about-us.component.ts
└── features-section/                # 功能特性页
    └── features-section.component.ts
```

## 🚀 功能特性

### 1. **营销首页** (`/marketing`)
- Hero 横幅展示
- 核心功能概览
- CTA（Call-to-Action）区域
- 响应式设计

### 2. **产品展示** (`/marketing/product`)
- 产品特性详细介绍
- 图文并茂的展示布局
- 功能亮点列表
- 交替式视觉设计

### 3. **价格方案** (`/marketing/pricing`)
- 多档位价格套餐
- 特色标签标注
- FAQ 常见问题
- 在线选型引导

### 4. **联系我们** (`/marketing/contact`)
- 联系表单验证
- 多种联系方式展示
- 社交媒体链接
- 实时反馈提示

### 5. **关于我们** (`/marketing/about`)
- 公司发展历程时间轴
- 核心团队介绍
- 企业价值观展示
- 使命与愿景

### 6. **功能特性** (`/marketing/features`)
- Tab 切换分类展示
- 详细功能说明
- 技术规格参数
- 第三方集成展示

## 🎨 设计特点

### 配色方案
- 主色调：渐变紫色 (#667eea → #764ba2)
- 强调色：粉色渐变 (#f093fb → #f5576c)
- 成功色：绿色 (#4caf50)
- 中性色：灰色系 (#333, #666, #f8f9fa)

### 交互效果
- 卡片悬停动画（位移 + 阴影）
- 渐变色背景
- Material Design 组件
- 响应式栅格布局

### 视觉元素
- Material Icons 图标
- 渐变色按钮
- 圆角卡片设计
- 一致性间距系统

## 🛠️ 技术栈

- **框架**: Angular 15+
- **UI 组件库**: Angular Material
- **表单处理**: Reactive Forms
- **路由**: Angular Router
- **状态管理**: RxJS
- **样式**: SCSS

## 📦 依赖模块

```typescript
// Angular Material Modules
- MatToolbarModule
- MatButtonModule
- MatIconModule
- MatCardModule
- MatFormFieldModule
- MatInputModule
- MatSnackBarModule
- MatProgressSpinnerModule
- MatSidenavModule
- MatListModule
- MatMenuModule
- MatDialogModule
- MatTabsModule
- MatExpansionModule
- MatGridListModule
```

## 🔗 路由配置

已添加到主路由模块 `app-routing.module.ts`:

```typescript
{
  path: 'marketing',
  loadChildren: () => 
    import('./marketing/marketing.module').then((m) => m.MarketingModule),
}
```

## 📱 访问路径

- 营销首页：`http://localhost:4200/marketing`
- 产品展示：`http://localhost:4200/marketing/product`
- 价格方案：`http://localhost:4200/marketing/pricing`
- 联系我们：`http://localhost:4200/marketing/contact`
- 关于我们：`http://localhost:4200/marketing/about`
- 功能特性：`http://localhost:4200/marketing/features`

## 🎯 使用示例

### 导航到营销页面

```typescript
import { Router } from '@angular/router';

constructor(private router: Router) {}

navigateToMarketing() {
  this.router.navigateByUrl('/marketing');
}

navigateToPricing() {
  this.router.navigateByUrl('/marketing/pricing');
}
```

### 在模板中添加链接

```html
<!-- 导航栏 -->
<a mat-button routerLink="/marketing">首页</a>
<a mat-button routerLink="/marketing/product">产品</a>
<a mat-button routerLink="/marketing/pricing">价格</a>
<a mat-button routerLink="/marketing/contact">联系</a>

<!-- 或使用按钮 -->
<button mat-raised-button color="primary" routerLink="/marketing/pricing">
  查看价格
</button>
```

## 🔄 可扩展性

### 添加新页面

1. 创建组件目录和文件
2. 在 `marketing.module.ts` 中声明组件
3. 在 `marketing.module.ts` 的路由中注册
4. 导入所需的 Angular Material 模块

### 自定义主题

修改 `src/styles/themes/_custom-theme.scss` 中的颜色变量：

```scss
$primary-palette: mat.define-palette((
  500: $color-primary,
  // ... 其他色阶
));
```

## 📊 SEO 优化建议

1. 为每个页面添加唯一的 `<title>` 和 `<meta>` 描述
2. 使用语义化的 HTML 标签
3. 添加 Open Graph 元标签用于社交媒体分享
4. 实现结构化数据（Schema.org）
5. 优化图片 alt 属性

## 🚀 性能优化

- 懒加载模块，减少初始加载时间
- 使用 `OnPush` 变更检测策略
- 图片懒加载
- CSS 动画使用 GPU 加速
- 按需加载 Material Icons

## 🧪 测试建议

```typescript
describe('MarketingHomeComponent', () => {
  let component: MarketingHomeComponent;
  let fixture: ComponentFixture<MarketingHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MarketingHomeComponent],
      imports: [
        NoopAnimationsModule,
        MatButtonModule,
        MatCardModule,
        // ... 其他模块
      ],
    }).compileComponents();
  });

  it('should create the component', () => {
    fixture = TestBed.createComponent(MarketingHomeComponent);
    component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
```

## 📝 注意事项

1. 所有文本内容应支持国际化（i18n）
2. 确保在所有表单中添加验证逻辑
3. 移动端适配需要充分测试
4. 遵循 Angular 编码规范和最佳实践
5. 保持代码的可维护性和可读性

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 LICENSE 文件了解详情

---

**版本**: 1.0.0  
**最后更新**: 2026-03-07  
**维护者**: iMato Team
