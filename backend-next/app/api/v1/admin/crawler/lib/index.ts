/**
 * 爬虫模块索引
 */

// 先导入所有爬虫（触发注册）
import './openscied-crawler';
import './openstax-crawler';
import './khan-crawler';
import './coursera-crawler';
import './bnu-crawler';

// 然后导出其他模块
export * from './types';
export * from './registry';
export * from './config';
export * from './utils';
export * from './executor';
export * from './scheduler';
export * from './platforms';
