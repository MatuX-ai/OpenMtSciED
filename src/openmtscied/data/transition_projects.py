"""
OpenMTSciEd 过渡项目库
为知识递进点设计Blockly编程项目模板
"""

import json
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from pathlib import Path


class BlocklyBlock(BaseModel):
    """Blockly积木块定义"""
    block_type: str = Field(..., description="积木类型,如variables_set, math_number")
    fields: Dict[str, Any] = Field(default_factory=dict, description="字段值")
    inputs: Dict[str, Any] = Field(default_factory=dict, description="输入值(嵌套积木)")


class TransitionProject(BaseModel):
    """
    过渡项目模型

    用于帮助学生理解抽象概念的Blockly编程项目
    """

    # 基础信息
    project_id: str = Field(..., description="项目唯一ID")
    title: str = Field(..., description="项目标题")
    knowledge_point_id: str = Field(..., description="关联的知识点ID")
    subject: str = Field(..., description="学科(物理/化学/生物/工程)")
    difficulty: int = Field(..., ge=1, le=5, description="难度等级(1-5)")

    # 项目描述
    description: str = Field(..., description="项目描述")
    learning_objectives: List[str] = Field(default_factory=list, description="学习目标")
    estimated_time_minutes: int = Field(..., gt=0, description="预计完成时间(分钟)")

    # Blockly配置
    initial_blocks: List[BlocklyBlock] = Field(default_factory=list, description="初始积木块")
    blockly_xml: str = Field(default="", description="Blockly XML模板")
    javascript_code: str = Field(default="", description="生成的JavaScript代码")

    # 仿真参数
    simulation_params: Dict[str, Any] = Field(default_factory=dict, description="仿真参数配置")

    # 评估标准
    success_criteria: List[str] = Field(default_factory=list, description="成功标准")
    hints: List[str] = Field(default_factory=list, description="提示信息")

    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            "project_id": self.project_id,
            "title": self.title,
            "knowledge_point_id": self.knowledge_point_id,
            "subject": self.subject,
            "difficulty": self.difficulty,
            "description": self.description,
            "learning_objectives": self.learning_objectives,
            "estimated_time_minutes": self.estimated_time_minutes,
            "blockly_xml": self.blockly_xml,
            "javascript_code": self.javascript_code,
            "simulation_params": self.simulation_params,
        }


class TransitionProjectLibrary:
    """
    过渡项目库

    管理所有过渡项目模板,支持按知识点、学科、难度查询
    """

    def __init__(self, data_file: str = "data/transition_projects.json"):
        self.data_file = Path(data_file)
        self.projects: List[TransitionProject] = []
        self._load_projects()

    def _load_projects(self):
        """加载项目库(从文件或生成示例)"""
        if self.data_file.exists():
            with open(self.data_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                self.projects = [TransitionProject(**p) for p in data]
        else:
            # 生成示例项目
            self.projects = self._generate_sample_projects()
            self.save()

    def _generate_sample_projects(self) -> List[TransitionProject]:
        """生成示例过渡项目"""

        projects = [
            # 物理类项目
            TransitionProject(
                project_id="TP-Phys-001",
                title="用变量模拟速度公式 v=s/t",
                knowledge_point_id="KP-Phys-001",
                subject="物理",
                difficulty=2,
                description="通过Blockly编程,使用变量存储距离和时间,计算并显示速度",
                learning_objectives=[
                    "理解变量的概念和用途",
                    "掌握速度公式 v=s/t",
                    "学会使用数学运算积木"
                ],
                estimated_time_minutes=30,
                initial_blocks=[
                    BlocklyBlock(
                        block_type="variables_set",
                        fields={"VAR": "distance"},
                        inputs={"VALUE": {"block_type": "math_number", "fields": {"NUM": 100}}}
                    ),
                    BlocklyBlock(
                        block_type="variables_set",
                        fields={"VAR": "time"},
                        inputs={"VALUE": {"block_type": "math_number", "fields": {"NUM": 10}}}
                    ),
                ],
                blockly_xml="""<xml>
  <block type="variables_set" x="50" y="50">
    <field name="VAR">distance</field>
    <value name="VALUE">
      <block type="math_number">
        <field name="NUM">100</field>
      </block>
    </value>
  </block>
  <block type="variables_set" x="50" y="150">
    <field name="VAR">time</field>
    <value name="VALUE">
      <block type="math_number">
        <field name="NUM">10</field>
      </block>
    </value>
  </block>
  <block type="variables_set" x="50" y="250">
    <field name="VAR">velocity</field>
    <value name="VALUE">
      <block type="math_arithmetic">
        <field name="OP">DIVIDE</field>
        <value name="A">
          <block type="variables_get">
            <field name="VAR">distance</field>
          </block>
        </value>
        <value name="B">
          <block type="variables_get">
            <field name="VAR">time</field>
          </block>
        </value>
      </block>
    </value>
  </block>
</xml>""",
                javascript_code="""var distance = 100;
var time = 10;
var velocity = distance / time;
console.log('速度:', velocity, 'm/s');""",
                simulation_params={
                    "variables": ["distance", "time", "velocity"],
                    "formula": "velocity = distance / time",
                    "output_type": "console"
                },
                success_criteria=[
                    "正确定义distance和time变量",
                    "使用除法运算计算速度",
                    "输出结果单位为m/s"
                ],
                hints=[
                    "提示1: 使用'变量'类别中的'设置变量'积木",
                    "提示2: 使用'数学运算'类别中的'除法'积木",
                    "提示3: 使用'文本'类别中的'打印'积木显示结果"
                ]
            ),

            # 生物类项目
            TransitionProject(
                project_id="TP-Bio-001",
                title="用函数模拟种群增长",
                knowledge_point_id="KP-Bio-001",
                subject="生物",
                difficulty=3,
                description="编写函数模拟生态系统中的种群数量随时间的指数增长",
                learning_objectives=[
                    "理解函数的定义和调用",
                    "掌握指数增长模型 N(t) = N₀ × e^(rt)",
                    "学会使用循环积木"
                ],
                estimated_time_minutes=45,
                initial_blocks=[],
                blockly_xml="""<xml>
  <block type="procedures_defnoreturn" x="50" y="50">
    <field name="NAME">simulatePopulation</field>
    <statement name="STACK">
      <block type="variables_set">
        <field name="VAR">initial_population</field>
        <value name="VALUE">
          <block type="math_number">
            <field name="NUM">100</field>
          </block>
        </value>
        <next>
          <block type="variables_set">
            <field name="VAR">growth_rate</field>
            <value name="VALUE">
              <block type="math_number">
                <field name="NUM">0.1</field>
              </block>
            </value>
          </block>
        </next>
      </block>
    </statement>
  </block>
</xml>""",
                javascript_code="""function simulatePopulation() {
  var initial_population = 100;
  var growth_rate = 0.1;
  var time_steps = 10;

  for (var t = 0; t < time_steps; t++) {
    var population = initial_population * Math.exp(growth_rate * t);
    console.log('时间步', t, ': 种群数量', Math.round(population));
  }
}

simulatePopulation();""",
                simulation_params={
                    "function_name": "simulatePopulation",
                    "parameters": ["initial_population", "growth_rate", "time_steps"],
                    "model": "exponential_growth",
                    "output_type": "chart"
                },
                success_criteria=[
                    "正确定义simulatePopulation函数",
                    "使用循环模拟多个时间步",
                    "应用指数增长公式",
                    "输出种群数量变化曲线"
                ],
                hints=[
                    "提示1: 使用'函数'类别定义simulatePopulation",
                    "提示2: 使用'循环'类别中的'repeat'积木",
                    "提示3: 使用'数学运算'中的'指数'积木计算e^(rt)"
                ]
            ),

            # 化学类项目
            TransitionProject(
                project_id="TP-Chem-001",
                title="用数组存储元素周期表",
                knowledge_point_id="KP-Chem-001",
                subject="化学",
                difficulty=2,
                description="使用数组存储前10个化学元素的信息,并实现查询功能",
                learning_objectives=[
                    "理解数组的概念和操作",
                    "掌握对象/字典的使用",
                    "学会遍历数组查找元素"
                ],
                estimated_time_minutes=35,
                initial_blocks=[],
                blockly_xml="""<xml>
  <block type="variables_set" x="50" y="50">
    <field name="VAR">elements</field>
    <value name="VALUE">
      <block type="lists_create_with">
        <mutation items="3"></mutation>
      </block>
    </value>
  </block>
</xml>""",
                javascript_code="""var elements = [
  {name: '氢', symbol: 'H', atomic_number: 1},
  {name: '氦', symbol: 'He', atomic_number: 2},
  {name: '锂', symbol: 'Li', atomic_number: 3}
];

// 查询原子序数为2的元素
for (var i = 0; i < elements.length; i++) {
  if (elements[i].atomic_number === 2) {
    console.log('找到元素:', elements[i].name, elements[i].symbol);
  }
}""",
                simulation_params={
                    "data_structure": "array_of_objects",
                    "query_field": "atomic_number",
                    "output_type": "table"
                },
                success_criteria=[
                    "正确定义包含元素信息的数组",
                    "每个元素包含name、symbol、atomic_number字段",
                    "实现按原子序数查询功能",
                    "输出查询结果"
                ],
                hints=[
                    "提示1: 使用'列表'类别创建数组",
                    "提示2: 使用'字典'类别存储元素属性",
                    "提示3: 使用'循环'和'条件判断'实现查询"
                ]
            ),

            # 工程类项目
            TransitionProject(
                project_id="TP-Eng-001",
                title="用状态机模拟交通灯控制",
                knowledge_point_id="KP-Eng-001",
                subject="工程",
                difficulty=3,
                description="使用状态机模式模拟交通灯的红灯→绿灯→黄灯循环",
                learning_objectives=[
                    "理解状态机的基本概念",
                    "掌握条件分支的使用",
                    "学会模拟时序控制"
                ],
                estimated_time_minutes=40,
                initial_blocks=[],
                blockly_xml="""<xml>
  <block type="variables_set" x="50" y="50">
    <field name="VAR">current_state</field>
    <value name="VALUE">
      <block type="text">
        <field name="TEXT">red</field>
      </block>
    </value>
  </block>
</xml>""",
                javascript_code="""var current_state = 'red';
var states = ['red', 'green', 'yellow'];

function trafficLightCycle() {
  var currentIndex = states.indexOf(current_state);
  var nextIndex = (currentIndex + 1) % states.length;
  current_state = states[nextIndex];

  console.log('当前信号灯:', current_state);

  if (current_state === 'red') {
    console.log('  → 等待30秒后变绿');
  } else if (current_state === 'green') {
    console.log('  → 等待25秒后变黄');
  } else if (current_state === 'yellow') {
    console.log('  → 等待5秒后变红');
  }
}

// 模拟3个周期
for (var cycle = 0; cycle < 3; cycle++) {
  console.log('\\n=== 周期', cycle + 1, '===');
  trafficLightCycle();
}""",
                simulation_params={
                    "pattern": "state_machine",
                    "states": ["red", "green", "yellow"],
                    "transitions": {"red": "green", "green": "yellow", "yellow": "red"},
                    "output_type": "animation"
                },
                success_criteria=[
                    "正确定义状态变量和状态列表",
                    "实现状态转换逻辑",
                    "模拟至少3个完整周期",
                    "输出每个状态的持续时间"
                ],
                hints=[
                    "提示1: 使用变量current_state记录当前状态",
                    "提示2: 使用数组states存储所有状态",
                    "提示3: 使用取模运算%实现循环切换"
                ]
            ),
        ]

        return projects

    def get_project_by_id(self, project_id: str) -> Optional[TransitionProject]:
        """根据ID获取项目"""
        for project in self.projects:
            if project.project_id == project_id:
                return project
        return None

    def get_projects_by_knowledge_point(self, kp_id: str) -> List[TransitionProject]:
        """根据知识点ID获取相关项目"""
        return [p for p in self.projects if p.knowledge_point_id == kp_id]

    def get_projects_by_subject(self, subject: str) -> List[TransitionProject]:
        """根据学科获取项目"""
        return [p for p in self.projects if p.subject == subject]

    def get_projects_by_difficulty(self, difficulty: int) -> List[TransitionProject]:
        """根据难度获取项目"""
        return [p for p in self.projects if p.difficulty == difficulty]

    def search_projects(self, keyword: str) -> List[TransitionProject]:
        """搜索项目(标题或描述中包含关键词)"""
        keyword_lower = keyword.lower()
        return [
            p for p in self.projects
            if keyword_lower in p.title.lower() or keyword_lower in p.description.lower()
        ]

    def save(self):
        """保存项目库到JSON文件"""
        self.data_file.parent.mkdir(parents=True, exist_ok=True)

        data = [p.to_dict() for p in self.projects]
        with open(self.data_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"✅ 已保存 {len(self.projects)} 个过渡项目到: {self.data_file}")

    def get_statistics(self) -> Dict[str, Any]:
        """获取项目库统计信息"""
        subject_count = {}
        difficulty_count = {}

        for project in self.projects:
            subject_count[project.subject] = subject_count.get(project.subject, 0) + 1
            difficulty_count[project.difficulty] = difficulty_count.get(project.difficulty, 0) + 1

        return {
            "total_projects": len(self.projects),
            "by_subject": subject_count,
            "by_difficulty": difficulty_count,
            "avg_estimated_time": sum(p.estimated_time_minutes for p in self.projects) / len(self.projects),
        }


# 示例使用
if __name__ == "__main__":
    library = TransitionProjectLibrary()

    print("=" * 60)
    print("过渡项目库统计")
    print("=" * 60)

    stats = library.get_statistics()
    print(f"总项目数: {stats['total_projects']}")
    print(f"按学科分布: {stats['by_subject']}")
    print(f"按难度分布: {stats['by_difficulty']}")
    print(f"平均预计时长: {stats['avg_estimated_time']:.0f}分钟")

    print("\n" + "=" * 60)
    print("项目列表示例")
    print("=" * 60)

    for i, project in enumerate(library.projects[:3], 1):
        print(f"\n{i}. [{project.subject}] {project.title}")
        print(f"   难度: {'★' * project.difficulty}{'☆' * (5-project.difficulty)}")
        print(f"   预计时长: {project.estimated_time_minutes}分钟")
        print(f"   描述: {project.description[:50]}...")
