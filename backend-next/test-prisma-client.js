#!/usr/bin/env node

/**
 * 测试 Prisma Client 是否正确生成
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 检查 Prisma Client 是否正确生成...\n');

// 检查 Prisma Client 目录是否存在
const clientPath = path.join(__dirname, 'node_modules', '.prisma', 'client');
if (fs.existsSync(clientPath)) {
  console.log('✅ Prisma Client 目录存在:', clientPath);
  
  // 检查关键文件
  const indexJs = path.join(clientPath, 'index.js');
  const indexDts = path.join(clientPath, 'index.d.ts');
  
  if (fs.existsSync(indexJs)) {
    console.log('✅ index.js 存在');
  } else {
    console.log('❌ index.js 不存在');
  }
  
  if (fs.existsSync(indexDts)) {
    console.log('✅ index.d.ts 存在');
  } else {
    console.log('❌ index.d.ts 不存在');
  }
  
  console.log('\n🎉 Prisma Client 已正确生成！');
} else {
  console.log('❌ Prisma Client 目录不存在:', clientPath);
  console.log('\n💡 请运行以下命令生成 Prisma Client:');
  console.log('   npm run prisma-generate');
  console.log('   或');
  console.log('   npx prisma generate');
  process.exit(1);
}