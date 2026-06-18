# OpenMTSciEd API 实施指南

> **状态**: 2026-06-18 更新 (Neo4j → PostgreSQL/Prisma 迁移完成)
> 原 Neo4j 实施代码已遗弃,请参考以下 PostgreSQL + Prisma 版本。

## 📁 当前目录结构

```
G:\OpenMTSciEd\backend-next\app\api\
├── health/
│   └── route.ts          ✅ 已创建
└── v1/
    ├── tutorials/
    │   ├── route.ts      ✅ Prisma 实现
    │   └── [id]/
    │       └── route.ts  ✅ Prisma 实现
    ├── coursewares/
    │   └── route.ts      ✅ Prisma 实现
    ├── knowledge-graph/
    │   ├── path/
    │   │   └── route.ts  ✅ 闭包表递归 CTE
    │   └── recommend/
    │       └── route.ts  ✅ Prisma + concept 关联
    ├── hardware-projects/
    │   └── route.ts      ✅ Prisma 实现
    ├── questions/
    │   ├── banks/        ✅ Prisma 分组统计
    │   ├── import-stem/  ✅ Prisma upsert
    │   └── import-extended/ ✅ Prisma upsert
    └── admin/
        ├── graph/        ✅ SQL 统计
        └── graph/overview/ ✅ 图可视化
```

## 🔧 核心库文件

### 1. lib/db.ts (Prisma 客户端单例)

**路径**: `G:\OpenMTSciEd\backend-next\lib\db.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 2. lib/concept-path.ts (闭包表服务)

**路径**: `G:\OpenMTSciEd\backend-next\lib\concept-path.ts`

```typescript
import { prisma } from '@/lib/db';

// 递归 CTE 查询前置依赖
export async function getPrerequisites(conceptId: number, pathType: string = 'required') {
  return prisma.$queryRawUnsafe<Array<{id: number, depth: number}>>(
    `SELECT descendant_id as id, depth
     FROM concept_path
     WHERE ancestor_id = $1 AND path_type = $2 AND depth > 0
     ORDER BY depth`,
    [conceptId, pathType]
  );
}

// 查找两个知识点之间的最短路径
export async function findRoute(
  startId: number,
  endId: number,
  pathType: string = 'required'
) {
  return prisma.$queryRawUnsafe<Array<{concept_id: number, depth: number}>>(
    `WITH RECURSIVE route AS (
      SELECT $1::int as concept_id, 0 as depth
      UNION ALL
      SELECT cd.dependent_id, r.depth + 1
      FROM route r
      JOIN concept_dependency cd ON cd.prerequisite_id = r.concept_id
      WHERE r.depth < 20 AND cd.path_type = $2
    )
    SELECT * FROM route WHERE concept_id = $3`,
    [startId, pathType, endId]
  );
}
```

### 3. lib/auth.ts (JWT 认证)

**路径**: `G:\OpenMTSciEd\backend-next\lib\auth.ts`

```typescript
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export function signToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): object | null {
  try { return jwt.verify(token, JWT_SECRET) as object; }
  catch { return null; }
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}
```

## 🚀 启动步骤

1. **配置环境变量** (`G:\OpenMTSciEd\backend-next\.env.local`):
```env
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"
JWT_SECRET="your_jwt_secret"
```

2. **安装依赖**:
```bash
cd G:\OpenMTSciEd\backend-next
npm install
```

3. **同步数据库**:
```bash
npx prisma generate
npx prisma db push
```

4. **启动开发服务器**:
```bash
npm run dev
```

5. **测试 API**:
```bash
# 健康检查
curl http://localhost:3000/api/health

# 获取教程列表
curl "http://localhost:3000/api/v1/tutorials?page=1&size=10"

# 生成学习路径
curl -X POST http://localhost:3000/api/v1/knowledge-graph/path \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"current_grade":"9-12","subjects":["physics"]}'
```

## 📝 iMato 前端集成

修改 `g:\iMato\src\environments\environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  openMtSciEdApiUrl: 'http://localhost:3000/api/v1',
};
```

创建服务 `g:\iMato\src\app\services\openmt-scied.service.ts` (见之前的方案)

---

**最后更新**: 2026-06-18  
**技术栈**: Next.js + PostgreSQL (Prisma) + 闭包表 + TypeScript
