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
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, current_grade, subjects } = body;

    if (!user_id || !current_grade || !subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, current_grade, subjects (array)' },
        { status: 400 }
      );
    }

    // PostgreSQL 闭包表查询
    try {
      const { Prisma } = await import('@prisma/client');
      const subjectFilter = subjects.length > 0
        ? `AND c.name ILIKE '%${subjects.map((s: string) => s.replace(/'/g, "''")).join("%' OR c.name ILIKE '%")}%'`
        : '';

      const closureResult = await prisma.$queryRaw<Array<{
        id: number;
        name: string;
        description: string | null;
        depth: number;
      }>>`
        SELECT c.id, c.name, c.description, cp.depth
        FROM concept_path cp
        JOIN concept c ON cp.ancestor_id = c.id
        WHERE cp.path_type = 'required'
          AND cp.depth > 0
          ${Prisma.raw(subjectFilter)}
        ORDER BY cp.depth DESC
        LIMIT 10
      `;

      if (closureResult.length > 0) {
        const nodes = closureResult.map((row, index) => ({
          id: `node_${index}`,
          type: 'concept',
          resource_id: String(row.id),
          title: row.name,
          prerequisites: index > 0 ? [`node_${index - 1}`] : [],
          next_steps: index < closureResult.length - 1 ? [`node_${index + 1}`] : [],
          estimated_time_minutes: 45,
          difficulty_level: row.depth > 3 ? 'advanced' : row.depth > 1 ? 'intermediate' : 'beginner',
        }));

        return NextResponse.json({
          path_id: `path_${user_id}_${Date.now()}`,
          nodes,
          estimated_duration_hours: nodes.reduce((sum: number, node: { estimated_time_minutes: number }) => sum + node.estimated_time_minutes / 60, 0),
          difficulty_progression: 'adaptive',
          message: 'Learning path generated from PostgreSQL closure table',
          source: 'postgresql_closure',
        });
      }

      // 闭包表无数据时返回空路径
      return NextResponse.json({
        path_id: `path_${user_id}_${Date.now()}`,
        nodes: [],
        estimated_duration_hours: 0,
        difficulty_progression: 'adaptive',
        message: 'No learning path data available for the specified subjects',
        source: 'postgresql_closure',
      });
    } catch (pgError) {
      console.error('[knowledge-graph/path] 闭包表查询失败:', pgError);
      return NextResponse.json(
        { error: 'Failed to query learning path from database', details: pgError instanceof Error ? pgError.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error generating learning path:', error);
    return NextResponse.json(
      { error: 'Failed to generate learning path', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 辅助端点：获取用户的学习进度
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');

  if (!userId) {
    return NextResponse.json(
      { error: 'Missing user_id parameter' },
      { status: 400 }
    );
  }

  try {
    // TODO: 接入用户学习进度表（user_progress）后替换此 stub
    // 当前返回空进度数据，前端可安全处理
    return NextResponse.json({
      user_id: userId,
      completed_tutorials: [],
      count: 0,
      message: 'User progress tracking not yet available (pending user_progress table)',
      source: 'postgresql_stub',
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user progress', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
