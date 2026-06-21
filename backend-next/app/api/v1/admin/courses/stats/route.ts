import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * GET /api/v1/admin/courses/stats
 * 获取课程统计信息（从 PostgreSQL 数据库读取）
 */
export async function GET() {
  try {
    const [
      total,
      elementary,
      middle,
      high,
      university,
      otherLevel,
      questions,
    ] = await Promise.all([
      prisma.course.count(),
      prisma.course.count({ where: { gradeLevel: 'elementary' } }),
      prisma.course.count({ where: { gradeLevel: 'middle' } }),
      prisma.course.count({ where: { gradeLevel: 'high' } }),
      prisma.course.count({ where: { gradeLevel: 'university' } }),
      prisma.course.count({
        where: {
          gradeLevel: { notIn: ['elementary', 'middle', 'high', 'university'] },
        },
      }),
      prisma.question.count(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        total,
        elementary,
        middle,
        high,
        university,
        other: otherLevel,
        questions,
      },
    });
  } catch (error: unknown) {
    console.error('Get course stats error:', error);
    return NextResponse.json(
      { success: false, error: '获取课程统计失败', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
