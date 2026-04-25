#!/usr/bin/env python3
"""读取并显示测试报告"""
import json

with open('deployment_test_report.json', encoding='utf-8') as f:
    data = json.load(f)

print("\n" + "="*60)
print("  OpenMTSciEd 部署前测试结果汇总")
print("="*60)

summary = data['summary']
print(f"\n总测试数: {summary['total']}")
print(f"通过: {summary['passed']} ✅")
print(f"失败: {summary['failed']} ❌")
print(f"警告: {summary['total'] - summary['passed'] - summary['failed']} ⚠️")
print(f"通过率: {summary['pass_rate']:.1f}%\n")

# 按类别统计
cats = {}
for r in data['results']:
    cat = r['category']
    if cat not in cats:
        cats[cat] = {'total': 0, 'passed': 0, 'failed': 0, 'warn': 0}
    cats[cat]['total'] += 1
    if r['status'] == 'PASS':
        cats[cat]['passed'] += 1
    elif r['status'] == 'FAIL':
        cats[cat]['failed'] += 1
    else:
        cats[cat]['warn'] += 1

print("各类别统计:")
print("-" * 60)
for cat, s in cats.items():
    rate = (s['passed'] / s['total'] * 100) if s['total'] > 0 else 0
    status = "✅" if rate >= 80 else "⚠️" if rate >= 60 else "❌"
    print(f"{status} {cat:12s} | 总数: {s['total']:2d} | 通过: {s['passed']:2d} | 失败: {s['failed']:2d} | 通过率: {rate:5.1f}%")

# 列出失败的测试
print("\n" + "="*60)
print("失败的测试项:")
print("="*60)
for r in data['results']:
    if r['status'] == 'FAIL':
        print(f"❌ [{r['category']}] {r['test_name']}")
        if r.get('details'):
            print(f"   详情: {r['details']}")

# 给出建议
print("\n" + "="*60)
print("部署建议:")
print("="*60)
if summary['pass_rate'] >= 90:
    print("\n🟢 优秀 - 可以部署到生产环境")
elif summary['pass_rate'] >= 75:
    print("\n🟡 良好 - 有条件部署（需修复问题）")
elif summary['pass_rate'] >= 60:
    print("\n🟠 一般 - 不建议立即部署")
else:
    print("\n🔴 较差 - 禁止部署")

print("\n详细报告已保存到: deployment_test_report.json\n")
