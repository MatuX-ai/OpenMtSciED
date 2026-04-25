"""删除学科类题库数据"""
import os
from dotenv import load_dotenv

load_dotenv('.env.local')

import sys
sys.path.insert(0, 'backend')

from openmtscied.shared.models.db_models import SessionLocal, QuestionBank, Question
from sqlalchemy import text

db = SessionLocal()

print("="*60)
print("🗑️  删除学科类题库数据")
print("="*60)

# 查找所有OpenStax相关的题库（学科类）
banks_to_delete = db.query(QuestionBank).filter(
    QuestionBank.source == 'openstax'
).all()

print(f"\n找到 {len(banks_to_delete)} 个学科类题库:\n")

total_questions = 0
for bank in banks_to_delete:
    question_count = db.query(Question).filter(Question.bank_id == bank.id).count()
    total_questions += question_count
    print(f"  📚 {bank.name}")
    print(f"     ID: {bank.id}, 题目数: {question_count}")

print(f"\n总计将删除 {total_questions} 道题目")
print("\n⚠️  这些是传统学科类教育内容，不符合STEM课外教育定位\n")

# 自动确认删除（因为是明确的业务需求）
confirm = "yes"

if confirm.lower() == 'yes':
    # 先删除用户答题记录（外键依赖）
    for bank in banks_to_delete:
        questions = db.query(Question).filter(Question.bank_id == bank.id).all()
        question_ids = [q.id for q in questions]
        if question_ids:
            db.execute(
                text("DELETE FROM user_answers WHERE question_id IN :ids"),
                {"ids": tuple(question_ids)}
            )
            print(f"  ✅ 删除 {bank.name} 相关的用户答题记录")
    
    db.commit()
    
    # 再删除题目
    for bank in banks_to_delete:
        deleted = db.query(Question).filter(Question.bank_id == bank.id).delete()
        print(f"  ✅ 删除 {bank.name} 的 {deleted} 道题目")
    
    # 再删除题库
    for bank in banks_to_delete:
        db.delete(bank)
        print(f"  ✅ 删除题库: {bank.name}")
    
    db.commit()
    
    print("\n" + "="*60)
    print("✅ 删除完成！")
    print("="*60)
    
    # 显示剩余题库
    remaining = db.query(QuestionBank).all()
    print(f"\n剩余题库数量: {len(remaining)}")
    if remaining:
        for bank in remaining:
            q_count = db.query(Question).filter(Question.bank_id == bank.id).count()
            print(f"  - {bank.name}: {q_count}题")
else:
    print("\n❌ 已取消删除操作")

db.close()
