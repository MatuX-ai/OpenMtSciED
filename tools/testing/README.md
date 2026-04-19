# 测试工具目录

本目录存放各种测试脚本和临时检查工具。

## 📁 目录内容

### 数据检查脚本 (check_*.py)
用于检查数据库、编码、配置等状态的脚本。

- `check_db_url.py` - 检查数据库URL配置
- `check_encoding.py` - 检查文件编码
- `check_existing_data.py` - 检查现有数据
- `check_k12_distribution.py` - 检查K12数据分布
- `check_kg_nodes.py` - 检查知识图谱节点
- `check_settings.py` - 检查系统设置
- `check_settings_db_url.py` - 检查数据库URL设置

### 数据统计脚本 (count_*.py)
用于统计课程、节点等数量的脚本。

- `count_all_courses.py` - 统计所有课程数量
- `count_all_nodes.py` - 统计所有节点数量

### 数据操作脚本
- `delete_subject_courses.py` - 删除特定学科课程
- `generate_bcrypt_hash.py` - 生成bcrypt哈希（完整版）
- `generate_bcrypt_simple.py` - 生成bcrypt哈希（简化版）
- `init_neon_db.py` - 初始化Neon数据库（同步）
- `init_neon_db_async.py` - 初始化Neon数据库（异步）

### 测试脚本 (test_*.py)
各种功能测试脚本。

- `test_arcadedb_adapter.py` - ArcadeDB适配器测试
- `test_arcadedb_simple.py` - ArcadeDB简单测试
- `test_async_db.py` - 异步数据库测试
- `test_hardware_project_api.py` - 硬件项目API测试
- `test_import.py` - 导入功能测试
- `test_learning_path_api.py` - 学习路径API测试
- `test_login.py` - 登录功能测试
- `test_login_api.py` - 登录API测试
- `test_neo4j_http.py` - Neo4j HTTP接口测试
- `test_neon_connection.py` - Neon连接测试
- `test_neon_direct.py` - Neon直接连接测试
- `test_neon_sqlalchemy.py` - Neon SQLAlchemy测试
- `test_pg8000.py` - pg8000驱动测试
- `test_query_format.py` - 查询格式测试
- `test_supabase_api.py` - Supabase API测试
- `test_supabase_connection.py` - Supabase连接测试
- `test_web_frontend.py` - Web前端测试

### 验证脚本 (verify_*.py)
用于验证系统状态和数据完整性的脚本。

- `verify_neo4j_connection.py` - 验证Neo4j连接
- `verify_neo4j_data.py` - 验证Neo4j数据
- `verify_neo4j_http.py` - 验证Neo4j HTTP接口

### 其他工具
- `neo4j_heartbeat.py` - Neo4j心跳检测

### 测试数据库
- `test_unified_courses.db` - 统一课程测试数据库（SQLite）

## ⚠️ 使用说明

### 这些脚本的特点
1. **临时性**: 大多数是为特定任务创建的临时脚本
2. **独立性**: 每个脚本可以独立运行
3. **实验性**: 可能包含未完善的代码或硬编码的配置

### 运行方式
```bash
# 运行任意测试脚本
python tools/testing/test_login.py

# 运行检查脚本
python tools/testing/check_db_url.py

# 运行验证脚本
python tools/testing/verify_neo4j_connection.py
```

### 注意事项
- 运行前请确保已安装所需的依赖包
- 部分脚本需要配置环境变量（如数据库URL）
- 测试数据库文件较大（784KB），谨慎提交到git

## 🗑️ 清理建议

以下脚本可以考虑删除或整合：

### 可以删除的（已过时）
- `test_arcadedb_*.py` - ArcadeDB已废弃
- `test_neon_*.py` - 如不再使用Neon数据库
- `test_supabase_*.py` - 如不再使用Supabase

### 可以整合的
- 多个`check_*.py`可以合并为一个统一的检查工具
- 多个`test_*_connection.py`可以合并为连接测试套件

### 建议保留的
- `generate_bcrypt_*.py` - 密码哈希生成工具
- `init_neon_db_*.py` - 数据库初始化工具（如仍在使用）

## 📅 最后整理日期

2026-04-19

## 🔗 相关文档

- [清理报告](../../CLEANUP_REPORT_20260419.md)
- [开发总结](../../DEVELOPMENT_SUMMARY.md)
