#!/usr/bin/env python3
"""
题库爬虫系统快速启动脚本
一键爬取、导入和验证题库数据
"""

import os
import sys
from pathlib import Path

# 添加 backend 到路径
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))
sys.path.insert(0, backend_path)

from openmtscied.shared.crawlers.openstax_question_crawler import OpenStaxQuestionCrawler


def main():
    print("="*70)
    print("🚀 题库爬虫系统 - 快速启动")
    print("="*70)
    
    # 步骤1: 爬取题目
    print("\n📚 步骤 1/3: 爬取 OpenStax 生物教材题目")
    print("-" * 70)
    
    crawler = OpenStaxQuestionCrawler()
    config = {
        'textbook': 'biology-2e',
        'chapters': [1, 2, 3],  # 爬取前3章
        'output_file': 'openstax_biology_questions.json'
    }
    
    result = crawler.run(config)
    
    if not result['success']:
        print(f"\n❌ 爬取失败: {result.get('error', '未知错误')}")
        return
    
    print(f"\n✅ 爬取完成!")
    print(f"   总题目数: {result['total_items']}")
    print(f"   有效题目: {result['scraped_items']}")
    
    if result.get('stats'):
        stats = result['stats']
        print(f"   统计信息:")
        print(f"     - 有效: {stats['valid']}")
        print(f"     - 无效: {stats['invalid']}")
        print(f"     - 重复: {stats['duplicates']}")
    
    if not result['data']:
        print("\n⚠️ 未获取到有效题目，请检查网络连接或网站结构变化")
        return
    
    # 步骤2: 导入数据库
    print("\n\n📥 步骤 2/3: 导入题目到数据库")
    print("-" * 70)
    
    # 直接导入函数
    sys.path.insert(0, os.path.dirname(__file__))
    from import_question_data import create_question_bank, import_questions_from_json
    
    # 创建题库
    bank_id = create_question_bank(
        name="OpenStax Biology Questions",
        source="openstax",
        subject="biology",
        level="high",
        description="OpenStax Biology 2e 教材复习题"
    )
    
    # 导入题目
    output_file = Path("data/question_library/openstax_biology_questions.json")
    if output_file.exists():
        import_questions_from_json(str(output_file), bank_id)
    else:
        print(f"⚠️ 文件不存在: {output_file}")
    
    # 步骤3: 验证数据
    print("\n\n🔍 步骤 3/3: 验证导入结果")
    print("-" * 70)
    
    from openmtscied.shared.models.db_models import SessionLocal, QuestionBank, Question
    
    db = SessionLocal()
    
    # 查看题库信息
    bank = db.query(QuestionBank).filter(QuestionBank.id == bank_id).first()
    if bank:
        print(f"\n✅ 题库信息:")
        print(f"   名称: {bank.name}")
        print(f"   来源: {bank.source}")
        print(f"   学科: {bank.subject}")
        print(f"   难度: {bank.level}")
        print(f"   题目数: {bank.total_questions}")
        
        # 查看示例题目
        sample_questions = db.query(Question).filter(
            Question.bank_id == bank_id
        ).limit(3).all()
        
        if sample_questions:
            print(f"\n📝 示例题目 (前{len(sample_questions)}道):")
            for i, q in enumerate(sample_questions, 1):
                print(f"\n{i}. {q.content[:80]}...")
                print(f"   类型: {q.question_type}")
                print(f"   难度: {q.difficulty:.2f}")
                if q.knowledge_points:
                    print(f"   知识点: {', '.join(q.knowledge_points[:3])}")
    
    db.close()
    
    print("\n" + "="*70)
    print("🎉 题库爬虫系统执行完成！")
    print("="*70)
    print("\n💡 提示:")
    print("   - 查看完整文档: backend/openmtscied/shared/crawlers/QUESTION_CRAWLER_GUIDE.md")
    print("   - 运行测试: python tests/test_question_crawler.py")
    print("   - 导入更多题目: 修改配置中的 chapters 参数")
    print("="*70)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️ 用户中断执行")
        sys.exit(0)
    except Exception as e:
        print(f"\n\n❌ 执行失败: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
