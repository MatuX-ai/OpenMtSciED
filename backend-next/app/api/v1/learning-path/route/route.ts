/**
 * GET /api/v1/learning-path/route
 *
 * 获取从起点到终点的完整学习路径链条（P2 增强功能）
 * 闭包表确认路径存在并提供最短深度，然后在边表上做 BFS 重建具体节点序列
 *
 * 查询参数:
 *   - from: 起点知识点 ID（必填）
 *   - to: 终点知识点 ID（必填）
 *   - path_type: 路径类型过滤，默认 "required"
 *
 * 响应示例:
 * {
 *   "from": 3,
 *   "to": 42,
 *   "path_type": "required",
 *   "path": [3, 7, 15, 28, 42],
 *   "depth": 4,
 *   "concepts": [{ "id": 3, "name": "基础代数" }, ...]
 * }
 */

import { NextResponse } from 'next/server';
import { findRoute, getConcept } from '@/lib/concept-path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromStr = searchParams.get('from');
    const toStr = searchParams.get('to');
    const pathType = searchParams.get('path_type') || 'required';

    // 参数校验
    if (!fromStr || !toStr) {
      return NextResponse.json(
        { error: 'Missing required parameters: from, to', code: 'MISSING_PARAM' },
        { status: 400 }
      );
    }

    const fromId = parseInt(fromStr, 10);
    const toId = parseInt(toStr, 10);

    if (isNaN(fromId) || fromId <= 0 || isNaN(toId) || toId <= 0) {
      return NextResponse.json(
        { error: 'Invalid from/to: must be positive integers', code: 'INVALID_PARAM' },
        { status: 400 }
      );
    }

    if (fromId === toId) {
      return NextResponse.json(
        { error: 'from and to must be different concepts', code: 'INVALID_PARAM' },
        { status: 400 }
      );
    }

    // 验证 path_type 格式
    if (!/^[a-zA-Z_]{1,50}$/.test(pathType)) {
      return NextResponse.json(
        { error: 'Invalid path_type: must be 1-50 alphabetic characters', code: 'INVALID_PARAM' },
        { status: 400 }
      );
    }

    // 检查两个知识点是否存在
    const [fromConcept, toConcept] = await Promise.all([
      getConcept(fromId),
      getConcept(toId),
    ]);

    if (!fromConcept) {
      return NextResponse.json(
        { error: 'Source concept not found', concept_id: fromId, code: 'NOT_FOUND' },
        { status: 404 }
      );
    }
    if (!toConcept) {
      return NextResponse.json(
        { error: 'Target concept not found', concept_id: toId, code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const route = await findRoute(fromId, toId, pathType);

    if (!route) {
      return NextResponse.json(
        {
          error: 'No path found between the specified concepts',
          from: fromId,
          to: toId,
          path_type: pathType,
          code: 'NO_PATH',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      from: fromId,
      from_name: fromConcept.name,
      to: toId,
      to_name: toConcept.name,
      path_type: pathType,
      path: route.path,
      depth: route.depth,
      concepts: route.concepts,
    });
  } catch (error: unknown) {
    console.error('Find route error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to find route', message, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
