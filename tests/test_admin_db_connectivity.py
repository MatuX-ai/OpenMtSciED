"""
Admin 后台与数据库连通性测试脚本
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_question_bank_api():
    """测试题库管理 API"""
    print("\n" + "="*60)
    print("🧪 测试 1: 题库管理 API")
    print("="*60)
    
    # 1. 获取题库列表
    try:
        res = requests.get(f"{BASE_URL}/api/v1/learning/banks")
        if res.status_code == 200:
            data = res.json()
            print(f"✅ 获取题库列表成功: {len(data['data'])} 个题库")
            for bank in data['data'][:3]:
                print(f"   - {bank['name']} ({bank['total_questions']} 题)")
        else:
            print(f"❌ 获取题库列表失败: {res.status_code}")
    except Exception as e:
        print(f"❌ 请求异常: {e}")
    
    # 2. 创建新题库
    try:
        new_bank = {
            "name": "Test Bank - Physics Mechanics",
            "description": "高中物理力学测试题库",
            "source": "test",
            "subject": "physics",
            "level": "high"
        }
        res = requests.post(f"{BASE_URL}/api/v1/learning/banks", json=new_bank)
        if res.status_code == 200:
            data = res.json()
            bank_id = data['data']['id']
            print(f"✅ 创建题库成功: ID={bank_id}")
            
            # 3. 验证创建
            res = requests.get(f"{BASE_URL}/api/v1/learning/banks")
            banks = res.json()['data']
            created = [b for b in banks if b['id'] == bank_id]
            if created:
                print(f"✅ 数据库验证通过: 找到新创建的题库")
            
            # 4. 删除测试题库
            # 注意：当前 API 可能没有 DELETE 接口，这里仅做提示
            print(f"⚠️  提示: 测试题库 ID={bank_id} 已创建，如需清理请手动删除")
        else:
            print(f"❌ 创建题库失败: {res.status_code} - {res.text}")
    except Exception as e:
        print(f"❌ 创建题库异常: {e}")

def test_crawler_api():
    """测试爬虫管理 API"""
    print("\n" + "="*60)
    print("🧪 测试 2: 爬虫管理 API")
    print("="*60)
    
    # 1. 获取爬虫列表
    try:
        res = requests.get(f"{BASE_URL}/api/v1/admin/crawlers")
        if res.status_code == 200:
            data = res.json()
            print(f"✅ 获取爬虫列表成功: {len(data['data'])} 个爬虫")
            for crawler in data['data'][:3]:
                print(f"   - {crawler['name']} ({crawler['status']})")
        else:
            print(f"❌ 获取爬虫列表失败: {res.status_code}")
    except Exception as e:
        print(f"❌ 请求异常: {e}")
    
    # 2. 获取爬虫模板（包含题库爬虫）
    try:
        res = requests.get(f"{BASE_URL}/api/v1/admin/crawlers/templates")
        if res.status_code == 200:
            data = res.json()
            question_crawlers = [c for c in data['data'] if 'question' in c['id'].lower()]
            print(f"✅ 获取爬虫模板成功: {len(data['data'])} 个模板")
            if question_crawlers:
                print(f"   📚 题库爬虫模板:")
                for qc in question_crawlers:
                    print(f"      - {qc['name']} ({qc['id']})")
            else:
                print(f"   ⚠️  未找到题库爬虫模板")
        else:
            print(f"❌ 获取爬虫模板失败: {res.status_code}")
    except Exception as e:
        print(f"❌ 请求异常: {e}")

def test_database_direct():
    """直接测试数据库连接"""
    print("\n" + "="*60)
    print("🧪 测试 3: 数据库直连测试")
    print("="*60)
    
    try:
        import sys
        sys.path.insert(0, 'backend')
        from openmtscied.shared.models.db_models import SessionLocal, QuestionBank, Course
        
        db = SessionLocal()
        
        # 测试题库表
        bank_count = db.query(QuestionBank).count()
        print(f"✅ 数据库连接成功")
        print(f"   - QuestionBank 表: {bank_count} 条记录")
        
        # 测试课程表
        course_count = db.query(Course).count()
        print(f"   - Course 表: {course_count} 条记录")
        
        db.close()
        
    except Exception as e:
        print(f"❌ 数据库连接失败: {e}")

if __name__ == "__main__":
    print("\n🚀 开始 Admin 后台数据库连通性测试...")
    
    test_database_direct()
    test_question_bank_api()
    test_crawler_api()
    
    print("\n" + "="*60)
    print("✅ 测试完成")
    print("="*60 + "\n")
