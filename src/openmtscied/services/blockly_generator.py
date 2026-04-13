"""
OpenMTSciEd Blockly代码生成服务
将知识点映射到Blockly项目模板,生成可视化编程代码
"""

import sys
import logging
from typing import List, Dict, Any, Optional
from pathlib import Path

# 添加项目根目录到Python路径
project_root = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(project_root))

from src.openmtscied.data.transition_projects import TransitionProjectLibrary, TransitionProject

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class BlocklyCodeGenerator:
    """
    Blockly代码生成器

    根据知识点ID生成对应的Blockly项目和JavaScript代码
    """

    def __init__(self):
        self.library = TransitionProjectLibrary()

    def generate_for_knowledge_point(self, kp_id: str, difficulty: int = None) -> Optional[Dict[str, Any]]:
        """
        为指定知识点生成Blockly项目

        Args:
            kp_id: 知识点ID
            difficulty: 目标难度(1-5),可选

        Returns:
            包含Blockly XML和JavaScript代码的字典
        """

        logger.info(f"为知识点 {kp_id} 生成Blockly项目")

        # 查找相关项目
        projects = self.library.get_projects_by_knowledge_point(kp_id)

        if not projects:
            logger.warning(f"未找到知识点 {kp_id} 的过渡项目")
            # 返回默认项目
            return self._get_default_project(kp_id)

        # 如果指定了难度,选择最接近的项目
        if difficulty:
            projects = sorted(projects, key=lambda p: abs(p.difficulty - difficulty))

        # 返回第一个匹配的项目
        project = projects[0]

        return {
            "project_id": project.project_id,
            "title": project.title,
            "knowledge_point_id": project.knowledge_point_id,
            "blockly_xml": project.blockly_xml,
            "javascript_code": project.javascript_code,
            "difficulty": project.difficulty,
            "estimated_time_minutes": project.estimated_time_minutes,
            "learning_objectives": project.learning_objectives,
            "hints": project.hints,
        }

    def _get_default_project(self, kp_id: str) -> Dict[str, Any]:
        """生成默认的Blockly项目模板"""

        default_xml = """<xml>
  <block type="text_print" x="50" y="50">
    <value name="TEXT">
      <shadow type="text">
        <field name="TEXT">开始学习!</field>
      </shadow>
    </value>
  </block>
</xml>"""

        default_code = """console.log('开始学习新知识!');
// TODO: 根据知识点添加具体代码"""

        return {
            "project_id": f"TP-Default-{kp_id}",
            "title": f"知识点 {kp_id} 的练习项目",
            "knowledge_point_id": kp_id,
            "blockly_xml": default_xml,
            "javascript_code": default_code,
            "difficulty": 1,
            "estimated_time_minutes": 20,
            "learning_objectives": ["完成基础编程练习"],
            "hints": ["从简单的打印语句开始"],
        }

    def generate_batch(self, kp_ids: List[str]) -> List[Dict[str, Any]]:
        """
        批量生成Blockly项目

        Args:
            kp_ids: 知识点ID列表

        Returns:
            项目列表
        """

        results = []
        for kp_id in kp_ids:
            project = self.generate_for_knowledge_point(kp_id)
            if project:
                results.append(project)

        logger.info(f"批量生成完成: {len(results)}/{len(kp_ids)} 个项目")
        return results

    def get_all_projects(self) -> List[TransitionProject]:
        """获取所有过渡项目"""
        return self.library.projects

    def get_library_statistics(self) -> Dict[str, Any]:
        """获取项目库统计信息"""
        return self.library.get_statistics()


# 示例使用
if __name__ == "__main__":
    generator = BlocklyCodeGenerator()

    print("=" * 60)
    print("Blockly代码生成器测试")
    print("=" * 60)

    # 测试单个知识点
    print("\n1. 为知识点 KP-Phys-001 生成项目:")
    result = generator.generate_for_knowledge_point("KP-Phys-001")

    if result:
        print(f"   项目ID: {result['project_id']}")
        print(f"   标题: {result['title']}")
        print(f"   难度: {result['difficulty']}")
        print(f"   预计时长: {result['estimated_time_minutes']}分钟")
        print(f"\n   JavaScript代码预览:")
        print("   " + "\n   ".join(result['javascript_code'].split('\n')[:5]))

    # 测试批量生成
    print("\n2. 批量生成3个知识点的项目:")
    kp_ids = ["KP-Phys-001", "KP-Bio-001", "KP-Chem-001"]
    results = generator.generate_batch(kp_ids)

    print(f"   成功生成: {len(results)} 个项目")
    for r in results:
        print(f"   - {r['title']}")

    # 显示统计信息
    print("\n3. 项目库统计:")
    stats = generator.get_library_statistics()
    print(f"   总项目数: {stats['total_projects']}")
    print(f"   按学科分布: {stats['by_subject']}")
    print(f"   按难度分布: {stats['by_difficulty']}")
