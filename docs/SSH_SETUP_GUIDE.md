# SSH 密钥配置指南 - OpenMTSciEd

## ✅ SSH 密钥已生成

**公钥内容：**
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIA1Tgn7CIQ3Kic52/0aeONT9/ou1aIVsDJtR15ZWEQ/a 3936318150@qq.com
```

**密钥文件位置：**
- 私钥：`C:\Users\Administrator\.ssh\id_ed25519`
- 公钥：`C:\Users\Administrator\.ssh\id_ed25519.pub`

---

## 📋 下一步操作

### 第 1 步：将公钥添加到 GitHub

1. **访问 GitHub SSH 设置页面：**
   ```
   https://github.com/settings/keys
   ```

2. **点击 "New SSH key" 按钮**

3. **填写信息：**
   - **Title（标题）**: `OpenMTSciEd - Windows PC`
   - **Key type（密钥类型）**: 选择 "Authentication Key"
   - **Key（密钥）**: 复制上面的公钥内容（整个一行）

4. **点击 "Add SSH key" 保存**

### 第 2 步：测试 SSH 连接

在 PowerShell 中执行：

```powershell
ssh -T git@github.com
```

**预期输出：**
```
Hi MatuX-ai! You've successfully authenticated, but GitHub does not provide shell access.
```

如果出现这个提示，说明 SSH 配置成功！✅

### 第 3 步：切换 Git 远程仓库为 SSH 协议

当前你的仓库使用的是 HTTPS 协议，需要切换到 SSH：

```powershell
cd g:\iMato\OpenMTSciEd
git remote set-url origin git@github.com:MatuX-ai/OpenMtSciED.git
```

**验证是否切换成功：**
```powershell
git remote -v
```

应该看到：
```
origin  git@github.com:MatuX-ai/OpenMtSciED.git (fetch)
origin  git@github.com:MatuX-ai/OpenMtSciED.git (push)
```

### 第 4 步：推送代码到 GitHub

现在可以直接推送，无需输入密码或 Token：

```powershell
git push origin main
```

---

## 🔧 常见问题

### 问题 1：SSH 连接被拒绝

**错误信息：**
```
ssh: connect to host github.com port 22: Connection timed out
```

**解决方案：**
使用 HTTPS over SSH（端口 443）：

```powershell
# 创建或编辑 SSH 配置文件
notepad C:\Users\Administrator\.ssh\config
```

添加以下内容：
```
Host github.com
    Hostname ssh.github.com
    Port 443
    User git
    IdentityFile ~/.ssh/id_ed25519
```

保存后重新测试：
```powershell
ssh -T git@github.com
```

### 问题 2：权限被拒绝

**错误信息：**
```
git@github.com: Permission denied (publickey).
```

**解决方案：**

1. 确保 SSH Agent 正在运行：
```powershell
Start-Service ssh-agent
Set-Service -Name ssh-agent -StartupType Automatic
```

2. 添加私钥到 SSH Agent：
```powershell
ssh-add C:\Users\Administrator\.ssh\id_ed25519
```

3. 验证密钥已添加：
```powershell
ssh-add -l
```

应该看到你的密钥指纹。

### 问题 3：仍然要求输入密码

**原因：**
可能使用了错误的远程 URL。

**检查方法：**
```powershell
git remote -v
```

如果看到的是 `https://` 开头的地址，需要重新设置为 SSH：
```powershell
git remote set-url origin git@github.com:MatuX-ai/OpenMtSciED.git
```

---

## 🎯 快速命令汇总

```powershell
# 1. 测试 SSH 连接
ssh -T git@github.com

# 2. 查看当前远程仓库
git remote -v

# 3. 切换到 SSH 协议
git remote set-url origin git@github.com:MatuX-ai/OpenMtSciED.git

# 4. 推送代码
git push origin main

# 5. 拉取最新代码
git pull origin main
```

---

## 📊 HTTPS vs SSH 对比

| 特性 | HTTPS | SSH |
|------|-------|-----|
| 认证方式 | Token / 用户名密码 | SSH 密钥对 |
| 配置难度 | 简单 | 中等 |
| 安全性 | 高 | 更高 |
| 便利性 | 每次需输入 Token | 一次配置，永久使用 |
| 防火墙友好 | ✅ 是 | ⚠️ 可能需要配置 |
| 推荐场景 | 临时使用 | 长期开发 |

---

## 🔐 安全建议

1. **不要分享私钥文件**
   - 私钥文件：`id_ed25519`（没有 .pub 扩展名）
   - 这个文件绝对不能分享给任何人

2. **可以安全分享的：**
   - 公钥文件：`id_ed25519.pub`
   - 这就是你刚才看到的那行以 `ssh-ed25519` 开头的内容

3. **备份密钥：**
   ```powershell
   # 备份到 U 盘或其他安全位置
   Copy-Item C:\Users\Administrator\.ssh\id_ed25519* D:\Backup\SSH_Keys\
   ```

4. **设置密钥密码（可选但推荐）：**
   ```powershell
   ssh-keygen -p -f C:\Users\Administrator\.ssh\id_ed25519
   ```
   这样即使私钥泄露，也需要密码才能使用。

---

## 🚀 完成后的效果

配置完成后，你可以：

✅ 直接 `git push` 无需输入密码  
✅ 直接 `git pull` 无需输入密码  
✅ 更安全地访问 GitHub  
✅ 支持自动化脚本和 CI/CD  

---

## 📞 需要帮助？

如果在配置过程中遇到问题：

1. 检查 SSH 连接：`ssh -vT git@github.com`（详细模式）
2. 查看 GitHub 官方文档：https://docs.github.com/en/authentication/connecting-to-github-with-ssh
3. 联系邮箱：3936318150@qq.com

---

**祝你使用愉快！** 🎉
