import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface CrawlerConfig {
  id: string;
  name: string;
  description?: string;
  target_url?: string;
  type?: string;
  output_file?: string;
  status?: string;
  progress?: number;
  total_items?: number;
  scraped_items?: number;
  last_run?: string | null;
  error_message?: string | null;
  [key: string]: unknown;
}

const DATA_DIR = path.join(process.cwd(), '..', 'data');
const CRAWLER_CONFIGS_FILE = path.join(DATA_DIR, 'crawler_configs.json');

/**
 * POST /api/v1/education-platforms/generate
 * 生成教育平台数据（触发爬虫）
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const platformName = body.platform_name;

    // 加载爬虫配置
    let configs: CrawlerConfig[] = [];
    if (fs.existsSync(CRAWLER_CONFIGS_FILE)) {
      const data = fs.readFileSync(CRAWLER_CONFIGS_FILE, 'utf-8');
      configs = JSON.parse(data);
    }

    // 如果指定了平台名称，只生成该平台的数据
    let targetConfigs = configs;
    if (platformName) {
      targetConfigs = configs.filter(c => 
        c.name.toLowerCase().includes(platformName.toLowerCase()) ||
        c.id.toLowerCase().includes(platformName.toLowerCase())
      );
    }

    if (targetConfigs.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: '未找到匹配的平台配置',
          message: platformName ? `未找到平台: ${platformName}` : '没有可用的平台配置'
        },
        { status: 404 }
      );
    }

    // 更新配置状态为 pending
    const updatedConfigs = configs.map(config => {
      const isTarget = targetConfigs.some(tc => tc.id === config.id);
      if (isTarget) {
        return {
          ...config,
          status: 'pending',
          progress: 0,
          last_run: new Date().toISOString(),
          error_message: null
        };
      }
      return config;
    });

    // 保存更新后的配置
    fs.writeFileSync(CRAWLER_CONFIGS_FILE, JSON.stringify(updatedConfigs, null, 2), 'utf-8');

    // TODO: 这里应该异步触发实际的爬虫任务
    // 目前只是更新状态，实际爬虫需要在后台运行
    console.log(`开始生成 ${targetConfigs.length} 个平台的数据`);
    targetConfigs.forEach(config => {
      console.log(`- ${config.name} (${config.id})`);
    });

    return NextResponse.json({
      success: true,
      message: `已开始生成 ${targetConfigs.length} 个平台的数据`,
      data: {
        platforms: targetConfigs.map(c => ({
          id: c.id,
          name: c.name,
          status: 'pending'
        })),
        totalPlatforms: targetConfigs.length
      }
    });
  } catch (error: unknown) {
    console.error('Generate education platforms error:', error);
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
