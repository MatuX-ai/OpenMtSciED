# 贡献指南

感谢你对 OpenMTSciEd Desktop Manager 的兴趣！我们欢迎所有形式的贡献。

---

## 📋 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发环境设置](#开发环境设置)
- [代码规范](#代码规范)
- [提交 PR](#提交-pr)
- [报告 Bug](#报告-bug)
- [功能建议](#功能建议)

---

## 行为准则

本项目采用 Contributor Covenant 行为准则。请尊重所有参与者，营造友好的社区环境。

---

## 如何贡献

### 🐛 报告 Bug

1. 搜索 [Issues](../../issues) 确认问题未被报告
2. 使用 Bug Report 模板创建新 Issue
3. 包含以下信息：
   - 操作系统和版本
   - Node.js 和 Rust 版本
   - 详细的复现步骤
   - 预期行为和实际行为
   - 截图或错误日志

### 💡 功能建议

1. 搜索 [Issues](../../issues) 确认功能未被建议
2. 使用 Feature Request 模板创建新 Issue
3. 描述：
   - 功能用途
   - 使用场景
   - 可能的实现方案

### 🔧 代码贡献

#### 简单修复（拼写错误、文档改进）

1. Fork 仓库
2. 直接修改
3. 提交 Pull Request

#### 新功能或重大改动

1. 先创建 Issue 讨论方案
2. 等待维护者反馈
3. Fork 并开发
4. 提交 Pull Request

---

## 开发环境设置

### 1. Fork 和克隆

```bash
# Fork 后克隆你的 fork
git clone https://github.com/YOUR_USERNAME/desktop-manager.git
cd desktop-manager
```

### 2. 添加上游远程

```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/desktop-manager.git
```

### 3. 安装依赖

```bash
npm install
```

### 4. 验证安装

```bash
# 运行测试
npm run test

# 代码检查
npm run lint

# 开发模式
npm run tauri:dev
```

---

## 代码规范

### TypeScript 规范

- ✅ 使用严格模式
- ✅ 显式声明返回类型
- ❌ 避免使用 `any`，使用 `unknown` 代替
- ✅ 使用接口定义数据结构

```typescript
// ✅ 好的做法
interface Course {
  id: number;
  name: string;
  description: string;
}

async loadCourses(): Promise<Course[]> {
  const courses = await this.tauriService.getCourses();
  return courses as Course[];
}

// ❌ 避免
async loadCourses() {
  const courses: any[] = await this.tauriService.getCourses();
  return courses;
}
```

### Angular 规范

- 使用独立组件（Standalone Components）
- 遵循单向数据流
- 使用 OnPush 变更检测策略（如适用）
- 模板中使用 trackBy

```typescript
@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngFor="let course of courses; trackBy: trackById">
      {{ course.name }}
    </div>
  `
})
export class CourseListComponent {
  trackById(index: number, course: Course): number {
    return course.id;
  }
}
```

### Rust 规范

- 遵循 Rust 官方风格指南
- 使用 `cargo fmt` 格式化代码
- 使用 `cargo clippy` 检查代码质量

```bash
cd src-tauri
cargo fmt
cargo clippy
```

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 变量/函数 | camelCase | `loadCourses`, `userName` |
| 类/接口 | PascalCase | `CourseService`, `UserData` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 文件 | kebab-case | `course-list.component.ts` |
| 选择器 | kebab-case with prefix | `app-course-list` |

### 注释规范

- 公共 API 必须添加 JSDoc
- 复杂逻辑添加行内注释
- 使用中文注释（项目主要语言）

```typescript
/**
 * 加载课程列表
 * @returns 课程数组
 */
async loadCourses(): Promise<Course[]> {
  // 从 Tauri 后端获取数据
  const courses = await this.tauriService.getCourses();
  return courses as Course[];
}
```

---

## 提交 PR

### 1. 创建特性分支

```bash
# 同步主分支
git checkout main
git pull upstream main

# 创建新分支
git checkout -b feature/your-feature-name
```

分支命名规范：
- `feature/xxx` - 新功能
- `fix/xxx` - Bug 修复
- `docs/xxx` - 文档更新
- `refactor/xxx` - 代码重构
- `test/xxx` - 测试相关

### 2. 开发和测试

```bash
# 确保代码通过检查
npm run lint
npm run test

# 测试应用功能
npm run tauri:dev
```

### 3. 提交更改

```bash
git add .
git commit -m "feat: add course search functionality"
```

**提交消息规范**（Conventional Commits）：

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

类型：
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具变动

示例：
```
feat(course-library): add search and filter functionality

- Implement search by course name
- Add category filter dropdown
- Update unit tests

Closes #123
```

### 4. 推送到 GitHub

```bash
git push origin feature/your-feature-name
```

### 5. 创建 Pull Request

1. 访问你的 fork 页面
2. 点击 "Compare & pull request"
3. 填写 PR 描述
4. 关联相关 Issue
5. 等待审查

### PR 检查清单

提交 PR 前，请确认：

- [ ] 代码遵循项目规范
- [ ] 添加了必要的测试
- [ ] 更新了相关文档
- [ ] 通过了所有 CI 检查
- [ ] 没有合并冲突
- [ ] 提交消息清晰明了
- [ ] 关联了相关 Issue

---

## 代码审查

### 审查标准

维护者会检查：

1. **功能正确性**
   - 功能是否按预期工作
   - 是否有边界情况未处理

2. **代码质量**
   - 是否遵循代码规范
   - 是否有重复代码
   - 性能是否合理

3. **测试覆盖**
   - 是否添加了测试
   - 测试是否充分

4. **文档完整性**
   - 是否更新了文档
   - 注释是否清晰

### 审查流程

1. 自动 CI 检查（Lint、Test、Build）
2. 至少一位维护者审查
3. 提出修改建议（如有必要）
4. 作者更新代码
5. 审查通过后合并

---

## 常见问题

### Q: 我的 PR 多久会被审查？

A: 通常在 1-3 个工作日内，复杂的功能可能需要更长时间。

### Q: 如何处理合并冲突？

```bash
# 同步主分支
git fetch upstream
git checkout main
git merge upstream/main

# 回到特性分支
git checkout feature/your-feature
git rebase main

# 解决冲突后
git add .
git rebase --continue
git push origin feature/your-feature --force
```

### Q: 可以一次提交多个功能吗？

A: 不建议。每个 PR 应该只关注一个功能或修复，这样更容易审查和回滚。

### Q: 如何保持 fork 同步？

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

---

## 文档贡献

文档同样重要！你可以：

- 修正拼写错误
- 改进说明清晰度
- 添加示例代码
- 翻译文档
- 补充缺失的章节

文档位置：
- `README.md` - 项目概述
- `BUILD.md` - 构建指南
- `docs/` - 详细文档

---

## 成为维护者

如果你经常贡献并且熟悉项目，可能会被邀请成为维护者。

维护者职责：
- 审查 PR
- 管理 Issues
- 发布新版本
- 维护文档

---

## 联系方式

- 📧 邮箱: [3936318150@qq.com](mailto:3936318150@qq.com)
- 💬 Discussions: [GitHub Discussions](../../discussions)
- 🐛 Issues: [GitHub Issues](../../issues)

---

## 致谢

感谢所有贡献者！你们的努力让这个项目变得更好。

<a href="../../graphs/contributors">
  <img src="https://contrib.rocks/image?repo=your-repo/desktop-manager" />
</a>

---

**最后更新**: 2026-04-11
