#!/usr/bin/env node
/**
 * 测试 Khan Academy 爬虫
 */

import { generateKhanAcademyCourses, saveCourses } from '../lib/crawlers/khan-academy-crawler';
import * as path from 'path';

async function testKhanAcademyCrawler() {
  console.log('🧪 测试 Khan Academy 爬虫...\n');
  
  try {
    // 1. 生成课程数据
    console.log('📚 生成课程数据...');
    const courses = await generateKhanAcademyCourses();
    console.log(`✅ 生成了 ${courses.length} 个课程\n`);
    
    // 2. 显示课程摘要
    console.log('📋 课程摘要:');
    courses.forEach((course, index) => {
      console.log(`   ${index + 1}. ${course.title}`);
    });
    console.log('');
    
    // 3. 保存到文件
    console.log(`💾 保存课程数据...`);
    await saveCourses(courses);
    
    console.log('\n✅ 测试完成！');
    console.log('\n📊 统计信息:');
    console.log(`   总课程数: ${courses.length}`);
    
  } catch (error) {
    console.error('❌ 测试失败:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

testKhanAcademyCrawler();
