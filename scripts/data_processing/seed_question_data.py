"""
题库数据填充脚本 - 从 OpenStax 等资源导入示例题目
"""
import os
import sys
import json
from dotenv import load_dotenv

# 加载环境变量
load_dotenv('.env.local')

# 添加 backend 到路径
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))
sys.path.insert(0, backend_path)

from openmtscied.shared.models.db_models import SessionLocal, QuestionBank, Question

def seed_question_banks():
    """初始化基础题库分类"""
    db = SessionLocal()
    banks = [
        {"name": "OpenStax Physics - Mechanics", "source": "openstax", "subject": "physics", "level": "high", "description": "高中物理力学基础练习"},
        {"name": "OpenStax Biology - Cell Structure", "source": "openstax", "subject": "biology", "level": "high", "description": "高中生物细胞结构知识点"},
        {"name": "TED-Ed STEM Quiz", "source": "ted_ed", "subject": "general", "level": "middle", "description": "TED-Ed 跨学科科学常识问答"},
    ]
    
    for bank_data in banks:
        if not db.query(QuestionBank).filter(QuestionBank.name == bank_data["name"]).first():
            bank = QuestionBank(**bank_data)
            db.add(bank)
    
    db.commit()
    print("✅ Question Banks seeded.")
    db.close()

def seed_sample_questions():
    """导入示例题目"""
    db = SessionLocal()
    
    # 获取已创建的题库 ID
    physics_bank = db.query(QuestionBank).filter(QuestionBank.source == "openstax", QuestionBank.subject == "physics").first()
    biology_bank = db.query(QuestionBank).filter(QuestionBank.source == "openstax", QuestionBank.subject == "biology").first()
    
    if not physics_bank or not biology_bank:
        print("❌ Please run seed_question_banks first.")
        return

    questions = [
        {
            "bank_id": physics_bank.id,
            "content": "一个物体以 10 m/s 的初速度做匀加速直线运动，加速度为 2 m/s²，5秒后的速度是多少？",
            "question_type": "multiple_choice",
            "options_json": ["15 m/s", "20 m/s", "25 m/s", "30 m/s"],
            "correct_answer": "20 m/s",
            "explanation": "根据公式 v = v0 + at，v = 10 + 2*5 = 20 m/s。",
            "difficulty": 0.4,
            "knowledge_points": ["kinematics", "velocity", "acceleration"]
        },
        {
            "bank_id": biology_bank.id,
            "content": "植物细胞与动物细胞的主要区别之一是植物细胞具有：",
            "question_type": "multiple_choice",
            "options_json": ["线粒体", "细胞壁", "核糖体", "内质网"],
            "correct_answer": "细胞壁",
            "explanation": "植物细胞拥有由纤维素构成的细胞壁，而动物细胞没有。",
            "difficulty": 0.3,
            "knowledge_points": ["cell_structure", "plant_biology"]
        }
    ]
    
    for q_data in questions:
        if not db.query(Question).filter(Question.content == q_data["content"]).first():
            q = Question(**q_data)
            db.add(q)
            
    db.commit()
    print("✅ Sample Questions seeded.")
    db.close()

if __name__ == "__main__":
    print("Starting question data seeding...")
    seed_question_banks()
    seed_sample_questions()
    print("🎉 Data seeding completed!")
