"""
生成 bcrypt 密码哈希
"""
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 生成 TestPass123 的哈希
password = "TestPass123"
hashed = pwd_context.hash(password)

print("=" * 80)
print(f"原始密码: {password}")
print(f"bcrypt 哈希: {hashed}")
print("=" * 80)

# 验证哈希是否正确
if pwd_context.verify(password, hashed):
    print("✅ 哈希验证成功！")
else:
    print("❌ 哈希验证失败！")

# 生成 SQL 插入语句
print("\n" + "=" * 80)
print("SQL 插入语句:")
print("=" * 80)
sql = f"""
INSERT INTO users (username, email, hashed_password, is_active, is_superuser, role)
VALUES (
  'testuser',
  'test@example.com',
  '{hashed}',
  true,
  false,
  'user'
);
"""
print(sql)
print("=" * 80)
