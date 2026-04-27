import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface CourseTutorial {
  course_id?: string;
  title: string;
  description?: string;
  source?: string;
  subject?: string;
  level?: string;
  url?: string;
  thumbnail?: string;
  duration?: string;
  instructor?: string;
  _source_file?: string;
  [key: string]: unknown;
}

const DATA_DIR = path.join(process.cwd(), '..', 'data');
const COURSE_LIBRARY_DIR = path.join(DATA_DIR, 'course_library');

/**
 * 加载JSON文件
 */
function loadJsonFiles(dir: string): CourseTutorial[] {
  const allData: CourseTutorial[] = [];
  
  if (!fs.existsSync(dir)) {
    console.warn(`Directory not found: ${dir}`);
    return allData;
  }

  const files = fs.readdirSync(dir).filter(f => 
    f.endsWith('.json') && 
    !f.includes('complete') && 
    !f.includes('validated') // 排除合并文件，避免重复
  );
  
  for (const filename of files) {
    try {
      const filePath = path.join(dir, filename);
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      // 如果数据是数组，直接添加；如果是对象且有data字段，添加data数组
      if (Array.isArray(data)) {
        allData.push(...data.map((item: CourseTutorial) => ({ ...item, _source_file: filename })));
      } else if (data.data && Array.isArray(data.data)) {
        allData.push(...data.data.map((item: CourseTutorial) => ({ ...item, _source_file: filename })));
      } else {
        // 单个对象
        allData.push({ ...(data as CourseTutorial), _source_file: filename });
      }
    } catch (e) {
      console.error(`Failed to load file ${filename}:`, e);
    }
  }
  
  return allData;
}

/**
 * GET /api/v1/libraries/tutorials
 * 获取教程列表
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip') || '0');
    const limit = parseInt(searchParams.get('limit') || '50');
    const source = searchParams.get('source');
    const subject = searchParams.get('subject');
    const search = searchParams.get('search');

    // 加载所有教程数据
    const tutorials = loadJsonFiles(COURSE_LIBRARY_DIR);
    
    // 筛选
    let filtered = tutorials;
    
    if (source) {
      filtered = filtered.filter(t => t.source === source || (t._source_file && t._source_file.includes(source)));
    }
    
    if (subject) {
      filtered = filtered.filter(t => t.subject === subject);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(t => 
        String(t.title || '').toLowerCase().includes(searchLower) || 
        String(t.description || '').toLowerCase().includes(searchLower)
      );
    }
    
    // 先过滤出真正的教程（有 tutorial_id 或 unit_id 的数据）
    filtered = filtered.filter(t => t.tutorial_id || t.unit_id);
    
    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limit);
    
    return NextResponse.json({
      success: true,
      data: paginated,
      total,
      skip,
      limit
    });
  } catch (error: unknown) {
    console.error('Get tutorials error:', error);
    return NextResponse.json(
      { success: false, error: '服务器错误', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
