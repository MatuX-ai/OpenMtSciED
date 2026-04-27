#!/usr/bin/env node

/**
 * Vercel 部署前的 Prisma Client 生成脚本
 * 确保在 Vercel 环境中正确生成 Prisma Client
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 开始为 Vercel 部署生成 Prisma Client...');

try {
  // 检查 prisma schema 文件是否存在
  const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
  if (!fs.existsSync(schemaPath)) {
    console.error('❌ Prisma schema 文件不存在:', schemaPath);
    process.exit(1);
  }

  console.log('✅ Prisma schema 文件存在');

  // 生成 Prisma Client
  console.log('📦 正在生成 Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('✅ Prisma Client 生成成功');
  
  // 验证生成的客户端
  const clientPath = path.join(__dirname, 'node_modules', '.prisma', 'client');
  if (fs.existsSync(clientPath)) {
    console.log('✅ Prisma Client 目录存在:', clientPath);
  } else {
    console.warn('⚠️  Prisma Client 目录可能未正确生成');
  }

  console.log('🎉 Prisma Client 准备就绪，可以部署到 Vercel');
} catch (error) {
  console.error('❌ 生成 Prisma Client 失败:', error.message);
  process.exit(1);
}