#!/usr/bin/env node
/**
 * 测试 BNU Shanghai 爬虫
 */

import { generateBNUCourses, saveCourses } from '../app/lib/crawlers/bnu-shanghai-crawler';
import path from 'path';

async function testBNUCrawler() {
  console.log('🧪 测试 BNU Shanghai 爬虫...\n');
  
  try {
    console.log('📚 生成BNU和上海K12课程数据...');
    const courses = generateBNUCourses();
    console.log(`✅ 生成了 ${courses.length} 个课程\n`);
    
    console.log('📋 课程摘要（前10个）:');
    courses.slice(0, 10).forEach((course, index) => {
      console.log(`   ${index + 1}. ${course.title} (${course.grade_level})`);
    });
    if (courses.length > 10) {
      console.log(`   ... 还有 ${courses.length - 10} 个课程`);
    }
    console.log('');
    
    const outputFile = path.join(process.cwd(), 'data', 'course_library', 'bnu_shanghai_courses_test.json');
    console.log(`💾 保存到: ${outputFile}`);
    await saveCourses(courses, outputFile);
    
    console.log('\n✅ 测试完成！');
    console.log('\n📊 统计信息:');
    console.log(`   总课程数: ${courses.length}`);
    
    const bySource = courses.reduce((acc, course) => {
      acc[course.source] = (acc[course.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('   按来源分类:');
    Object.entries(bySource).forEach(([source, count]) => {
      console.log(`     - ${source}: ${count} 个课程`);
    });
    
    const byGrade = courses.reduce((acc, course) => {
      acc[course.grade_level] = (acc[course.grade_level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('   按年级分类:');
    Object.entries(byGrade).forEach(([grade, count]) => {
      console.log(`     - ${grade}: ${count} 个课程`);
    });
    
    const bySubject = courses.reduce((acc, course) => {
      acc[course.subject] = (acc[course.subject] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('   按学科分类:');
    Object.entries(bySubject).forEach(([subject, count]) => {
      console.log(`     - ${subject}: ${count} 个课程`);
    });
    
  } catch (error) {
    console.error('❌ 测试失败:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

testBNUCrawler();
