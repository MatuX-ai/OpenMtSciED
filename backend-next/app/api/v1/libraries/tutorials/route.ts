import { NextResponse } from 'next/server';
import { filterOutK12Academic } from '@/lib/k12-filter';
import { loadJsonFiles, COURSE_LIBRARY_DIR } from '@/lib/library-data';

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

// 排除合并数据文件（避免与原始数据重复）
const EXCLUDED_FILES = [
  'complete_stem_library.json',
  'validated_stem_library.json',
  'stem_complete_with_robotics.json',
  'stem_comprehensive_courses.json',
];

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
    const tutorials = loadJsonFiles<CourseTutorial>(COURSE_LIBRARY_DIR, [], EXCLUDED_FILES);
    
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
    
    // 先过滤出真正的教程（有 tutorial_id/unit_id/course_id 的数据）
    filtered = filtered.filter(t => t.tutorial_id || t.unit_id || t.course_id || t.id);
    
    // 过滤 K12 学科类课程
    filtered = filterOutK12Academic(filtered);
    
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
