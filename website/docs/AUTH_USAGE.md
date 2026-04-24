# 用户登录控件使用指南

## 概述

导航组件已集成用户登录控件，提供完整的认证UI和交互功能。

## 功能特性

### 1. 未登录状态
- 显示"登录"按钮
- 渐变色背景，带图标
- 悬停动画效果

### 2. 已登录状态
- 显示用户头像（首字母）
- 显示用户名
- 下拉菜单包含：
  - 个人中心
  - 学习仪表盘
  - 退出登录

### 3. 响应式设计
- 桌面端：右侧显示登录按钮/用户信息
- 移动端：全宽显示，集成到汉堡菜单中

## 使用方法

### 基本使用

登录控件已集成到导航组件中，无需额外配置。只需确保引入了 `navbar.js`：

```html
<script src="js/navbar.js"></script>
```

### 登录流程

#### 方式一：使用演示登录（当前实现）

点击"登录"按钮会弹出简单的提示框用于演示：

```javascript
// 在 navbar.js 中的 showLoginModal() 函数
const email = prompt('请输入邮箱地址（演示功能）:');
const password = prompt('请输入密码（演示功能）:');

// 模拟登录成功
const mockUser = {
    id: 'user_' + Date.now(),
    name: email.split('@')[0],
    email: email,
    loginTime: new Date().toISOString()
};

localStorage.setItem('user', JSON.stringify(mockUser));
```

#### 方式二：集成真实登录API

修改 `handleLogin()` 函数以调用真实的登录API：

```javascript
window.handleLogin = async function() {
    // 显示登录表单模态框
    showLoginForm();
};

async function showLoginForm() {
    // 创建登录模态框
    const modal = document.createElement('div');
    modal.className = 'login-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>用户登录</h2>
            <form id="loginForm">
                <input type="email" id="loginEmail" placeholder="邮箱" required>
                <input type="password" id="loginPassword" placeholder="密码" required>
                <button type="submit">登录</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 处理表单提交
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // 保存用户信息
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('token', data.token);
                
                // 更新UI
                updateAuthUI(true);
                
                // 关闭模态框
                modal.remove();
                
                alert('登录成功！');
            } else {
                alert('登录失败：' + data.message);
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('登录失败，请稍后重试');
        }
    });
}
```

### 退出登录

点击"退出登录"会清除本地存储的用户信息：

```javascript
window.handleLogout = function() {
    if (!confirm('确定要退出登录吗？')) return;

    // 清除用户信息
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    localStorage.removeItem('token');

    // 更新 UI
    updateAuthUI(false);

    alert('已成功退出登录');
};
```

## 用户数据存储

### localStorage 结构

```javascript
{
    "user": {
        "id": "user_1234567890",
        "name": "username",
        "email": "user@example.com",
        "loginTime": "2026-04-19T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 检查登录状态

```javascript
// 方法一：使用 NavbarComponent API
const isLoggedIn = NavbarComponent.checkLoginStatus();

// 方法二：直接检查 localStorage
const user = localStorage.getItem('user');
const isLoggedIn = user !== null;
```

## 自定义用户信息

### 修改用户头像

默认使用用户名首字母作为头像，可以自定义为图片：

```javascript
function loadUserInfo() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;

    const user = JSON.parse(userStr);
    const userAvatar = document.getElementById('userAvatar');
    
    // 如果用户有头像URL，显示图片
    if (user.avatarUrl) {
        userAvatar.innerHTML = `<img src="${user.avatarUrl}" alt="${user.name}">`;
        userAvatar.style.background = 'none';
    } else {
        // 否则显示首字母
        userAvatar.textContent = user.name.charAt(0).toUpperCase();
    }
}
```

### 添加更多用户菜单项

在 `navbar.html` 或 HTML 文件中的导航部分添加：

```html
<div class="user-dropdown">
    <!-- 现有菜单项 -->
    <a href="#" class="dropdown-item" onclick="showProfile()">
        <svg>...</svg>
        个人中心
    </a>
    
    <!-- 新增菜单项 -->
    <a href="#" class="dropdown-item" onclick="showSettings()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
        设置
    </a>
    
    <div class="dropdown-divider"></div>
    <a href="#" class="dropdown-item logout" onclick="handleLogout()">
        <svg>...</svg>
        退出登录
    </a>
</div>
```

然后添加对应的处理函数：

```javascript
window.showSettings = function(e) {
    if (e) e.preventDefault();
    alert('设置页面开发中...');
    // window.location.href = '/settings.html';
};
```

## 样式自定义

### 修改登录按钮颜色

在 CSS 中覆盖变量：

```css
:root {
    --primary-color: #your-color;
    --accent-color: #your-accent-color;
}
```

或直接修改 `.btn-login` 样式：

```css
.btn-login {
    background: linear-gradient(135deg, #ff6b6b, #feca57);
}
```

### 修改用户头像大小

```css
.user-avatar {
    width: 40px;
    height: 40px;
    font-size: 1.1rem;
}
```

### 修改下拉菜单宽度

```css
.user-dropdown {
    min-width: 220px;
}
```

## 安全建议

### 1. 使用 HTTPS
确保在生产环境中使用 HTTPS 协议传输敏感数据。

### 2. Token 存储
- **短期会话**：使用 `sessionStorage`
- **长期会话**：使用 `localStorage` + 刷新Token机制
- **更安全**：使用 HttpOnly Cookie

### 3. Token 过期处理

```javascript
function isTokenExpired() {
    const token = localStorage.getItem('token');
    if (!token) return true;
    
    // 解析 JWT token 的过期时间
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
}

// 定期检查 token 状态
setInterval(() => {
    if (isTokenExpired()) {
        handleLogout();
        alert('会话已过期，请重新登录');
    }
}, 60000); // 每分钟检查一次
```

### 4. CSRF 保护
在 API 请求中添加 CSRF token。

## API 集成示例

### 后端登录接口（Python FastAPI 示例）

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import jwt
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/auth", tags=["auth"])

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    user: dict
    token: str

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    # 验证用户凭据
    user = verify_credentials(request.email, request.password)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # 生成 JWT token
    token = create_jwt_token(user)
    
    return LoginResponse(
        success=True,
        user={
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "avatar": user.avatar_url
        },
        token=token
    )

def create_jwt_token(user):
    payload = {
        "user_id": user.id,
        "exp": datetime.utcnow() + timedelta(hours=24),
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, "SECRET_KEY", algorithm="HS256")
```

### 前端调用示例

```javascript
async function login(email, password) {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) {
            throw new Error('Login failed');
        }
        
        const data = await response.json();
        
        // 保存用户信息和 token
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        
        // 更新 UI
        updateAuthUI(true);
        
        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}
```

## 测试清单

- [ ] 点击登录按钮显示登录界面
- [ ] 输入正确的凭据后成功登录
- [ ] 登录后显示用户头像和名称
- [ ] 悬停用户信息显示下拉菜单
- [ ] 点击"个人中心"跳转正确
- [ ] 点击"学习仪表盘"跳转正确
- [ ] 点击"退出登录"清除用户信息
- [ ] 退出后显示登录按钮
- [ ] 刷新页面后保持登录状态
- [ ] 移动端显示正常
- [ ] Token 过期后自动退出

## 常见问题

### Q: 如何记住用户的登录状态？

A: 使用 `localStorage` 存储用户信息和 token，页面加载时检查并恢复状态。

### Q: 如何实现自动登录？

A: 在 `initAuthState()` 中检查 localStorage 中的 token，如果有效则自动登录。

### Q: 如何处理多个标签页的登录状态同步？

A: 监听 `storage` 事件：

```javascript
window.addEventListener('storage', (e) => {
    if (e.key === 'user') {
        initAuthState();
    }
});
```

### Q: 如何添加第三方登录（Google、GitHub等）？

A: 在登录模态框中添加第三方登录按钮，使用 OAuth 2.0 流程。

## 相关文档

- [导航组件使用指南](NAVBAR_USAGE.md)
- [导航组件实施报告](NAVBAR_IMPLEMENTATION_REPORT.md)

## 更新日志

- **v1.1** (2026-04-19): 添加用户登录控件
  - 登录/登出功能
  - 用户信息显示
  - 下拉菜单
  - 响应式设计
  - localStorage 状态管理
