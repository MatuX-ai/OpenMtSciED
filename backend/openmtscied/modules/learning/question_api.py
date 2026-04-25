from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
import requests
import base64
import os

from shared.models.db_models import SessionLocal, QuestionBank, Question, UserAnswer

def get_current_user_id():
    # 简化版：测试环境下返回固定用户 ID，并确保该用户在数据库中存在
    db = SessionLocal()
    user_id = "test_user_001"
    if not db.query(UserProfile).filter(UserProfile.id == user_id).first():
        from shared.models.db_models import UserProfile
        user = UserProfile(id=user_id, username="TestUser")
        db.add(user)
        db.commit()
    db.close()
    return user_id

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Pydantic Models ---
class QuestionBankCreate(BaseModel):
    name: str
    description: Optional[str] = None
    source: Optional[str] = None
    subject: Optional[str] = None
    level: Optional[str] = None

class QuestionCreate(BaseModel):
    bank_id: int
    content: str
    question_type: str
    options_json: Optional[list] = None
    correct_answer: str
    explanation: Optional[str] = None
    difficulty: Optional[float] = 0.5
    knowledge_points: Optional[list] = []
    course_ids: Optional[list] = []

class AnswerSubmit(BaseModel):
    question_id: int
    answer_content: str
    time_spent_seconds: Optional[int] = 0

# --- API Endpoints ---

@router.get("/banks")
def get_question_banks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    banks = db.query(QuestionBank).offset(skip).limit(limit).all()
    return {"success": True, "data": banks}

@router.post("/banks")
def create_question_bank(bank: QuestionBankCreate, db: Session = Depends(get_db)):
    db_bank = QuestionBank(**bank.dict())
    db.add(db_bank)
    db.commit()
    db.refresh(db_bank)
    return {"success": True, "data": db_bank}

@router.get("/questions")
def get_questions(bank_id: Optional[int] = None, skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    query = db.query(Question)
    if bank_id:
        query = query.filter(Question.bank_id == bank_id)
    questions = query.offset(skip).limit(limit).all()
    return {"success": True, "data": questions}

@router.post("/questions")
def create_question(question: QuestionCreate, db: Session = Depends(get_db)):
    db_question = Question(**question.dict())
    db.add(db_question)
    
    # 更新题库总数
    bank = db.query(QuestionBank).filter(QuestionBank.id == question.bank_id).first()
    if bank:
        bank.total_questions += 1
    
    db.commit()
    db.refresh(db_question)
    return {"success": True, "data": db_question}

@router.post("/submit-answer")
def submit_answer(answer: AnswerSubmit, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    question = db.query(Question).filter(Question.id == answer.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # 简单判分逻辑 (可根据题型扩展)
    is_correct = 1 if answer.answer_content.strip().lower() == question.correct_answer.strip().lower() else 0
    
    db_answer = UserAnswer(
        user_id=user_id,
        question_id=answer.question_id,
        answer_content=answer.answer_content,
        is_correct=is_correct,
        time_spent_seconds=answer.time_spent_seconds
    )
    db.add(db_answer)
    db.commit()
    
    return {
        "success": True, 
        "is_correct": bool(is_correct), 
        "explanation": question.explanation
    }

@router.get("/recommend-questions")
def recommend_questions(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    """基于知识图谱和答题记录推荐题目"""
    # 1. 获取用户最近答错的知识点
    wrong_answers = db.query(UserAnswer).filter(
        UserAnswer.user_id == user_id,
        UserAnswer.is_correct == 0
    ).order_by(UserAnswer.answered_at.desc()).limit(10).all()
    
    weak_points = set()
    for ans in wrong_answers:
        q = db.query(Question).filter(Question.id == ans.question_id).first()
        if q and q.knowledge_points:
            weak_points.update(q.knowledge_points)
    
    recommended = []
    
    if weak_points:
        # 2. 针对薄弱知识点推荐
        for point in list(weak_points)[:3]:
            qs = db.query(Question).filter(
                Question.knowledge_points.contains([point])
            ).limit(2).all()
            recommended.extend(qs)
    else:
        # 3. 如果没有错题，则根据 Neo4j 中的热门路径推荐基础题
        # TODO: 这里可以接入 Neo4j 查询最常被访问的课程节点
        questions = db.query(Question).order_by(func.random()).limit(5).all()
        return {"success": True, "data": questions}
    
    return {"success": True, "data": recommended[:5]}

@router.get("/my-history")
def get_user_history(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    """获取用户答题历史及错题本"""
    answers = db.query(UserAnswer).filter(
        UserAnswer.user_id == user_id
    ).order_by(UserAnswer.answered_at.desc()).limit(50).all()
    
    history = []
    for ans in answers:
        q = db.query(Question).filter(Question.id == ans.question_id).first()
        if q:
            history.append({
                "answer_id": ans.id,
                "question_content": q.content,
                "is_correct": bool(ans.is_correct),
                "answered_at": ans.answered_at,
                "knowledge_points": q.knowledge_points
            })
    
    return {"success": True, "data": history}

@router.get("/stats")
def get_user_stats(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    """获取用户知识点掌握度统计"""
    answers = db.query(UserAnswer).filter(UserAnswer.user_id == user_id).all()
    
    point_stats = {}
    total = len(answers)
    correct = sum(1 for a in answers if a.is_correct)
    
    for ans in answers:
        q = db.query(Question).filter(Question.id == ans.question_id).first()
        if q and q.knowledge_points:
            for point in q.knowledge_points:
                if point not in point_stats:
                    point_stats[point] = {"total": 0, "correct": 0}
                point_stats[point]["total"] += 1
                if ans.is_correct:
                    point_stats[point]["correct"] += 1
    
    # 计算掌握度百分比
    mastery = {}
    for point, stats in point_stats.items():
        mastery[point] = round((stats["correct"] / stats["total"]) * 100, 1) if stats["total"] > 0 else 0
        
    return {
        "success": True, 
        "overall_accuracy": round((correct / total) * 100, 1) if total > 0 else 0,
        "knowledge_mastery": mastery
    }

@router.get("/adaptive-quiz")
def get_adaptive_quiz(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    """获取自适应练习题目 (根据用户水平动态调整难度)"""
    # 1. 计算用户当前平均难度水平
    recent_answers = db.query(UserAnswer).filter(
        UserAnswer.user_id == user_id
    ).order_by(UserAnswer.answered_at.desc()).limit(20).all()
    
    current_level = 0.5 # 默认中等难度
    if recent_answers:
        difficulties = []
        for ans in recent_answers:
            q = db.query(Question).filter(Question.id == ans.question_id).first()
            if q:
                difficulties.append(q.difficulty)
        if difficulties:
            current_level = sum(difficulties) / len(difficulties)

    # 2. 根据表现微调下一题难度
    last_ans = recent_answers[0] if recent_answers else None
    target_difficulty = current_level
    if last_ans:
        if last_ans.is_correct:
            target_difficulty = min(1.0, current_level + 0.1) # 答对则增加难度
        else:
            target_difficulty = max(0.0, current_level - 0.1) # 答错则降低难度

    # 3. 选取最接近目标难度的题目
    all_questions = db.query(Question).all()
    if not all_questions:
        return {"success": True, "data": []}
        
    # 简单的距离排序
    best_question = min(all_questions, key=lambda q: abs(q.difficulty - target_difficulty))
    
    return {"success": True, "data": [best_question], "target_difficulty": target_difficulty}

@router.get("/daily-challenge")
def get_daily_challenge(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    """获取每日一题 (基于日期和用户ID的确定性随机)"""
    from datetime import date
    today = date.today().isoformat()
    
    # 检查今天是否已经做过
    existing = db.query(UserAnswer).join(Question).filter(
        UserAnswer.user_id == user_id,
        func.date(UserAnswer.answered_at) == date.today()
    ).first()
    
    if existing:
        q = db.query(Question).filter(Question.id == existing.question_id).first()
        return {"success": True, "data": q, "is_completed": True}

    # 生成今日题目：使用用户ID和日期的哈希值作为种子
    import hashlib
    seed_str = f"{user_id}-{today}"
    seed_hash = int(hashlib.md5(seed_str.encode()).hexdigest(), 16)
    
    total = db.query(Question).count()
    if total == 0:
        return {"success": False, "message": "No questions available"}
        
    offset = seed_hash % total
    question = db.query(Question).offset(offset).limit(1).first()
    
    return {"success": True, "data": question, "is_completed": False}
