# Neo4j连接问题诊断与解决方案

**问题**: DNS解析失败，无法连接到Neo4j Aura  
**时间**: 2026-04-18

---

## 🔍 问题现象

```
socket.gaierror: [Errno 11001] getaddrinfo failed
Failed to DNS resolve address 4abd5ef9.databases.neo4j.io:7687
```

或

```
HTTPSConnectionPool: Failed to establish a new connection: [Errno 11001] getaddrinfo failed
```

---

## 📋 诊断步骤

### 1. 检查网络连接

```bash
# Ping测试
ping 4abd5ef9.databases.neo4j.io

# DNS解析测试
nslookup 4abd5ef9.databases.neo4j.io

# 或使用PowerShell
Resolve-DnsName 4abd5ef9.databases.neo4j.io
```

**预期结果**: 应该能解析出IP地址

**如果失败**: 
- 检查防火墙设置
- 检查代理配置
- 尝试切换网络（如使用手机热点）

---

### 2. 检查Neo4j实例状态

登录Neo4j Aura控制台: https://console.neo4j.io/

**检查项**:
- [ ] 实例状态是否为 "RUNNING"
- [ ] 实例ID是否正确: `4abd5ef9`
- [ ] 密码是否正确

**如果实例已停止**:
1. 点击实例
2. 点击 "Start" 按钮
3. 等待状态变为 "RUNNING"

---

### 3. 检查环境变量配置

确认 `.env` 文件中的配置：

```env
NEO4J_URI=neo4j+s://4abd5ef9.databases.neo4j.io
NEO4J_USER=4abd5ef9
NEO4J_PASSWORD=bXebDaB8hSalBxvvB5GhHmcvudO03ilZB7qItmI0Xbs
NEO4J_DATABASE=4abd5ef9
NEO4J_QUERY_API_URL=https://4abd5ef9.databases.neo4j.io/db/4abd5ef9/query/v2
```

**常见错误**:
- ❌ 密码复制不完整
- ❌ URI格式错误（多了空格）
- ❌ 使用了错误的实例ID

---

### 4. 测试HTTP API直接访问

使用浏览器或Postman访问:

```
URL: https://4abd5ef9.databases.neo4j.io/db/4abd5ef9/query/v2
Method: POST
Auth: Basic Auth (user: 4abd5ef9, password: <your_password>)
Headers: Content-Type: application/json
Body: {"statements": [{"statement": "RETURN 1 AS test"}]}
```

**预期响应**:
```json
{
  "results": [
    {
      "columns": ["test"],
      "data": [{"row": [1]}]
    }
  ]
}
```

---

## 🛠️ 解决方案

### 方案1: 修复网络问题

**Windows防火墙**:
1. 打开 "Windows Defender 防火墙"
2. 点击 "允许应用通过防火墙"
3. 确保Python有网络访问权限

**代理设置**:
```bash
# 如果使用代理，设置环境变量
set HTTP_PROXY=http://proxy-server:port
set HTTPS_PROXY=http://proxy-server:port

# 或在Python中
import os
os.environ['HTTP_PROXY'] = 'http://proxy-server:port'
os.environ['HTTPS_PROXY'] = 'http://proxy-server:port'
```

**DNS缓存清理**:
```bash
ipconfig /flushdns
```

---

### 方案2: 重启Neo4j实例

1. 登录 https://console.neo4j.io/
2. 找到实例 `4abd5ef9`
3. 如果状态不是 "RUNNING"，点击 "Start"
4. 等待2-3分钟直到状态变为 "RUNNING"
5. 重新运行验证脚本

---

### 方案3: 使用本地Neo4j (临时方案)

如果云数据库持续无法访问，可以安装本地Neo4j用于开发：

```bash
# 使用Docker快速启动
docker run \
  --name neo4j-dev \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password \
  -d neo4j:latest
```

然后修改 `.env`:
```env
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
NEO4J_DATABASE=neo4j
NEO4J_QUERY_API_URL=http://localhost:7474/db/neo4j/query/v2
```

---

### 方案4: 检查Python环境

**更新neo4j驱动**:
```bash
pip install --upgrade neo4j
```

**检查requests库**:
```bash
pip install requests
```

**测试SSL证书**:
```python
import ssl
import socket

context = ssl.create_default_context()
with socket.create_connection(('4abd5ef9.databases.neo4j.io', 443)) as sock:
    with context.wrap_socket(sock, server_hostname='4abd5ef9.databases.neo4j.io') as ssock:
        print("SSL连接成功")
        print(ssock.version())
```

---

## ✅ 验证清单

完成以下步骤后，再次运行验证脚本：

- [ ] Neo4j实例状态为 "RUNNING"
- [ ] 能Ping通 `4abd5ef9.databases.neo4j.io`
- [ ] 环境变量配置正确
- [ ] Python依赖已安装 (`neo4j`, `requests`)
- [ ] 防火墙/代理已配置

运行验证:
```bash
python verify_neo4j_http.py
```

**预期输出**:
```
✅ HTTP API连接成功
📊 节点统计:
   CourseUnit: 125 个
   KnowledgePoint: 316 个
   TextbookChapter: 11 个
   HardwareProject: XX 个
```

---

## 📞 寻求支持

如果以上方案都无效：

1. **检查Neo4j Aura状态页面**: https://status.neo4j.io/
2. **联系Neo4j支持**: support@neo4j.com
3. **查看项目Issues**: https://github.com/MatuX-ai/OpenMtSciED/issues

---

## 📝 备注

- Neo4j Aura免费层实例可能在24小时无活动后自动暂停
- 建议在开发期间保持实例运行
- 考虑升级到付费层以获得更高可用性

---

**最后更新**: 2026-04-18  
**状态**: ⏳ 待解决
