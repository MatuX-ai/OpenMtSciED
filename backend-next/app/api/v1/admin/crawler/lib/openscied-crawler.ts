/**
 * OpenSciEd 爬虫
 * 从现有数据文件加载 OpenSciEd 教学单元
 */

import { registerCrawler } from './registry';
import type { CrawlerConfig, CrawlResult } from './types';
import { loadJsonFile, createSuccessResult, createErrorResult } from './utils';

async function crawlOpenSciEd(config: CrawlerConfig): Promise<CrawlResult> {
  try {
    console.log('[OpenSciEd] Starting crawler...');
    
    // 根据配置确定年级水平
    const gradeLevel = (config.grade_level as string) || 'middle';
    
    // 确定输出文件路径
    let outputFile = config.output_file;
    if (!outputFile) {
      // 默认文件路径
      const fileMap: Record<string, string> = {
        elementary: 'course_library/openscied_elementary_units.json',
        middle: 'course_library/openscied_middle_units.json',
        high: 'course_library/openscied_high_school_units.json',
        all: 'course_library/openscied_all_units.json',
      };
      outputFile = fileMap[gradeLevel] || fileMap.middle;
    }
    
    // 加载现有数据
    const data = loadJsonFile(outputFile);
    
    if (data.length === 0) {
      console.warn(`[OpenSciEd] No data found in ${outputFile}`);
      return createSuccessResult(0, 0, []);
    }
    
    console.log(`[OpenSciEd] Loaded ${data.length} units from ${outputFile}`);
    
    return createSuccessResult(data.length, data.length, data);
  } catch (error: unknown) {
    console.error('[OpenSciEd] Crawler error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResult(errorMessage);
  }
}

// 注册爬虫
registerCrawler(
  'openscied_units',
  'OpenSciEd Units',
  crawlOpenSciEd,
  '爬取 OpenSciEd 教学单元（6-8年级及高中）'
);

console.log('[OpenSciEd] Crawler registered');
