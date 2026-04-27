import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
const envPath = path.join(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const prisma = new PrismaClient();

async function createDefaultUser() {
  console.log('🔍 检查默认用户...\n');
  
  try {
    // 检查用户是否已存在
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: '3936318150@qq.com' },
          { username: '3936318150@qq.com' }
        ]
      }
    });
    
    if (existingUser) {
      console.log('✅ 默认用户已存在:');
      console.log(`   ID: ${existingUser.id}`);
      console.log(`   用户名: ${existingUser.username}`);
      console.log(`   邮箱: ${existingUser.email}`);
      console.log(`   角色: ${existingUser.role}`);
      console.log('\n💡 使用以下凭据登录:');
      console.log('   用户名: 3936318150@qq.com');
      console.log('   密码: 12345678');
      return;
    }
    
    console.log('📝 创建默认管理员用户...\n');
    
    // 创建默认用户
    const hashedPassword = await bcrypt.hash('12345678', 10);
    
    const newUser = await prisma.user.create({
      data: {
        username: '3936318150@qq.com',
        email: '3936318150@qq.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin',
        isActive: true
      }
    });
    
    console.log('✅ 默认用户创建成功!');
    console.log(`   ID: ${newUser.id}`);
    console.log(`   用户名: ${newUser.username}`);
    console.log(`   邮箱: ${newUser.email}`);
    console.log(`   角色: ${newUser.role}`);
    console.log('\n💡 使用以下凭据登录:');
    console.log('   用户名: 3936318150@qq.com');
    console.log('   密码: 12345678');
    
  } catch (error) {
    console.error('❌ 创建用户失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDefaultUser();
