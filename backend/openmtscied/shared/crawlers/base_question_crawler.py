"""
题库爬虫基类
提供通用的题库爬取功能和质量评估机制
"""

import os
import json
import logging
import hashlib
from typing import Dict, Any, List, Optional
from pathlib import Path
from abc import ABC, abstractmethod
from datetime import datetime

logger = logging.getLogger(__name__)


class QuestionQualityChecker:
    """题目质量检查器"""
    
    @staticmethod
    def check_completeness(question: Dict[str, Any]) -> Dict[str, Any]:
        """检查题目完整性"""
        issues = []
        score = 100
        
        # 检查必填字段
        if not question.get('content'):
            issues.append("缺少题目内容")
            score -= 30
        
        if not question.get('correct_answer'):
            issues.append("缺少正确答案")
            score -= 30
        
        if not question.get('question_type'):
            issues.append("缺少题目类型")
            score -= 20
        
        # 检查选择题选项
        if question.get('question_type') == 'multiple_choice':
            options = question.get('options_json', [])
            if not options or len(options) < 2:
                issues.append("选择题选项不足")
                score -= 20
        
        # 检查解析
        if not question.get('explanation'):
            issues.append("缺少题目解析")
            score -= 10
        
        return {
            "score": max(0, score),
            "issues": issues,
            "is_valid": score >= 60
        }
    
    @staticmethod
    def estimate_difficulty(question: Dict[str, Any]) -> float:
        """估算题目难度（0-1）"""
        difficulty = 0.5  # 默认中等难度
        
        # 基于题目长度
        content_len = len(question.get('content', ''))
        if content_len > 200:
            difficulty += 0.1
        elif content_len < 50:
            difficulty -= 0.1
        
        # 基于知识点数量
        kp_count = len(question.get('knowledge_points', []))
        if kp_count > 3:
            difficulty += 0.1
        elif kp_count == 0:
            difficulty -= 0.1
        
        # 限制在0-1范围
        return max(0.0, min(1.0, difficulty))
    
    @staticmethod
    def generate_question_hash(question: Dict[str, Any]) -> str:
        """生成题目哈希值用于去重"""
        # 使用题目内容和类型作为去重依据
        content = question.get('content', '').strip().lower()
        q_type = question.get('question_type', '')
        
        hash_str = f"{q_type}:{content}"
        return hashlib.md5(hash_str.encode('utf-8')).hexdigest()


class BaseQuestionCrawler(ABC):
    """题库爬虫基类"""
    
    def __init__(self, crawler_id: str, name: str, description: str = ""):
        self.crawler_id = crawler_id
        self.name = name
        self.description = description
        self.quality_checker = QuestionQualityChecker()
        self.output_dir = Path("data/question_library")
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    @abstractmethod
    def crawl_questions(self, config: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        爬取题目
        
        Args:
            config: 爬虫配置
            
        Returns:
            题目列表
        """
        pass
    
    def process_questions(self, questions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        处理题目：质量检查、去重、标准化
        
        Args:
            questions: 原始题目列表
            
        Returns:
            处理结果统计
        """
        stats = {
            "total": len(questions),
            "valid": 0,
            "invalid": 0,
            "duplicates": 0,
            "processed": []
        }
        
        seen_hashes = set()
        
        for question in questions:
            # 1. 质量检查
            quality = self.quality_checker.check_completeness(question)
            
            if not quality["is_valid"]:
                stats["invalid"] += 1
                logger.warning(f"题目质量不达标: {quality['issues']}")
                continue
            
            # 2. 估算难度（如果未提供）
            if 'difficulty' not in question or question['difficulty'] is None:
                question['difficulty'] = self.quality_checker.estimate_difficulty(question)
            
            # 3. 去重检查
            q_hash = self.quality_checker.generate_question_hash(question)
            if q_hash in seen_hashes:
                stats["duplicates"] += 1
                continue
            
            seen_hashes.add(q_hash)
            
            # 4. 标准化处理
            standardized = self.standardize_question(question)
            stats["processed"].append(standardized)
            stats["valid"] += 1
        
        return stats
    
    def standardize_question(self, question: Dict[str, Any]) -> Dict[str, Any]:
        """标准化题目格式"""
        standardized = {
            "content": question.get("content", "").strip(),
            "question_type": question.get("question_type", "multiple_choice"),
            "options_json": question.get("options_json", []),
            "correct_answer": question.get("correct_answer", "").strip(),
            "explanation": question.get("explanation", ""),
            "difficulty": float(question.get("difficulty", 0.5)),
            "knowledge_points": question.get("knowledge_points", []),
            "source": question.get("source", self.crawler_id),
            "created_at": datetime.now().isoformat()
        }
        
        # 确保选择题选项是列表
        if standardized["question_type"] == "multiple_choice":
            if not isinstance(standardized["options_json"], list):
                standardized["options_json"] = []
        
        return standardized
    
    def save_questions(self, questions: List[Dict[str, Any]], filename: str):
        """保存题目到JSON文件"""
        output_file = self.output_dir / filename
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(questions, f, ensure_ascii=False, indent=2)
        logger.info(f"✅ 成功保存 {len(questions)} 道题目到 {output_file}")
        return output_file
    
    def run(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        运行爬虫
        
        Args:
            config: 爬虫配置
            
        Returns:
            爬取结果
        """
        try:
            logger.info(f"🚀 开始爬取题库: {self.name}")
            
            # 1. 爬取原始题目
            raw_questions = self.crawl_questions(config)
            logger.info(f"📊 爬取到 {len(raw_questions)} 道原始题目")
            
            # 2. 处理题目（质量检查、去重、标准化）
            stats = self.process_questions(raw_questions)
            logger.info(f"✅ 处理完成: 有效={stats['valid']}, 无效={stats['invalid']}, 重复={stats['duplicates']}")
            
            # 3. 保存结果
            if stats["processed"]:
                output_file = config.get('output_file', f"{self.crawler_id}_questions.json")
                self.save_questions(stats["processed"], output_file)
            
            return {
                "success": True,
                "total_items": stats["total"],
                "scraped_items": stats["valid"],
                "data": stats["processed"],
                "stats": {
                    "valid": stats["valid"],
                    "invalid": stats["invalid"],
                    "duplicates": stats["duplicates"]
                }
            }
            
        except Exception as e:
            logger.error(f"❌ 题库爬取失败: {str(e)}")
            return {
                "success": False,
                "total_items": 0,
                "scraped_items": 0,
                "error": str(e),
                "data": []
            }
