# OpenMTSciEd 登录信息

## 默认管理员账号

**已创建默认管理员账号，可用于登录所有前端应用：**

- **用户名**: `admin`
- **密码**: `admin123`
- **邮箱**: `admin@openmtscied.com`

## 前端应用访问地址

### 1. Admin Web (管理后台)
- **地址**: http://localhost:4201
- **登录页面**: http://localhost:4201/login
- **用途**: 系统管理、课程管理、爬虫管理等

### 2. Desktop Manager (桌面应用)
- **地址**: http://localhost:4200
- **用途**: 本地资源管理、离线学习、硬件项目等

### 3. Website (用户网站)
- **地址**: http://localhost:8080 (需要启动website服务)
- **登录页面**: http://localhost:8080/login.html
- **用途**: 学生学习、课程浏览、练习做题等

## Backend API
- **地址**: http://localhost:3000
- **健康检查**: http://localhost:3000/api/health
- **API文档**: 待添加Swagger/OpenAPI

## 测试账号

除了admin账号外，还可以注册新账号进行测试：
- 在任何前端应用的注册页面创建新用户
- 或使用API直接注册：
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/register" -Method Post -ContentType "application/json" -Body '{"username":"testuser","email":"test@example.com","password":"test123"}'
```

## 常见问题

### 登录失败？
1. 确认backend-next服务正在运行（http://localhost:3000）
2. 检查用户名和密码是否正确
3. 查看浏览器控制台是否有错误信息
4. 确认前端代理配置正确指向backend-next

### API返回401错误？
- Token可能已过期或无效
- 尝试重新登录获取新Token
- 检查请求头中是否正确包含`Authorization: Bearer <token>`

### 端口冲突？
- backend-next: 3000
- admin-web: 4201
- desktop-manager: 4200
- 如有冲突，可修改对应服务的配置文件更改端口