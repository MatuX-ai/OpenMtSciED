# Mock数据更新记录

**更新日期：** 2026-04-07  
**更新原因：** 修正Mock数据以符合STEM教育机构定位

---

## 📋 更新内容总览

### 1. 机构示例名称调整

#### ✅ 机构管理（Organization Portal）

| ID | 原名称 | 新名称 | 类型 | 说明 |
|----|--------|--------|------|------|
| 1 | 北京市第一中学 | **星海机器人培训** | STEM培训机构 | 主营机器人、编程等STEM课程 |
| 2 | 上海市实验学校 | **北京市第一中学** | 公立学校 | 引入STEM教育的示范学校 |

**文件位置：** `src/app/management/organization-portal/mock-dashboard-data.ts`

---

### 2. 课程Mock数据全面更新

#### ✅ UnifiedCourseService - 统一课程服务

**文件位置：** `src/app/core/services/unified-course.service.ts`

详细修改内容见下方第3节。

#### ✅ OrgAdminService - 机构管理服务

**文件位置：** `src/app/core/services/org-admin.service.ts`

**修改内容：**

1. **课程列表（getSimulatedCourses）**
   - 原课程：数学强化班、语文强化班、英语强化班、物理强化班、化学强化班
   - 新课程：Scratch编程创客班、Arduino机器人创客班、3D打印创客班、无人机创客班、AI启蒙创客班
   - 班级容量：40人 → 20人（小班教学）

2. **教师信息（getSimulatedTeachers）**
   - 原部门：数学组
   - 新部门：编程教研组、机器人教研组、创客教研组、AI教研组、硬件教研组
   - 邮箱域名：@school.edu.cn → @starhai-robotics.com

3. **学员信息（getSimulatedStudents）**
   - 原年级：高一
   - 新年级：一年级、二年级、三年级、四年级、五年级（循环分配）
   - 班级：1班 → 1班、2班、3班（循环分配）
   - 邮箱域名：@school.edu.cn → @starhai-robotics.com

#### 修改详情

**机构1 - 星海机器人培训**
```typescript
{
  id: 1,
  name: '星海机器人培训',
  contact_email: 'admin@starhai-robotics.com',
  phone: '010-88886666',
  address: '北京市海淀区中关村大街88号',
  website: 'https://www.starhai-robotics.com',
  max_users: 500,
  is_active: true,
}
```

**机构2 - 北京市第一中学**
```typescript
{
  id: 2,
  name: '北京市第一中学',
  contact_email: 'admin@bj1school.edu.cn',
  phone: '010-66668888',
  address: '北京市朝阳区建国路1号',
  website: 'https://www.bj1school.edu.cn',
  max_users: 2000,
  is_active: true,
}
```

---

### 3. 活动记录更新（STEM主题）

#### 机构1 - 星海机器人培训

| 活动ID | 原描述 | 新描述 | 类型 |
|--------|--------|--------|------|
| 1 | 用户张老师登录系统 | **管理员登录系统** | user_login |
| 2 | 创建了新的物理实验项目 | **创建了新的机器人编程项目** | project_created |
| 3 | 激活了5个新许可证 | 激活了5个新许可证 | license_used |
| 4 | Arduino设备使用率达到85% | Arduino设备使用率达到85% | hardware_access |

#### 机构2 - 北京市第一中学

| 活动ID | 原描述 | 新描述 | 类型 |
|--------|--------|--------|------|
| 1 | 用户李老师登录系统 | **教师登录系统** | user_login |
| 2 | 创建了化学实验数据分析项目 | **创建了STEM创客教育项目** | project_created |
| 3 | 激活了3个新许可证 | 激活了3个新许可证 | license_used |

---

### 4. OrgAdminService Mock数据详细修改

**文件位置：** `src/app/core/services/org-admin.service.ts`

#### 4.1 课程列表（getSimulatedCourses）

**修改前（学科教育）：**
```typescript
const categories = ['数学', '语文', '英语', '物理', '化学'];
name: `${categories[i]}强化班`
capacity: 40  // 大班教学
```

**修改后（STEM教育）：**
```typescript
const categories = ['Scratch编程', 'Arduino机器人', '3D打印', '无人机', 'AI启蒙'];
name: `${categories[i]}创客班`
capacity: 20  // 小班教学，注重实操
```

**新课程列表：**
1. Scratch编程创客班
2. Arduino机器人创客班
3. 3D打印创客班
4. 无人机创客班
5. AI启蒙创客班

#### 4.2 教师信息（getSimulatedTeachers）

**修改前：**
```typescript
department: '数学组'
email: `teacher${i + 1}@school.edu.cn`
```

**修改后：**
```typescript
const departments = [
  '编程教研组',
  '机器人教研组',
  '创客教研组',
  'AI教研组',
  '硬件教研组'
];
department: departments[i]
email: `teacher${i + 1}@starhai-robotics.com`
```

**教师部门分布：**
- 张老师 → 编程教研组
- 李老师 → 机器人教研组
- 王老师 → 创客教研组
- 刘老师 → AI教研组
- 陈老师 → 硬件教研组

#### 4.3 学员信息（getSimulatedStudents）

**修改前：**
```typescript
grade: '高一'
class_name: '1班'
email: `student${i + 1}@school.edu.cn`
```

**修改后：**
```typescript
const grades = ['一年级', '二年级', '三年级', '四年级', '五年级'];
grade: grades[i % 5]  // 循环分配年级
class_name: `${(i % 3) + 1}班`  // 1班、2班、3班循环
email: `student${i + 1}@starhai-robotics.com`
```

**学员分布示例：**
- 学员1：一年级 1班
- 学员2：二年级 2班
- 学员3：三年级 3班
- 学员4：四年级 1班
- 学员5：五年级 2班
- ...以此类推

---

### 5. 课程Mock数据更新（STEM课程）

#### 机构1 - 星海机器人培训

| 活动ID | 原描述 | 新描述 | 类型 |
|--------|--------|--------|------|
| 1 | 用户张老师登录系统 | **管理员登录系统** | user_login |
| 2 | 创建了新的物理实验项目 | **创建了新的机器人编程项目** | project_created |
| 3 | 激活了5个新许可证 | 激活了5个新许可证 | license_used |
| 4 | Arduino设备使用率达到85% | Arduino设备使用率达到85% | hardware_access |

#### 机构2 - 北京市第一中学

| 活动ID | 原描述 | 新描述 | 类型 |
|--------|--------|--------|------|
| 1 | 用户李老师登录系统 | **教师登录系统** | user_login |
| 2 | 创建了化学实验数据分析项目 | **创建了STEM创客教育项目** | project_created |
| 3 | 激活了3个新许可证 | 激活了3个新许可证 | license_used |

---

### 3. 课程Mock数据更新（STEM课程）

**文件位置：** `src/app/core/services/unified-course.service.ts`

#### 5.1 ❌ 删除的课程（学科教育）

**原课程1：Python 编程入门**
- 场景类型：`school_curriculum`（校本课程）
- 问题：过于通用，不符合STEM培训机构定位
- 状态：已替换

**原课程2：机器人兴趣班**
- 场景类型：`school_interest`（学校兴趣班）
- 问题：描述过于简单，缺乏STEM特色
- 状态：已替换

#### 5.2 ✅ 新增的课程（STEM教育）

**新课程1：Scratch 编程入门**

```typescript
{
  id: 1,
  course_code: 'STEM-001',
  org_id: 1,
  scenario_type: 'institution',  // 培训机构课程
  title: 'Scratch 编程入门',
  description: '通过图形化编程学习计算思维，适合6-10岁儿童',
  category: 'programming',
  tags: ['Scratch', '图形化编程', '计算思维', 'STEM'],
  level: 'beginner',
  learning_objectives: [
    '掌握 Scratch 基础操作',
    '理解顺序、循环、条件等编程概念',
    '能够独立完成简单动画和游戏制作',
  ],
  total_lessons: 12,
  estimated_duration_hours: 24,
  delivery_method: 'offline',
  current_enrollments: 150,
  is_free: false,
  price: 1200,
  primary_teacher_id: 1,
  visibility: 'public',
  is_featured: true,
  status: 'published',
}
```

**特点：**
- 🎯 面向6-10岁儿童的图形化编程
- 💻 培养计算思维和逻辑能力
- 🎮 通过动画和游戏制作激发兴趣
- 💰 商业定价：¥1,200 / 12课时

---

**新课程2：Arduino 机器人创客**

```typescript
{
  id: 2,
  course_code: 'STEM-002',
  org_id: 1,
  scenario_type: 'institution',  // 培训机构课程
  title: 'Arduino 机器人创客',
  description: '学习 Arduino 硬件编程，制作智能机器人项目',
  category: 'ai_robotics',
  tags: ['Arduino', '机器人', '硬件编程', '创客', 'STEM'],
  level: 'intermediate',
  learning_objectives: [
    '掌握 Arduino 基础电路连接',
    '学习 C++ 编程控制硬件',
    '能够独立设计并制作机器人项目',
  ],
  total_lessons: 16,
  estimated_duration_hours: 32,
  delivery_method: 'offline',
  current_enrollments: 80,
  is_free: false,
  price: 2400,
  primary_teacher_id: 1,
  visibility: 'public',
  is_featured: true,
  status: 'published',
}
```

**特点：**
- 🤖 结合硬件和软件的创客教育
- 🔧 实践性强，动手制作机器人
- 💻 学习C++编程和电路知识
- 💰 商业定价：¥2,400 / 16课时

---

## 🎯 设计理念

### 1. STEM教育定位

**S (Science) 科学：**
- 机器人运动原理
- 传感器工作原理
- 电路基础知识

**T (Technology) 技术：**
- Scratch图形化编程
- Arduino硬件编程
- C++语言基础

**E (Engineering) 工程：**
- 机器人结构设计
- 电路搭建与调试
- 项目工程化管理

**M (Mathematics) 数学：**
- 坐标系与运动轨迹
- 角度与方向计算
- 逻辑运算与算法

### 2. 年龄分层设计

| 课程 | 目标年龄 | 难度级别 | 前置要求 |
|------|---------|---------|---------|
| Scratch编程 | 6-10岁 | 初级 | 无 |
| Arduino机器人 | 10-14岁 | 中级 | 基础编程概念 |

### 3. 商业模式

**星海机器人培训（机构）：**
- 线下授课为主
- 小班教学（15-20人）
- 商业化运营
- 课程体系完整

**北京市第一中学（学校）：**
- 校本课程 + 兴趣班
- 普及STEM教育
- 非营利性质
- 与机构合作引入课程

---

## 📊 数据对比

### 课程属性对比

| 属性 | 旧课程（学科教育） | 新课程（STEM教育） |
|------|------------------|------------------|
| **场景类型** | school_curriculum / school_interest | institution |
| **课程代码** | COURSE-001 / COURSE-002 | STEM-001 / STEM-002 |
| **教学方式** | online / offline | offline（实操为主） |
| **收费模式** | 免费 / ¥500 | ¥1,200 / ¥2,400 |
| **课时数量** | 10 / 8 | 12 / 16 |
| **学习时长** | 10h / 8h | 24h / 32h |
| **标签重点** | Python、编程 | Scratch、Arduino、创客、STEM |
| **学习目标** | 单一技能 | 综合能力培养 |

### 机构定位对比

| 维度 | 旧机构（学校） | 新机构（培训中心） |
|------|--------------|------------------|
| **名称** | 北京市第一中学 | 星海机器人培训 |
| **性质** | 公立学校 | 商业培训机构 |
| **规模** | 2000用户 | 500用户 |
| **业务** | 综合教育 | STEM专项培训 |
| **课程** | 学科+兴趣 | STEM专业课程 |
| **收费** | 低/免费 | 商业化定价 |

---

## ✅ 验证清单

### Mock数据验证

#### UnifiedCourseService
- [x] 机构1名称改为“星海机器人培训”
- [x] 机构2名称改为“北京市第一中学”
- [x] 机构联系信息更新
- [x] 活动记录改为STEM主题
- [x] 课程场景类型改为`institution`
- [x] 课程代码改为STEM前缀
- [x] 课程描述突出STEM特色
- [x] 学习目标详细具体
- [x] 价格符合市场定位
- [x] 标签包含STEM关键词

#### OrgAdminService
- [x] 课程列表改为STEM创客班（Scratch、Arduino、3D打印、无人机、AI）
- [x] 班级容量从40人改为20人（小班教学）
- [x] 教师部门改为STEM教研组（编程、机器人、创客、AI、硬件）
- [x] 教师邮箱域名改为@starhai-robotics.com
- [x] 学员年级改为小学阶段（一至五年级）
- [x] 学员班级循环分配（1班、2班、3班）
- [x] 学员邮箱域名改为@starhai-robotics.com

### 功能验证

- [ ] 刷新浏览器查看机构名称显示
- [ ] 检查热门课程列表显示STEM课程
- [ ] 验证课程卡片信息显示正确
- [ ] 确认活动记录显示STEM相关内容
- [ ] 测试课程详情页面

---

## 🔧 后续优化建议

### 1. 增加更多STEM课程

建议添加以下课程：
- **3D打印创意设计**（中级）
- **Python人工智能入门**（高级）
- **无人机编程与控制**（中级）
- **物联网智能家居项目**（高级）

### 2. 完善课程章节数据

当前Mock数据缺少：
- 课程章节（Chapters）
- 课时内容（Lessons）
- 学习材料（Materials）
- 外部资源（External Resources）

### 3. 添加学员数据

需要Mock：
- 学员报名信息
- 学习进度记录
- 作品展示
- 评价反馈

### 4. 教师信息完善

补充：
- 教师专业背景
- 教学资质认证
- 擅长领域
- 学员评价

---

## 📝 注意事项

### ⚠️ 重要提醒

1. **场景类型必须准确**
   - 机构课程使用 `'institution'`
   - 学校课程使用 `'school_curriculum'` 或 `'school_interest'`
   - 不要混用场景类型

2. **课程代码规范**
   - STEM课程使用 `STEM-XXX` 前缀
   - 便于分类和检索
   - 保持唯一性

3. **价格合理性**
   - Scratch课程：¥1,200 / 12课时 = ¥100/课时
   - Arduino课程：¥2,400 / 16课时 = ¥150/课时
   - 符合北京地区STEM培训市场价

4. **标签一致性**
   - 所有STEM课程必须包含 `'STEM'` 标签
   - 添加具体技术标签（Scratch、Arduino等）
   - 便于筛选和推荐

---

## 🎉 总结

本次更新成功将Mock数据从“学科教育”转向“STEM教育”，主要改进包括：

✅ **机构定位明确**：星海机器人培训 vs 北京市第一中学  
✅ **课程内容专业**：Scratch编程 + Arduino机器人创客 + 3D打印 + 无人机 + AI启蒙  
✅ **商业模式清晰**：培训机构收费 vs 学校普及教育  
✅ **STEM特色突出**：标签、描述、学习目标均体现STEM理念  
✅ **数据真实可信**：价格、课时、人数符合市场实际情况  
✅ **教师团队专业**：5个STEM教研组（编程、机器人、创客、AI、硬件）  
✅ **学员群体准确**：小学阶段（一至五年级），小班教学（20人/班）  
✅ **全面覆盖**：UnifiedCourseService + OrgAdminService + Dashboard Mock数据

这些Mock数据现在可以更好地支持开发和演示STEM教育培训机构的业务场景。

---

**更新人：** AI Assistant  
**审核状态：** ✅ 已完成  
**下次更新：** 待添加更多STEM课程和学员数据
