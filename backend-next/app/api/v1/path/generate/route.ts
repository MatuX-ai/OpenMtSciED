/**
 * POST /api/v1/path/generate
 * Desktop path-visualization 兼容 shim（闭包表数据源）
 */
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { findRoute } from '@/lib/concept-path';

interface GenerateRequest {
  user_id?: string;
  age?: number;
  grade_level?: string;
  max_nodes?: number;
}

interface PathNode {
  node_type: string;
  node_id: string;
  title: string;
  difficulty: number;
  estimated_hours: number;
  description?: string;
}

function difficultyFromDepth(depth: number, index: number, total: number): number {
  if (depth <= 1) return 1;
  if (depth <= 3) return 2;
  if (index < total * 0.3) return 1;
  if (index < total * 0.7) return 2;
  return 3;
}

function mapConceptsToPathNodes(
  concepts: { id: number; name: string }[],
  depths: number[]
): PathNode[] {
  return concepts.map((c, index) => {
    const depth = depths[index] ?? index + 1;
    return {
      node_type: 'knowledge_point',
      node_id: String(c.id),
      title: c.name,
      difficulty: difficultyFromDepth(depth, index, concepts.length),
      estimated_hours: Math.max(1, 3 - Math.min(depth, 2)),
      description: undefined,
    };
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateRequest;
    const userId = body.user_id || 'anonymous';
    const maxNodes = Math.min(30, Math.max(1, body.max_nodes ?? 15));

    // 找最长可用路径端点（depth 在 max_nodes 范围内）
    const endpoints = await prisma.$queryRaw<
      Array<{ ancestor_id: number; descendant_id: number; depth: number }>
    >`
      SELECT ancestor_id, descendant_id, depth
      FROM concept_path
      WHERE path_type = 'required'
        AND depth > 0
        AND depth <= ${maxNodes}
      ORDER BY depth DESC
      LIMIT 1
    `;

    if (endpoints.length === 0) {
      // 回退: 取无前置依赖的根节点
      const roots = await prisma.$queryRaw<
        Array<{ id: number; name: string }>
      >`
        SELECT c.id, c.name
        FROM concept c
        WHERE NOT EXISTS (
          SELECT 1 FROM concept_path cp
          WHERE cp.descendant_id = c.id
            AND cp.path_type = 'required'
            AND cp.depth > 0
        )
        ORDER BY c.id
        LIMIT ${maxNodes}
      `;

      const pathNodes = roots.map((r, i) => ({
        node_type: 'knowledge_point',
        node_id: String(r.id),
        title: r.name,
        difficulty: 1,
        estimated_hours: 2,
      }));

      return NextResponse.json(buildResponse(userId, pathNodes));
    }

    const ep = endpoints[0];
    const route = await findRoute(
      Number(ep.ancestor_id),
      Number(ep.descendant_id),
      'required'
    );

    if (!route || route.concepts.length === 0) {
      return NextResponse.json(buildResponse(userId, []));
    }

    const trimmed = route.concepts.slice(0, maxNodes);
    const depths = trimmed.map((_, i) => i + 1);
    const pathNodes = mapConceptsToPathNodes(trimmed, depths);

    return NextResponse.json(buildResponse(userId, pathNodes));
  } catch (error: unknown) {
    console.error('Path generate error:', error);
    const message = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json({ error: '服务器错误', message }, { status: 500 });
  }
}

function buildResponse(userId: string, pathNodes: PathNode[]) {
  const totalHours = pathNodes.reduce((s, n) => s + n.estimated_hours, 0);
  const avgDifficulty =
    pathNodes.length > 0
      ? pathNodes.reduce((s, n) => s + n.difficulty, 0) / pathNodes.length
      : 0;

  return {
    user_id: userId,
    path_nodes: pathNodes,
    summary: {
      total_nodes: pathNodes.length,
      total_hours: totalHours,
      avg_difficulty: Math.round(avgDifficulty * 10) / 10,
    },
    generated_at: new Date().toISOString(),
    source: 'postgresql_closure',
  };
}
