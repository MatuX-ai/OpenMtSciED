# 机构仪表盘开发指南

## 功能概述

机构仪表盘提供了教育机构的综合数据展示和管理功能，包括：

- **实时数据统计**：活跃许可证数量、项目总数、用户总数、硬件消耗等
- **数据可视化**：使用ECharts展示用户增长趋势、项目发展趋势、硬件使用情况等
- **实时监控**：许可证剩余量监控和预警
- **信息编辑**：机构基本信息的在线编辑功能

## 技术架构

### 前端技术栈
- Angular 16
- Material Design Components
- ECharts (数据可视化)
- RxJS (响应式编程)

### 文件结构
```
src/app/admin/organizations/
├── organization-dashboard.component.ts     # 仪表盘主组件
├── organization-dashboard.service.ts       # 数据服务
├── organization-edit-dialog.component.ts   # 编辑对话框组件
├── organization-routing.module.ts          # 路由配置
├── organizations.module.ts                 # 模块定义
└── mock-dashboard-data.ts                  # 模拟数据
```

## 核心功能实现

### 1. 数据展示
仪表盘展示了四个核心统计指标：
- 活跃许可证数量及剩余量
- 项目总数
- 用户总数
- 硬件消耗量（小时）

### 2. ECharts可视化
实现了四种图表类型：
- **折线图**：用户增长趋势
- **柱状图**：项目发展趋势
- **饼图**：硬件使用分布
- **条形图**：许可证使用情况

### 3. 实时监控
- 许可证剩余量实时显示
- 系统警报和通知
- 最近活动记录

### 4. 信息编辑
- 弹窗式编辑界面
- 表单验证
- 异步提交处理

## API接口设计

### 获取仪表盘数据
```
GET /api/v1/org/{org_id}/dashboard
Headers: X-Org-ID: {org_id}
```

### 更新机构信息
```
PUT /api/v1/organizations/{org_id}
Headers: X-Org-ID: {org_id}
Body: {
  "name": "机构名称",
  "contact_email": "联系邮箱",
  "phone": "电话",
  "address": "地址",
  "website": "网站",
  "max_users": 最大用户数
}
```

### 获取机构概览
```
GET /api/v1/org/{org_id}/overview
Headers: X-Org-ID: {org_id}
```

## 使用方法

### 访问仪表盘
```
http://localhost:4200/admin/organizations/1/dashboard
```

其中 `1` 是机构ID，可以根据实际情况替换。

### 开发环境配置
1. 确保已安装依赖：
   ```bash
   npm install echarts ngx-echarts --legacy-peer-deps
   ```

2. 启动开发服务器：
   ```bash
   ng serve
   ```

3. 访问仪表盘页面

## 数据结构

### DashboardData 接口
```typescript
interface DashboardData {
  organization: Organization;
  statistics: {
    activeLicenses: number;
    totalProjects: number;
    totalUsers: number;
    hardwareConsumption: number;
    licenseRemaining: number;
  };
  charts: {
    userGrowthData: ChartData[];
    projectTrendData: ChartData[];
    hardwareUsageData: ChartData[];
    licenseUsageData: ChartData[];
  };
  recentActivities: Activity[];
  alerts: Alert[];
}
```

## 自定义配置

### 修改图表样式
在 `organization-dashboard.component.ts` 中的 `setupCharts()` 方法中调整ECharts配置选项。

### 添加新的统计指标
1. 在 `DashboardData` 接口中添加新的字段
2. 在模板中添加对应的统计卡片
3. 在服务中实现数据获取逻辑

### 扩展图表类型
1. 在 `mock-dashboard-data.ts` 中添加模拟数据
2. 在 `setupCharts()` 中添加新的图表配置
3. 在模板中添加对应的图表容器

## 注意事项

1. **环境配置**：确保 `environment.ts` 文件正确配置API基础URL
2. **权限控制**：生产环境中需要添加适当的权限验证
3. **错误处理**：完善网络请求的错误处理机制
4. **性能优化**：对于大量数据的图表，考虑分页或懒加载
5. **响应式设计**：组件已适配移动端显示

## 测试数据

系统内置了两个机构的模拟数据：
- 北京市第一中学 (ID: 1)
- 上海市实验学校 (ID: 2)

可以通过修改URL中的机构ID来切换查看不同机构的数据。