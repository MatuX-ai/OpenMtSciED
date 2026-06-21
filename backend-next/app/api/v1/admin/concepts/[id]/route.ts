import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import {
  deleteConcept,
  getConcept,
  updateConcept,
} from '@/lib/concept-path';

/**
 * GET /api/v1/admin/concepts/:id
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (isNaN(id) || id <= 0) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const concept = await getConcept(id);
    if (!concept) {
      return NextResponse.json({ error: 'Concept not found' }, { status: 404 });
    }

    return NextResponse.json(concept);
  } catch (error: unknown) {
    console.error('Get concept error:', error);
    const message = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json({ error: '服务器错误', message }, { status: 500 });
  }
}

/**
 * PUT /api/v1/admin/concepts/:id
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (isNaN(id) || id <= 0) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const existing = await getConcept(id);
    if (!existing) {
      return NextResponse.json({ error: 'Concept not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, description } = body;

    const concept = await updateConcept(id, {
      ...(name !== undefined && { name: String(name).trim() }),
      ...(description !== undefined && { description: String(description).trim() }),
    });

    return NextResponse.json(concept);
  } catch (error: unknown) {
    console.error('Update concept error:', error);
    const message = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json({ error: '服务器错误', message }, { status: 500 });
  }
}

/**
 * DELETE /api/v1/admin/concepts/:id
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (isNaN(id) || id <= 0) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const existing = await getConcept(id);
    if (!existing) {
      return NextResponse.json({ error: 'Concept not found' }, { status: 404 });
    }

    await deleteConcept(id);
    return NextResponse.json({ message: 'Concept deleted', id });
  } catch (error: unknown) {
    console.error('Delete concept error:', error);
    const message = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json({ error: '服务器错误', message }, { status: 500 });
  }
}
