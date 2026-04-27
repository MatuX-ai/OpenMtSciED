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
    const courses = generateKhanAcademyCourses();
    console.log(`✅ 生成了 ${courses.length} 个课程\n`);
    
    // 2. 显示课程摘要
    console.log('📋 课程摘要:');
    courses.forEach((course, index) => {
      console.log(`   ${index + 1}. ${course.title} (${course.grade_level})`);
    });
    console.log('');
    
    // 3. 保存到文件
    const outputFile = path.join(process.cwd(), 'data', 'course_library', 'khan_academy_courses_test.json');
    console.log(`💾 保存到: ${outputFile}`);
    await saveCourses(courses, outputFile);
    
    console.log('\n✅ 测试完成！');
    console.log('\n📊 统计信息:');
    console.log(`   总课程数: ${courses.length}`);
    
    const bySubject = courses.reduce((acc, course) => {
      acc[course.subject] = (acc[course.subject] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('   按学科分类:');
    Object.entries(bySubject).forEach(([subject, count]) => {
      console.log(`     - ${subject}: ${count}`);
    });
    
    const byGrade = courses.reduce((acc, course) => {
      acc[course.grade_level] = (acc[course.grade_level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('   按年级分类:');
    Object.entries(byGrade).forEach(([grade, count]) => {
      console.log(`     - ${grade}: ${count}`);
    });
    
  } catch (error) {
    console.error('❌ 测试失败:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

testKhanAcademyCrawler();
