"""
Neo4j连接测试和Schema初始化脚本
验证Neo4j Desktop连接并执行建表脚本
"""

import sys
from pathlib import Path

try:
    from neo4j import GraphDatabase
except ImportError:
    print("❌ 错误: neo4j驱动未安装")
    print("请运行: pip install neo4j")
    sys.exit(1)


def test_connection(uri="bolt://127.0.0.1:7687", username="neo4j", password="password"):
    """测试Neo4j连接"""
    print("=" * 60)
    print("Neo4j 连接测试")
    print("=" * 60)
    print(f"URI: {uri}")
    print(f"用户名: {username}")

    try:
        driver = GraphDatabase.driver(uri, auth=(username, password))

        with driver.session() as session:
            # 执行简单查询测试连接
            result = session.run("RETURN 1 AS test")
            record = result.single()

            if record and record["test"] == 1:
                print("✅ 连接成功!")

                # 获取Neo4j版本信息
                version_result = session.run("CALL dbms.components() YIELD name, versions RETURN name, versions")
                for record in version_result:
                    print(f"   Neo4j版本: {record['versions'][0]}")

                driver.close()
                return True
            else:
                print("❌ 连接测试失败")
                driver.close()
                return False

    except Exception as e:
        print(f"❌ 连接失败: {e}")
        print("\n可能的原因:")
        print("1. Neo4j Desktop未启动")
        print("2. 数据库实例未运行")
        print("3. 用户名或密码错误")
        print("4. 端口7687被占用")
        return False


def execute_cypher_file(file_path, uri="bolt://127.0.0.1:7687", username="neo4j", password="password"):
    """执行Cypher脚本文件"""
    print(f"\n执行Cypher脚本: {file_path}")

    if not Path(file_path).exists():
        print(f"❌ 文件不存在: {file_path}")
        return False

    try:
        driver = GraphDatabase.driver(uri, auth=(username, password))

        with open(file_path, 'r', encoding='utf-8') as f:
            cypher_script = f.read()

        # 分割多个Cypher语句(按分号分隔)
        statements = [stmt.strip() for stmt in cypher_script.split(';') if stmt.strip() and not stmt.strip().startswith('//')]

        with driver.session() as session:
            success_count = 0
            for i, statement in enumerate(statements, 1):
                try:
                    # 跳过注释行和空行
                    if not statement or statement.startswith('//'):
                        continue

                    result = session.run(statement)
                    success_count += 1

                    # 显示进度
                    if i % 5 == 0:
                        print(f"   已执行 {i}/{len(statements)} 条语句...")

                except Exception as e:
                    print(f"⚠️  语句执行失败 (第{i}条): {str(e)[:100]}")
                    # 继续执行其他语句

        print(f"✅ 脚本执行完成! 成功: {success_count}/{len(statements)}")
        driver.close()
        return True

    except Exception as e:
        print(f"❌ 脚本执行失败: {e}")
        return False


def verify_schema(uri="bolt://127.0.0.1:7687", username="neo4j", password="password"):
    """验证Schema创建结果"""
    print("\n" + "=" * 60)
    print("验证Schema创建结果")
    print("=" * 60)

    try:
        driver = GraphDatabase.driver(uri, auth=(username, password))

        with driver.session() as session:
            # 统计节点数量
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

            # 统计关系数量
            print("\n🔗 关系统计:")
            result = session.run("""
            MATCH ()-[r]->()
            RETURN type(r) AS relationship_type, count(*) AS count
            ORDER BY count DESC
            """)

            total_relationships = 0
            for record in result:
                print(f"   {record['relationship_type']}: {record['count']}")
                total_relationships += record['count']

            print(f"   总计: {total_relationships} 条关系")

            # 查看约束
            print("\n🔒 约束列表:")
            result = session.run("SHOW CONSTRAINTS")
            constraint_count = 0
            for record in result:
                print(f"   - {record['name']}: {record['type']}")
                constraint_count += 1

            if constraint_count == 0:
                print("   (无约束)")

            # 查看索引
            print("\n📑 索引列表:")
            result = session.run("SHOW INDEXES")
            index_count = 0
            for record in result:
                if record['type'] != 'LOOKUP':  # 排除系统索引
                    print(f"   - {record['name']}: {record['type']}")
                    index_count += 1

            if index_count == 0:
                print("   (无索引)")

            print("\n" + "=" * 60)
            print(f"✅ Schema验证完成!")
            print(f"   节点: {total_nodes}, 关系: {total_relationships}")
            print(f"   约束: {constraint_count}, 索引: {index_count}")
            print("=" * 60)

        driver.close()
        return True

    except Exception as e:
        print(f"❌ 验证失败: {e}")
        return False


def main():
    """主函数"""
    print("\n" + "🚀" * 30)
    print("OpenMTSciEd Neo4j 初始化工具")
    print("🚀" * 30 + "\n")

    # 配置
    uri = "bolt://127.0.0.1:7687"
    username = "neo4j"
    password = "password"

    # 步骤1: 测试连接
    if not test_connection(uri, username, password):
        print("\n❌ 无法连接到Neo4j,请检查:")
        print("   1. Neo4j Desktop是否已启动")
        print("   2. 数据库实例'iMato-DB'是否正在运行")
        print("   3. 密码是否正确(当前为: password)")
        sys.exit(1)

    # 步骤2: 执行Schema创建脚本
    schema_file = Path(__file__).parent / "schema_creation.cypher"
    if schema_file.exists():
        print("\n" + "=" * 60)
        print("步骤 2/3: 执行Schema创建脚本")
        print("=" * 60)
        execute_cypher_file(str(schema_file), uri, username, password)
    else:
        print(f"\n⚠️  警告: Schema文件不存在: {schema_file}")

    # 步骤3: 执行约束和索引脚本
    constraints_file = Path(__file__).parent / "constraints_and_indexes.cypher"
    if constraints_file.exists():
        print("\n" + "=" * 60)
        print("步骤 3/3: 执行约束和索引脚本")
        print("=" * 60)
        execute_cypher_file(str(constraints_file), uri, username, password)
    else:
        print(f"\n⚠️  警告: 约束文件不存在: {constraints_file}")

    # 步骤4: 验证结果
    verify_schema(uri, username, password)

    print("\n✅ Neo4j初始化完成!")
    print("\n下一步:")
    print("   1. 运行数据导入器: python scripts/graph_db/data_importer.py")
    print("   2. 或在Neo4j Browser中手动执行Cypher查询")


if __name__ == "__main__":
    main()
