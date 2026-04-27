#!/usr/bin/env node
/**
 * 测试 OpenStax 爬虫
 */

import { generateOpenStaxChapters, saveChapters } from '../app/lib/crawlers/openstax-crawler';
import path from 'path';

async function testOpenStaxCrawler() {
  console.log('🧪 测试 OpenStax 爬虫...\n');
  
  try {
    // 1. 生成章节数据
    console.log('📚 生成教材章节数据...');
    const chapters = generateOpenStaxChapters();
    console.log(`✅ 生成了 ${chapters.length} 个章节\n`);
    
    // 2. 显示章节摘要
    console.log('📋 章节摘要（前10个）:');
    chapters.slice(0, 10).forEach((chapter, index) => {
      console.log(`   ${index + 1}. ${chapter.textbook_title} - 第${chapter.chapter_number}章: ${chapter.title}`);
    });
    if (chapters.length > 10) {
      console.log(`   ... 还有 ${chapters.length - 10} 个章节`);
    }
    console.log('');
    
    // 3. 保存到文件
    const outputFile = path.join(process.cwd(), 'data', 'textbook_library', 'openstax_chapters_test.json');
    console.log(`💾 保存到: ${outputFile}`);
    await saveChapters(chapters, outputFile);
    
    console.log('\n✅ 测试完成！');
    console.log('\n📊 统计信息:');
    console.log(`   总章节数: ${chapters.length}`);
    
    // 按教材统计
    const byTextbook = chapters.reduce((acc, chapter) => {
      acc[chapter.textbook_title] = (acc[chapter.textbook_title] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('   按教材分类:');
    Object.entries(byTextbook).forEach(([title, count]) => {
      console.log(`     - ${title}: ${count} 章`);
    });
    
    // 按学科统计
    const bySubject = chapters.reduce((acc, chapter) => {
      acc[chapter.subject] = (acc[chapter.subject] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('   按学科分类:');
    Object.entries(bySubject).forEach(([subject, count]) => {
      console.log(`     - ${subject}: ${count} 章`);
    });
    
  } catch (error) {
    console.error('❌ 测试失败:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

testOpenStaxCrawler();
