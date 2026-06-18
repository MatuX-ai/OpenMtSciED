# 04 - 非功能需求

## 1. 性能需求

### 1.1 API 响应时间

| 端点类型 | 目标响应时间 | 当前参考值 | 优先级 |
|----------|-------------|-----------|--------|
| 健康检查 | < 500ms | ~285ms | P0 |
| 列表查询（教程、硬件等） | < 1.5s | ~864–879ms | P0 |
| 学习路径生成 | < 2s | ~1.4s | P1 |
| 资源推荐 | < 1s | < 1s | P1 |

### 1.2 优化措施

| 措施 | 状态 |
|------|------|
| Neo4j 索引（6 个） | ✅ 已创建 |
| 查询优化 | ✅ 已完成 |
| Redis 缓存层 | ⏳ Phase 2 计划 |
| CDN 静态资源加速 | 🔄 Website 生产环境 |

### 1.3 并发与扩展

| 需求 | 描述 | 状态 |
|------|------|------|
| NFR-P1 | Neo4j 连接池 maxConnectionPoolSize: 50 | ✅ |
| NFR-P2 | 支持 Vercel Serverless 部署 | ✅ |
| NFR-P3 | 水平扩展能力（无状态 API） | ✅ 设计满足 |

---

## 2. 安全需求

### 2.1 认证与授权

| ID | 需求 | 优先级 | 状态 |
|----|------|--------|------|
| NFR-S1 | 密码 bcrypt 加密存储 | P0 | ✅ |
| NFR-S2 | JWT Token 认证，可配置过期时间 | P0 | ✅ |
| NFR-S3 | 管理员接口 role 校验 | P0 | ✅ |
| NFR-S4 | 生产环境 SECRET_KEY 必须通过环境变量配置 | P0 | 🔄 |
| NFR-S5 | API 密钥管理 | P2 | ⏳ |
| NFR-S6 | 速率限制（Rate Limiting） | P2 | ⏳ |

### 2.2 传输与访问

| ID | 需求 | 优先级 | 状态 |
|----|------|--------|------|
| NFR-S7 | 生产环境强制 HTTPS | P0 | ⏳ |
| NFR-S8 | CORS 白名单配置 | P1 | 🔄 |
| NFR-S9 | 敏感操作需重新验证密码 | P2 | ⏳ |

### 2.3 数据隐私

| ID | 需求 | 优先级 | 状态 |
|----|------|--------|------|
| NFR-S10 | Desktop Manager 支持本地 SQLite 离线存储 | P1 | ✅ |
| NFR-S11 | 用户可删除账户（GDPR 友好） | P3 | ⏳ |
| NFR-S12 | 不在日志中输出密码或 Token | P1 | 🔄 |

---

## 3. 可用性与可靠性

| ID | 需求 | 优先级 | 状态 |
|----|------|--------|------|
| NFR-A1 | API 健康检查可用于监控告警 | P0 | ✅ |
| NFR-A2 | 数据库连接失败时返回明确错误 | P0 | ✅ |
| NFR-A3 | 错误监控（Sentry 等） | P2 | ⏳ |
| NFR-A4 | 爬虫失败记录 errorMessage 并可重试 | P1 | ✅ |
| NFR-A5 | 目标可用性 99.5%（生产环境） | P2 | ⏳ |

---

## 4. 兼容性

### 4.1 浏览器（Website）

| 浏览器 | 最低版本 | 状态 |
|--------|---------|------|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |

### 4.2 桌面端

| 平台 | 要求 | 状态 |
|------|------|------|
| Windows | 10+ | ✅ |
| macOS | 10.15+ | ✅ |
| Linux | 主流发行版 | ✅ |

### 4.3 开发环境

| 工具 | 版本要求 |
|------|---------|
| Node.js | >= 18.x |
| Rust | >= 1.70（Desktop） |
| npm | >= 9.x |

---

## 5. 可维护性

| ID | 需求 | 优先级 | 状态 |
|----|------|--------|------|
| NFR-M1 | TypeScript 严格模式 | P1 | ✅ |
| NFR-M2 | 统一代码规范（ESLint / Prettier） | P1 | 🔄 |
| NFR-M3 | API 文档与代码同步更新 | P1 | 🔄 |
| NFR-M4 | Prisma Schema 作为关系型数据单一来源 | P0 | ✅ |
| NFR-M5 | 模块化子项目独立 package.json | P0 | ✅ |

---

## 6. 可访问性

| ID | 需求 | 优先级 | 状态 |
|----|------|--------|------|
| NFR-AC1 | HTML 语义化标签 | P2 | 🔄 |
| NFR-AC2 | ARIA 无障碍属性 | P2 | ⏳ |
| NFR-AC3 | 键盘导航支持 | P2 | ⏳ |
| NFR-AC4 | 移动端触摸友好按钮尺寸 | P1 | ✅ |

---

## 7. 国际化

| ID | 需求 | 优先级 | 状态 |
|----|------|--------|------|
| NFR-I1 | 当前版本以中文为主 | P0 | ✅ |
| NFR-I2 | 多语言支持（i18n） | P3 | ⏳ Phase 3 |

---

## 8. 部署与运维

| ID | 需求 | 优先级 | 状态 |
|----|------|--------|------|
| NFR-D1 | Backend 部署至 Vercel | P1 | ✅ |
| NFR-D2 | Website 静态托管（Vercel） | P1 | ✅ |
| NFR-D3 | 环境变量管理（.env.local） | P0 | ✅ |
| NFR-D4 | 数据库：Neo4j Aura + Neon PostgreSQL | P0 | ✅ |
| NFR-D5 | CI/CD 自动化测试与部署 | P2 | ⏳ |

### 8.1 环境变量（关键）

```env
# PostgreSQL
DATABASE_URL=

# JWT
SECRET_KEY=
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Neo4j
NEO4J_URI=
NEO4J_USER=
NEO4J_PASSWORD=

# iMato 集成（可选）
IMATO_SHARED_SECRET=
```

---

## 9. 许可证与合规

| 需求 | 说明 |
|------|------|
| 开源许可证 | MIT |
| 教育资源 | 遵循各来源平台开放许可（OpenStax、Khan Academy 等） |
| 用户数据 | 本地存储优先（Desktop），云端需明确隐私政策 |

---

## 相关文档

- [功能需求 — 认证章节](./03-functional-requirements.md#fr-12-用户认证)
- [系统架构 — 部署](./06-system-architecture.md)
- [路线图 — Phase 2 安全增强](./07-roadmap-and-status.md)
