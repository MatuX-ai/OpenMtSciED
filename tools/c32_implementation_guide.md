# C3.2 快速实施配置文件

## 说明

本目录包含 C3.2 依赖更新与安全扫描机制的完整配置文件，可直接使用。

## 文件清单

1. `.github/dependabot.yml` - Dependabot 自动依赖更新配置
2. `.github/workflows/weekly-security-scan.yml` - 每周安全扫描工作流
3. `SECURITY.md` - 安全响应政策文档

## 使用方法

### 1. Dependabot 配置

将 `dependabot.yml` 复制到 `.github/` 目录:

```bash
cp dependabot.yml .github/dependabot.yml
```

### 2. 每周安全扫描

将工作流文件复制到对应目录:

```bash
cp weekly-security-scan.yml .github/workflows/weekly-security-scan.yml
```

### 3. 安全响应政策

将 SECURITY.md 复制到项目根目录:

```bash
cp SECURITY.md ../../SECURITY.md
```

## 验证

运行回测脚本验证功能是否完整:

```bash
python verify_c32_dependency_security.py
```

## 注意事项

1. 根据实际团队名称修改 reviewer 配置
2. 时区已设置为 Asia/Tokyo (UTC+9)
3. 扫描时间设置在凌晨，避免影响正常开发
4. 可根据实际情况调整扫描频率
