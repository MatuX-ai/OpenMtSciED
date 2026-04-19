"""
使用 bcrypt 直接生成密码哈希
"""
import bcrypt

# 原始密码
password = "TestPass123"

# 生成盐值并加密
salt = bcrypt.gensalt()
hashed = bcrypt.hashpw(password.encode('utf-8'), salt)

print("=" * 80)
print(f"原始密码: {password}")
print(f"bcrypt 哈希: {hashed.decode('utf-8')}")
print("=" * 80)

# 验证哈希
if bcrypt.checkpw(password.encode('utf-8'), hashed):
    print("✅ 哈希验证成功！")
else:
    print("❌ 哈希验证失败！")

# 生成 SQL 插入语句
print("\n" + "=" * 80)
print("SQL 插入语句（复制到 Neon 控制台执行）:")
print("=" * 80)
sql = f"""
INSERT INTO users (username, email, hashed_password, is_active, is_superuser, role)
VALUES (
  'testuser',
  'test@example.com',
  '{hashed.decode('utf-8')}',
  true,
  false,
  'user'
);
"""
print(sql)
print("=" * 80)
print("\n提示：复制上面的 SQL 语句，在 Neon 控制台的 SQL Editor 中执行即可创建测试用户")
