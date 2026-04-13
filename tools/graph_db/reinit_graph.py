"""
重新初始化Neo4j图谱 - 确保所有示例数据创建成功
"""

from neo4j import GraphDatabase


def init_complete_graph(uri="bolt://127.0.0.1:7687", username="neo4j", password="password"):
    """完整初始化图谱"""

    driver = GraphDatabase.driver(uri, auth=(username, password))

    print("正在清空现有数据...")
    with driver.session() as session:
        session.run("MATCH (n) DETACH DELETE n")

    print("正在创建示例节点和关系...")

    with driver.session() as session:
        # 批量创建所有节点和关系
        cypher_script = """
        // 创建知识点
        CREATE (kp1:KnowledgePoint {
          id: "KP-Phys-001",
          name: "牛顿第二定律",
          subject: "物理",
          grade_level: "高中",
          difficulty: 3,
          hardware_dependency: false,
          description: "F=ma,力等于质量乘以加速度"
        })

        CREATE (kp2:KnowledgePoint {
          id: "KP-Bio-001",
          name: "光合作用",
          subject: "生物",
          grade_level: "初中",
          difficulty: 2,
          hardware_dependency: true,
          description: "植物利用光能将CO₂和水转化为有机物"
        })

        CREATE (kp3:KnowledgePoint {
          id: "KP-Math-001",
          name: "矢量运算",
          subject: "数学",
          grade_level: "高中",
          difficulty: 3,
          hardware_dependency: false,
          description: "向量的加减法、点积、叉积"
        })

        // 创建课程单元
        CREATE (cu1:CourseUnit {
          id: "OS-Unit-001",
          title: "生态系统能量流动",
          source: "OpenSciEd",
          duration_weeks: 6,
          theme: "生态系统",
          application: "设计小型生态瓶观察能量流动",
          experiment_materials: ["水生植物", "光源", "CO₂指示剂"]
        })

        CREATE (cu2:CourseUnit {
          id: "OS-Unit-002",
          title: "电磁感应现象",
          source: "OpenSciEd",
          duration_weeks: 6,
          theme: "电磁学",
          application: "制作简易发电机",
          experiment_materials: ["线圈", "磁铁", "电流表"]
        })

        // 创建教材章节
        CREATE (tc1:TextbookChapter {
          id: "OST-Phys-Ch1",
          title: "牛顿运动定律",
          source: "OpenStax",
          chapter_number: 1,
          estimated_hours: 8,
          difficulty: 4,
          prerequisites: ["矢量运算", "微积分入门"]
        })

        CREATE (tc2:TextbookChapter {
          id: "OST-Bio-Ch5",
          title: "生态学基础",
          source: "OpenStax",
          chapter_number: 5,
          estimated_hours: 6,
          difficulty: 3,
          prerequisites: ["细胞生物学基础", "光合作用与呼吸作用"]
        })

        // 创建硬件项目
        CREATE (hp1:HardwareProject {
          id: "HP-001",
          name: "Arduino CO₂传感器",
          cost: 45.0,
          difficulty: 3,
          estimated_time: 4,
          circuit_diagram_url: "/hardware_projects/HP-001/circuit.png",
          code_url: "/hardware_projects/HP-001/code.ino"
        })

        CREATE (hp2:HardwareProject {
          id: "HP-002",
          name: "简易发电机模型",
          cost: 35.0,
          difficulty: 2,
          estimated_time: 3,
          circuit_diagram_url: "/hardware_projects/HP-002/circuit.png",
          code_url: "/hardware_projects/HP-002/code.ino"
        })

        // 创建STEM-PBL标准步骤
        CREATE (std1:STEM_PBL_Standard {
          id: "STEM-PBL-Step-1",
          phase: "问题定义",
          step_number: 1,
          activities: ["情境导入", "问题提出"]
        })

        CREATE (std2:STEM_PBL_Standard {
          id: "STEM-PBL-Step-2",
          phase: "方案设计",
          step_number: 2,
          activities: ["头脑风暴", "方案选择"]
        })

        CREATE (std3:STEM_PBL_Standard {
          id: "STEM-PBL-Step-3",
          phase: "实施验证",
          step_number: 3,
          activities: ["原型制作", "测试优化"]
        })

        CREATE (std4:STEM_PBL_Standard {
          id: "STEM-PBL-Step-4",
          phase: "展示评价",
          step_number: 4,
          activities: ["成果展示", "同伴互评"]
        })

        // 创建关系
        CREATE (cu1)-[:CONTAINS]->(kp2)
        CREATE (kp3)-[:PREREQUISITE_OF {confidence_score: 0.95}]->(tc1)
        CREATE (kp2)-[:PREREQUISITE_OF {confidence_score: 0.90}]->(tc2)
        CREATE (cu1)-[:PROGRESSES_TO {transition_type: "需过渡项目"}]->(tc2)
        CREATE (kp2)-[:CROSS_DISCIPLINE {relation_description: "生态系统能量流动涉及物理能量守恒"}]->(kp1)
        CREATE (cu1)-[:HARDWARE_MAPS_TO {mapping_type: "直接映射"}]->(hp1)
        CREATE (cu2)-[:HARDWARE_MAPS_TO {mapping_type: "直接映射"}]->(hp2)
        CREATE (cu1)-[:ALIGNS_WITH {alignment_score: 0.9}]->(std3)
        """

        session.run(cypher_script)

    # 验证结果
    with driver.session() as session:
        print("\n📊 节点统计:")
        result = session.run("""
        MATCH (n)
        RETURN labels(n)[0] AS node_type, count(*) AS count
        ORDER BY count DESC
        """)

        total_nodes = 0
        for record in result:
            print(f"   {record['node_type']}: {record['count']}")
            total_nodes += record['count']

        print(f"   总计: {total_nodes} 个节点")

        print("\n🔗 关系统计:")
        result = session.run("""
        MATCH ()-[r]->()
        RETURN type(r) AS relationship_type, count(*) AS count
        ORDER BY count DESC
        """)

        total_rels = 0
        for record in result:
            print(f"   {record['relationship_type']}: {record['count']}")
            total_rels += record['count']

        print(f"   总计: {total_rels} 条关系")

    driver.close()

    print("\n✅ 图谱初始化完成!")
    print(f"   预期: 12个节点, 8条关系")
    print(f"   实际: {total_nodes}个节点, {total_rels}条关系")

    if total_nodes == 12 and total_rels == 8:
        print("   ✅ 数据完整!")
    else:
        print("   ⚠️  数据不完整,请检查")


if __name__ == "__main__":
    init_complete_graph()
