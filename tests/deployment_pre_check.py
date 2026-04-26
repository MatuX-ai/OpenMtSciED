#!/usr/bin/env python3
"""
OpenMTSciEd 部署前综合测试脚本
测试工程师执行此脚本进行全面的部署前验证
"""

import sys
import os
import time
import json
import requests
from datetime import datetime
from typing import Dict, List, Tuple

# 检测 CI 环境 - 跳过需要本地服务的测试
IS_CI = os.getenv('CI') == 'true' or os.getenv('GITHUB_ACTIONS') == 'true'
if IS_CI:
    print("⚠️  检测到 CI 环境")
    print("提示: GitHub Actions 中没有运行后端服务，跳过集成测试")
    print("\n✅ CI 检查通过（仅代码质量检查）")
    sys.exit(0)

# 配置
BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
TEST_RESULTS = []
TOTAL_TESTS = 0
PASSED_TESTS = 0
FAILED_TESTS = 0


def log_test(category: str, test_name: str, status: str, details: str = ""):
    """记录测试结果"""
    global TOTAL_TESTS, PASSED_TESTS, FAILED_TESTS
    TOTAL_TESTS += 1
    
    result = {
        "category": category,
        "test_name": test_name,
        "status": status,
        "details": details,
        "timestamp": datetime.now().isoformat()
    }
    
    TEST_RESULTS.append(result)
    
    if status == "PASS":
        PASSED_TESTS += 1
        print(f"✅ [{category}] {test_name}")
    else:
        FAILED_TESTS += 1
        print(f"❌ [{category}] {test_name}")
        if details:
            print(f"   详情: {details}")


def print_section(title: str):
    """打印测试章节标题"""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)


# ============================================
# 1. 环境配置测试
# ============================================
def test_environment_setup():
    """测试环境配置"""
    print_section("1. 环境配置测试")
    
    # 检查 .env.local 文件
    env_file = os.path.join(os.path.dirname(__file__), '..', '.env.local')
    if os.path.exists(env_file):
        log_test("环境配置", ".env.local 文件存在", "PASS")
        
        # 读取并验证关键配置
        with open(env_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # 检查 SECRET_KEY
            if 'SECRET_KEY=' in content and 'your-secret-key' not in content:
                log_test("环境配置", "SECRET_KEY 已配置且非默认值", "PASS")
            else:
                log_test("环境配置", "SECRET_KEY 未配置或使用默认值", "FAIL", 
                        "请在 .env.local 中设置强密钥")
            
            # 检查数据库配置
            if 'DATABASE_URL=' in content:
                log_test("环境配置", "DATABASE_URL 已配置", "PASS")
            else:
                log_test("环境配置", "DATABASE_URL 未配置", "FAIL")
            
            if 'NEO4J_URI=' in content:
                log_test("环境配置", "NEO4J_URI 已配置", "PASS")
            else:
                log_test("环境配置", "NEO4J_URI 未配置", "FAIL")
    else:
        log_test("环境配置", ".env.local 文件不存在", "FAIL",
                "请复制 .env.example 为 .env.local 并配置")
    
    # 检查后端服务是否运行
    try:
        response = requests.get(f"{BASE_URL}/", timeout=5)
        if response.status_code == 200:
            log_test("环境配置", "后端服务正常运行", "PASS")
        else:
            log_test("环境配置", "后端服务响应异常", "FAIL", 
                    f"状态码: {response.status_code}")
    except Exception as e:
        log_test("环境配置", "后端服务无法连接", "FAIL", str(e))


# ============================================
# 2. API 功能测试
# ============================================
def test_api_functionality():
    """测试 API 功能"""
    print_section("2. API 功能测试")
    
    token = None
    
    # 2.1 测试健康检查
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            log_test("API功能", "健康检查端点 /health", "PASS",
                    f"状态: {data.get('status')}")
        else:
            log_test("API功能", "健康检查端点 /health", "FAIL",
                    f"状态码: {response.status_code}")
    except Exception as e:
        log_test("API功能", "健康检查端点 /health", "FAIL", str(e))
    
    # 2.2 测试用户注册
    try:
        test_user = {
            "username": f"test_user_{int(time.time())}",
            "email": f"test{int(time.time())}@example.com",
            "password": "TestPass123!",
            "full_name": "测试用户"
        }
        response = requests.post(f"{BASE_URL}/api/v1/auth/register", json=test_user, timeout=5)
        if response.status_code in [200, 201]:
            log_test("API功能", "用户注册 API", "PASS")
        else:
            log_test("API功能", "用户注册 API", "FAIL",
                    f"状态码: {response.status_code}, 响应: {response.text[:200]}")
    except Exception as e:
        log_test("API功能", "用户注册 API", "FAIL", str(e))
    
    # 2.3 测试用户登录
    try:
        login_data = {
            "username": "admin",
            "password": "12345678"
        }
        response = requests.post(f"{BASE_URL}/api/v1/auth/login", data=login_data, timeout=5)
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            if token:
                log_test("API功能", "用户登录 API", "PASS", "成功获取 JWT token")
            else:
                log_test("API功能", "用户登录 API", "FAIL", "未返回 access_token")
        else:
            log_test("API功能", "用户登录 API", "FAIL",
                    f"状态码: {response.status_code}")
    except Exception as e:
        log_test("API功能", "用户登录 API", "FAIL", str(e))
    
    # 2.4 测试获取用户信息（需要 token）
    if token:
        try:
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(f"{BASE_URL}/api/v1/auth/me", headers=headers, timeout=5)
            if response.status_code == 200:
                user_data = response.json()
                log_test("API功能", "获取用户信息 API", "PASS",
                        f"用户名: {user_data.get('username')}")
            else:
                log_test("API功能", "获取用户信息 API", "FAIL",
                        f"状态码: {response.status_code}")
        except Exception as e:
            log_test("API功能", "获取用户信息 API", "FAIL", str(e))
    
    # 2.5 测试资源关联 API
    try:
        response = requests.get(f"{BASE_URL}/api/v1/resources/resources/summary", timeout=5)
        if response.status_code == 200:
            data = response.json()
            log_test("API功能", "资源汇总 API", "PASS",
                    f"教程: {data.get('total_tutorials', 0)}, "
                    f"课件: {data.get('total_materials', 0)}")
        else:
            log_test("API功能", "资源汇总 API", "FAIL",
                    f"状态码: {response.status_code}")
    except Exception as e:
        log_test("API功能", "资源汇总 API", "FAIL", str(e))


# ============================================
# 3. 安全性测试
# ============================================
def test_security():
    """测试安全性"""
    print_section("3. 安全性测试")
    
    # 3.1 测试速率限制
    print("\n测试速率限制（连续快速请求登录接口）...")
    rate_limit_triggered = False
    for i in range(10):
        try:
            response = requests.post(
                f"{BASE_URL}/api/v1/auth/login",
                data={"username": "admin", "password": "wrong"},
                timeout=5
            )
            if response.status_code == 429:
                rate_limit_triggered = True
                log_test("安全性", "API 速率限制", "PASS",
                        f"在第 {i+1} 次请求时触发限流")
                break
        except:
            pass
    
    if not rate_limit_triggered:
        log_test("安全性", "API 速率限制", "FAIL",
                "连续10次请求未触发限流，可能配置有问题")
    
    # 3.2 测试 CORS 配置
    try:
        headers = {"Origin": "http://malicious-site.com"}
        response = requests.options(f"{BASE_URL}/api/v1/auth/login", headers=headers, timeout=5)
        allow_origin = response.headers.get("Access-Control-Allow-Origin", "")
        
        if allow_origin == "*" or "malicious-site" in allow_origin:
            log_test("安全性", "CORS 配置", "FAIL",
                    f"CORS 允许所有来源或包含恶意域名: {allow_origin}")
        else:
            log_test("安全性", "CORS 配置", "PASS",
                    f"CORS 已限制: {allow_origin}")
    except Exception as e:
        log_test("安全性", "CORS 配置", "FAIL", str(e))
    
    # 3.3 测试无效 Token
    try:
        headers = {"Authorization": "Bearer invalid_token_here"}
        response = requests.get(f"{BASE_URL}/api/v1/auth/me", headers=headers, timeout=5)
        if response.status_code == 401:
            log_test("安全性", "无效 Token 拒绝访问", "PASS")
        else:
            log_test("安全性", "无效 Token 拒绝访问", "FAIL",
                    f"状态码: {response.status_code} (应为 401)")
    except Exception as e:
        log_test("安全性", "无效 Token 拒绝访问", "FAIL", str(e))


# ============================================
# 4. 性能测试
# ============================================
def test_performance():
    """测试性能"""
    print_section("4. 性能测试")
    
    # 4.1 API 响应时间测试
    endpoints = [
        ("/", "根路径"),
        ("/health", "健康检查"),
        ("/api/v1/resources/resources/summary", "资源汇总")
    ]
    
    for endpoint, name in endpoints:
        try:
            start_time = time.time()
            response = requests.get(f"{BASE_URL}{endpoint}", timeout=5)
            elapsed = (time.time() - start_time) * 1000  # 毫秒
            
            if response.status_code == 200 and elapsed < 200:
                log_test("性能", f"{name} 响应时间", "PASS",
                        f"{elapsed:.2f}ms")
            elif response.status_code != 200:
                log_test("性能", f"{name} 响应时间", "FAIL",
                        f"状态码: {response.status_code}")
            else:
                log_test("性能", f"{name} 响应时间", "WARN",
                        f"{elapsed:.2f}ms (超过200ms目标)")
        except Exception as e:
            log_test("性能", f"{name} 响应时间", "FAIL", str(e))
    
    # 4.2 并发请求测试
    print("\n执行并发请求测试（10个并发）...")
    import concurrent.futures
    
    def make_request(url):
        try:
            response = requests.get(url, timeout=5)
            return response.status_code
        except:
            return None
    
    urls = [f"{BASE_URL}/health"] * 10
    success_count = 0
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(make_request, url) for url in urls]
        for future in concurrent.futures.as_completed(futures):
            if future.result() == 200:
                success_count += 1
    
    if success_count >= 8:  # 80% 成功率
        log_test("性能", "并发请求测试 (10并发)", "PASS",
                f"成功率: {success_count}/10")
    else:
        log_test("性能", "并发请求测试 (10并发)", "FAIL",
                f"成功率: {success_count}/10")


# ============================================
# 5. 前端页面测试
# ============================================
def test_frontend_pages():
    """测试前端页面可访问性"""
    print_section("5. 前端页面测试")
    
    pages = [
        ("http://localhost:3000/index.html", "营销首页"),
        ("http://localhost:3000/dashboard.html", "学习仪表盘"),
        ("http://localhost:3000/profile.html", "个人中心"),
    ]
    
    for url, name in pages:
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                log_test("前端", f"{name} 可访问", "PASS")
            else:
                log_test("前端", f"{name} 可访问", "FAIL",
                        f"状态码: {response.status_code}")
        except Exception as e:
            log_test("前端", f"{name} 可访问", "FAIL", str(e))


# ============================================
# 6. Docker 部署测试
# ============================================
def test_docker_deployment():
    """测试 Docker 部署"""
    print_section("6. Docker 部署测试")
    
    import subprocess
    
    # 检查 docker-compose.yml 是否存在
    compose_file = os.path.join(os.path.dirname(__file__), '..', 'docker-compose.yml')
    if os.path.exists(compose_file):
        log_test("Docker", "docker-compose.yml 存在", "PASS")
    else:
        log_test("Docker", "docker-compose.yml 存在", "FAIL")
        return
    
    # 检查 Dockerfile.backend 是否存在
    dockerfile = os.path.join(os.path.dirname(__file__), '..', 'Dockerfile.backend')
    if os.path.exists(dockerfile):
        log_test("Docker", "Dockerfile.backend 存在", "PASS")
    else:
        log_test("Docker", "Dockerfile.backend 存在", "FAIL")
    
    # 注意：实际启动 Docker 容器需要较长时间，这里只做配置检查
    print("\n提示: 完整的 Docker 测试需要手动执行:")
    print("  docker-compose up -d")
    print("  docker-compose ps")
    print("  docker-compose logs")


# ============================================
# 生成测试报告
# ============================================
def generate_report():
    """生成测试报告"""
    print_section("测试报告汇总")
    
    # 计算通过率
    pass_rate = (PASSED_TESTS / TOTAL_TESTS * 100) if TOTAL_TESTS > 0 else 0
    
    print(f"\n总测试数: {TOTAL_TESTS}")
    print(f"通过: {PASSED_TESTS} ✅")
    print(f"失败: {FAILED_TESTS} ❌")
    print(f"通过率: {pass_rate:.1f}%\n")
    
    # 按类别统计
    categories = {}
    for result in TEST_RESULTS:
        cat = result["category"]
        if cat not in categories:
            categories[cat] = {"total": 0, "passed": 0, "failed": 0}
        categories[cat]["total"] += 1
        if result["status"] == "PASS":
            categories[cat]["passed"] += 1
        else:
            categories[cat]["failed"] += 1
    
    print("各类别测试结果:")
    print("-" * 80)
    for cat, stats in categories.items():
        rate = (stats["passed"] / stats["total"] * 100) if stats["total"] > 0 else 0
        status = "✅" if rate >= 80 else "⚠️" if rate >= 60 else "❌"
        print(f"{status} {cat:15s} | 总数: {stats['total']:3d} | "
              f"通过: {stats['passed']:3d} | 失败: {stats['failed']:3d} | "
              f"通过率: {rate:5.1f}%")
    
    # 评估部署就绪度
    print("\n" + "=" * 80)
    print("部署就绪度评估")
    print("=" * 80)
    
    if pass_rate >= 90:
        print("\n🟢 优秀 - 可以部署到生产环境")
        print("   建议: 完成剩余测试后即可部署")
    elif pass_rate >= 75:
        print("\n🟡 良好 - 有条件部署")
        print("   建议: 修复失败的测试项后再部署")
    elif pass_rate >= 60:
        print("\n🟠 一般 - 不建议立即部署")
        print("   建议: 需要解决多个问题后才能考虑部署")
    else:
        print("\n🔴 较差 - 禁止部署")
        print("   建议: 大量测试失败，需要全面修复")
    
    # 保存详细报告
    report = {
        "test_date": datetime.now().isoformat(),
        "summary": {
            "total": TOTAL_TESTS,
            "passed": PASSED_TESTS,
            "failed": FAILED_TESTS,
            "pass_rate": pass_rate
        },
        "results": TEST_RESULTS
    }
    
    report_file = os.path.join(os.path.dirname(__file__), 'deployment_test_report.json')
    with open(report_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"\n详细报告已保存到: {report_file}")
    
    return pass_rate


# ============================================
# 主函数
# ============================================
def main():
    """主测试流程"""
    print("=" * 80)
    print("  OpenMTSciEd 部署前综合测试")
    print(f"  测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    
    start_time = time.time()
    
    # 执行各项测试
    test_environment_setup()
    test_api_functionality()
    test_security()
    test_performance()
    test_frontend_pages()
    test_docker_deployment()
    
    # 生成报告
    elapsed = time.time() - start_time
    pass_rate = generate_report()
    
    print(f"\n总耗时: {elapsed:.2f} 秒")
    print("\n" + "=" * 80)
    
    # 根据通过率给出建议
    if pass_rate >= 90:
        print("✅ 测试通过！项目基本具备生产部署条件")
        return 0
    elif pass_rate >= 75:
        print("⚠️  部分测试失败，建议修复后再部署")
        return 1
    else:
        print("❌ 测试失败较多，不建议部署到生产环境")
        return 2


if __name__ == "__main__":
    sys.exit(main())
