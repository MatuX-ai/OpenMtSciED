#!/usr/bin/env node
/**
 * 检查数据库中的孤立表
 * 对比 Prisma schema 和实际数据库中的表
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// 加载环境变量
const envPath = path.join(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

if (!process.env.DATABASE_URL) {
  console.error('❌ 错误: 未找到 DATABASE_URL 环境变量');
  console.log('请确保 backend-next/.env.local 文件中包含 DATABASE_URL');
  process.exit(1);
}

const prisma = new PrismaClient();

async function checkOrphanedTables() {
  console.log('🔍 开始检查数据库表...\n');
  
  try {
    // 从 Prisma schema 文件中读取模型列表
    const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
    const modelMatches = schemaContent.match(/model\s+(\w+)\s+\{/g);
    
    let schemaModels: string[] = [];
    if (modelMatches) {
      schemaModels = modelMatches
        .map(match => match.match(/model\s+(\w+)/)?.[1])
        .filter((name): name is string => name !== undefined);
    }
    
    // 添加 Prisma 内部表
    schemaModels.push('_prisma_migrations');
    
    console.log('📋 Prisma Schema 中定义的表:');
    schemaModels.forEach(model => console.log(`   - ${model}`));
    console.log('');
    
    // 查询数据库中所有的表
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    ` as Array<{ table_name: string }>;
    
    const actualTables = tables.map(t => t.table_name);
    
    console.log('💾 数据库中实际存在的表:');
    actualTables.forEach(table => console.log(`   - ${table}`));
    console.log('');
    
    // 找出孤立的表（在数据库中存在但不在 Prisma schema 中）
    const orphanedTables = actualTables.filter(table => !schemaModels.includes(table));
    
    if (orphanedTables.length > 0) {
      console.log('⚠️  发现孤立的表:');
      orphanedTables.forEach(table => console.log(`   - ${table}`));
      console.log('');
      console.log('建议操作:');
      console.log('1. 检查这些表是否还在使用');
      console.log('2. 如果确认不再需要，可以删除这些表');
      console.log('3. 如果需要保留，请在 Prisma schema 中添加对应的模型定义');
    } else {
      console.log('✅ 没有发现孤立的表，数据库结构正常！');
    }
    
    console.log('\n📊 统计信息:');
    console.log(`   Prisma 模型数: ${schemaModels.length}`);
    console.log(`   数据库表数: ${actualTables.length}`);
    console.log(`   孤立表数: ${orphanedTables.length}`);
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrphanedTables();
