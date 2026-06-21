import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { addDependency, removeDependency } from '@/lib/concept-path';

function parseDependencyBody(body: unknown): {
  prerequisiteId: number;
  dependentId: number;
  pathType: string;
} | { error: string } {
  if (!body || typeof body !== 'object') {
    return { error: '请求体无效' };
  }

  const { prerequisiteId, dependentId, pathType = 'required' } = body as Record<
    string,
    unknown
  >;

  const pre = Number(prerequisiteId);
  const dep = Number(dependentId);

  if (!Number.isInteger(pre) || pre <= 0) {
    return { error: 'prerequisiteId 必须为正整数' };
  }
  if (!Number.isInteger(dep) || dep <= 0) {
    return { error: 'dependentId 必须为正整数' };
  }
  if (typeof pathType !== 'string' || !pathType.trim()) {
    return { error: 'pathType 无效' };
  }

  return { prerequisiteId: pre, dependentId: dep, pathType: pathType.trim() };
}

function parseDependencyQuery(searchParams: URLSearchParams): ReturnType<
  typeof parseDependencyBody
> {
  return parseDependencyBody({
    prerequisiteId: searchParams.get('prerequisiteId'),
    dependentId: searchParams.get('dependentId'),
    pathType: searchParams.get('pathType') || 'required',
  });
}

/**
 * POST /api/v1/admin/concepts/dependencies
 * 新增直接依赖并维护闭包表
 */
export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const parsed = parseDependencyBody(body);
    if ('error' in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    await addDependency(
      parsed.prerequisiteId,
      parsed.dependentId,
      parsed.pathType
    );

    return NextResponse.json(
      {
        message: 'Dependency added',
        prerequisiteId: parsed.prerequisiteId,
        dependentId: parsed.dependentId,
        pathType: parsed.pathType,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Add dependency error:', error);
    const message = error instanceof Error ? error.message : '未知错误';

    if (message.includes('环') || message.includes('循环')) {
      return NextResponse.json({ error: message, code: 'CYCLE_DETECTED' }, { status: 409 });
    }
    if (message.includes('自环')) {
      return NextResponse.json({ error: message, code: 'SELF_LOOP' }, { status: 400 });
    }

    return NextResponse.json({ error: '服务器错误', message }, { status: 500 });
  }
}

/**
 * DELETE /api/v1/admin/concepts/dependencies
 * 删除直接依赖并重建闭包表
 */
export async function DELETE(request: Request) {
  const auth = requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    let parsed = parseDependencyQuery(searchParams);

    if ('error' in parsed) {
      try {
        const body = await request.json();
        parsed = parseDependencyBody(body);
      } catch {
        // use query parse error
      }
    }

    if ('error' in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    await removeDependency(
      parsed.prerequisiteId,
      parsed.dependentId,
      parsed.pathType
    );

    return NextResponse.json({
      message: 'Dependency removed and closure rebuilt',
      prerequisiteId: parsed.prerequisiteId,
      dependentId: parsed.dependentId,
      pathType: parsed.pathType,
    });
  } catch (error: unknown) {
    console.error('Remove dependency error:', error);
    const message = error instanceof Error ? error.message : '未知错误';

    if (message.includes('不存在')) {
      return NextResponse.json({ error: message, code: 'NOT_FOUND' }, { status: 404 });
    }

    return NextResponse.json({ error: '服务器错误', message }, { status: 500 });
  }
}
