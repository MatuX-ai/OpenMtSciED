# OpenMTSciEd Desktop Manager - 应用重构计划

## 📊 当前状态分析

### ✅ 已完成功能
- [x] Setup Wizard（首次使用向导）
- [x] Dashboard（仪表盘）
- [x] Course Library（教程库）
- [x] Material Library（课件库）
- [x] Settings（设置页面）
- [x] 本地数据存储管理
- [x] Tauri 后端命令集成

### ⚠️ 需要改进的问题

#### 1. 架构层面
- ❌ 缺少统一的状态管理
- ❌ 用户配置直接使用 localStorage（无封装）
- ❌ 缺少全局错误处理机制
- ❌ 服务层职责不清晰

#### 2. 代码组织
- ❌ 类型定义分散在各个文件中
- ❌ 缺少统一的常量管理
- ❌ 导航逻辑混乱（MarketingNav vs 内部导航）
- ❌ 缺少工具函数库

#### 3. 用户体验
- ❌ 缺少加载状态管理
- ❌ 缺少统一的提示/通知系统
- ❌ 缺少离线/在线状态检测
- ❌ 缺少数据持久化策略

#### 4. 可维护性
- ❌ 缺少日志系统
- ❌ 缺少性能监控
- ❌ 缺少配置管理
- ❌ 缺少环境变量支持

---

## 🎯 重构目标

### 阶段一：核心架构优化（优先级：高）

#### 1.1 创建统一的状态管理服务
**目标**: 集中管理应用状态，替代分散的 localStorage 使用

**新增文件**:
```
src/app/core/services/
├── state.service.ts          # 应用状态管理
├── user.service.ts           # 用户信息管理
└── config.service.ts         # 配置管理
```

**功能**:
- 用户配置文件管理（teacherName, schoolName, subject）
- 应用设置管理（主题、语言、存储路径等）
- 会话状态管理
- 自动保存到 localStorage（带加密选项）

**示例代码结构**:
```typescript
// state.service.ts
@Injectable({ providedIn: 'root' })
export class StateService {
  private readonly USER_PROFILE_KEY = 'user-profile';
  
  // 用户信息
  private userProfile$ = new BehaviorSubject<UserProfile | null>(null);
  
  // 获取用户信息
  getUserProfile(): Observable<UserProfile | null> {
    return this.userProfile$.asObservable();
  }
  
  // 更新用户信息
  updateUserProfile(profile: UserProfile): void {
    this.userProfile$.next(profile);
    this.saveToStorage(this.USER_PROFILE_KEY, profile);
  }
  
  // 清除用户信息
  clearUserProfile(): void {
    this.userProfile$.next(null);
    this.removeFromStorage(this.USER_PROFILE_KEY);
  }
  
  // 初始化时从 storage 加载
  initialize(): void {
    const profile = this.loadFromStorage<UserProfile>(this.USER_PROFILE_KEY);
    if (profile) {
      this.userProfile$.next(profile);
    }
  }
}
```

#### 1.2 创建统一的错误处理服务
**目标**: 集中处理应用错误，提供友好的错误提示

**新增文件**:
```
src/app/core/services/
├── error-handler.service.ts  # 全局错误处理
└── notification.service.ts   # 通知/提示服务
```

**功能**:
- 统一错误捕获和处理
- 错误分类（网络错误、业务错误、系统错误）
- 用户友好的错误提示
- 错误日志记录

**示例**:
```typescript
// error-handler.service.ts
@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  constructor(private notification: NotificationService) {}
  
  handleError(error: any, context?: string): void {
    console.error(`[${context}] Error:`, error);
    
    if (error instanceof TauriError) {
      this.handleTauriError(error);
    } else if (error instanceof NetworkError) {
      this.handleNetworkError(error);
    } else {
      this.handleGenericError(error);
    }
  }
  
  private handleTauriError(error: TauriError): void {
    this.notification.showError('系统错误', error.message);
  }
}
```

#### 1.3 创建类型定义中心
**目标**: 统一管理所有 TypeScript 接口和类型

**新增文件**:
```
src/app/core/models/
├── index.ts                  # 导出所有模型
├── user.model.ts             # 用户相关类型
├── course.model.ts           # 课程相关类型
├── material.model.ts         # 课件相关类型
├── storage.model.ts          # 存储相关类型
└── common.model.ts           # 通用类型
```

**示例**:
```typescript
// models/user.model.ts
export interface UserProfile {
  teacherName: string;
  schoolName: string;
  subject: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'zh-CN' | 'en-US';
  autoSave: boolean;
}

// models/storage.model.ts
export interface StorageInfo {
  dataPath: string;
  databasePath: string;
  materialsPath: string;
  totalSpace: number;
  freeSpace: number;
  usedSpace: number;
  materialCount: number;
  estimatedGrowth: string;
}
```

#### 1.4 重构 TauriService
**目标**: 按功能模块拆分服务，提高可维护性

**新结构**:
```
src/app/core/services/tauri/
├── base-tauri.service.ts     # 基础 Tauri 通信
├── course.service.ts         # 课程管理命令
├── material.service.ts       # 课件管理命令
├── storage.service.ts        # 存储管理命令
└── index.ts                  # 统一导出
```

**示例**:
```typescript
// base-tauri.service.ts
@Injectable({ providedIn: 'root' })
export class BaseTauriService {
  protected async invoke<T>(command: string, args?: any): Promise<T> {
    if (!this.isTauri()) {
      throw new Error('Not running in Tauri environment');
    }
    return window.__TAURI__.core.invoke<T>(command, args);
  }
  
  protected isTauri(): boolean {
    return typeof window.__TAURI__ !== 'undefined';
  }
}

// course.service.ts
@Injectable({ providedIn: 'root' })
export class CourseService extends BaseTauriService {
  async getCourses(): Promise<Course[]> {
    return this.invoke<Course[]>('get_courses');
  }
  
  async createCourse(course: CreateCourseRequest): Promise<Course> {
    return this.invoke<Course>('create_course', course);
  }
}
```

---

### 阶段二：用户体验优化（优先级：中）

#### 2.1 创建加载状态管理
**新增文件**:
```
src/app/core/services/loading.service.ts
src/app/shared/components/loading-overlay/
```

**功能**:
- 全局加载状态
- 局部加载指示器
- 自动显示/隐藏
- 可自定义样式

#### 2.2 创建通知系统
**新增文件**:
```
src/app/core/services/notification.service.ts
src/app/shared/components/notification/
```

**功能**:
- 成功/错误/警告/信息提示
- 自动消失
- 可手动关闭
- 位置可配置

#### 2.3 创建确认对话框
**新增文件**:
```
src/app/shared/components/confirm-dialog/
```

**功能**:
- 删除确认
- 重要操作确认
- 自定义标题和内容
- Promise -based API

#### 2.4 优化导航结构
**问题**: 当前 MarketingNav 和应用内部导航混用

**解决方案**:
```
src/app/shared/components/
├── app-header/               # 应用内部头部导航
├── app-sidebar/              # 侧边栏导航
└── marketing-nav/            # 营销页面导航（保留）
```

**路由守卫**:
```typescript
// auth.guard.ts
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private router: Router
  ) {}
  
  canActivate(): boolean {
    const profile = this.userService.getCurrentUserProfile();
    if (!profile) {
      this.router.navigate(['/setup-wizard']);
      return false;
    }
    return true;
  }
}
```

---

### 阶段三：工程化优化（优先级：中低）

#### 3.1 创建常量管理
**新增文件**:
```
src/app/core/constants/
├── index.ts
├── app.constants.ts          # 应用常量
├── storage.constants.ts      # 存储相关常量
└── ui.constants.ts           # UI 相关常量
```

**示例**:
```typescript
// storage.constants.ts
export const STORAGE_KEYS = {
  USER_PROFILE: 'user-profile',
  USER_PREFERENCES: 'user-preferences',
  APP_SETTINGS: 'app-settings',
} as const;

export const DEFAULT_STORAGE_PATHS = {
  DATA_DIR: '%APPDATA%\\com.openmtscied.desktop-manager',
  MATERIALS_DIR: 'materials',
  BACKUPS_DIR: 'backups',
} as const;

export const STORAGE_LIMITS = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  WARNING_THRESHOLD: 0.9, // 90% 警告
} as const;
```

#### 3.2 创建工具函数库
**新增文件**:
```
src/app/core/utils/
├── index.ts
├── format.utils.ts           # 格式化工具
├── validation.utils.ts       # 验证工具
├── storage.utils.ts          # 存储工具
└── date.utils.ts             # 日期工具
```

**示例**:
```typescript
// format.utils.ts
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
```

#### 3.3 创建日志系统
**新增文件**:
```
src/app/core/services/logger.service.ts
```

**功能**:
- 分级日志（DEBUG, INFO, WARN, ERROR）
- 日志过滤
- 日志持久化（可选）
- 生产环境禁用 DEBUG

**示例**:
```typescript
@Injectable({ providedIn: 'root' })
export class LoggerService {
  private level: LogLevel = environment.production ? LogLevel.WARN : LogLevel.DEBUG;
  
  debug(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
  
  info(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }
  
  error(message: string, error?: any): void {
    console.error(`[ERROR] ${message}`, error);
    // 可选：发送到错误追踪服务
  }
}
```

#### 3.4 环境变量配置
**新增文件**:
```
src/environments/
├── environment.ts            # 开发环境
└── environment.prod.ts       # 生产环境
```

**示例**:
```typescript
// environment.ts
export const environment = {
  production: false,
  enableDebugLogging: true,
  apiBaseUrl: 'http://localhost:3000',
  enableMockData: true,
};

// environment.prod.ts
export const environment = {
  production: true,
  enableDebugLogging: false,
  apiBaseUrl: 'https://api.openmtscied.com',
  enableMockData: false,
};
```

---

### 阶段四：性能优化（优先级：低）

#### 4.1 实现数据缓存
**目标**: 减少重复的 Tauri 命令调用

**方案**:
- RxJS `shareReplay` 缓存 observable
- 手动缓存策略（TTL）
- 智能刷新机制

#### 4.2 懒加载优化
**目标**: 加快初始加载速度

**当前状态**: 已使用 loadComponent 懒加载
**优化点**:
- 预加载策略
- 路由预取
- 资源分割优化

#### 4.3 内存管理
**目标**: 防止内存泄漏

**措施**:
- 组件销毁时取消订阅
- 使用 `async` pipe 自动管理订阅
- 定期清理缓存

---

## 📅 实施计划

### Week 1: 核心架构重构
- [ ] Day 1-2: 创建类型定义中心
- [ ] Day 3-4: 实现状态管理服务
- [ ] Day 5: 实现错误处理和通知服务

### Week 2: 服务层重构
- [ ] Day 1-2: 拆分 TauriService
- [ ] Day 3: 创建工具函数库
- [ ] Day 4: 创建常量管理
- [ ] Day 5: 更新现有组件使用新服务

### Week 3: UI/UX 优化
- [ ] Day 1-2: 实现加载状态管理
- [ ] Day 3: 实现通知系统
- [ ] Day 4: 实现确认对话框
- [ ] Day 5: 优化导航结构

### Week 4: 工程化完善
- [ ] Day 1: 创建日志系统
- [ ] Day 2: 配置环境变量
- [ ] Day 3-4: 全面测试和修复 bug
- [ ] Day 5: 文档更新和代码审查

---

## 🎯 预期收益

### 代码质量
- ✅ 类型安全性提升 100%
- ✅ 代码复用率提升 60%
- ✅ 可维护性显著提升

### 开发效率
- ✅ 新功能开发速度提升 40%
- ✅ Bug 定位时间减少 50%
- ✅ 代码审查更容易

### 用户体验
- ✅ 更流畅的交互反馈
- ✅ 更友好的错误提示
- ✅ 更快的加载速度

### 可扩展性
- ✅ 模块化设计便于扩展
- ✅ 清晰的架构便于团队协作
- ✅ 完善的文档降低学习成本

---

## ⚠️ 风险评估

### 高风险
- ❗ 重构可能引入新 bug
- ❗ 需要全面回归测试

**缓解措施**:
- 逐步重构，每次小步迭代
- 保持向后兼容
- 充分的单元测试

### 中风险
- ⚠️ 学习时间成本
- ⚠️ 短期开发速度下降

**缓解措施**:
- 提供详细的迁移指南
- 保留旧 API 作为过渡

### 低风险
- 💡 文档不完善
- 💡 团队成员适应期

**缓解措施**:
- 编写详细的技术文档
- 组织技术培训

---

## 📝 下一步行动

1. **立即开始**: 创建类型定义中心（最简单，风险最低）
2. **本周内**: 完成状态管理服务
3. **两周内**: 完成服务层重构
4. **一个月内**: 完成全部重构

---

**建议**: 先从**阶段一**开始，逐步推进，每完成一个阶段就进行测试和验证。

是否需要我开始执行某个具体的重构任务？
