"""
创建超级管理员账户（简化版）
"""

import asyncio
import sys
import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import bcrypt

async def create_super_admin():
    """创建超级管理员账户"""
    
    # 加载项目根目录的.env
    env_path = Path(__file__).parent.parent.parent / ".env"
    if env_path.exists():
        load_dotenv(env_path)
        print(f"✅ 已加载配置文件: {env_path}")
    
    # 直接使用提供的数据库URL，使用asyncpg驱动
    db_url = "postgresql+asyncpg://neondb_owner:npg_gOwZRiQYy8W3@ep-dark-violet-a13zs25i-pooler.ap-southeast-1.aws.neon.tech/neondb"
    print("✅ 已配置Neon数据库连接")
    
    print(f"正在连接数据库...")
    
    engine = create_async_engine(db_url, echo=False)
    
    try:
        email = "3936318150@qq.com"
        username = "superadmin"
        password = "12345678"
        
        # 使用bcrypt哈希密码
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
        
        async with engine.connect() as conn:
            # 检查用户是否已存在
            result = await conn.execute(
                text("SELECT id, username, role, is_active FROM users WHERE email = :email"),
                {"email": email}
            )
            existing_user = result.fetchone()
            
            if existing_user:
                print(f"⚠️  用户 {email} 已存在")
                print(f"   ID: {existing_user[0]}")
                print(f"   用户名: {existing_user[1]}")
                print(f"   角色: {existing_user[2]}")
                print(f"   状态: {'活跃' if existing_user[3] else '非活跃'}")
                
                confirm = input("\n是否将其提升为超级管理员并重置密码？(y/n): ")
                if confirm.lower() == 'y':
                    await conn.execute(
                        text("UPDATE users SET role = :role, is_active = :is_active, password_hash = :password WHERE email = :email"),
                        {
                            "role": "admin",
                            "is_active": True,
                            "password": hashed_password,
                            "email": email
                        }
                    )
                    await conn.commit()
                    print("✅ 已更新为超级管理员")
                else:
                    print("❌ 操作取消")
                    return
            else:
                # 创建新用户
                await conn.execute(
                    text("""
                        INSERT INTO users (username, email, password_hash, role, is_active)
                        VALUES (:username, :email, :password, :role, :is_active)
                    """),
                    {
                        "username": username,
                        "email": email,
                        "password": hashed_password,
                        "role": "admin",
                        "is_active": True
                    }
                )
                await conn.commit()
                
                # 获取新创建的用户ID
                result = await conn.execute(
                    text("SELECT id FROM users WHERE email = :email"),
                    {"email": email}
                )
                user_id = result.scalar()
                
                print("=" * 60)
                print("✅ 超级管理员创建成功！")
                print("=" * 60)
                print(f"   邮箱: {email}")
                print(f"   用户名: {username}")
                print(f"   密码: {password}")
                print(f"   角色: admin (系统管理员)")
                print(f"   用户ID: {user_id}")
                print("=" * 60)
                print("\n⚠️  请妥善保管密码，建议首次登录后修改！")
                print("=" * 60)
    
    except Exception as e:
        print(f"❌ 创建失败: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(create_super_admin())
