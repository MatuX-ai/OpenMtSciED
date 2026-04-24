"""
合并所有STEM课件到统一库
整合来自不同来源的STEM课程，创建完整的STEM教育资源库
"""

import json
from pathlib import Path
from datetime import datetime

def merge_all_stem_courses():
    """合并所有STEM课件文件"""
    
    # 定义所有STEM课件文件路径
    stem_files = [
        'data/course_library/stem_complete_with_robotics.json',
        'data/course_library/stem_additional_courses.json', 
        'data/course_library/stem_comprehensive_courses.json',
        'data/course_library/k12_massive_courses.json',
        'data/course_library/bnu_shanghai_k12_courses.json',
        'data/course_library/openscied_all_units.json',
        'data/course_library/openscied_elementary_units.json',
        'data/course_library/openscied_middle_units.json',
        'data/course_library/openscied_high_school_units.json',
        'data/course_library/openscied_additional_units.json',
        'data/course_library/stemcloud_courses.json',
        'data/course_library/khan_academy_courses.json'
    ]
    
    all_courses = []
    file_stats = {}
    
    for file_path in stem_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, list):
                    all_courses.extend(data)
                    file_stats[file_path] = len(data)
                    print(f"✅ 加载 {file_path}: {len(data)} 个课件")
                else:
                    print(f"⚠️  {file_path} 不是列表格式，跳过")
        except Exception as e:
            print(f"❌ 加载 {file_path} 失败: {e}")
    
    print(f"\n📊 各文件统计:")
    for path, count in file_stats.items():
        print(f"  {Path(path).name}: {count}")
    
    print(f"\n🎯 总计STEM课件数量: {len(all_courses)}")
    
    # 去重处理（基于course_id）
    unique_courses = {}
    duplicates = 0
    for course in all_courses:
        course_id = course.get('course_id', '')
        if course_id and course_id not in unique_courses:
            unique_courses[course_id] = course
        elif course_id:
            duplicates += 1
    
    deduplicated_courses = list(unique_courses.values())
    print(f"🔄 去重后课件数量: {len(deduplicated_courses)} (移除重复: {duplicates})")
    
    # 按学科分类统计
    subject_stats = {}
    grade_stats = {}
    source_stats = {}
    
    for course in deduplicated_courses:
        # 学科统计
        subject = course.get('subject', '未知')
        subject_stats[subject] = subject_stats.get(subject, 0) + 1
        
        # 年级统计
        grade_level = course.get('grade_level', '未知')
        grade_stats[grade_level] = grade_stats.get(grade_level, 0) + 1
        
        # 来源统计
        source = course.get('source', '未知')
        source_stats[source] = source_stats.get(source, 0) + 1
    
    print(f"\n📚 按学科分布:")
    for subject, count in sorted(subject_stats.items(), key=lambda x: x[1], reverse=True):
        print(f"  {subject}: {count}")
    
    print(f"\n🎓 按教育阶段分布:")
    for grade, count in sorted(grade_stats.items()):
        print(f"  {grade}: {count}")
    
    print(f"\n🏫 按来源分布:")
    for source, count in sorted(source_stats.items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"  {source}: {count}")
    
    # 添加元数据
    metadata = {
        "total_courses": len(deduplicated_courses),
        "generated_at": datetime.now().isoformat(),
        "description": "OpenMTSciEd完整STEM课件库 - 包含科学、技术、工程、数学领域的全面教育资源",
        "subjects": list(subject_stats.keys()),
        "grade_levels": list(grade_stats.keys()),
        "sources": list(source_stats.keys()),
        "statistics": {
            "by_subject": subject_stats,
            "by_grade": grade_stats,
            "by_source": source_stats
        }
    }
    
    # 保存合并后的课件库
    output_file = Path('data/course_library/complete_stem_library.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            "metadata": metadata,
            "courses": deduplicated_courses
        }, f, ensure_ascii=False, indent=2)
    
    print(f"\n💾 合并后的STEM课件库已保存到: {output_file}")
    print(f"📈 最终STEM课件总数: {len(deduplicated_courses)}")
    
    return len(deduplicated_courses)

def create_stem_summary_report(total_count):
    """创建STEM课件库摘要报告"""
    
    report = f"""
# OpenMTSciEd STEM课件库补充完成报告

## 📊 总体统计
- **总STEM课件数量**: {total_count} 个
- **生成时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
- **覆盖领域**: 科学、技术、工程、数学及前沿交叉学科

## 🎯 补充内容特点

### 1. 全面性
- 涵盖K-12全学段（小学、初中、高中）
- 包含传统STEM学科和前沿科技领域
- 融合理论与实践，注重动手能力培养

### 2. 前沿性  
- 人工智能与机器学习
- 量子科技基础
- 生物技术创新
- 可持续能源技术
- 空间科技探索

### 3. 实用性
- 每个课件包含明确的知识点
- 提供实验和实践环节
- 配备低成本替代方案
- 跨学科联系和应用场景

### 4. 系统性
- 按教育阶段分级设计
- 知识难度递进安排
- 技能培养循序渐进
- 评价体系完整配套

## 📁 文件结构
- `stem_complete_with_robotics.json`: 基础STEM课程（含机器人）
- `stem_additional_courses.json`: 扩展STEM课程
- `stem_comprehensive_courses.json`: 前沿综合STEM课程  
- `complete_stem_library.json`: 合并后的完整STEM课件库

## 🚀 应用价值
1. **教师备课**: 提供丰富的STEM教学资源和课程设计参考
2. **学生学习**: 系统化的STEM学习路径和实践项目
3. **课程开发**: 为学校和教育机构提供标准化STEM课程内容
4. **教育研究**: 支持STEM教育模式创新和效果评估

## 🔧 技术特色
- 标准化数据结构，便于系统集成
- 丰富的元数据标签，支持智能推荐
- 模块化设计，支持灵活组合
- 开源开放，促进资源共享

---
*本报告由OpenMTSciEd系统自动生成*
    """
    
    # 保存报告
    report_file = Path('backtest_reports/STEM_COURSES_COMPLETION_REPORT.md')
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"📋 STEM课件补充报告已保存到: {report_file}")

if __name__ == "__main__":
    total = merge_all_stem_courses()
    create_stem_summary_report(total)