# OpenMTSciEd 营销站点

这是 OpenMTSciEd 项目的独立营销网站，与核心教育引擎解耦。

## 目录结构

```
marketing-site/
├── frontend/          # 营销网站前端（从主项目分离）
│   ├── home/         # 首页组件
│   └── open-source/  # 开源介绍页面
└── backend/          # 营销相关 API（可选）
    └── marketing_api.py
```

## 部署选项

### 选项 1: 静态托管（推荐）

营销网站可以部署为纯静态站点：

```bash
# 使用 Vercel
vercel deploy

# 或使用 Netlify
netlify deploy

# 或 GitHub Pages
npm run build
gh-pages -d dist
```

### 选项 2: 独立服务

如果需要后端 API（如搜索功能）：

```bash
cd backend
pip install fastapi uvicorn
uvicorn marketing_api:app --reload
```

## 与主项目集成

如需将营销站点重新集成到主项目中：

1. 将 `frontend/` 中的组件复制回 `OpenMTSciEd/frontend/src/app/`
2. 在 `app.routes.ts` 中添加路由
3. 将 `backend/marketing_api.py` 移回 `backend/openmtscied/api/`
4. 在 `main.py` 中注册路由

## 自定义

编辑 `frontend/home/home.component.ts` 修改首页内容。

## 许可证

MIT License
