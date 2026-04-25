"""
题库数据导入脚本
将爬取的题目数据导入到数据库
"""

import os
import sys
import json
from pathlib import Path
from dotenv import load_dotenv

# 加载环境变量
load_dotenv('.env.local')

# 添加 backend 到路径
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))
sys.path.insert(0, backend_path)

from openmtscied.shared.models.db_models import SessionLocal, QuestionBank, Question


def create_question_bank(name: str, source: str, subject: str, level: str, description: str = "") -> int:
    """创建或获取题库"""
    db = SessionLocal()
    
    # 检查是否已存在
    existing = db.query(QuestionBank).filter(
        QuestionBank.name == name,
        QuestionBank.source == source
    ).first()
    
    if existing:
        print(f"✅ 题库已存在: {name} (ID: {existing.id})")
        bank_id = existing.id
    else:
        # 创建新题库
        bank = QuestionBank(
            name=name,
            description=description,
            source=source,
            subject=subject,
            level=level,
            total_questions=0
        )
        db.add(bank)
        db.commit()
        db.refresh(bank)
        bank_id = bank.id
        print(f"✅ 创建新题库: {name} (ID: {bank_id})")
    
    db.close()
    return bank_id


def import_questions_from_json(file_path: str, bank_id: int, batch_size: int = 100):
    """从 JSON 文件导入题目到指定题库"""
    db = SessionLocal()
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            questions_data = json.load(f)
        
        if not isinstance(questions_data, list):
            print(f"❌ JSON 文件格式错误，期望列表格式")
            return
        
        total = len(questions_data)
        imported = 0
        skipped = 0
        
        print(f"📊 开始导入 {total} 道题目...")
        
        for idx, q_data in enumerate(questions_data, 1):
            try:
                # 检查是否已存在（基于内容去重）
                existing = db.query(Question).filter(
                    Question.content == q_data.get('content', ''),
                    Question.bank_id == bank_id
                ).first()
                
                if existing:
                    skipped += 1
                    continue
                
                # 创建题目对象
                question = Question(
                    bank_id=bank_id,
                    content=q_data.get('content', ''),
                    question_type=q_data.get('question_type', 'multiple_choice'),
                    options_json=q_data.get('options_json', []),
                    correct_answer=q_data.get('correct_answer', ''),
                    explanation=q_data.get('explanation', ''),
                    difficulty=float(q_data.get('difficulty', 0.5)),
                    knowledge_points=q_data.get('knowledge_points', []),
                    course_ids=q_data.get('course_ids', [])
                )
                
                db.add(question)
                imported += 1
                
                # 批量提交
                if idx % batch_size == 0:
                    db.commit()
                    print(f"  进度: {idx}/{total} (已导入: {imported}, 跳过: {skipped})")
            
            except Exception as e:
                print(f"  ⚠️ 导入第 {idx} 题失败: {str(e)}")
                continue
        
        # 最终提交
        db.commit()
        
        # 更新题库总数
        bank = db.query(QuestionBank).filter(QuestionBank.id == bank_id).first()
        if bank:
            actual_count = db.query(Question).filter(Question.bank_id == bank_id).count()
            bank.total_questions = actual_count
            db.commit()
        
        print(f"\n✅ 导入完成!")
        print(f"   总题目数: {total}")
        print(f"   成功导入: {imported}")
        print(f"   跳过重复: {skipped}")
        print(f"   题库总数: {actual_count if bank else 0}")
    
    except Exception as e:
        print(f"❌ 导入失败: {str(e)}")
        db.rollback()
    finally:
        db.close()


def import_all_question_files(data_dir: str = "data/question_library"):
    """导入所有题库文件"""
    data_path = Path(data_dir)
    
    if not data_path.exists():
        print(f"❌ 目录不存在: {data_dir}")
        return
    
    json_files = list(data_path.glob("*_questions.json"))
    
    if not json_files:
        print(f"⚠️ 未找到题库文件")
        return
    
    print(f"📁 找到 {len(json_files)} 个题库文件\n")
    
    for json_file in json_files:
        print(f"\n{'='*60}")
        print(f"处理文件: {json_file.name}")
        print(f"{'='*60}")
        
        # 从文件名推断题库信息
        stem = json_file.stem  # 例如: openstax_biology_ch1
        parts = stem.split('_')
        
        # 根据文件名规则创建题库
        if 'openstax' in stem:
            source = "openstax"
            subject = parts[1] if len(parts) > 1 else "general"
            level = "high"
            bank_name = f"OpenStax {subject.title()} Questions"
            description = f"OpenStax {subject.title()} 教材复习题"
        else:
            source = parts[0] if parts else "unknown"
            subject = "general"
            level = "middle"
            bank_name = f"{source.title()} Questions"
            description = f"{source.title()} 题库"
        
        # 创建题库
        bank_id = create_question_bank(
            name=bank_name,
            source=source,
            subject=subject,
            level=level,
            description=description
        )
        
        # 导入题目
        import_questions_from_json(str(json_file), bank_id)


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="导入题库数据到数据库")
    parser.add_argument("--file", type=str, help="单个JSON文件路径")
    parser.add_argument("--bank-id", type=int, help="题库ID")
    parser.add_argument("--dir", type=str, default="data/question_library", help="题库文件目录")
    parser.add_argument("--all", action="store_true", help="导入所有题库文件")
    
    args = parser.parse_args()
    
    if args.file and args.bank_id:
        # 导入单个文件
        import_questions_from_json(args.file, args.bank_id)
    elif args.all:
        # 导入所有文件
        import_all_question_files(args.dir)
    else:
        print("用法:")
        print("  导入单个文件: python import_question_data.py --file xxx.json --bank-id 1")
        print("  导入所有文件: python import_question_data.py --all")
