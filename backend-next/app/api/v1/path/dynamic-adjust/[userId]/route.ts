/**
 * GET /api/v1/path/dynamic-adjust/:userId
 * Desktop path-visualization 兼容 shim — 基于闭包表 successors 的弱项建议
 */
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSuccessors } from '@/lib/concept-path';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // 取一个中间节点，返回其后续可学节点作为「建议加强/延伸」
    const sample = await prisma.$queryRaw<Array<{ id: number }>>`
      SELECT c.id
      FROM concept c
      JOIN concept_path cp ON cp.ancestor_id = c.id
      WHERE cp.path_type = 'required' AND cp.depth > 0
      GROUP BY c.id
      HAVING COUNT(*) >= 2
      ORDER BY COUNT(*) DESC
      LIMIT 1
    `;

    if (sample.length === 0) {
      return NextResponse.json({
        success: true,
        user_id: userId,
        weak_points: [],
        source: 'postgresql_closure',
      });
    }

    const successors = await getSuccessors(sample[0].id, 'required');
    const weakPoints = successors.slice(0, 5).map((s) => ({
      concept_id: s.id,
      name: s.name,
      depth: s.depth,
      suggestion: `建议继续学习: ${s.name}`,
    }));

    return NextResponse.json({
      success: true,
      user_id: userId,
      weak_points: weakPoints.map((p) => p.name),
      details: weakPoints,
      source: 'postgresql_closure',
    });
  } catch (error: unknown) {
    console.error('Dynamic adjust error:', error);
    const message = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json({ error: '服务器错误', message }, { status: 500 });
  }
}
