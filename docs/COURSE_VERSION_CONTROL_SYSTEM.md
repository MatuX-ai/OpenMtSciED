# 课程版本控制系统技术文档

## 系统概述

课程版本控制系统是一个基于Git理念的版本管理解决方案，专门为教育平台的课程内容管理而设计。该系统提供了完整的版本控制功能，包括提交、分支、合并、回滚等核心特性。

## 核心功能

### 1. 版本管理
- **提交历史**: 完整的版本提交历史记录
- **版本对比**: 支持任意两个版本间的差异比较
- **版本回滚**: 可以回滚到任意历史版本
- **变更追踪**: 详细的变更类型记录（新增、修改、删除）

### 2. 分支管理
- **多分支支持**: 支持创建和管理多个开发分支
- **分支切换**: 灵活的分支切换机制
- **分支保护**: 可配置的分支保护策略
- **分支状态**: 实时跟踪各分支的HEAD版本

### 3. 合并系统
- **合并请求**: 类似Git PR的合并请求机制
- **冲突检测**: 自动检测合并冲突
- **三路合并**: 基于共同祖先的智能合并算法
- **合并历史**: 完整的合并操作记录

## 数据模型设计

### CourseVersion (课程版本)
```python
class CourseVersion(Base):
    id = Column(Integer, primary_key=True)
    course_id = Column(Integer, ForeignKey('courses.id'))
    version_number = Column(Integer)           # 版本号
    commit_hash = Column(String(64))           # 提交哈希
    parent_commit_hash = Column(String(64))    # 父提交哈希
    author_email = Column(String(255))         # 提交者邮箱
    commit_message = Column(Text)              # 提交消息
    course_snapshot = Column(JSON)             # 课程完整快照
    branch_name = Column(String(100))          # 分支名称
    is_head = Column(Boolean)                  # 是否为分支头
    has_conflicts = Column(Boolean)            # 是否存在冲突
```

### VersionBranch (版本分支)
```python
class VersionBranch(Base):
    id = Column(Integer, primary_key=True)
    course_id = Column(Integer, ForeignKey('courses.id'))
    name = Column(String(100))                 # 分支名称
    description = Column(Text)                 # 分支描述
    is_active = Column(Boolean)                # 是否活跃
    is_protected = Column(Boolean)             # 是否受保护
    head_commit_hash = Column(String(64))      # HEAD提交哈希
```

### MergeRequest (合并请求)
```python
class MergeRequest(Base):
    id = Column(Integer, primary_key=True)
    course_id = Column(Integer, ForeignKey('courses.id'))
    source_branch = Column(String(100))        # 源分支
    target_branch = Column(String(100))        # 目标分支
    title = Column(String(255))                # 请求标题
    status = Column(String(50))                # 状态(open/closed/merged)
    has_conflicts = Column(Boolean)            # 是否有冲突
    merge_commit_hash = Column(String(64))     # 合并提交哈希
```

## API接口设计

### 版本管理接口

#### 提交新版本
```
POST /api/v1/org/{org_id}/courses/{course_id}/versions
```

**请求体:**
```json
{
    "course_id": 1,
    "commit_message": "Add new lesson content",
    "branch_name": "main",
    "course_data": {
        "title": "Python编程基础",
        "description": "入门级Python课程",
        "lessons": [...]
    }
}
```

#### 获取版本历史
```
GET /api/v1/org/{org_id}/courses/{course_id}/versions
```

**响应:**
```json
[
    {
        "id": 3,
        "version_number": 3,
        "commit_hash": "a1b2c3d4...",
        "author_email": "teacher@example.com",
        "commit_message": "Add control structures",
        "timestamp": "2024-01-15T10:30:00",
        "branch_name": "main",
        "is_head": true
    }
]
```

#### 获取特定版本内容
```
GET /api/v1/org/{org_id}/courses/{course_id}/versions/{commit_hash}/content
```

### 分支管理接口

#### 创建分支
```
POST /api/v1/org/{org_id}/courses/{course_id}/branches
```

**请求体:**
```json
{
    "name": "feature/new-content",
    "description": "开发新课程内容"
}
```

#### 列出分支
```
GET /api/v1/org/{org_id}/courses/{course_id}/branches
```

### 合并管理接口

#### 创建合并请求
```
POST /api/v1/org/{org_id}/courses/{course_id}/merge-requests
```

**请求体:**
```json
{
    "source_branch": "feature/new-content",
    "target_branch": "main",
    "title": "合并新内容到主分支",
    "description": "添加了三个新的实验章节"
}
```

#### 执行合并
```
POST /api/v1/org/{org_id}/courses/{course_id}/merge-requests/{mr_id}/merge
```

### 版本对比接口

#### 比较两个版本
```
GET /api/v1/org/{org_id}/courses/{course_id}/compare/{from_commit}...{to_commit}
```

**响应:**
```json
{
    "from_version": 2,
    "to_version": 3,
    "changes": {
        "type": "update",
        "added": ["new_chapter"],
        "modified": ["description"],
        "deleted": ["old_lesson"]
    }
}
```

## 核心算法实现

### 1. 提交哈希生成
```python
def generate_commit_hash(self):
    """生成基于内容的提交哈希"""
    content_str = json.dumps(self.course_snapshot, sort_keys=True, default=str)
    commit_data = f"{content_str}{self.author_email}{self.timestamp.isoformat()}"
    self.commit_hash = hashlib.sha256(commit_data.encode()).hexdigest()
```

### 2. 变更检测算法
```python
def calculate_changes_from_parent(self, parent_version):
    """计算相对于父版本的变更"""
    if not parent_version:
        return {"type": "initial", "added": list(self.course_snapshot.keys())}
    
    parent_data = parent_version.course_snapshot
    current_data = self.course_snapshot
    
    added = [k for k in current_data if k not in parent_data]
    modified = [k for k in current_data if k in parent_data and current_data[k] != parent_data[k]]
    deleted = [k for k in parent_data if k not in current_data]
    
    return {"type": "update", "added": added, "modified": modified, "deleted": deleted}
```

### 3. 三路合并算法
```python
def merge_with_version(self, other_version):
    """与另一个版本合并"""
    base_version = self.find_common_ancestor(other_version)
    
    # 三路合并逻辑
    merged_data = {}
    conflicts = {}
    
    for key in all_keys:
        if our_value == their_value:
            merged_data[key] = our_value
        elif our_value == base_value:
            merged_data[key] = their_value
        elif their_value == base_value:
            merged_data[key] = our_value
        else:
            conflicts[key] = {"base": base_value, "ours": our_value, "theirs": their_value}
            merged_data[key] = our_value  # 默认选择我们的版本
    
    return len(conflicts) == 0, {"merged_data": merged_data, "conflicts": conflicts}
```

## 使用示例

### 完整工作流程

```python
# 1. 初始化课程并提交第一个版本
version_service.commit_course_version(
    org_id=1,
    version_data=CourseVersionCreate(
        course_id=1,
        commit_message="Initial commit",
        course_data=initial_course_data
    ),
    current_user=teacher_user
)

# 2. 创建功能分支
version_service.create_branch(
    course_id=1,
    org_id=1,
    branch_data=BranchCreate(
        name="feature/advanced-topics",
        description="添加高级主题内容"
    ),
    current_user=teacher_user
)

# 3. 在分支上进行开发
# ... 修改课程内容 ...

# 4. 提交分支上的更改
version_service.commit_course_version(
    org_id=1,
    version_data=CourseVersionCreate(
        course_id=1,
        commit_message="Add advanced Python topics",
        branch_name="feature/advanced-topics",
        course_data=updated_course_data
    ),
    current_user=teacher_user
)

# 5. 创建合并请求
merge_request = version_service.create_merge_request(
    course_id=1,
    org_id=1,
    mr_data=MergeRequestCreate(
        source_branch="feature/advanced-topics",
        target_branch="main",
        title="合并高级主题内容",
        description="添加面向对象编程和异常处理章节"
    ),
    current_user=teacher_user
)

# 6. 执行合并
merged_version = version_service.merge_branches(
    merge_request_id=merge_request.id,
    org_id=1,
    current_user=teacher_user
)
```

## 系统特点

### 1. 数据一致性保证
- 使用数据库事务确保操作原子性
- 外键约束保证数据完整性
- 版本链的完整性验证

### 2. 性能优化
- 索引优化查询性能
- 分页支持大量版本历史
- 缓存常用查询结果

### 3. 安全性考虑
- 基于RBAC的权限控制
- 组织隔离确保数据安全
- 操作审计日志记录

### 4. 扩展性设计
- 模块化架构便于功能扩展
- 支持自定义合并策略
- 可插拔的冲突解决机制

## 部署和维护

### 数据库迁移
```bash
# 创建版本控制表
python backend/migrations/004_create_course_version_tables.py create

# 查看表结构
python backend/migrations/004_create_course_version_tables.py schema

# 删除表（谨慎使用）
python backend/migrations/004_create_course_version_tables.py drop
```

### 系统监控
- 版本提交频率统计
- 合并成功率监控
- 冲突发生率分析
- 系统性能指标跟踪

## 测试覆盖

### 单元测试
- 版本提交功能测试
- 分支管理测试
- 合并逻辑测试
- 冲突检测测试

### 集成测试
- 完整工作流程测试
- 多用户并发操作测试
- 异常情况处理测试

### 性能测试
- 大量版本历史查询性能
- 复杂合并操作性能
- 并发提交处理能力

## 未来扩展方向

1. **分布式版本控制**: 支持离线编辑和同步
2. **智能合并**: 基于AI的内容理解合并
3. **版本标签**: 支持语义化版本标记
4. **协作评审**: 内置代码评审流程
5. **自动化测试**: 版本变更自动质量检查

---

*本文档最后更新: 2024年2月*