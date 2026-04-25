"""
管理员题库批量导入脚本
支持从 JSON 文件批量导入题目到指定题库
"""
import os
import sys
import json
from dotenv import load_dotenv

load_dotenv('.env.local')

backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))
sys.path.insert(0, backend_path)

from openmtscied.shared.models.db_models import SessionLocal, QuestionBank, Question

def import_questions_from_json(file_path: str, bank_name: str):
    """从 JSON 文件导入题目"""
    db = SessionLocal()
    
    # 查找或创建题库
    bank = db.query(QuestionBank).filter(QuestionBank.name == bank_name).first()
    if not bank:
        print(f"❌ Question Bank '{bank_name}' not found. Please create it first.")
        db.close()
        return

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        questions_data = data if isinstance(data, list) else data.get('questions', [])
        count = 0
        
        for q_data in questions_data:
            # 检查是否已存在
            if db.query(Question).filter(Question.content == q_data['content']).first():
                continue
                
            q = Question(
                bank_id=bank.id,
                content=q_data['content'],
                question_type=q_data.get('question_type', 'multiple_choice'),
                options_json=q_data.get('options_json'),
                correct_answer=q_data['correct_answer'],
                explanation=q_data.get('explanation', ''),
                difficulty=q_data.get('difficulty', 0.5),
                knowledge_points=q_data.get('knowledge_points', [])
            )
            db.add(q)
            count += 1
            
        db.commit()
        print(f"✅ Successfully imported {count} questions into '{bank_name}'.")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error importing questions: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    # 示例用法
    # python scripts/data_processing/import_questions.py --file data/questions_sample.json --bank "OpenStax Physics - Mechanics"
    import argparse
    parser = argparse.ArgumentParser(description="Import questions from JSON")
    parser.add_argument("--file", required=True, help="Path to JSON file")
    parser.add_argument("--bank", required=True, help="Name of the question bank")
    
    args = parser.parse_args()
    import_questions_from_json(args.file, args.bank)
