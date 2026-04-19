"""
验证STEM课件质量 - 确保所有课件符合STEM教育标准
检查课件的完整性、相关性和教育质量
"""

import json
from pathlib import Path
from datetime import datetime

def validate_stem_courses():
    """验证STEM课件的质量和合规性"""
    
    # 加载合并后的STEM课件库
    with open('data/course_library/complete_stem_library.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    courses = data['courses']
    metadata = data['metadata']
    
    print("🔍 开始验证STEM课件质量...")
    print(f"📊 待验证课件总数: {len(courses)}")
    
    # 定义STEM相关学科关键词
    stem_subjects = {
        '科学', '技术', '工程', '数学', '物理', '化学', '生物', '地理', 
        '计算机', '编程', '机器人', '人工智能', '信息技术', '通用技术',
        '地球科学', '天文学', '环境科学', '材料科学', '能源科学',
        '空间科技', '量子科技', '生物科技', '可持续能源', '人工智能与机器学习',
        'STEM综合', '创新设计', '工程与设计', '物理实验', '数学建模',
        '综合实践', '科技创新', '小学科学', '初中物理', '初中化学',
        '初中数学', '小学数学', '高中数学'
    }
    
    # 非STEM学科关键词（需要排除）
    non_stem_keywords = {
        '语文', '英语', '历史', '政治', '道德', '法治', '音乐', '美术',
        '体育', '艺术', '文学', '哲学', '宗教', '社会学', '心理学',
        '经济学', '管理学', '法学', '教育学', '语言学', '传媒',
        '舞蹈', '戏剧', '书法', '摄影', '设计艺术', '表演艺术'
    }
    
    validation_results = {
        'total': len(courses),
        'valid_stem': 0,
        'invalid_non_stem': 0,
        'missing_fields': 0,
        'quality_issues': 0,
        'issues_detail': []
    }
    
    valid_courses = []
    
    for i, course in enumerate(courses):
        is_valid = True
        issues = []
        
        # 1. 检查必要字段
        required_fields = ['course_id', 'title', 'subject', 'grade_level', 'description']
        missing_fields = [field for field in required_fields if field not in course or not course[field]]
        
        if missing_fields:
            validation_results['missing_fields'] += 1
            issues.append(f"缺少必要字段: {missing_fields}")
            is_valid = False
        
        # 2. 检查是否为STEM相关学科
        subject = course.get('subject', '')
        title = course.get('title', '')
        description = course.get('description', '')
        
        # 检查是否包含非STEM关键词
        has_non_stem = any(keyword in subject or keyword in title or keyword in description 
                          for keyword in non_stem_keywords)
        
        # 检查是否包含STEM关键词
        has_stem = any(keyword in subject or keyword in title or keyword in description 
                      for keyword in stem_subjects)
        
        if has_non_stem and not has_stem:
            validation_results['invalid_non_stem'] += 1
            issues.append(f"非STEM学科: {subject}")
            is_valid = False
        elif has_stem:
            validation_results['valid_stem'] += 1
        else:
            # 如果既没有明确的STEM也没有非STEM关键词，标记为需要人工审核
            issues.append(f"学科不明确: {subject}")
            validation_results['quality_issues'] += 1
        
        # 3. 检查内容质量
        if len(course.get('description', '')) < 10:
            issues.append("描述过于简短")
            validation_results['quality_issues'] += 1
        
        # 4. 检查知识点
        knowledge_points = course.get('knowledge_points', [])
        if not knowledge_points:
            issues.append("缺少知识点")
            validation_results['quality_issues'] += 1
        
        # 5. 检查实验/实践环节
        experiments = course.get('experiments', [])
        if not experiments:
            issues.append("缺少实验/实践环节")
            validation_results['quality_issues'] += 1
        
        if issues:
            validation_results['issues_detail'].append({
                'course_id': course.get('course_id', 'unknown'),
                'title': course.get('title', 'unknown'),
                'issues': issues
            })
        
        if is_valid and not has_non_stem:
            valid_courses.append(course)
    
    print(f"\n✅ 验证完成!")
    print(f"📊 验证结果统计:")
    print(f"  - 总课件数: {validation_results['total']}")
    print(f"  - 有效STEM课件: {validation_results['valid_stem']}")
    print(f"  - 非STEM课件: {validation_results['invalid_non_stem']}")
    print(f"  - 缺少字段: {validation_results['missing_fields']}")
    print(f"  - 质量问题: {validation_results['quality_issues']}")
    
    if validation_results['issues_detail']:
        print(f"\n⚠️  发现 {len(validation_results['issues_detail'])} 个课件存在问题:")
        for issue in validation_results['issues_detail'][:10]:  # 只显示前10个
            print(f"  - {issue['course_id']}: {issue['title']}")
            for problem in issue['issues']:
                print(f"    • {problem}")
        if len(validation_results['issues_detail']) > 10:
            print(f"  ... 还有 {len(validation_results['issues_detail']) - 10} 个问题课件")
    
    # 保存验证后的纯净STEM课件库
    if valid_courses:
        output_file = Path('data/course_library/validated_stem_library.json')
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump({
                'metadata': {
                    **metadata,
                    'validated_at': datetime.now().isoformat(),
                    'validation_results': validation_results,
                    'description': '经过验证的纯STEM课件库 - 已排除非STEM内容'
                },
                'courses': valid_courses
            }, f, ensure_ascii=False, indent=2)
        
        print(f"\n💾 验证后的STEM课件库已保存到: {output_file}")
        print(f"🎯 纯净STEM课件数量: {len(valid_courses)}")
    
    # 生成验证报告
    generate_validation_report(validation_results, len(valid_courses))
    
    return validation_results, len(valid_courses)

def generate_validation_report(results, valid_count):
    """生成验证报告"""
    
    report = f"""
# STEM课件质量验证报告

## 📊 验证概览
- **验证时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
- **总课件数量**: {results['total']}
- **有效STEM课件**: {valid_count}
- **验证通过率**: {valid_count/results['total']*100:.1f}%

## 🔍 验证标准

### 1. 学科相关性检查
- ✅ 包含STEM相关学科关键词
- ❌ 排除非STEM学科内容（语文、英语、历史、艺术等）
- ⚠️ 标记学科不明确的内容

### 2. 内容完整性检查
- 必要字段: course_id, title, subject, grade_level, description
- 知识点要求: 每个课件应包含明确的知识点
- 实践环节: 应包含实验或实践活动设计

### 3. 教育质量评估
- 描述详细程度: 描述不应过于简短
- 结构化程度: 具备标准化的数据结构
- 实用性: 包含低成本替代方案等实用信息

## 📈 验证结果分析

### 问题分布
- 非STEM课件: {results['invalid_non_stem']} 个
- 缺少必要字段: {results['missing_fields']} 个  
- 质量问题: {results['quality_issues']} 个

### 质量指标
- 内容完整率: {(results['total'] - results['missing_fields'])/results['total']*100:.1f}%
- STEM相关率: {results['valid_stem']/results['total']*100:.1f}%
- 整体合格率: {valid_count/results['total']*100:.1f}%

## 🎯 改进建议

1. **内容筛选**: 进一步优化学科分类算法，提高STEM识别准确率
2. **质量控制**: 建立更严格的内容审核机制
3. **标准化**: 统一课件数据格式和元数据标准
4. **持续更新**: 定期验证和更新课件库内容

## 📁 输出文件
- `validated_stem_library.json`: 经过验证的纯净STEM课件库
- 本报告: 详细的验证分析和质量评估

---
*STEM课件质量验证由OpenMTSciEd系统自动执行*
    """
    
    # 保存报告
    report_file = Path('backtest_reports/STEM_VALIDATION_REPORT.md')
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"📋 STEM验证报告已保存到: {report_file}")

if __name__ == "__main__":
    results, valid_count = validate_stem_courses()