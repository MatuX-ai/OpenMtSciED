#!/usr/bin/env node
/**
 * 验证 Prisma Schema 完整性
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// 加载环境变量
const envPath = path.join(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

if (!process.env.DATABASE_URL) {
  console.error('❌ 错误: 未找到 DATABASE_URL 环境变量');
  console.log('请确保 backend-next/.env.local 文件中包含 DATABASE_URL');
  process.exit(1);
}

console.log('🔍 开始验证 Prisma Schema...\n');

try {
  // 1. 检查 schema 文件是否存在
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
  
  if (!fs.existsSync(schemaPath)) {
    console.error('❌ 错误: 找不到 prisma/schema.prisma 文件');
    process.exit(1);
  }
  
  console.log('✅ Schema 文件存在');
  
  // 2. 读取并显示当前模型
  const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  const modelMatches = schemaContent.match(/model\s+(\w+)\s+\{/g);
  
  if (modelMatches) {
    const models = modelMatches.map(match => match.match(/model\s+(\w+)/)?.[1]).filter(Boolean);
    
    console.log('\n📋 当前定义的模型:');
    models.forEach(model => console.log(`   - ${model}`));
    console.log(`\n总计: ${models.length} 个模型`);
  } else {
    console.warn('⚠️  未找到任何模型定义');
  }
  
  // 3. 验证 Prisma schema 语法
  console.log('\n🔧 验证 Prisma schema 语法...');
  try {
    execSync('npx prisma validate', { stdio: 'inherit' });
    console.log('✅ Prisma schema 语法验证通过');
  } catch (error) {
    console.error('❌ Prisma schema 语法验证失败');
    throw error;
  }
  
  // 4. 检查是否需要同步数据库
  console.log('\n💾 检查数据库同步状态...');
  console.log('提示: 如果数据库尚未同步，请运行以下命令:');
  console.log('   npx prisma db push');
  console.log('或者创建迁移:');
  console.log('   npx prisma migrate dev --name init');
  
  console.log('\n✅ Schema 验证完成！\n');
  
  // 5. 建议的下一步操作
  console.log('📝 建议的后续步骤:');
  console.log('1. 运行 "npx prisma db push" 将 schema 同步到数据库');
  console.log('2. 或者运行 "npx prisma migrate dev" 创建迁移文件');
  console.log('3. 生成 Prisma Client: "npx prisma generate"');
  
} catch (error) {
  console.error('\n❌ 验证失败:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}
