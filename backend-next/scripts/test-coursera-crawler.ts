#!/usr/bin/env node
/**
 * 测试 Coursera 爬虫
 */

import { generateCourseraCourses, saveCourses } from '../lib/crawlers/coursera-crawler';
import * as path from 'path';

async function testCourseraCrawler() {
  console.log('🧪 测试 Coursera 爬虫...\n');
  
  try {
    // 1. 生成课程数据
    console.log('📚 生成Coursera大学课程数据...');
    const courses = generateCourseraCourses();
    console.log(`✅ 生成了 ${courses.length} 个课程\n`);
    
    // 2. 显示课程摘要
    console.log('📋 课程摘要:');
    courses.forEach((course, index) => {
      console.log(`   ${index + 1}. ${course.title} (${course.subject}) - ${course.duration_weeks}周`);
    });
    console.log('');
    
    // 3. 保存到文件
    const outputFile = path.join(process.cwd(), 'data', 'course_library', 'coursera_courses_test.json');
    console.log(`💾 保存到: ${outputFile}`);
    await saveCourses(courses, outputFile);
    
    console.log('\n✅ 测试完成！');
    console.log('\n📊 统计信息:');
    console.log(`   总课程数: ${courses.length}`);
    
    // 按学科统计
    const bySubject = courses.reduce((acc, course) => {
      acc[course.subject] = (acc[course.subject] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('   按学科分类:');
    Object.entries(bySubject).forEach(([subject, count]) => {
      console.log(`     - ${subject}: ${count} 个课程`);
    });
    
    // 计算平均时长
    const avgDuration = courses.reduce((sum, course) => sum + course.duration_weeks, 0) / courses.length;
    console.log(`   平均时长: ${avgDuration.toFixed(1)} 周`);
    
    // 显示知识要点总数
    const totalKPs = courses.reduce((sum, course) => sum + course.knowledge_points.length, 0);
    console.log(`   知识要点总数: ${totalKPs} 个`);
    
  } catch (error) {
    console.error('❌ 测试失败:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

testCourseraCrawler();
