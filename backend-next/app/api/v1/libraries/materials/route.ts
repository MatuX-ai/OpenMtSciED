import { NextResponse } from 'next/server';
import { filterOutK12Academic } from '@/lib/k12-filter';
import { loadJsonFiles, TEXTBOOK_LIBRARY_DIR } from '@/lib/library-data';

interface TextbookMaterial {
  chapter_id?: string;
  title: string;
  textbook?: string;
  source?: string;
  grade_level?: string;
  subject?: string;
  chapter_url?: string;
  pdf_download_url?: string;
  download_url?: string;
  key_concepts?: string[];
  _source_file?: string;
  [key: string]: unknown; // 允许其他属性
}

/**
 * GET /api/v1/libraries/materials
 * 获取课件列表
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip') || '0');
    const limit = parseInt(searchParams.get('limit') || '50');
    const source = searchParams.get('source');
    const subject = searchParams.get('subject');
    const gradeLevel = searchParams.get('grade_level');
    const materialType = searchParams.get('material_type'); // 新增：课件类型筛选
    const search = searchParams.get('search');

    // 加载所有课件数据
    const materials = loadJsonFiles<TextbookMaterial>(TEXTBOOK_LIBRARY_DIR);
    
    // 筛选
    let filtered = materials;
    
    // 按课件类型筛选
    if (materialType) {
      if (materialType === 'k12') {
        // K-12 课件：排除 university
        filtered = filtered.filter(m => m.grade_level !== 'university');
      } else if (materialType === 'university') {
        // 大学教材
        filtered = filtered.filter(m => m.grade_level === 'university');
      }
    }
    
    if (source) {
      filtered = filtered.filter(m => m.source === source);
    }
    
    if (subject) {
      filtered = filtered.filter(m => m.subject === subject);
    }
    
    if (gradeLevel) {
      filtered = filtered.filter(m => m.grade_level === gradeLevel);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(m => 
        String(m.title || '').toLowerCase().includes(searchLower) || 
        String(m.textbook || '').toLowerCase().includes(searchLower)
      );
    }
    
    // 过滤 K12 学科类课程
    filtered = filterOutK12Academic(filtered);
    
    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limit);
    
    // 统一下载链接字段名
    paginated.forEach(item => {
      if ('download_url' in item && !('pdf_download_url' in item)) {
        item.pdf_download_url = item.download_url;
      }
    });
    
    return NextResponse.json({
      success: true,
      data: paginated,
      total,
      skip,
      limit
    });
  } catch (error: unknown) {
    console.error('Get materials error:', error);
    return NextResponse.json(
      { success: false, error: '服务器错误', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
