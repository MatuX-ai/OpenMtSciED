# 安全测试工具集

## 概述

本目录包含了iMato项目的安全测试工具和相关脚本，用于执行全面的安全渗透测试和回归验证。

## 工具列表

### 1. 安全渗透测试工具
**文件**: `security_penetration_test.py`

#### 功能特性
- 智能合约漏洞扫描（集成Slither）
- API安全渗透测试
- 数据库加密强度检测
- OWASP Top 10合规性检查
- 自动化安全报告生成

#### 使用方法
```bash
cd scripts
python security_penetration_test.py
```

#### 输出文件
- `security_penetration_test_report_YYYYMMDD_HHMMSS.json` - 详细测试报告

### 2. 安全修复工具
**文件**: `security_fixes.py`

#### 功能特性
- 自动修复常见的安全配置问题
- 生成安全配置示例文件
- 创建自定义错误页面
- 设置安全日志记录机制

#### 使用方法
```bash
cd scripts
python security_fixes.py
```

#### 生成文件
- `DATABASE_SSL_CONFIG_EXAMPLE.txt` - 数据库SSL配置示例
- `PRODUCTION_SECURITY_CONFIG.py` - 生产环境安全配置
- `SECURITY_LOGGING_CONFIG.py` - 安全日志配置
- `src/assets/error-pages/` - 自定义错误页面目录

### 3. 回归测试工具
**文件**: `regression_test_security.py`

#### 功能特性
- 验证安全修复效果
- 重新运行安全测试
- OWASP合规性改进验证
- 安全配置覆盖率检查

#### 使用方法
```bash
cd scripts
python regression_test_security.py
```

#### 输出文件
- `security_regression_test_report_YYYYMMDD_HHMMSS.json` - 回归测试报告

## 安装依赖

### Python依赖包
```bash
pip install slither-analyzer
pip install requests
pip install pydantic
```

### 系统工具
```bash
# Ubuntu/Debian
sudo apt-get install solc

# macOS
brew install solidity

# Windows
# 从Solidity官网下载安装程序
```

## 测试环境要求

### 最低配置
- Python 3.8+
- 4GB RAM
- 100MB磁盘空间

### 推荐配置
- Python 3.10+
- 8GB RAM
- 1GB磁盘空间
- 多核CPU

## 执行流程

### 完整安全测试流程
1. **准备阶段**
   ```bash
   pip install -r requirements.security.txt
   ```

2. **执行渗透测试**
   ```bash
   python security_penetration_test.py
   ```

3. **应用安全修复**
   ```bash
   python security_fixes.py
   ```

4. **验证修复效果**
   ```bash
   python regression_test_security.py
   ```

### CI/CD集成示例
```yaml
# .github/workflows/security-test.yml
name: Security Testing

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  security-test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.10'
    
    - name: Install dependencies
      run: |
        pip install slither-analyzer
        pip install -r scripts/requirements.security.txt
    
    - name: Run security penetration test
      run: |
        cd scripts
        python security_penetration_test.py
    
    - name: Upload security report
      uses: actions/upload-artifact@v3
      with:
        name: security-report
        path: scripts/security_penetration_test_report_*.json
```

## 报告解读

### 安全测试报告结构
```json
{
  "report_metadata": {
    "title": "安全渗透测试报告",
    "generated_at": "2026-03-01T12:00:13.984996",
    "duration_seconds": 595.440462
  },
  "summary": {
    "overall_status": "PASS",
    "total_critical_vulnerabilities": 0,
    "compliance_score": 100.0
  },
  "test_results": [...],
  "recommendations": [...]
}
```

### 关键指标说明
- **overall_status**: 整体测试状态（PASS/WARNING/FAIL）
- **compliance_score**: OWASP合规分数（0-100%）
- **vulnerabilities**: 发现的漏洞按严重程度分类
- **recommendations**: 安全改进建议

## 常见问题解答

### Q: Slither扫描报错怎么办？
A: 确保已安装Solidity编译器：
```bash
solc --version  # 检查是否安装
```

### Q: 如何排除特定文件的扫描？
A: 在`security_penetration_test.py`中修改`discover_api_endpoints`函数

### Q: 测试报告中的建议如何实施？
A: 参考`SECURITY_SPECIFICATIONS.md`文档中的具体实施指南

### Q: 如何定制测试规则？
A: 修改各测试函数中的检测逻辑和阈值设置

## 维护和更新

### 版本更新记录
- v1.0 (2026-03-01): 初始版本发布
- 支持Slither 0.11.5
- 支持OWASP Top 10 2021标准

### 贡献指南
1. Fork项目仓库
2. 创建特性分支
3. 提交更改和测试
4. 发起Pull Request

## 许可证

本工具集遵循MIT许可证，详见LICENSE文件。

## 联系方式

如有问题或建议，请联系：
- 安全团队邮箱: security@imatu.com
- GitHub Issues: https://github.com/imatu/security-tools/issues

---
*最后更新: 2026年3月1日*