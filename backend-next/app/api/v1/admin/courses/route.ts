import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface CourseData {
  id?: string;
  course_id?: string;
  title: string;
  subject?: string;
  category?: string;
  level?: string;
  grade_level?: string;
  source?: string;
  description?: string;
  url?: string;
  duration_minutes?: number;
  duration_hours?: number;
  complexity?: string;
  _source_file?: string;
  [key: string]: unknown;
}

/**
 * 从 course_library 目录加载所有课程数据
 */
function loadCourses(): CourseData[] {
  // 尝试多个可能的路径来找到课程数据
  const possiblePaths = [
    path.join(process.cwd(), 'data', 'course_library'),  // backend-next/data/course_library
    path.join(process.cwd(), '..', 'data', 'course_library'),  // backend-next/../data/course_library (项目根目录)
    path.join(__dirname, '..', '..', '..', '..', '..', 'data', 'course_library')  // 从当前文件位置向上查找
  ];
  
  let courseDir = '';
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      courseDir = testPath;
      break;
    }
  }
  
  if (!courseDir) {
    console.warn(`Course library directory not found in any of the expected locations:`, possiblePaths);
    return [];
  }

  const allCourses: CourseData[] = [];

  const files = fs.readdirSync(courseDir).filter(f => 
    f.endsWith('.json') && 
    !f.includes('complete') && 
    !f.includes('validated') // 排除合并文件，避免重复
  );

  for (const filename of files) {
    try {
      const filePath = path.join(courseDir, filename);
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);

      if (Array.isArray(data)) {
        allCourses.push(...data.map((item: CourseData) => ({
          ...item,
          _source_file: filename
        })));
      } else if (data.courses && Array.isArray(data.courses)) {
        allCourses.push(...data.courses.map((item: CourseData) => ({
          ...item,
          _source_file: filename
        })));
      } else if (data.data && Array.isArray(data.data)) {
        allCourses.push(...data.data.map((item: CourseData) => ({
          ...item,
          _source_file: filename
        })));
      } else {
        allCourses.push({
          ...(data as CourseData),
          _source_file: filename
        });
      }
    } catch (e) {
      console.error(`Failed to load course file ${filename}:`, e);
    }
  }

  return allCourses;
}

/**
 * GET /api/v1/admin/courses
 * 获取课程列表（从文件系统读取）
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip') || '0');
    const limit = parseInt(searchParams.get('limit') || '50');
    const source = searchParams.get('source');
    const subject = searchParams.get('subject');
    const level = searchParams.get('level');
    const search = searchParams.get('search');

    // 加载所有课程
    let courses = loadCourses();

    // 筛选
    if (source) {
      courses = courses.filter(c => 
        c.source?.toLowerCase().includes(source.toLowerCase()) ||
        c._source_file?.toLowerCase().includes(source.toLowerCase())
      );
    }

    if (subject) {
      courses = courses.filter(c => 
        c.subject?.toLowerCase().includes(subject.toLowerCase()) ||
        c.category?.toLowerCase().includes(subject.toLowerCase())
      );
    }

    if (level) {
      courses = courses.filter(c => 
        c.level === level || 
        c.grade_level === level
      );
    }

    if (search) {
      const query = search.toLowerCase();
      courses = courses.filter(c =>
        c.title?.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query) ||
        c.subject?.toLowerCase().includes(query)
      );
    }

    // 先过滤出真正的课程（有 course_id 的数据）
    courses = courses.filter(c => c.course_id || c.id);

    // 分页
    const total = courses.length;
    const paginatedCourses = courses.slice(skip, skip + limit);

    // 格式化响应
    const formattedCourses = paginatedCourses.map(course => ({
      id: course.id || course.course_id || '',
      title: course.title,
      subject: course.subject || course.category || '未分类',
      level: course.level || course.grade_level || 'unknown',
      source: course.source || '未知来源',
      description: course.description || '',
      url: course.url || '',
      duration_minutes: course.duration_minutes || (course.duration_hours ? course.duration_hours * 60 : 60),
      complexity: course.complexity || 'medium',
      created_at: new Date().toISOString()
    }));

    return NextResponse.json({
      success: true,
      data: formattedCourses,
      total,
      skip,
      limit
    });
  } catch (error: unknown) {
    console.error('Get courses error:', error);
    return NextResponse.json(
      { success: false, error: '服务器错误', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
