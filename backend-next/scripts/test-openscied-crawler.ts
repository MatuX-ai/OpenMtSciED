#!/usr/bin/env node
/**
 * 测试 OpenSciEd 爬虫
 */

import { generateOpenSciEdUnits, saveUnits } from '../lib/crawlers/openscied-crawler';

async function testOpenSciEdCrawler() {
  console.log('🧪 测试 OpenSciEd 爬虫...\n');
  
  try {
    // 1. 生成单元数据
    console.log('📚 生成OpenSciEd科学探究单元...');
    const units = await generateOpenSciEdUnits();
    console.log(`✅ 生成了 ${units.length} 个单元\n`);
    
    // 2. 显示单元摘要
    console.log('📋 单元摘要:');
    units.forEach((unit, index) => {
      console.log(`   ${index + 1}. ${unit.title}`);
    });
    console.log('');
    
    // 3. 保存到文件
    console.log(`💾 保存单元数据...`);
    await saveUnits(units);
    
    console.log('\n✅ 测试完成！');
    console.log('\n📊 统计信息:');
    console.log(`   总单元数: ${units.length}`);
    
  } catch (error) {
    console.error('❌ 测试失败:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

testOpenSciEdCrawler();
