import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 定义爬虫配置接口
interface CrawlerConfig {
  id: string;
  name: string;
  description?: string;
  target_url?: string;
  type?: string;
  grade_level?: string;
  output_file?: string;
  status?: string;
  progress?: number;
  total_items?: number;
  scraped_items?: number;
  last_run?: string | null;
  error_message?: string | null;
}

// 定义平台信息接口
interface PlatformInfo {
  id: string;
  platform_name: string;
  source: string;
  target_url: string;
  type: string;
  output_file: string;
  status: string;
  last_run?: string | null;
  total_items: number;
  error_message?: string | null;
}

/**
 * GET /api/v1/admin/education-platforms
 * 获取已注册的教育平台列表
 */
export async function GET() {
  try {
    // 从爬虫配置中提取平台信息
    const crawlerConfigPath = path.join(process.cwd(), '..', 'data', 'crawler_configs.json');
    let platforms: PlatformInfo[] = [];

    if (fs.existsSync(crawlerConfigPath)) {
      const crawlerConfigs: CrawlerConfig[] = JSON.parse(fs.readFileSync(crawlerConfigPath, 'utf-8'));
      
      // 从爬虫配置中提取唯一的平台/来源
      const platformMap = new Map<string, PlatformInfo>();
      
      crawlerConfigs.forEach((config: CrawlerConfig) => {
        // 从爬虫名称或输出文件中提取平台名称
        let platformName = config.name || '';
        
        // 尝试从 output_file 提取平台名
        if (config.output_file) {
          const fileName = path.basename(config.output_file, '.json');
          // 移除 _courses, _tutorials, _units 等后缀
          platformName = fileName.replace(/_(courses|tutorials|units|textbooks|materials|questions)$/i, '');
          // 转换为更易读的名称
          platformName = platformName
            .split('_')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }
        
        if (!platformMap.has(platformName)) {
          platformMap.set(platformName, {
            id: config.id,
            platform_name: platformName,
            source: config.name,
            target_url: config.target_url || '',
            type: config.type || 'course',
            output_file: config.output_file || '',
            status: config.status || 'idle',
            last_run: config.last_run,
            total_items: config.total_items || 0,
            error_message: config.error_message,
          });
        }
      });
      
      platforms = Array.from(platformMap.values());
    }

    return NextResponse.json({
      success: true,
      data: platforms,
      total: platforms.length,
    });
  } catch (error: unknown) {
    console.error('Get education platforms error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '服务器错误', 
        message: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
