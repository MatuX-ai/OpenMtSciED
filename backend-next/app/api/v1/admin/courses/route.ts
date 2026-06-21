import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * GET /api/v1/admin/courses
 * 获取课程列表（从 PostgreSQL 数据库读取）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip') || '0');
    const limit = parseInt(searchParams.get('limit') || '50');
    const source = searchParams.get('source');
    const subject = searchParams.get('subject');
    const level = searchParams.get('level');
    const search = searchParams.get('search');

    // 构建查询条件
    const where: Record<string, unknown> = {};
    const filters: Record<string, unknown>[] = [];

    if (source) {
      filters.push({ source: { contains: source, mode: 'insensitive' as const } });
    }

    if (subject) {
      filters.push({ subject: { contains: subject, mode: 'insensitive' as const } });
    }

    if (level) {
      filters.push({ gradeLevel: level });
    }

    if (search) {
      filters.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
          { subject: { contains: search, mode: 'insensitive' as const } },
        ],
      });
    }

    if (filters.length === 1) {
      Object.assign(where, filters[0]);
    } else if (filters.length > 1) {
      where['AND'] = filters;
    }

    // 并行查询总数和分页数据
    const [total, courses] = await Promise.all([
      prisma.course.count({ where: where as any }),
      prisma.course.findMany({
        where: where as any,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // 格式化响应
    const formattedCourses = courses.map(course => ({
      id: course.courseId || String(course.id),
      title: course.title,
      subject: course.subject || '未分类',
      level: course.gradeLevel || 'unknown',
      source: course.source || '未知来源',
      description: course.description || '',
      url: course.url || '',
      duration_minutes: course.durationMinutes || 60,
      complexity: course.complexity || 'medium',
      created_at: course.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: formattedCourses,
      total,
      skip,
      limit,
    });
  } catch (error: unknown) {
    console.error('Get courses error:', error);
    return NextResponse.json(
      { success: false, error: '服务器错误', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
