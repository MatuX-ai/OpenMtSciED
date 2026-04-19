# 异步数据库配置使用指南

## 概述

本项目提供了两种数据库连接方式：
1. **同步数据库** (`database.py`) - 适用于传统同步操作
2. **异步数据库** (`async_database.py`) - 适用于高性能异步操作

## 文件说明

### 核心文件

- `backend/openmtscied/database.py` - 同步数据库配置（使用 psycopg2）
- `backend/openmtscied/async_database.py` - 异步数据库配置（使用 asyncpg）
- `init_neon_db.py` - 同步初始化脚本
- `init_neon_db_async.py` - 异步初始化脚本

### 示例 API

- `backend/openmtscied/api/async_example_api.py` - 异步 API 使用示例

## 技术栈

- **SQLAlchemy 2.0+** - ORM 框架
- **asyncpg** - PostgreSQL 异步驱动
- **FastAPI** - 异步 Web 框架

## 配置说明

### 环境变量

在 `.env.local` 中配置数据库 URL：

```bash
# 可以使用任意一种格式，系统会自动转换
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/dbname
# 或
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

### SSL 连接

NeonDB 强制要求 SSL 连接，配置已自动处理：
- 同步模式：`connect_args={"sslmode": "require"}`
- 异步模式：`connect_args={"ssl": "require"}`

## 使用方法

### 1. 初始化数据库

#### 同步方式
```bash
python init_neon_db.py
```

#### 异步方式
```bash
python init_neon_db_async.py
```

### 2. 在 FastAPI 中使用异步数据库

#### 导入依赖
```python
from backend.openmtscied.async_database import get_async_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
```

#### 创建异步端点
```python
@router.get("/users")
async def list_users(db: AsyncSession = Depends(get_async_db)):
    # 执行异步查询
    result = await db.execute(select(User))
    users = result.scalars().all()
    return {"users": users}
```

### 3. 异步 CRUD 操作示例

#### 查询
```python
# 查询单个对象
result = await db.execute(select(User).where(User.id == user_id))
user = result.scalar_one_or_none()

# 查询多个对象
result = await db.execute(select(User))
users = result.scalars().all()
```

#### 创建
```python
new_user = User(username="test", email="test@example.com")
db.add(new_user)
await db.commit()
await db.refresh(new_user)
```

#### 更新
```python
user.email = "newemail@example.com"
await db.commit()
```

#### 删除
```python
await db.delete(user)
await db.commit()
```

## 同步 vs 异步对比

| 特性 | 同步 (database.py) | 异步 (async_database.py) |
|------|-------------------|-------------------------|
| 驱动 | psycopg2 | asyncpg |
| 会话类型 | Session | AsyncSession |
| 查询方式 | `db.query()` | `await db.execute()` |
| 适用场景 | 简单脚本、后台任务 | 高并发 API、实时应用 |
| 性能 | 标准 | 更高（非阻塞） |

## 最佳实践

### 1. 选择合适的模式

- **使用异步**：
  - 高并发 API 端点
  - 需要同时处理多个数据库请求
  - I/O 密集型操作

- **使用同步**：
  - 简单的数据迁移脚本
  - 后台批处理任务
  - 不需要高并发的场景

### 2. 会话管理

异步会话会自动管理生命周期：
```python
async def get_async_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
```

### 3. 错误处理

始终包裹异常处理：
```python
try:
    result = await db.execute(select(User))
    users = result.scalars().all()
except Exception as e:
    logger.error(f"数据库错误: {e}")
    raise HTTPException(status_code=500, detail="数据库错误")
```

### 4. 事务管理

```python
# 自动提交
await db.commit()

# 回滚
await db.rollback()

# 刷新对象
await db.refresh(user)
```

## 注册异步路由

在 `main.py` 中注册异步 API：

```python
from .api import async_example_api

app.include_router(async_example_api.router)
```

## 测试异步 API

启动服务后访问：
```bash
# 获取用户列表
curl http://localhost:8000/api/v1/async-users/

# 获取单个用户
curl http://localhost:8000/api/v1/async-users/1
```

## 常见问题

### Q: 为什么需要两种数据库配置？
A: 同步配置适合简单任务和脚本，异步配置适合高并发 API。两者可以共存，根据场景选择。

### Q: asyncpg 和 psycopg2 有什么区别？
A: asyncpg 是纯异步驱动，性能更好；psycopg2 是同步驱动，更成熟稳定。

### Q: 如何切换驱动？
A: 修改 `.env.local` 中的 `DATABASE_URL`，系统会自动检测并转换。

### Q: 连接池如何配置？
A: 在 `async_database.py` 中调整 `create_async_engine` 的参数：
```python
async_engine = create_async_engine(
    ASYNC_DATABASE_URL,
    pool_size=10,        # 连接池大小
    max_overflow=20,     # 最大溢出连接数
    pool_pre_ping=True,  # 健康检查
    pool_recycle=3600    # 连接回收时间
)
```

## 性能优化建议

1. **使用连接池**：已默认启用
2. **批量操作**：使用 `db.add_all()` 而非多次 `db.add()`
3. **延迟加载**：谨慎使用关系加载，避免 N+1 查询
4. **索引优化**：为常用查询字段添加数据库索引
5. **查询优化**：只选择需要的字段，避免 `SELECT *`

## 相关资源

- [SQLAlchemy 异步文档](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html)
- [asyncpg 文档](https://magicstack.github.io/asyncpg/)
- [FastAPI 异步支持](https://fastapi.tiangolo.com/async/)
