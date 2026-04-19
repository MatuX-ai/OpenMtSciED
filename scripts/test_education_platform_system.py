"""
教育平台数据生成器测试脚本
验证各个组件是否正常工作
"""

import sys
import json
from pathlib import Path

# 添加项目根目录到Python路径
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))


def test_imports():
    """测试导入是否正常"""
    print("🔍 测试模块导入...")
    try:
        from scripts.scrapers.education_platform_generator import (
            EducationPlatformManager,
            EdXGenerator,
            MITOpenCourseWareGenerator,
            ChineseMOOCGenerator
        )
        print("✅ 数据生成器模块导入成功")
        
        from scripts.graph_db.knowledge_graph_optimizer import KnowledgeGraphOptimizer
        print("✅ 知识图谱优化器模块导入成功")
        
        return True
    except ImportError as e:
        print(f"❌ 模块导入失败: {e}")
        return False


def test_generators():
    """测试数据生成器"""
    print("\n🔍 测试数据生成器...")
    try:
        from scripts.scrapers.education_platform_generator import (
            EdXGenerator,
            MITOpenCourseWareGenerator,
            ChineseMOOCGenerator
        )
        
        # 测试edX生成器
        edx_gen = EdXGenerator()
        edx_courses = edx_gen.generate_courses()
        print(f"✅ edX生成器: 生成 {len(edx_courses)} 个课程")
        
        # 测试MIT OCW生成器
        mit_gen = MITOpenCourseWareGenerator()
        mit_courses = mit_gen.generate_courses()
        print(f"✅ MIT OCW生成器: 生成 {len(mit_courses)} 个课程")
        
        # 测试中国大学MOOC生成器
        mooc_gen = ChineseMOOCGenerator()
        mooc_courses = mooc_gen.generate_courses()
        print(f"✅ 中国大学MOOC生成器: 生成 {len(mooc_courses)} 个课程")
        
        return True
    except Exception as e:
        print(f"❌ 数据生成器测试失败: {e}")
        return False


def test_manager():
    """测试平台管理器"""
    print("\n🔍 测试平台管理器...")
    try:
        from scripts.scrapers.education_platform_generator import EducationPlatformManager
        
        manager = EducationPlatformManager()
        status = manager.get_platform_status()
        
        print(f"✅ 管理器初始化成功")
        print(f"   注册平台数: {len(status)}")
        
        for platform_name, info in status.items():
            print(f"   - {platform_name}: {'✓' if info['registered'] else '✗'}")
        
        return True
    except Exception as e:
        print(f"❌ 平台管理器测试失败: {e}")
        return False


def test_data_files():
    """测试数据文件生成"""
    print("\n🔍 测试数据文件...")
    try:
        from scripts.scrapers.education_platform_generator import EducationPlatformManager
        
        manager = EducationPlatformManager()
        manager.run_all_generators()
        
        data_dir = Path("data/course_library")
        expected_files = [
            "edx_courses.json",
            "mit_opencourseware_courses.json",
            "chinese_mooc_courses.json"
        ]
        
        all_exist = True
        for filename in expected_files:
            filepath = data_dir / filename
            if filepath.exists():
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    print(f"✅ {filename}: {len(data)} 个课程")
            else:
                print(f"❌ {filename}: 文件不存在")
                all_exist = False
        
        return all_exist
    except Exception as e:
        print(f"❌ 数据文件测试失败: {e}")
        return False


def test_optimizer():
    """测试知识图谱优化器"""
    print("\n🔍 测试知识图谱优化器...")
    try:
        from scripts.graph_db.knowledge_graph_optimizer import KnowledgeGraphOptimizer
        
        optimizer = KnowledgeGraphOptimizer()
        courses = optimizer.load_all_courses()
        
        print(f"✅ 优化器初始化成功")
        print(f"   加载课程数: {len(courses)}")
        
        if len(courses) > 0:
            # 测试文本提取
            text = optimizer.extract_course_text(courses[0])
            print(f"✅ 文本提取成功: {len(text)} 字符")
            
            # 测试相似度计算（小样本）
            if len(courses) >= 2:
                similar_pairs = optimizer.calculate_content_similarity(courses[:10])
                print(f"✅ 相似度计算成功: 找到 {len(similar_pairs)} 对相似课程")
        
        return True
    except Exception as e:
        print(f"❌ 知识图谱优化器测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_api_routes():
    """测试API路由"""
    print("\n🔍 测试API路由...")
    try:
        # 检查路由文件是否存在
        routes_file = Path("backend/openmtscied/api/education_platform_routes.py")
        if routes_file.exists():
            print(f"✅ API路由文件存在")
            
            # 尝试导入
            import sys
            sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))
            from openmtscied.api import education_platform_routes
            print(f"✅ API路由模块导入成功")
            
            return True
        else:
            print(f"❌ API路由文件不存在")
            return False
    except Exception as e:
        print(f"❌ API路由测试失败: {e}")
        return False


def main():
    """运行所有测试"""
    print("="*60)
    print("🧪 教育平台数据生成器 - 测试套件")
    print("="*60)
    
    tests = [
        ("模块导入", test_imports),
        ("数据生成器", test_generators),
        ("平台管理器", test_manager),
        ("数据文件", test_data_files),
        ("知识图谱优化器", test_optimizer),
        ("API路由", test_api_routes),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"\n❌ {test_name} 测试异常: {e}")
            results.append((test_name, False))
    
    # 汇总结果
    print("\n" + "="*60)
    print("📊 测试结果汇总")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ 通过" if result else "❌ 失败"
        print(f"{test_name:20s} {status}")
    
    print("-"*60)
    print(f"总计: {passed}/{total} 测试通过")
    
    if passed == total:
        print("\n🎉 所有测试通过！系统运行正常。")
        return True
    else:
        print(f"\n⚠️  {total - passed} 个测试失败，请检查错误信息。")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
