"""
硬件项目API测试脚本
用于验证新创建的API端点是否正常工作
"""

import asyncio
import httpx
from typing import Dict, Any


async def test_hardware_project_api():
    """测试硬件项目API"""
    
    base_url = "http://localhost:8000"
    
    print("🧪 开始测试硬件项目API...")
    print("=" * 50)
    
    async with httpx.AsyncClient() as client:
        
        # 测试1: 获取项目列表
        print("\n1️⃣ 测试获取项目列表...")
        try:
            response = await client.get(f"{base_url}/api/v1/hardware/projects/")
            if response.status_code == 200:
                projects = response.json()
                print(f"✅ 成功获取 {len(projects)} 个项目")
                if projects:
                    print(f"   第一个项目: {projects[0].get('title', 'N/A')}")
            else:
                print(f"❌ 获取项目列表失败: {response.status_code}")
                print(f"   响应: {response.text}")
        except Exception as e:
            print(f"❌ 请求失败: {e}")
        
        # 测试2: 获取分类列表
        print("\n2️⃣ 测试获取分类列表...")
        try:
            response = await client.get(f"{base_url}/api/v1/hardware/projects/categories")
            if response.status_code == 200:
                categories = response.json()
                print(f"✅ 成功获取 {len(categories)} 个分类: {categories}")
            else:
                print(f"❌ 获取分类失败: {response.status_code}")
        except Exception as e:
            print(f"❌ 请求失败: {e}")
        
        # 测试3: 获取统计信息
        print("\n3️⃣ 测试获取统计信息...")
        try:
            response = await client.get(f"{base_url}/api/v1/hardware/projects/stats/summary")
            if response.status_code == 200:
                stats = response.json()
                print(f"✅ 成功获取统计信息:")
                print(f"   总项目数: {stats.get('total_projects', 0)}")
                print(f"   平均成本: ¥{stats.get('average_cost', 0)}")
            else:
                print(f"❌ 获取统计信息失败: {response.status_code}")
        except Exception as e:
            print(f"❌ 请求失败: {e}")
        
        # 测试4: 筛选测试 - 按分类
        print("\n4️⃣ 测试按分类筛选...")
        try:
            response = await client.get(
                f"{base_url}/api/v1/hardware/projects/",
                params={"category": "sensor", "limit": 5}
            )
            if response.status_code == 200:
                projects = response.json()
                print(f"✅ 成功获取传感器类项目 {len(projects)} 个")
            else:
                print(f"❌ 筛选测试失败: {response.status_code}")
        except Exception as e:
            print(f"❌ 请求失败: {e}")
        
        # 测试5: 搜索测试
        print("\n5️⃣ 测试搜索功能...")
        try:
            response = await client.get(
                f"{base_url}/api/v1/hardware/projects/",
                params={"search": "超声波", "limit": 5}
            )
            if response.status_code == 200:
                projects = response.json()
                print(f"✅ 搜索'超声波'找到 {len(projects)} 个项目")
            else:
                print(f"❌ 搜索测试失败: {response.status_code}")
        except Exception as e:
            print(f"❌ 请求失败: {e}")
        
        # 测试6: 获取单个项目（如果存在）
        print("\n6️⃣ 测试获取单个项目...")
        try:
            # 先获取一个项目ID
            list_response = await client.get(f"{base_url}/api/v1/hardware/projects/", params={"limit": 1})
            if list_response.status_code == 200 and list_response.json():
                project_id = list_response.json()[0]['project_id']
                
                detail_response = await client.get(f"{base_url}/api/v1/hardware/projects/{project_id}")
                if detail_response.status_code == 200:
                    project = detail_response.json()
                    print(f"✅ 成功获取项目详情: {project.get('title', 'N/A')}")
                else:
                    print(f"❌ 获取项目详情失败: {detail_response.status_code}")
            else:
                print("⚠️  没有可用项目进行详情测试")
        except Exception as e:
            print(f"❌ 请求失败: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 API测试完成!")


if __name__ == "__main__":
    asyncio.run(test_hardware_project_api())