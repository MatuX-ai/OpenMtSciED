# 安全政策

## 报告漏洞

如果您发现 OpenMTSciEd 项目中的安全漏洞，请通过以下方式联系我们：

- **邮箱**: security@imato.edu
- **GitHub Security Advisory**: https://github.com/iMato/OpenMTSciEd/security/advisories/new

**请勿**通过公开 Issue 报告安全问题。

## 支持版本

我们仅为最新版本提供安全更新：

| 版本 | 支持状态 |
|------|---------|
| 最新主分支 | ✅ 支持 |
| 旧版本 | ❌ 不支持 |

## 响应时间

- **确认收到报告**: 48 小时内
- **初步评估**: 5 个工作日内
- **修复发布**: 根据严重程度，通常在 14-30 天内

## 安全最佳实践

### 部署建议

1. **不要使用默认密码**
   ```bash
   # 在 .env 文件中设置强密码
   NEO4J_PASSWORD=your_strong_password_here
   POSTGRES_PASSWORD=your_strong_password_here
   ```

2. **生产环境配置**
   - 启用 HTTPS
   - 配置防火墙规则
   - 定期更新依赖包
   - 监控异常访问日志

3. **敏感信息管理**
   - 永远不要将 `.env` 文件提交到版本控制
   - 使用密钥管理服务（如 AWS Secrets Manager、HashiCorp Vault）
   - 定期轮换 API 密钥和数据库密码

### 已知限制

- WebUSB 功能需要 HTTPS 环境（localhost 除外）
- Neo4j 默认配置仅适用于开发环境
- AI 模型 API 密钥需要妥善保管

## 致谢

感谢以下安全研究人员帮助我们改进项目安全性：
- （待添加贡献者名单）
