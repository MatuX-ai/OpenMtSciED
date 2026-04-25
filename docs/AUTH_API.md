# 认证 API 文档

## 基础信息

- **Base URL**: `http://localhost:8000/api/v1/auth`
- **认证方式**: Bearer Token (JWT)
- **数据格式**: JSON

---

## 公开端点（无需认证）

### 1. 用户注册

**端点**: `POST /register`

**速率限制**: 3次/分钟

**请求体**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**响应** (200 OK):
```json
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "role": "user"
}
```

**错误响应**:
- `400 Bad Request`: 用户名或邮箱已存在
- `429 Too Many Requests`: 请求过于频繁

**示例**:
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "securepass123"
  }'
```

---

### 2. 用户登录

**端点**: `POST /login`

**速率限制**: 5次/分钟

**请求体** (Form Data):
```
username: string
password: string
```

**响应** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**错误响应**:
- `401 Unauthorized`: 用户名或密码错误
- `429 Too Many Requests`: 请求过于频繁

**示例**:
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=12345678"
```

---

## 受保护端点（需要认证）

所有受保护端点需要在请求头中包含 JWT Token：

```
Authorization: Bearer <your_access_token>
```

### 3. 获取当前用户信息

**端点**: `GET /me`

**响应** (200 OK):
```json
{
  "id": 1,
  "username": "admin",
  "email": "3936318150@qq.com",
  "role": "admin"
}
```

**错误响应**:
- `401 Unauthorized`: Token无效或过期

**示例**:
```bash
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 4. 更新用户个人资料

**端点**: `PUT /me/profile`

**请求体**:
```json
{
  "full_name": "string (可选)",
  "avatar_url": "string (可选)",
  "bio": "string (可选)",
  "phone": "string (可选)",
  "location": "string (可选)",
  "website": "string (可选)"
}
```

**响应** (200 OK):
```json
{
  "id": 1,
  "username": "admin",
  "email": "3936318150@qq.com",
  "role": "admin"
}
```

**错误响应**:
- `401 Unauthorized`: Token无效或过期
- `404 Not Found`: 用户不存在

**示例**:
```bash
curl -X PUT http://localhost:8000/api/v1/auth/me/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "张三",
    "bio": "STEM教育爱好者",
    "phone": "13800138000"
  }'
```

---

### 5. 修改密码

**端点**: `POST /me/password`

**请求体**:
```json
{
  "old_password": "string",
  "new_password": "string"
}
```

**响应** (200 OK):
```json
{
  "message": "密码修改成功"
}
```

**错误响应**:
- `400 Bad Request`: 旧密码错误
- `401 Unauthorized`: Token无效或过期
- `404 Not Found`: 用户不存在

**示例**:
```bash
curl -X POST http://localhost:8000/api/v1/auth/me/password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "old_password": "oldpass123",
    "new_password": "newpass456"
  }'
```

---

## 前端集成示例

### Angular Service

```typescript
// auth.service.ts
export class AuthService {
  private apiUrl = 'http://localhost:8000/api/v1';

  // 注册
  register(userData: RegisterRequest): Observable<UserInfo> {
    return this.http.post<UserInfo>(`${this.apiUrl}/auth/register`, userData);
  }

  // 登录
  login(credentials: LoginRequest): Observable<AuthResponse> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, formData).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access_token);
      })
    );
  }

  // 获取当前用户
  getCurrentUser(): Observable<UserInfo> {
    const token = localStorage.getItem('access_token');
    return this.http.get<UserInfo>(`${this.apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  // 更新资料
  updateProfile(profileData: any): Observable<UserInfo> {
    const token = localStorage.getItem('access_token');
    return this.http.put<UserInfo>(`${this.apiUrl}/auth/me/profile`, profileData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // 修改密码
  changePassword(oldPassword: string, newPassword: string): Observable<void> {
    const token = localStorage.getItem('access_token');
    return this.http.post<void>(`${this.apiUrl}/auth/me/password`, {
      old_password: oldPassword,
      new_password: newPassword
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }
}
```

### JavaScript (Website)

```javascript
// 登录
async function login(username, password) {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  
  const response = await fetch('http://localhost:8000/api/v1/auth/login', {
    method: 'POST',
    body: formData
  });
  
  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    return data;
  } else {
    throw new Error('登录失败');
  }
}

// 注册
async function register(username, email, password) {
  const response = await fetch('http://localhost:8000/api/v1/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, email, password })
  });
  
  if (response.ok) {
    return await response.json();
  } else {
    const error = await response.json();
    throw new Error(error.detail);
  }
}

// 获取用户信息
async function getCurrentUser() {
  const token = localStorage.getItem('access_token');
  const response = await fetch('http://localhost:8000/api/v1/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error('获取用户信息失败');
  }
}
```

---

## 安全注意事项

1. **Token存储**: 
   - 建议将 access_token 存储在 HttpOnly Cookie 中以防止XSS攻击
   - 当前实现使用 localStorage，适合开发环境

2. **密码安全**:
   - 密码使用 bcrypt 哈希存储
   - 传输时使用 HTTPS（生产环境）

3. **速率限制**:
   - 登录: 5次/分钟
   - 注册: 3次/分钟
   - 防止暴力破解和滥用

4. **Token过期**:
   - 默认有效期: 7天 (可通过环境变量 `ACCESS_TOKEN_EXPIRE_MINUTES` 配置)
   - 过期后需要重新登录

---

## 测试

运行测试脚本验证API功能：

```bash
python tests/test_auth_api.py
```

测试包括：
- ✅ 用户注册
- ✅ 用户登录
- ✅ 获取用户信息
- ✅ 更新用户资料
- ✅ 修改密码
- ✅ 重复注册检测

---

## 待实现功能

- [ ] 邮箱验证
- [ ] 密码重置（通过邮箱）
- [ ] 双因素认证 (2FA)
- [ ] 第三方登录 (GitHub, Google)
- [ ] Token刷新机制
- [ ] 会话管理
