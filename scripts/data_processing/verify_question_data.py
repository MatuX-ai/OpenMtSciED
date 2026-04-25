"""验证题库数据"""
import os
from dotenv import load_dotenv

load_dotenv('.env.local')

import sys
sys.path.insert(0, 'backend')

from openmtscied.shared.models.db_models import SessionLocal, QuestionBank, Question

db = SessionLocal()

print("="*60)
print("📊 题库数据统计")
print("="*60)

banks = db.query(QuestionBank).all()
print(f"\n题库总数: {len(banks)}\n")

for bank in banks:
    print(f"📚 {bank.name}")
    print(f"   ID: {bank.id}")
    print(f"   来源: {bank.source}")
    print(f"   学科: {bank.subject}")
    print(f"   难度: {bank.level}")
    print(f"   题目数: {bank.total_questions}")
    
    # 显示该题库的题目类型分布
    if bank.total_questions > 0:
        questions = db.query(Question).filter(Question.bank_id == bank.id).all()
        type_count = {}
        for q in questions:
            t = q.question_type
            type_count[t] = type_count.get(t, 0) + 1
        
        print(f"   题型分布: {', '.join([f'{k}: {v}题' for k, v in type_count.items()])}")
        
        # 显示平均难度
        avg_difficulty = sum(q.difficulty for q in questions) / len(questions)
        print(f"   平均难度: {avg_difficulty:.2f}")
    
    print()

print("="*60)
print("✅ 验证完成")
print("="*60)

db.close()
