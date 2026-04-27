/**
 * 教育平台状态管理
 */

import type { PlatformStatus } from './types';
import { loadConfigs } from './config';
import { fileExists, getFileSize } from './utils';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), '..', 'data');

/**
 * 获取所有教育平台的状态
 */
export function getPlatformStatus(): PlatformStatus[] {
  const configs = loadConfigs();
  const platforms: PlatformStatus[] = [];
  
  for (const config of configs) {
    // 检查数据文件是否存在
    let fileExistsFlag = false;
    let fileSize: number | null = null;
    
    if (config.output_file) {
      let outputFile = config.output_file;
      
      // 如果是相对路径，转换为绝对路径
      if (!path.isAbsolute(outputFile)) {
        if (outputFile.includes('course_library')) {
          outputFile = path.join(DATA_DIR, 'course_library', path.basename(outputFile));
        } else if (outputFile.includes('textbook_library')) {
          outputFile = path.join(DATA_DIR, 'textbook_library', path.basename(outputFile));
        } else {
          outputFile = path.join(DATA_DIR, path.basename(outputFile));
        }
      }
      
      fileExistsFlag = fileExists(outputFile);
      fileSize = getFileSize(outputFile);
    }
    
    platforms.push({
      platform_name: config.name,
      registered: true,
      schedule: {
        interval: config.schedule_interval || 'manual',
        day: 'every',
        time: '00:00',
      },
      data_file_exists: fileExistsFlag,
      last_updated: config.last_run,
      file_size: fileSize,
    });
  }
  
  return platforms;
}
