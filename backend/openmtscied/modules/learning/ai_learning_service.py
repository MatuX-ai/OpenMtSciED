"""
OpenMTSciEd 统一 AI 学习服务
整合课程大纲生成、理论-实践映射及联动任务生成
"""

import os
import json
import logging
import requests
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- 数据模型 ---

class CourseOutlineItem(BaseModel):
    title: str
    description: str
    estimated_hours: float
    resources: List[str] = []

class CourseDesignResponse(BaseModel):
    topic: str
    target_audience: str
    outline: List[CourseOutlineItem]
    learning_objectives: List[str]

class AILearningTask(BaseModel):
    task_id: str
    title: str
    knowledge_point_id: str
    hardware_project_id: str
    description: str
    theory_part: str
    practice_part: str
    ai_guidance: str
    hints: List[str] = []
    common_mistakes: List[str] = []
    success_criteria: List[str] = []
    estimated_time_minutes: int = 60

# --- 核心服务类 ---

class UnifiedAIService:
    def __init__(self):
        self.api_key = os.getenv("LLM_API_KEY", "")
        self.base_url = os.getenv("LLM_BASE_URL", "https://api.openai.com/v1/chat/completions")
        self.model = os.getenv("LLM_MODEL", "gpt-3.5-turbo")

    def _call_llm(self, prompt: str) -> Optional[str]:
        if not self.api_key:
            return None
        try:
            response = requests.post(
                self.base_url,
                headers={"Content-Type": "application/json", "Authorization": f"Bearer {self.api_key}"},
                json={"model": self.model, "messages": [{"role": "user", "content": prompt}], "temperature": 0.7},
                timeout=30
            )
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error(f"LLM call failed: {str(e)}")
            return None

    def generate_outline(self, topic: str, grade_level: str = "High School") -> Optional[CourseDesignResponse]:
        """生成 STEM 课程大纲"""
        prompt = f"""请为 {grade_level} 学生设计一个关于 "{topic}" 的 STEM 课程大纲。
        要求：1. 包含 3-5 个核心模块；2. 每个模块包含标题、描述、预计学时；3. 输出严格 JSON 格式。"""
        
        content = self._call_llm(prompt)
        if content:
            try:
                data = json.loads(content)
                return CourseDesignResponse(
                    topic=topic, target_audience=grade_level,
                    outline=[CourseOutlineItem(**item) for item in data.get("outline", [])],
                    learning_objectives=data.get("learning_objectives", [])
                )
            except: pass
        return self._get_mock_outline(topic, grade_level)

    def generate_link_explanation(self, kp_title: str, hw_title: str) -> str:
        """生成理论与硬件实践的关联解释"""
        prompt = f"请用 100 字以内解释：学习'{kp_title}'为什么需要通过'{hw_title}'这个硬件实验来加深理解？"
        explanation = self._call_llm(prompt)
        return explanation or f"通过'{hw_title}'的实践，可以将'{kp_title}'的抽象理论具象化，通过观察实验现象验证理论预测。"

    def generate_learning_task(self, kp_id: str, kp_info: Dict, hw_id: str, hw_info: Dict) -> AILearningTask:
        """生成完整的 AI 联动学习任务"""
        explanation = self.generate_link_explanation(kp_info.get("title", ""), hw_info.get("title", ""))
        return AILearningTask(
            task_id=f"TASK-{kp_id}-{hw_id}",
            title=f"{kp_info.get('title', '')} → {hw_info.get('title', '')}",
            knowledge_point_id=kp_id, hardware_project_id=hw_id,
            description=f"结合理论与实践的联动学习任务。",
            theory_part=f"理论学习：{kp_info.get('description', '')}",
            practice_part=f"硬件实践：{hw_info.get('description', '')}",
            ai_guidance=explanation,
            hints=["先理解理论核心概念", "仔细检查硬件接线", "对比实验结果与理论预测"]
        )

    def _get_mock_outline(self, topic: str, grade_level: str) -> CourseDesignResponse:
        return CourseDesignResponse(
            topic=topic, target_audience=grade_level,
            outline=[CourseOutlineItem(title=f"{topic} 基础", description="核心概念", estimated_hours=2.0)],
            learning_objectives=[f"掌握 {topic} 的基本原理"]
        )

# 全局实例
ai_service = UnifiedAIService()
