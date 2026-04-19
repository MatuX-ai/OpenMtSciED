"""
教育平台数据生成器快速启动脚本
一键执行：数据生成 → 关系优化 → Neo4j导入
"""

import sys
import subprocess
from pathlib import Path


def run_command(cmd: list, description: str):
    """运行命令并显示进度"""
    print(f"\n{'='*60}")
    print(f"🔄 {description}")
    print(f"{'='*60}")
    print(f"命令: {' '.join(cmd)}")
    print()
    
    try:
        result = subprocess.run(
            cmd,
            check=True,
            capture_output=False,
            encoding='utf-8'
        )
        print(f"✅ {description} - 成功")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} - 失败")
        print(f"错误代码: {e.returncode}")
        return False
    except Exception as e:
        print(f"❌ {description} - 异常: {e}")
        return False


def main():
    """主函数"""
    print("="*60)
    print("🚀 OpenMTSciEd 教育平台数据生成器 - 快速启动")
    print("="*60)
    print()
    
    # 获取项目根目录
    project_root = Path(__file__).parent.parent
    scripts_dir = project_root / "scripts"
    
    # 步骤1: 生成所有平台数据
    step1_cmd = [
        sys.executable,
        str(scripts_dir / "scrapers" / "education_platform_generator.py")
    ]
    
    if not run_command(step1_cmd, "步骤1: 生成教育平台数据"):
        print("\n⚠️  数据生成失败，但将继续后续步骤...")
    
    # 步骤2: 优化知识图谱关系
    step2_cmd = [
        sys.executable,
        str(scripts_dir / "graph_db" / "knowledge_graph_optimizer.py")
    ]
    
    if not run_command(step2_cmd, "步骤2: 优化知识图谱关系"):
        print("\n⚠️  关系优化失败，但将继续后续步骤...")
    
    # 步骤3: 导入到Neo4j
    step3_cmd = [
        sys.executable,
        str(scripts_dir / "graph_db" / "import_to_neo4j.py")
    ]
    
    if not run_command(step3_cmd, "步骤3: 导入数据到Neo4j"):
        print("\n❌ Neo4j导入失败")
        print("\n可能的原因:")
        print("  1. Neo4j服务未启动")
        print("  2. 连接配置不正确")
        print("  3. 网络连接问题")
        return False
    
    # 完成
    print("\n" + "="*60)
    print("✅ 所有步骤完成！")
    print("="*60)
    print("\n📊 数据摘要:")
    print("  - 教育平台数据: data/course_library/*.json")
    print("  - 优化关系数据: data/knowledge_graph_relationships.json")
    print("  - Neo4j数据库: 已更新")
    print("\n🌐 访问Admin界面:")
    print("  http://localhost:4200/admin/education-platforms")
    print("\n📚 API文档:")
    print("  http://localhost:8000/docs")
    print("="*60)
    
    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
