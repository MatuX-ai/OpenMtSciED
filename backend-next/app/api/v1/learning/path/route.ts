/**
 * @deprecated 此端点将在后续版本废弃。
 * 学习路径依赖查询已迁移至 PostgreSQL 闭包表:
 *   - GET /api/v1/learning-path/prerequisites/:conceptId  (前置依赖)
 *   - GET /api/v1/learning-path/successors/:conceptId    (后续可学)
 *   - GET /api/v1/learning-path/route                     (完整路径)
 *
 * 当前保留此端点以兼容前端，使用 PostgreSQL 闭包表查询。
 */

import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';
import prisma from '@/lib/db';
import { findRoute } from '@/lib/concept-path';

/**
 * GET /api/v1/learning/path
 * 获取个性化学习路径
 * 使用 PostgreSQL 闭包表查询
 */
export async function GET(request: Request) {
  try {
    // 验证用户身份
    const authHeader = request.headers.get('authorization') || undefined;
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token 无效' }, { status: 401 });
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject') || '';
    const grade = searchParams.get('grade') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    // PostgreSQL 闭包表查询
    const whereSubject = subject ? `AND c.name ILIKE '%${subject.replace(/'/g, "''")}%'` : '';
    const closureResult = await prisma.$queryRaw<Array<{
      id: number;
      name: string;
      description: string | null;
      depth: number;
    }>>`
      SELECT c.id, c.name, c.description, cp.depth
      FROM concept_path cp
      JOIN concept c ON cp.descendant_id = c.id
      WHERE cp.path_type = 'required'
        AND cp.depth > 0
        ${Prisma.raw(whereSubject)}
      ORDER BY cp.depth ASC
      LIMIT ${limit}::int
    `;

    const learningPath = closureResult.map((row) => ({
      id: row.id,
      title: row.name,
      description: row.description,
      subject: subject || 'all',
      grade: grade || 'all',
      difficulty: row.depth > 3 ? 'advanced' : row.depth > 1 ? 'intermediate' : 'beginner',
      depth: Number(row.depth),
      hasPrerequisites: true,
    }));

    return NextResponse.json({
      learning_path: learningPath,
      total: learningPath.length,
      filters: {
        subject: subject || 'all',
        grade: grade || 'all',
      },
      source: 'postgresql_closure',
    });
  } catch (error: unknown) {
    console.error('Get learning path error:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: '服务器错误', message: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/learning/path/generate
 * 重新生成学习路径
 * 使用 PostgreSQL 闭包表 findRoute
 */
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || undefined;
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token 无效' }, { status: 401 });
    }

    const body = await request.json();
    const { targetSubject, targetGrade, maxSteps = 5 } = body;

    // PostgreSQL 闭包表查询
    const endpoints = await prisma.$queryRaw<Array<{ ancestor_id: number; descendant_id: number; depth: number }>>`
      SELECT ancestor_id, descendant_id, depth
      FROM concept_path
      WHERE path_type = 'required'
        AND depth > 0
        AND depth <= ${maxSteps}
      ORDER BY depth DESC
      LIMIT 1
    `;

    if (endpoints.length > 0) {
      const ep = endpoints[0];
      const route = await findRoute(
        Number(ep.ancestor_id),
        Number(ep.descendant_id),
        'required'
      );

      if (route) {
        return NextResponse.json({
          generated_path: route.concepts.map((c) => ({
            id: c.id,
            title: c.name,
            subject: targetSubject || 'all',
            difficulty: 'adaptive',
          })),
          steps: route.depth,
          source: 'postgresql_closure',
        });
      }
    }

    // 无可用路径数据时返回空结果
    return NextResponse.json({
      generated_path: [],
      steps: 0,
      source: 'postgresql_closure',
      message: 'No learning path data available for the specified parameters',
    });
  } catch (error: unknown) {
    console.error('Generate path error:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: '服务器错误', message: errorMessage },
      { status: 500 }
    );
  }
}
