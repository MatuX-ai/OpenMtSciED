import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

/**
 * POST /api/v1/admin/graph/query
 * 执行自定义 SQL 查询（管理员，只读）
 */
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || undefined;
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
    }

    const body = await request.json();
    const { sql, params = [] } = body;

    if (!sql) {
      return NextResponse.json({ error: '缺少 SQL 查询语句' }, { status: 400 });
    }

    // 安全限制：只允许 SELECT 查询
    const trimmedSql = sql.trim().toLowerCase();
    if (!trimmedSql.startsWith('select')) {
      return NextResponse.json(
        { error: '仅支持 SELECT 查询，不允许修改操作' },
        { status: 403 }
      );
    }

    // 禁止危险操作
    const forbidden = ['insert', 'update', 'delete', 'drop', 'alter', 'truncate', 'create'];
    for (const keyword of forbidden) {
      if (trimmedSql.includes(keyword)) {
        return NextResponse.json(
          { error: `不允许包含 ${keyword} 操作` },
          { status: 403 }
        );
      }
    }

    const results = await prisma.$queryRawUnsafe(sql, ...params);

    return NextResponse.json({
      results,
      count: Array.isArray(results) ? results.length : 0,
    });
  } catch (error: unknown) {
    console.error('Graph query error:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: '查询失败', message: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/admin/graph/stats
 * 获取知识图谱统计信息
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || undefined;
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
    }

    const [courses, questions, users, concepts, dependencies, tutorials, coursewares, hardwareProjects] = await Promise.all([
      prisma.course.count(),
      prisma.question.count(),
      prisma.user.count(),
      prisma.concept.count(),
      prisma.conceptDependency.count(),
      prisma.tutorial.count(),
      prisma.courseware.count(),
      prisma.hardwareProject.count(),
    ]);

    return NextResponse.json({
      statistics: {
        courses,
        questions,
        users,
        concepts,
        dependencies,
        tutorials,
        coursewares,
        hardware_projects: hardwareProjects,
      },
    });
  } catch (error: unknown) {
    console.error('Graph stats error:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: '服务器错误', message: errorMessage },
      { status: 500 }
    );
  }
}
