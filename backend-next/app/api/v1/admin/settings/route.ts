import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SETTINGS_DIR = path.join(process.cwd(), '..', 'data');
const SETTINGS_FILE = path.join(SETTINGS_DIR, 'system_settings.json');

/**
 * GET /api/v1/admin/settings
 * 获取系统设置
 */
export async function GET() {
  try {
    let settings: any = {};
    
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      settings = JSON.parse(data);
    } else {
      // 从环境变量获取默认配置
      const databaseUrl = process.env.DATABASE_URL || '';
      const neo4jUri = process.env.NEO4J_URI || 'neo4j+s://4abd5ef9.databases.neo4j.io';
      
      settings = {
        ai_service: {
          enabled: false,
          provider: 'openai',
          api_key: '',
          model: 'gpt-3.5-turbo',
          base_url: 'https://api.openai.com/v1'
        },
        database: {
          neon_host: databaseUrl ? new URL(databaseUrl).hostname : 'ep-raspy-shape-ao7ool7u-pooler.c-2.ap-southeast-1.aws.neon.tech',
          neon_port: 5432,
          neon_name: 'neondb',
          neon_user: 'neondb_owner',
          neon_password: '',
          neo4j_uri: neo4jUri,
          neo4j_username: process.env.NEO4J_USERNAME || '4abd5ef9',
          neo4j_password: ''
        },
        storage: {
          type: 'local',
          path: '/data/storage'
        }
      };
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    console.error('Get settings error:', error);
    return NextResponse.json({ error: '服务器错误', message: error.message }, { status: 500 });
  }
}

/**
 * POST /api/v1/admin/settings
 * 更新系统设置
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 确保目录存在
    if (!fs.existsSync(SETTINGS_DIR)) {
      fs.mkdirSync(SETTINGS_DIR, { recursive: true });
    }

    // 合并现有设置
    let currentSettings: any = {};
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      currentSettings = JSON.parse(data);
    }
    
    const updatedSettings = { ...currentSettings, ...body };
    
    // 保存设置
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updatedSettings, null, 2), 'utf-8');

    return NextResponse.json({ success: true, message: '设置已保存', data: updatedSettings });
  } catch (error: any) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: '服务器错误', message: error.message }, { status: 500 });
  }
}
