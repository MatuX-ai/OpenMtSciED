import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import {
  createConcept,
  listConcepts,
} from '@/lib/concept-path';

/**
 * GET /api/v1/admin/concepts
 * 分页列出知识点
 */
export async function GET(request: Request) {
  const auth = requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const size = Math.min(100, Math.max(1, parseInt(searchParams.get('size') || '20', 10)));
    const search = searchParams.get('search') || undefined;

    const { items, total } = await listConcepts({
      skip: (page - 1) * size,
      take: size,
      search,
    });

    return NextResponse.json({
      items,
      total,
      page,
      size,
      total_pages: Math.ceil(total / size),
    });
  } catch (error: unknown) {
    console.error('List concepts error:', error);
    const message = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json({ error: '服务器错误', message }, { status: 500 });
  }
}

/**
 * POST /api/v1/admin/concepts
 * 创建知识点
 */
export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const { name, description, legacyNeo4jId } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'name 为必填字段' }, { status: 400 });
    }

    const concept = await createConcept({
      name: name.trim(),
      description: description?.trim(),
      legacyNeo4jId: legacyNeo4jId?.trim(),
    });

    return NextResponse.json(concept, { status: 201 });
  } catch (error: unknown) {
    console.error('Create concept error:', error);
    const message = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json({ error: '服务器错误', message }, { status: 500 });
  }
}
