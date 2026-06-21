# Desktop Manager 知识图谱组件 - Neo4j→PostgreSQL 闭包表迁移

## Context（背景与目标）

后端已完成 Neo4j 图数据库到 PostgreSQL 闭包表（Prisma + `concept_path` 表）的架构迁移：
- 后端 `lib/neo4j.ts` 与 `neo4j-driver` 依赖已删除
- `/api/v1/learning/path` 端点改用 PostgreSQL 闭包表查询（返回 `{ learning_path[], total, filters, source: 'postgresql_closure' }`）
- `desktop-manager` 中残留 1 处 Neo4j 描述文案（第 320 行 `console.log`），需同步迁移
- `question.service.ts` 第 32 行的 `apiUrl` 仅服务于题库相关接口（`/banks`、`/questions`、`/submit-answer` 等），**未调用** `/learning/path`，经核查无需修改

**目标**：消除 desktop-manager 中 Neo4j 引用，并在知识图谱组件内直接接通 PostgreSQL 闭包表 API，使学习路径功能真正可用。

---

## 修改文件

### 文件 1：`desktop-manager/src/app/features/knowledge-graph/knowledge-graph.component.ts`

#### 1.1 顶部 import 增补
在现有 import 块中加入：
```typescript
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
```

#### 1.2 注入依赖
在 `KnowledgeGraphComponent` 类内 `chartContainer` 字段下方新增：
```typescript
private readonly apiUrl = 'http://localhost:3000/api/v1/learning/path';
```
并将构造函数改为：
```typescript
constructor(
  private snackBar: MatSnackBar,
  private http: HttpClient,
  private authService: AuthService,
) {}
```

#### 1.3 `ngOnInit` 改造：先 mock 占位 + 异步拉真实数据
```typescript
ngOnInit(): void {
  // 先用 mock 数据保证 UI 立即可见，避免空白态
  this.learningPaths = this.getMockLearningPaths();
  // 异步从 PostgreSQL 闭包表加载真实学习路径
  this.loadRealLearningPaths();
}
```

#### 1.4 完整实现 `loadRealLearningPaths()`
替换第 318-324 行原有 stub：
```typescript
async loadRealLearningPaths(): Promise<void> {
  console.log('正在从 PostgreSQL 闭包表加载真实学习路径...');
  try {
    const token = this.authService.getToken();
    if (!token) {
      console.warn('未登录，跳过远端学习路径加载，使用 mock 数据');
      return;
    }

    const response = await firstValueFrom(
      this.http.get<{
        learning_path: Array<{
          id: number;
          title: string;
          description: string | null;
          subject: string;
          grade: string;
          difficulty: string;
          depth: number;
          hasPrerequisites: boolean;
        }>;
        total: number;
        source: string;
      }>(this.apiUrl, {
        headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
        params: { limit: '20' },
      })
    );

    if (response?.learning_path?.length) {
      this.learningPaths = response.learning_path.map((item) =>
        this.mapToLearningPath(item)
      );
      this.updateChart();
      console.log(
        `✅ 成功从 ${response.source} 加载 ${response.learning_path.length} 条学习路径`
      );
    }
  } catch (error: any) {
    // 优雅降级：500/网络错误时保留 mock 数据 + 提示
    console.warn(
      'PostgreSQL 闭包表学习路径加载失败，已迁移至降级方案（保留 mock 数据）:',
      error?.message || error
    );
    this.snackBar.open('路径生成中，已显示本地推荐路径', '关闭', { duration: 3000 });
  }
}

private mapToLearningPath(item: {
  id: number;
  title: string;
  description: string | null;
  difficulty: string;
  depth: number;
}): LearningPath {
  const nodeId = `concept-${item.id}`;
  return {
    id: String(item.id),
    name: item.title,
    description: item.description ?? '基于闭包表生成的学习路径',
    nodes: [
      {
        id: nodeId,
        type: 'tutorial',
        title: item.title,
        source: 'PostgreSQL 闭包表',
        level: 'middle',
        subject: 'stem',
        difficulty: item.depth,
      },
    ],
    edges: [],
  };
}
```

---

### 文件 2：`desktop-manager/src/app/services/question.service.ts`
**无需修改**（已确认：第 32 行 `apiUrl` 仅服务于题库接口，不涉及学习路径；当前文件零 Neo4j 引用）。

---

## 验证方案

执行 `cd desktop-manager && npm run build`，确保：
- TypeScript 类型检查零错误
- Angular AOT 编译通过
- 输出 dist 中无 `neo4j` 字样

随后人工抽检（可选）：
```bash
cd backend-next && npm run dev          # 后端
cd desktop-manager && npm run tauri dev # 桌面端
```
打开知识图谱页面 → DevTools Console 应显示：
- `正在从 PostgreSQL 闭包表加载真实学习路径...`
- `✅ 成功从 postgresql_closure 加载 N 条学习路径`（N > 0 时）
- 或 `PostgreSQL 闭包表学习路径加载失败，已迁移至降级方案...`（后端 500/网络错误时）

**降级路径**：API 失败时 UI 保留 mock 数据 + Toast 提示"路径生成中"，不出现空白态。

---

## 关键文件路径速查

| 用途 | 路径 |
|------|------|
| 主修改文件 | `desktop-manager/src/app/features/knowledge-graph/knowledge-graph.component.ts` |
| Auth Token 来源 | `desktop-manager/src/app/services/auth.service.ts`（`getToken()`） |
| 后端端点实现 | `backend-next/app/api/v1/learning/path/route.ts` |
| 后端闭包表查询 | `backend-next/lib/concept-path.ts` |
| 后端参考文档 | `backend-next/API_DEVELOPMENT_COMPLETE.md` |

---

## 不在本次范围

- 不修改 `question.service.ts`
- 不修改 `lib/neo4j.ts`（已删除）
- 不新增/删除 Prisma 表结构
- 不调整后端路由