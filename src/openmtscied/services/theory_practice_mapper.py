"""
OpenMTSciEd AI理论-实践映射服务
使用MiniCPM生成知识点与硬件项目的联动学习任务
"""

import json
import logging
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TheoryPracticeLink(BaseModel):
    """理论-实践关联"""

    knowledge_point_id: str = Field(..., description="知识点ID")
    hardware_project_id: str = Field(..., description="硬件项目ID")
    relevance_score: float = Field(..., ge=0, le=1, description="关联度评分(0-1)")
    explanation: str = Field(..., description="AI解释:为什么学这个理论需要做这个实验")
    learning_tasks: List[str] = Field(default_factory=list, description="具体学习任务列表")
    expected_outcomes: List[str] = Field(default_factory=list, description="预期学习成果")


class AILearningTask(BaseModel):
    """AI生成的学习任务"""

    task_id: str = Field(..., description="任务唯一ID")
    title: str = Field(..., description="任务标题")
    knowledge_point_id: str = Field(..., description="关联知识点")
    hardware_project_id: str = Field(..., description="关联硬件项目")

    # 任务描述
    description: str = Field(..., description="任务详细描述")
    theory_part: str = Field(..., description="理论学习部分")
    practice_part: str = Field(..., description="实践操作部分")

    # AI导师指导
    ai_guidance: str = Field(..., description="AI虚拟导师的指导语")
    hints: List[str] = Field(default_factory=list, description="提示信息")
    common_mistakes: List[str] = Field(default_factory=list, description="常见错误")

    # 评估标准
    success_criteria: List[str] = Field(default_factory=list, description="成功标准")
    estimated_time_minutes: int = Field(..., gt=0, description="预计完成时间(分钟)")

    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            "task_id": self.task_id,
            "title": self.title,
            "knowledge_point_id": self.knowledge_point_id,
            "hardware_project_id": self.hardware_project_id,
            "description": self.description,
            "theory_part": self.theory_part,
            "practice_part": self.practice_part,
            "ai_guidance": self.ai_guidance,
            "hints": self.hints,
            "common_mistakes": self.common_mistakes,
            "success_criteria": self.success_criteria,
            "estimated_time_minutes": self.estimated_time_minutes,
        }


class MiniCPMService:
    """
    MiniCPM AI服务

    使用MiniCPM-2B模型生成理论-实践联动任务
    """

    def __init__(self, model_path: str = "models/minicpm-2b"):
        self.model_path = model_path
        self.is_loaded = False
        # 实际实现需要加载MiniCPM模型
        # from transformers import AutoModelForCausalLM, AutoTokenizer
        # self.model = AutoModelForCausalLM.from_pretrained(model_path)
        # self.tokenizer = AutoTokenizer.from_pretrained(model_path)

    def load_model(self):
        """加载MiniCPM模型"""
        logger.info(f"加载MiniCPM模型: {self.model_path}")
        # 模拟加载
        self.is_loaded = True
        logger.info("✅ MiniCPM模型加载成功")

    def generate_link_explanation(self, kp_title: str, kp_description: str,
                                  hw_title: str, hw_description: str) -> str:
        """
        生成理论-实践关联解释

        Args:
            kp_title: 知识点标题
            kp_description: 知识点描述
            hw_title: 硬件项目标题
            hw_description: 硬件项目描述

        Returns:
            AI生成的关联解释文本
        """

        # 构建Prompt
        prompt = f"""你是一个STEM教育专家。请解释为什么学习以下理论知识需要通过对应的硬件实践来加深理解:

【理论知识】
标题: {kp_title}
描述: {kp_description}

【硬件实践】
标题: {hw_title}
描述: {hw_description}

请用简洁的语言(200字以内)解释:
1. 这个理论知识在实际应用中有什么作用?
2. 为什么通过做这个硬件实验能更好地理解理论?
3. 理论与实践之间有什么联系?"""

        # 实际实现需要调用MiniCPM模型生成
        # inputs = self.tokenizer(prompt, return_tensors="pt")
        # outputs = self.model.generate(**inputs, max_length=500)
        # explanation = self.tokenizer.decode(outputs[0], skip_special_tokens=True)

        # 模拟AI生成(示例)
        explanation = self._simulate_ai_response(kp_title, hw_title)

        return explanation

    def _simulate_ai_response(self, kp_title: str, hw_title: str) -> str:
        """模拟AI响应(用于测试)"""

        responses = {
            ("牛顿运动定律", "超声波测距仪"):
                "通过学习牛顿运动定律,你理解了力与加速度的关系。制作超声波测距仪时,你需要考虑传感器安装位置的稳定性,这直接体现了惯性定律。当小车运动时,如果固定不牢,传感器会因惯性产生误差读数。通过实验,你能直观感受到理论中'物体保持原有运动状态'的含义。",

            ("电磁感应", "智能风扇控制系统"):
                "电磁感应定律告诉我们变化的磁场会产生电流。在智能风扇项目中,电机正是利用这一原理将电能转化为机械能。当你编写代码控制电机转速时,实际上是在调节电流大小,从而改变磁场强度。通过观察风扇转速变化,你能验证法拉第电磁感应定律。",

            ("生态系统能量流动", "WiFi环境监测站"):
                "生态系统中能量沿食物链逐级递减。使用WiFi监测站收集环境数据(温度、湿度),你可以模拟不同环境条件下的生态系统变化。例如,温度升高可能影响植物光合作用效率,进而影响整个食物链的能量传递。数据采集帮助你量化这些抽象概念。",

            ("欧姆定律", "语音控制LED灯"):
                "欧姆定律V=IR描述了电压、电流和电阻的关系。在LED电路中,你必须串联限流电阻,否则LED会因电流过大而烧毁。通过调整PWM值改变亮度,你实际上在调节等效电阻,从而控制电流。实验让你亲手验证理论公式。"
        }

        # 查找匹配的解释,否则返回通用解释
        for (kp, hw), explanation in responses.items():
            if kp in kp_title and hw in hw_title:
                return explanation

        return f"学习'{kp_title}'的理论知识,通过'{hw_title}'的实践项目,能够将抽象概念具象化。在动手制作过程中,你会遇到理论预测与实际结果的差异,这种对比分析能深化对理论的理解。理论与实践相结合,是STEM教育的核心理念。"

    def generate_learning_tasks(self, kp_id: str, kp_info: Dict[str, Any],
                                hw_id: str, hw_info: Dict[str, Any]) -> AILearningTask:
        """
        生成完整的AI学习任务

        Args:
            kp_id: 知识点ID
            kp_info: 知识点信息(包含title, description等)
            hw_id: 硬件项目ID
            hw_info: 硬件项目信息

        Returns:
            AI生成的学习任务
        """

        logger.info(f"为 {kp_id} + {hw_id} 生成AI学习任务")

        # 生成关联解释
        explanation = self.generate_link_explanation(
            kp_info.get("title", ""),
            kp_info.get("description", ""),
            hw_info.get("title", ""),
            hw_info.get("description", "")
        )

        # 构建学习任务
        task = AILearningTask(
            task_id=f"TASK-{kp_id}-{hw_id}",
            title=f"{kp_info.get('title', '')} → {hw_info.get('title', '')}",
            knowledge_point_id=kp_id,
            hardware_project_id=hw_id,
            description=f"本任务将理论知识'{kp_info.get('title', '')}'与硬件实践'{hw_info.get('title', '')}'相结合,通过动手实验深化理论理解。",
            theory_part=f"请先学习以下内容:\n\n{kp_info.get('description', '')}\n\n重点理解核心概念和公式。",
            practice_part=f"然后完成硬件项目:\n\n{hw_info.get('title', '')}\n\n{hw_info.get('description', '')}\n\n按照接线图连接电路,上传代码并测试。",
            ai_guidance=explanation,
            hints=[
                "提示1: 先阅读理论知识,标记不理解的地方",
                "提示2: 按照接线图仔细连接,避免短路",
                "提示3: 上传代码前检查语法错误",
                "提示4: 观察实验现象,与理论预测对比"
            ],
            common_mistakes=[
                "常见错误1: 接线错误导致设备无响应",
                "常见错误2: 未理解理论就盲目操作",
                "常见错误3: 忽略安全注意事项"
            ],
            success_criteria=[
                "能够口头解释理论知识",
                "成功完成硬件项目搭建",
                "能说明理论与实践的联系"
            ],
            estimated_time_minutes=60
        )

        return task


class TheoryPracticeMapper:
    """
    理论-实践映射器

    从Neo4j知识图谱查询知识点与硬件项目的关联,使用AI生成联动任务
    """

    def __init__(self):
        self.ai_service = MiniCPMService()
        self.mappings: List[TheoryPracticeLink] = []
        self.tasks: List[AILearningTask] = []

    def generate_mappings_from_neo4j(self) -> List[TheoryPracticeLink]:
        """
        从Neo4j查询知识点与硬件项目的关联

        Returns:
            关联列表
        """
        # 实际实现需要查询Neo4j
        # cypher = """
        # MATCH (kp:KnowledgePoint)-[:HARDWARE_MAPS_TO]->(hp:HardwareProject)
        # RETURN kp.id, kp.title, hp.id, hp.title
        # """

        # 模拟数据
        sample_mappings = [
            TheoryPracticeLink(
                knowledge_point_id="KP-Phys-001",
                hardware_project_id="HW-Sensor-001",
                relevance_score=0.85,
                explanation=self.ai_service.generate_link_explanation(
                    "牛顿运动定律", "物体受力与加速度关系",
                    "超声波测距仪", "使用HC-SR04测量距离"
                ),
                learning_tasks=[
                    "学习牛顿第二定律F=ma",
                    "分析传感器受力情况",
                    "设计稳定安装方案"
                ],
                expected_outcomes=[
                    "理解惯性的实际应用",
                    "掌握传感器安装技巧"
                ]
            ),
            TheoryPracticeLink(
                knowledge_point_id="KP-Phys-002",
                hardware_project_id="HW-Motor-001",
                relevance_score=0.90,
                explanation=self.ai_service.generate_link_explanation(
                    "电磁感应", "变化磁场产生电流",
                    "智能风扇控制系统", "温度控制直流电机"
                ),
                learning_tasks=[
                    "学习法拉第电磁感应定律",
                    "理解电机工作原理",
                    "编写PWM控制代码"
                ],
                expected_outcomes=[
                    "掌握电磁转换原理",
                    "学会电机控制技术"
                ]
            ),
        ]

        self.mappings = sample_mappings
        logger.info(f"✅ 生成 {len(sample_mappings)} 个理论-实践关联")

        return sample_mappings

    def generate_ai_tasks(self) -> List[AILearningTask]:
        """
        为所有映射生成AI学习任务

        Returns:
            AI学习任务列表
        """

        if not self.mappings:
            self.generate_mappings_from_neo4j()

        tasks = []
        for mapping in self.mappings:
            # 模拟知识点和硬件项目信息
            kp_info = {
                "title": f"知识点 {mapping.knowledge_point_id}",
                "description": "相关理论知识描述"
            }
            hw_info = {
                "title": f"硬件项目 {mapping.hardware_project_id}",
                "description": "硬件项目描述"
            }

            task = self.ai_service.generate_learning_tasks(
                mapping.knowledge_point_id, kp_info,
                mapping.hardware_project_id, hw_info
            )
            tasks.append(task)

        self.tasks = tasks
        logger.info(f"✅ 生成 {len(tasks)} 个AI学习任务")

        return tasks

    def get_task_by_ids(self, kp_id: str, hw_id: str) -> Optional[AILearningTask]:
        """根据知识点和硬件项目ID获取任务"""
        for task in self.tasks:
            if task.knowledge_point_id == kp_id and task.hardware_project_id == hw_id:
                return task
        return None

    def export_tasks_to_json(self, filepath: str = "data/ai_learning_tasks.json"):
        """导出学习任务到JSON"""
        data = [task.to_dict() for task in self.tasks]
        Path(filepath).parent.mkdir(parents=True, exist_ok=True)

        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"✅ 已导出 {len(self.tasks)} 个AI学习任务到: {filepath}")

    def get_statistics(self) -> Dict[str, Any]:
        """获取统计信息"""
        return {
            "total_mappings": len(self.mappings),
            "total_tasks": len(self.tasks),
            "avg_relevance_score": sum(m.relevance_score for m in self.mappings) / len(self.mappings) if self.mappings else 0,
        }


# 示例使用
if __name__ == "__main__":
    mapper = TheoryPracticeMapper()

    print("=" * 60)
    print("AI理论-实践映射服务")
    print("=" * 60)

    # 生成关联
    print("\n1. 从Neo4j生成理论-实践关联:")
    mappings = mapper.generate_mappings_from_neo4j()
    for m in mappings:
        print(f"   - {m.knowledge_point_id} ↔ {m.hardware_project_id} (关联度: {m.relevance_score})")

    # 生成AI任务
    print("\n2. 生成AI学习任务:")
    tasks = mapper.generate_ai_tasks()
    for task in tasks:
        print(f"   - {task.title}")
        print(f"     预计时长: {task.estimated_time_minutes}分钟")

    # 显示统计
    print("\n3. 统计信息:")
    stats = mapper.get_statistics()
    print(f"   总关联数: {stats['total_mappings']}")
    print(f"   总任务数: {stats['total_tasks']}")
    print(f"   平均关联度: {stats['avg_relevance_score']:.2f}")

    # 导出到JSON
    mapper.export_tasks_to_json()
