#!/usr/bin/env node
/**
 * 测试 OpenStax 爬虫
 */

import { generateOpenStaxChapters, saveChapters } from '../lib/crawlers/openstax-crawler';
import * as path from 'path';

async function testOpenStaxCrawler() {
  console.log('🧪 测试 OpenStax 爬虫...\n');
  
  try {
    // 1. 生成章节数据
    console.log('📚 生成教材章节数据...');
    const chapters = await generateOpenStaxChapters();
    console.log(`✅ 生成了 ${chapters.length} 个章节\n`);
    
    // 2. 显示章节摘要
    console.log('📋 章节摘要（前10个）:');
    chapters.slice(0, 10).forEach((chapter, index) => {
      console.log(`   ${index + 1}. ${chapter.title}`);
    });
    if (chapters.length > 10) {
      console.log(`   ... 还有 ${chapters.length - 10} 个章节`);
    }
    console.log('');
    
    // 3. 保存到文件
    console.log(`💾 保存章节数据...`);
    await saveChapters(chapters);
    
    console.log('\n✅ 测试完成！');
    console.log('\n📊 统计信息:');
    console.log(`   总章节数: ${chapters.length}`);
    
  } catch (error) {
    console.error('❌ 测试失败:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

testOpenStaxCrawler();
