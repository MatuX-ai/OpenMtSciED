import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

// 加载 .env.local 文件
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function createDefaultUser() {
  try {
    console.log('🔍 检查是否存在默认用户...');

    // 检查是否已存在 admin 用户
    const existingUser = await prisma.user.findUnique({
      where: { username: 'admin' }
    });

    if (existingUser) {
      console.log('✅ 默认用户已存在:', existingUser.username);
      return;
    }

    // 创建默认管理员用户
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const newUser = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@openmtscied.com',
        password: hashedPassword,
        name: '系统管理员',
        role: 'admin',
        isActive: true,
      }
    });

    console.log('✅ 默认用户创建成功！');
    console.log('👤 用户名: admin');
    console.log('🔑 密码: admin123');
    console.log('📧 邮箱:', newUser.email);
    console.log('🎭 角色:', newUser.role);

  } catch (error) {
    console.error('❌ 创建默认用户失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDefaultUser();
