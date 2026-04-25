# 认证系统快速测试指南

## 🚀 快速开始

### 步骤1: 启动后端服务

```bash
cd g:\OpenMTSciEd\backend\openmtscied
python main.py
```

等待看到以下输出表示启动成功：
```
[OK] Loaded environment variables from ...
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 步骤2: 运行自动化测试

在新终端中执行：

```bash
cd g:\OpenMTSciEd
python tests/test_auth_api.py
```

这将自动测试所有认证API端点。

---

## 🧪 手动测试

### 测试1: 用户注册

```bash
curl -X POST http://localhost:8000/api/v1/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\": \"testuser\", \"email\": \"test@example.com\", \"password\": \"test123\"}"
```

**PowerShell用户**:
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/register" -Method Post -ContentType "application/json" -Body '{"username":"testuser","email":"test@example.com","password":"test123"}'
```

### 测试2: 用户登录

```bash
curl -X POST http://localhost:8000/api/v1/auth/login ^
  -H "Content-Type: application/x-www-form-urlencoded" ^
  -d "username=admin&password=12345678"
```

**PowerShell用户**:
```powershell
$body = @{username="admin"; password="12345678"}
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/login" -Method Post -Body $body
```

### 测试3: 获取用户信息（需要Token）

先登录获取token，然后：

```bash
curl -X GET http://localhost:8000/api/v1/auth/me ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🌐 前端测试

### Website营销页面

1. 确保website正在运行（如果有静态服务器）
2. 打开浏览器访问 `website/index.html`
3. 点击右上角"登录"按钮
4. 应该跳转到 `http://localhost:4200/login`

### Desktop-Manager应用

1. 启动Angular开发服务器：
   ```bash
   cd g:\OpenMTSciEd\desktop-manager
   ng serve
   ```

2. 访问 `http://localhost:4200/login`

3. 使用以下账号登录：
   - **用户名**: `admin`
   - **密码**: `12345678`

4. 登录成功后会进入dashboard

---

## 📋 测试检查清单

- [ ] 后端服务成功启动
- [ ] 自动化测试全部通过
- [ ] 可以注册新用户
- [ ] 可以使用admin账号登录
- [ ] 重复注册被正确拒绝
- [ ] 错误的密码被正确拒绝
- [ ] 可以获取当前用户信息
- [ ] 可以更新用户资料
- [ ] 可以修改密码
- [ ] Website登录按钮能跳转到desktop-manager
- [ ] Desktop-Manager登录成功后能正常进入系统

---

## 🐛 常见问题

### 问题1: 后端启动失败，提示SECRET_KEY未设置

**解决方案**:
创建 `.env.local` 文件：

```bash
cd g:\OpenMTSciEd
python -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32))" > .env.local
```

或在文件中手动添加：
```env
SECRET_KEY=your-secret-key-here
```

### 问题2: CORS错误

**解决方案**:
检查 `.env.local` 中的CORS配置：

```env
CORS_ORIGINS=http://localhost:4200,http://localhost:3000,http://localhost:8080
```

### 问题3: 端口8000已被占用

**解决方案**:
修改 `backend/openmtscied/main.py` 最后一行：

```python
uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=False)
```

同时更新前端的API URL配置。

### 问题4: 注册API返回404

**解决方案**:
确保使用的是正确的URL路径：
- ✅ 正确: `http://localhost:8000/api/v1/auth/register`
- ❌ 错误: `http://localhost:8000/auth/register`

---

## 📊 API端点速查

| 功能 | 方法 | URL | 需要认证 |
|------|------|-----|----------|
| 注册 | POST | `/api/v1/auth/register` | ❌ |
| 登录 | POST | `/api/v1/auth/login` | ❌ |
| 获取用户信息 | GET | `/api/v1/auth/me` | ✅ |
| 更新资料 | PUT | `/api/v1/auth/me/profile` | ✅ |
| 修改密码 | POST | `/api/v1/auth/me/password` | ✅ |

---

## 📝 测试数据

### 默认管理员账号
- 用户名: `admin`
- 邮箱: `3936318150@qq.com`
- 密码: `12345678`
- 角色: `admin`

### 测试时可以创建的账号
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "test123"
}
```

---

## 🔍 调试技巧

### 查看后端日志

后端会在控制台输出详细日志，包括：
- 请求URL和方法
- 响应状态码
- 错误信息

### 使用浏览器开发者工具

1. 打开Chrome DevTools (F12)
2. 切换到Network标签
3. 执行登录/注册操作
4. 查看请求和响应详情

### 使用Postman或Insomnia

导入以下集合进行测试：

**注册**:
```
POST http://localhost:8000/api/v1/auth/register
Content-Type: application/json

{
  "username": "postman_user",
  "email": "postman@test.com",
  "password": "pass123"
}
```

**登录**:
```
POST http://localhost:8000/api/v1/auth/login
Content-Type: application/x-www-form-urlencoded

username=admin&password=12345678
```

---

## ✅ 验证成功标志

如果看到以下情况，说明认证系统工作正常：

1. ✅ 后端启动无错误
2. ✅ 自动化测试脚本显示所有测试通过
3. ✅ 可以成功注册新用户
4. ✅ 可以使用admin账号登录
5. ✅ 登录后能获取到JWT token
6. ✅ 使用token可以访问受保护的端点
7. ✅ Website登录按钮能正确跳转
8. ✅ Desktop-Manager登录成功后进入dashboard

---

## 📚 更多信息

- 详细API文档: [AUTH_API.md](../docs/AUTH_API.md)
- 改进报告: [AUTH_IMPROVEMENTS.md](../AUTH_IMPROVEMENTS.md)
- 后端代码: `backend/openmtscied/modules/auth/auth_api.py`
- 测试脚本: `tests/test_auth_api.py`
