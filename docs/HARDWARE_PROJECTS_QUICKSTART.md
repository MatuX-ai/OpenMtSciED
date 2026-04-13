# 硬件项目管理 - 快速开始指南

## 🚀 5分钟快速上手

### 步骤 1: 安装 Blockly 依赖

```bash
cd desktop-manager
npm install blockly
```

### 步骤 2: 在路由中注册组件

编辑 `desktop-manager/src/app/app.routes.ts`（或你的路由配置文件）：

```typescript
import { Routes } from '@angular/router';
import { HardwareProjectListComponent } from './features/hardware-projects/hardware-project-list/hardware-project-list.component';
import { BlocklyEditorComponent } from './features/hardware-projects/blockly-editor/blockly-editor.component';

export const routes: Routes = [
  // ... 其他路由
  {
    path: 'hardware-projects',
    component: HardwareProjectListComponent,
    title: '硬件项目库'
  },
  {
    path: 'hardware-projects/:id/edit',
    component: BlocklyEditorComponent,
    title: '可视化编程'
  }
];
```

### 步骤 3: 在侧边栏添加导航链接

编辑你的侧边栏组件（例如 `sidebar.component.html`）：

```html
<nav>
  <!-- 其他导航项 -->
  <a routerLink="/hardware-projects" routerLinkActive="active">
    <mat-icon>build</mat-icon>
    <span>硬件项目</span>
  </a>
</nav>
```

### 步骤 4: 运行应用

```bash
npm start
```

访问 `http://localhost:4200/hardware-projects` 查看硬件项目列表。

---

## 📖 使用示例

### 示例 1: 浏览硬件项目

1. 打开硬件项目列表页面
2. 使用筛选工具栏：
   - 输入关键词搜索（如"传感器"）
   - 选择分类（如"物联网"）
   - 设置最大预算（如 40 元）
3. 点击项目卡片查看详情

### 示例 2: 查看材料清单

1. 在项目卡片上点击"材料清单"按钮
2. 弹窗显示完整材料清单和总成本
3. 所有项目预算 ≤50 元

### 示例 3: 使用 Blockly 编辑器

1. 在项目卡片上点击"开始编程"按钮
2. 进入 Blockly 可视化编程界面
3. 从左侧工具箱拖拽积木块到工作区
4. 右侧实时预览生成的代码
5. 点击"生成代码"按钮确认
6. 点击"保存"按钮保存项目

---

## 🔧 自定义开发

### 添加新的硬件项目

编辑 `hardware-project-list.component.ts` 中的 `getMockProjects()` 方法：

```typescript
private getMockProjects(): HardwareProject[] {
  return [
    // 现有项目...
    {
      id: 'hw-new',
      tutorialId: 'tutorial-xxx',
      name: '你的新项目',
      description: '项目描述',
      category: 'electronics',
      difficulty: 3,
      estimatedTime: '2小时',
      totalCost: 40,
      materials: [
        { name: 'Arduino Nano', quantity: 1, unit: '块', unitPrice: 15 },
        // 更多材料...
      ],
      codeTemplate: {
        language: 'arduino',
        code: '// 你的代码模板',
        description: '代码说明'
      },
      webUsbSupport: false,
      safetyNotes: ['安全提示'],
      knowledgePoints: ['知识点']
    }
  ];
}
```

### 创建自定义积木块

1. 创建文件 `arduino-blocks.ts`：

```typescript
import * as Blockly from 'blockly';

// 定义新积木块
Blockly.Blocks['my_custom_block'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("我的自定义积木");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  }
};

// 生成代码
Blockly.Arduino['my_custom_block'] = function(block) {
  return '// 自定义代码\n';
};
```

2. 在 `blockly-editor.component.ts` 中导入：

```typescript
import './arduino-blocks'; // 在 initializeBlockly() 之前导入
```

3. 在工具箱 XML 中添加：

```xml
<category name="自定义" colour="#FF6B6B">
  <block type="my_custom_block"></block>
</category>
```

---

## 🎨 样式定制

### 修改主题颜色

编辑 `hardware-project-list.component.ts` 中的样式：

```typescript
styles: [`
  .budget-badge.budget-low {
    background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  }
  
  .budget-badge.budget-medium {
    background: linear-gradient(135deg, #ff9800 0%, #ffa726 100%);
  }
`]
```

### 调整网格布局

```typescript
.project-grid {
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
}
```

---

## 📊 API 集成（后端开发）

### Rust 后端接口设计

在 `src-tauri/src/commands/hardware.rs` 中实现：

```rust
use serde::{Deserialize, Serialize};
use tauri::command;

#[derive(Serialize, Deserialize)]
pub struct HardwareProject {
    pub id: String,
    pub tutorial_id: String,
    pub name: String,
    pub description: String,
    pub category: String,
    pub difficulty: u8,
    pub estimated_time: String,
    pub total_cost: f64,
    pub materials: Vec<MaterialItem>,
    pub code_template: Option<CodeTemplate>,
    pub web_usb_support: bool,
}

#[command]
pub fn list_hardware_projects(filter: Option<String>) -> Result<Vec<HardwareProject>, String> {
    // TODO: 从数据库查询
    Ok(vec![])
}

#[command]
pub fn get_hardware_project(id: String) -> Result<HardwareProject, String> {
    // TODO: 从数据库查询
    Err("Not implemented".to_string())
}

#[command]
pub fn save_hardware_project(project: HardwareProject) -> Result<(), String> {
    // TODO: 保存到数据库
    Ok(())
}
```

### Angular Service 封装

创建 `hardware-project.service.ts`：

```typescript
import { Injectable } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import { HardwareProject } from '../models/hardware-project.models';

@Injectable({
  providedIn: 'root'
})
export class HardwareProjectService {
  
  async listProjects(filter?: string): Promise<HardwareProject[]> {
    return await invoke('list_hardware_projects', { filter });
  }
  
  async getProject(id: string): Promise<HardwareProject> {
    return await invoke('get_hardware_project', { id });
  }
  
  async saveProject(project: HardwareProject): Promise<void> {
    return await invoke('save_hardware_project', { project });
  }
}
```

---

## 🐛 故障排除

### 问题 1: Blockly 未定义

**症状:** 控制台报错 `ReferenceError: Blockly is not defined`

**解决:**
```bash
npm install blockly
# 重启开发服务器
npm start
```

### 问题 2: 积木块不显示

**症状:** 工具箱为空或积木块缺失

**解决:**
1. 检查工具箱 XML 是否正确
2. 确保已导入 Blockly 模块
3. 检查浏览器控制台错误信息

### 问题 3: 代码生成失败

**症状:** 点击"生成代码"后无反应

**解决:**
1. 检查工作区是否有积木块
2. 确认已导入对应的代码生成器
3. 查看控制台错误日志

---

## 📚 学习资源

### 官方文档
- [Blockly 官方文档](https://developers.google.com/blockly)
- [Angular Material 组件库](https://material.angular.io/)
- [Tauri 桌面应用框架](https://tauri.app/)

### 示例项目
- [BlocklyDuino (Arduino 积木块)](https://github.com/gasolin/BlocklyDuino)
- [MicroBlocks (微型控制器编程)](https://microblocks.fun/)

### 视频教程
- Bilibili: "Blockly 可视化编程入门"
- YouTube: "Building Custom Blockly Blocks"

---

## 💡 最佳实践

### 1. 预算管理
- 始终使用 `validateBudget()` 验证项目成本
- 提供材料替代方案以降低总成本
- 标注价格来源和更新时间

### 2. 安全性
- 每个项目必须包含安全注意事项
- 高压电路项目需要特别标注
- 提供成人监督建议

### 3. 渐进式难度
- 为每个难度等级提供清晰的学习路径
- 低难度项目侧重基础概念
- 高难度项目引入复杂算法

### 4. 代码质量
- 提供完整的代码注释
- 包含错误处理逻辑
- 遵循 Arduino/Python 编码规范

---

## 🎯 下一步

1. **完善测试**: 编写单元测试和端到端测试
2. **国际化**: 支持多语言切换
3. **性能优化**: 大型项目的加载优化
4. **用户反馈**: 收集教师和学生使用意见

---

**祝你开发顺利！** 🚀

如有问题，请联系: 3936318150@qq.com
