#!/usr/bin/env node
/**
 * 测试 OpenSciEd 爬虫
 */

import { generateOpenSciEdUnits, saveUnits } from '../app/lib/crawlers/openscied-crawler';
import path from 'path';

async function testOpenSciEdCrawler() {
  console.log('🧪 测试 OpenSciEd 爬虫...\n');
  
  try {
    // 1. 生成单元数据
    console.log('📚 生成OpenSciEd科学探究单元...');
    const units = generateOpenSciEdUnits();
    console.log(`✅ 生成了 ${units.length} 个单元\n`);
    
    // 2. 显示单元摘要
    console.log('📋 单元摘要:');
    units.forEach((unit, index) => {
      console.log(`   ${index + 1}. ${unit.title} (${unit.grade_level}/${unit.subject}) - ${unit.duration_weeks}周`);
    });
    console.log('');
    
    // 3. 保存到文件
    const outputFile = path.join(process.cwd(), 'data', 'course_library', 'openscied_units_test.json');
    console.log(`💾 保存到: ${outputFile}`);
    await saveUnits(units, outputFile);
    
    console.log('\n✅ 测试完成！');
    console.log('\n📊 统计信息:');
    console.log(`   总单元数: ${units.length}`);
    
    // 按年级统计
    const byGrade = units.reduce((acc, unit) => {
      acc[unit.grade_level] = (acc[unit.grade_level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('   按年级分类:');
    Object.entries(byGrade).forEach(([grade, count]) => {
      console.log(`     - ${grade}: ${count} 个单元`);
    });
    
    // 按学科统计
    const bySubject = units.reduce((acc, unit) => {
      acc[unit.subject] = (acc[unit.subject] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('   按学科分类:');
    Object.entries(bySubject).forEach(([subject, count]) => {
      console.log(`     - ${subject}: ${count} 个单元`);
    });
    
    // 计算知识要点总数
    const totalKPs = units.reduce((sum, unit) => sum + unit.knowledge_points.length, 0);
    console.log(`   知识要点总数: ${totalKPs} 个`);
    
    // 实验项目总数
    const totalExperiments = units.reduce((sum, unit) => sum + unit.experiments.length, 0);
    console.log(`   实验项目总数: ${totalExperiments} 个`);
    
  } catch (error) {
    console.error('❌ 测试失败:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

testOpenSciEdCrawler();
