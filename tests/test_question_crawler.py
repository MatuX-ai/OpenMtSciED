"""
题库爬虫系统测试脚本
"""

import os
import sys
from pathlib import Path

# 添加 backend 到路径
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
sys.path.insert(0, backend_path)

from openmtscied.shared.crawlers.openstax_question_crawler import OpenStaxQuestionCrawler


def test_openstax_crawler():
    """测试 OpenStax 题库爬虫"""
    print("="*60)
    print("测试 OpenStax 题库爬虫")
    print("="*60)
    
    crawler = OpenStaxQuestionCrawler()
    
    # 测试配置：只爬取第1章
    config = {
        'textbook': 'biology-2e',
        'chapters': [1],
        'output_file': 'test_openstax_questions.json'
    }
    
    print(f"\n📚 爬取教材: {config['textbook']}")
    print(f"📖 章节: {config['chapters']}")
    print()
    
    result = crawler.run(config)
    
    print(f"\n{'='*60}")
    print(f"爬取结果:")
    print(f"{'='*60}")
    print(f"✅ 成功: {result['success']}")
    print(f"📊 总题目数: {result['total_items']}")
    print(f"✅ 有效题目: {result['scraped_items']}")
    
    if result.get('stats'):
        stats = result['stats']
        print(f"   - 有效: {stats['valid']}")
        print(f"   - 无效: {stats['invalid']}")
        print(f"   - 重复: {stats['duplicates']}")
    
    if result['data']:
        print(f"\n📝 示例题目 (前3道):")
        for i, q in enumerate(result['data'][:3], 1):
            print(f"\n{i}. {q['content'][:100]}...")
            print(f"   类型: {q['question_type']}")
            print(f"   难度: {q['difficulty']}")
            print(f"   知识点: {', '.join(q['knowledge_points'][:3])}")
    
    return result['success']


def test_quality_checker():
    """测试题目质量检查器"""
    from openmtscied.shared.crawlers.base_question_crawler import QuestionQualityChecker
    
    print("\n" + "="*60)
    print("测试题目质量检查器")
    print("="*60)
    
    checker = QuestionQualityChecker()
    
    # 测试完整题目
    good_question = {
        "content": "什么是细胞的基本结构？",
        "question_type": "multiple_choice",
        "options_json": ["细胞壁", "细胞膜", "细胞核", "细胞质"],
        "correct_answer": "细胞膜",
        "explanation": "细胞膜是细胞的基本结构之一",
        "knowledge_points": ["cell", "biology"]
    }
    
    quality = checker.check_completeness(good_question)
    print(f"\n✅ 完整题目评分: {quality['score']}")
    print(f"   问题: {quality['issues']}")
    print(f"   有效: {quality['is_valid']}")
    
    # 测试不完整题目
    bad_question = {
        "content": "短题",
        "question_type": "multiple_choice"
    }
    
    quality = checker.check_completeness(bad_question)
    print(f"\n❌ 不完整题目评分: {quality['score']}")
    print(f"   问题: {quality['issues']}")
    print(f"   有效: {quality['is_valid']}")
    
    # 测试难度估算
    difficulty = checker.estimate_difficulty(good_question)
    print(f"\n📊 难度估算: {difficulty}")
    
    # 测试去重哈希
    hash1 = checker.generate_question_hash(good_question)
    hash2 = checker.generate_question_hash(good_question)
    hash3 = checker.generate_question_hash({**good_question, "content": "不同的题目"})
    
    print(f"\n🔐 去重哈希测试:")
    print(f"   相同题目哈希一致: {hash1 == hash2}")
    print(f"   不同题目哈希不同: {hash1 != hash3}")


if __name__ == "__main__":
    try:
        # 测试质量检查器
        test_quality_checker()
        
        # 测试爬虫（需要网络连接）
        print("\n" + "="*60)
        response = input("是否运行网络爬虫测试？(y/n): ")
        if response.lower() == 'y':
            success = test_openstax_crawler()
            if success:
                print("\n🎉 所有测试通过！")
            else:
                print("\n⚠️ 爬虫测试失败，请检查网络连接")
        else:
            print("\n⏭️ 跳过网络爬虫测试")
    
    except Exception as e:
        print(f"\n❌ 测试失败: {str(e)}")
        import traceback
        traceback.print_exc()
