# Shared Libraries

共享代码库，供 `admin-web` 和 `desktop-manager` 共同使用。

## 目录结构

```
libs/
├── shared-ui/          # 共享UI组件
├── shared-services/    # 共享服务
├── shared-models/      # 共享数据模型
└── shared-utils/       # 工具函数
```

## 使用方法

### 在 admin-web 中使用

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@shared/*": ["../../libs/*"]
    }
  }
}

// 组件中导入
import { Course } from '@shared/models/course.model';
import { ApiService } from '@shared/services/api.service';
```

### 在 desktop-manager 中使用

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@shared/*": ["../../libs/*"]
    }
  }
}

// 组件中导入
import { Course } from '@shared/models/course.model';
import { ApiService } from '@shared/services/api.service';
```

## 迁移优先级

### P0 - 立即迁移（高重复率）
1. ✅ 数据模型（Course, User, Crawler等）
2. ✅ API服务封装
3. ✅ 认证服务

### P1 - 短期迁移
4. 通用UI组件（表格、卡片、对话框）
5. 工具函数（格式化、验证）

### P2 - 长期优化
6. 状态管理（如果需要）
7. 主题配置

## 注意事项

- 共享库不应依赖特定项目的代码
- 保持向后兼容，避免破坏性变更
- 使用语义化版本管理
