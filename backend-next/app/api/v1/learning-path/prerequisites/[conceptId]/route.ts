/**
 * GET /api/v1/learning-path/prerequisites/[conceptId]
 *
 * 获取目标知识点的所有前置依赖（"我该先学什么？"）
 * 按依赖深度从大到小排序（最基础的知识点排最前）
 *
 * 查询参数:
 *   - path_type: 路径类型过滤，默认 "required"
 *
 * 响应示例:
 * {
 *   "concept_id": 42,
 *   "path_type": "required",
 *   "prerequisites": [{ "id": 3, "name": "基础代数", "description": "...", "depth": 5 }],
 *   "total": 3
 * }
 */

import { NextResponse } from 'next/server';
import { getPrerequisites, getConcept } from '@/lib/concept-path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ conceptId: string }> }
) {
  try {
    const { conceptId: conceptIdStr } = await params;
    const conceptId = parseInt(conceptIdStr, 10);

    if (isNaN(conceptId) || conceptId <= 0) {
      return NextResponse.json(
        { error: 'Invalid conceptId: must be a positive integer', code: 'INVALID_PARAM' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const pathType = searchParams.get('path_type') || 'required';

    // 验证 path_type 格式
    if (!/^[a-zA-Z_]{1,50}$/.test(pathType)) {
      return NextResponse.json(
        { error: 'Invalid path_type: must be 1-50 alphabetic characters', code: 'INVALID_PARAM' },
        { status: 400 }
      );
    }

    // 检查知识点是否存在
    const concept = await getConcept(conceptId);
    if (!concept) {
      return NextResponse.json(
        { error: `Concept not found`, concept_id: conceptId, code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const prerequisites = await getPrerequisites(conceptId, pathType);

    return NextResponse.json({
      concept_id: conceptId,
      concept_name: concept.name,
      path_type: pathType,
      prerequisites,
      total: prerequisites.length,
    });
  } catch (error: unknown) {
    console.error('Get prerequisites error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to get prerequisites', message, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
