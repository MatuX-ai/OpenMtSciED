# Admin 用户管理模块

## 概述

Admin用户管理模块提供了完整的系统用户管理功能，包括用户列表查看、详情展示、角色分配、批量导入等核心功能。

## 功能特性

### ✅ 已实现功能

1. **用户列表管理**
   - 分页显示所有系统用户
   - 支持按用户名、邮箱搜索
   - 支持按角色、状态筛选
   - 批量选择和操作

2. **用户详情查看**
   - 查看用户完整信息
   - 角色管理和分配
   - 组织关联信息

3. **用户统计仪表板**
   - 总用户数统计
   - 活跃/非活跃用户分布
   - 管理员数量统计

4. **批量导入用户**
   - 支持CSV/Excel文件上传
   - 拖拽文件上传
   - 冲突处理策略（跳过/更新/覆盖）
   - 自动生成密码选项
   - 导入结果报告

5. **用户操作**
   - 编辑用户信息
   - 删除用户
   - 激活/停用用户

### 📋 待完善功能

- [ ] 后端用户列表API对接
- [ ] 用户创建表单
- [ ] 高级权限管理界面
- [ ] 用户活动日志
- [ ] 导出用户数据为Excel/CSV
- [ ] 批量修改用户角色
- [ ] 用户头像上传和管理

## 文件结构

```
desktop-manager/src/app/admin/user-management/
├── admin-user-management.component.ts      # 主组件（用户列表）
├── admin-user-management.component.html    # 主组件模板
├── admin-user-management.component.scss    # 主组件样式
├── user-detail-dialog.component.ts         # 用户详情对话框
└── bulk-import-dialog.component.ts         # 批量导入对话框

desktop-manager/src/app/core/services/
└── user.service.ts                          # 用户服务（API调用）

desktop-manager/src/app/models/
└── user.models.ts                           # 用户数据模型
```

## 使用方法

### 访问用户管理

1. 启动应用后进入Dashboard
2. 点击"用户管理"卡片
3. 或直接访问路由：`/admin/user-management`

### 查看用户详情

1. 在用户列表中点击"查看详情"按钮
2. 或使用对话框查看所有用户信息和角色

### 批量导入用户

1. 点击顶部"批量导入"按钮
2. 选择或拖拽CSV/Excel文件
3. 配置冲突处理策略
4. 开始导入并查看结果

## API集成说明

当前使用模拟数据，需要对接以下后端API：

### 需要的后端API端点

```typescript
// 获取用户列表
GET /api/v1/users?page=1&limit=50&role=admin&status=active

// 获取用户详情
GET /api/v1/users/{user_id}

// 删除用户
DELETE /api/v1/users/{user_id}

// 获取用户统计
GET /api/v1/users/stats

// 批量导入用户
POST /api/v1/auth/bulk-import
Content-Type: multipart/form-data
Body: { file: File, conflict_resolution: 'skip' }

// 为用户分配角色
POST /api/v1/auth/users/{user_id}/roles/{role_code}

// 撤销用户角色
DELETE /api/v1/auth/users/{user_id}/roles/{role_code}
```

### 后端已有API

根据代码分析，以下API已在后端实现：

- ✅ `POST /api/v1/auth/bulk-import` - 批量导入用户
- ✅ `/api/v1/permissions/users/{user_id}/roles` - 获取用户角色
- ✅ `POST /api/v1/auth/users/{user_id}/roles/{role_code}` - 分配角色
- ✅ `DELETE /api/v1/auth/users/{user_id}/roles/{role_code}` - 撤销角色

需要补充实现的API：
- ❌ `GET /api/v1/users` - 用户列表（带分页和筛选）
- ❌ `GET /api/v1/users/{user_id}` - 用户详情
- ❌ `DELETE /api/v1/users/{user_id}` - 删除用户
- ❌ `GET /api/v1/users/stats` - 用户统计

## 技术栈

- **框架**: Angular 17+ (Standalone Components)
- **UI库**: Angular Material
- **状态管理**: Angular Signals
- **HTTP客户端**: HttpClient
- **响应式编程**: RxJS

## 开发注意事项

1. **TypeScript类型安全**: 所有数据都使用了强类型接口
2. **响应式设计**: 支持桌面和移动端自适应
3. **错误处理**: 完善的错误提示和用户反馈
4. **加载状态**: 异步操作显示加载指示器
5. **可访问性**: 遵循Material Design无障碍标准

## 后续优化建议

1. **性能优化**
   - 虚拟滚动支持大量用户数据
   - 懒加载用户详情
   - 缓存常用数据

2. **用户体验**
   - 添加骨架屏加载效果
   - 优化大批量导入的进度显示
   - 添加撤销操作功能

3. **功能增强**
   - 用户活动审计日志
   - 双因素认证管理
   - 用户登录历史追踪
   - IP地址和设备信息管理

## 相关文档

- [RBAC权限系统设计](../../../src/models/permission.py)
- [用户模型定义](../../../src/models/user.py)
- [认证路由](../../../src/routes/auth_routes.py)
- [权限管理路由](../../../src/routes/permission_routes.py)

## 贡献指南

如需扩展用户管理功能，请遵循以下步骤：

1. 在 `user.service.ts` 中添加新的API方法
2. 更新 `user.models.ts` 中的类型定义
3. 创建新的组件或扩展现有组件
4. 在路由配置中添加新路由
5. 更新本文档

## 许可证

本项目采用与OpenMTSciEd相同的开源许可证。
