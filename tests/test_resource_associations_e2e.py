"""
资源关联功能端到端测试
测试教程、课件、硬件之间的完整关联流程
"""
import requests
import json
from typing import Dict, List

BASE_URL = "http://localhost:8000"

def test_api_health():
    """测试API健康状态"""
    print("=" * 60)
    print("1. 测试API健康状态")
    print("=" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}/api/v1/resources/resources/summary", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API正常响应")
            print(f"   教程数量: {data.get('total_tutorials', 0)}")
            print(f"   课件数量: {data.get('total_materials', 0)}")
            print(f"   硬件数量: {data.get('total_hardware', 0)}")
            return True
        else:
            print(f"❌ API返回错误: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API连接失败: {e}")
        print(f"   请确保后端服务运行在 {BASE_URL}")
        return False


def test_tutorial_related_materials(tutorial_id: str = "OS-Unit-001"):
    """测试教程相关课件查询"""
    print("\n" + "=" * 60)
    print("2. 测试教程 → 课件关联")
    print("=" * 60)
    print(f"教程ID: {tutorial_id}")
    
    try:
        response = requests.get(
            f"{BASE_URL}/api/v1/resources/tutorials/{tutorial_id}/related-materials",
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            materials = data.get('data', [])
            
            print(f"✅ 查询成功")
            print(f"   找到 {len(materials)} 个相关课件")
            
            for i, material in enumerate(materials[:3], 1):
                print(f"\n   课件 {i}:")
                print(f"     ID: {material.get('id')}")
                print(f"     标题: {material.get('title', 'N/A')[:40]}")
                print(f"     学科: {material.get('subject', 'N/A')}")
                print(f"     年级: {material.get('grade_level', 'N/A')}")
                print(f"     关联度: {material.get('relevance_score', 0) * 100:.0f}%")
            
            return len(materials) > 0
        else:
            print(f"❌ 查询失败: {response.status_code}")
            print(f"   {response.text}")
            return False
    except Exception as e:
        print(f"❌ 请求异常: {e}")
        return False


def test_material_required_hardware(material_id: str = "OST-Bio-Ch5"):
    """测试课件所需硬件查询"""
    print("\n" + "=" * 60)
    print("3. 测试课件 → 硬件关联")
    print("=" * 60)
    print(f"课件ID: {material_id}")
    
    try:
        response = requests.get(
            f"{BASE_URL}/api/v1/resources/materials/{material_id}/required-hardware",
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            hardware_list = data.get('data', [])
            
            print(f"✅ 查询成功")
            print(f"   找到 {len(hardware_list)} 个所需硬件")
            
            total_cost = 0
            for i, hw in enumerate(hardware_list[:3], 1):
                cost = hw.get('total_cost', 0)
                total_cost += cost
                
                print(f"\n   硬件 {i}:")
                print(f"     ID: {hw.get('project_id')}")
                print(f"     标题: {hw.get('title', 'N/A')[:40]}")
                print(f"     学科: {hw.get('subject', 'N/A')}")
                print(f"     难度: {'⭐' * hw.get('difficulty', 0)}")
                print(f"     成本: ¥{cost:.2f}")
            
            if hardware_list:
                print(f"\n   总成本估算: ¥{total_cost:.2f}")
            
            return len(hardware_list) > 0
        else:
            print(f"❌ 查询失败: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 请求异常: {e}")
        return False


def test_complete_learning_path(tutorial_id: str = "OS-Unit-001"):
    """测试完整学习路径"""
    print("\n" + "=" * 60)
    print("4. 测试完整学习路径 (教程 → 课件 → 硬件)")
    print("=" * 60)
    print(f"起始教程: {tutorial_id}")
    
    try:
        response = requests.get(
            f"{BASE_URL}/api/v1/resources/learning-path/{tutorial_id}",
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            path_data = data.get('data', {})
            
            tutorial = path_data.get('tutorial')
            materials = path_data.get('related_materials', [])
            hardware = path_data.get('required_hardware', [])
            
            print(f"✅ 学习路径生成成功")
            print(f"\n   📚 教程:")
            if tutorial:
                print(f"     {tutorial.get('title', 'N/A')[:50]}")
            else:
                print(f"     未找到教程信息")
            
            print(f"\n   📖 相关课件 ({len(materials)}个):")
            for i, mat in enumerate(materials[:2], 1):
                print(f"     {i}. {mat.get('title', 'N/A')[:40]} - {mat.get('subject', 'N/A')}")
            
            print(f"\n   🔧 所需硬件 ({len(hardware)}个):")
            for i, hw in enumerate(hardware[:2], 1):
                print(f"     {i}. {hw.get('title', 'N/A')[:40]} - ¥{hw.get('total_cost', 0):.2f}")
            
            # 验证路径完整性
            has_tutorial = tutorial is not None
            has_materials = len(materials) > 0
            has_hardware = len(hardware) > 0
            
            if has_tutorial and has_materials and has_hardware:
                print(f"\n   ✅ 完整的学习路径已建立!")
                return True
            elif has_tutorial:
                print(f"\n   ⚠️  部分关联缺失，建议补充课件和硬件关联")
                return True
            else:
                print(f"\n   ❌ 学习路径不完整")
                return False
        else:
            print(f"❌ 查询失败: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 请求异常: {e}")
        return False


def test_hardware_reverse_lookup(hardware_id: str = "HW-Sensor-001"):
    """测试硬件反向查找（硬件 → 教程/课件）"""
    print("\n" + "=" * 60)
    print("5. 测试硬件反向关联")
    print("=" * 60)
    print(f"硬件ID: {hardware_id}")
    
    try:
        response = requests.get(
            f"{BASE_URL}/api/v1/resources/hardware/{hardware_id}/related-resources",
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            related = data.get('data', {})
            tutorials = related.get('related_tutorials', [])
            materials = related.get('related_materials', [])
            
            print(f"✅ 反向查询成功")
            print(f"   相关教程: {len(tutorials)}个")
            print(f"   相关课件: {len(materials)}个")
            
            if tutorials:
                print(f"\n   适用教程:")
                for i, tut in enumerate(tutorials[:2], 1):
                    print(f"     {i}. {tut.get('title', 'N/A')[:40]}")
            
            if materials:
                print(f"\n   适用课件:")
                for i, mat in enumerate(materials[:2], 1):
                    print(f"     {i}. {mat.get('title', 'N/A')[:40]}")
            
            return True
        else:
            print(f"❌ 查询失败: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 请求异常: {e}")
        return False


def test_resource_search(keyword: str = "生物"):
    """测试资源搜索"""
    print("\n" + "=" * 60)
    print("6. 测试资源搜索功能")
    print("=" * 60)
    print(f"搜索关键词: {keyword}")
    
    try:
        response = requests.get(
            f"{BASE_URL}/api/v1/resources/search-resources",
            params={"keyword": keyword},
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            results = data.get('data', [])
            
            print(f"✅ 搜索成功")
            print(f"   找到 {len(results)} 个相关资源")
            
            for i, res in enumerate(results[:5], 1):
                res_type = res.get('type', 'unknown')
                type_icon = {
                    'tutorial': '📚',
                    'material': '📖',
                    'hardware': '🔧'
                }.get(res_type, '📄')
                
                print(f"   {i}. {type_icon} [{res_type}] {res.get('title', 'N/A')[:40]}")
            
            return len(results) > 0
        else:
            print(f"❌ 搜索失败: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 请求异常: {e}")
        return False


def run_all_tests():
    """运行所有测试"""
    print("\n" + "🚀 " * 20)
    print("资源关联功能端到端测试")
    print("🚀 " * 20 + "\n")
    
    results = []
    
    # 1. API健康检查
    results.append(("API健康检查", test_api_health()))
    
    # 如果API不可用，跳过后续测试
    if not results[0][1]:
        print("\n" + "⚠️ " * 20)
        print("API不可用，跳过后续测试")
        print("⚠️ " * 20)
        print_summary(results)
        return
    
    # 2-6. 功能测试
    results.append(("教程→课件关联", test_tutorial_related_materials()))
    results.append(("课件→硬件关联", test_material_required_hardware()))
    results.append(("完整学习路径", test_complete_learning_path()))
    results.append(("硬件反向关联", test_hardware_reverse_lookup()))
    results.append(("资源搜索", test_resource_search()))
    
    # 打印总结
    print_summary(results)


def print_summary(results: List[tuple]):
    """打印测试总结"""
    print("\n" + "=" * 60)
    print("📊 测试总结")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ 通过" if result else "❌ 失败"
        print(f"{status} - {name}")
    
    print("-" * 60)
    print(f"总计: {passed}/{total} 通过")
    
    if passed == total:
        print("\n🎉 所有测试通过！系统运行正常。")
    elif passed > total * 0.7:
        print(f"\n⚠️  大部分测试通过，但有 {total - passed} 项需要关注。")
    else:
        print(f"\n❌ 多项测试失败，请检查系统配置。")
    
    print("=" * 60)


if __name__ == "__main__":
    run_all_tests()
