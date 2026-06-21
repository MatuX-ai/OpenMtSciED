import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/user-auth';
import { createResourceAttribution, serializeAttribution } from '@/lib/resource-attribution';

export async function POST(request: Request) {
  const auth = requireUser(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const resourceType = (body.resource_type ?? body.resourceType)?.trim();
    const resourceId = String(body.resource_id ?? body.resourceId ?? '').trim();
    const sourceUrl = (body.source_url ?? body.sourceUrl)?.trim();

    if (!resourceType || !resourceId) {
      return NextResponse.json({ error: 'resource_type 与 resource_id 必填' }, { status: 400 });
    }
    if (!sourceUrl) {
      return NextResponse.json({ error: '引用资源必须填写 source_url' }, { status: 400 });
    }

    const row = await createResourceAttribution({
      userId: auth.userId,
      resourceType,
      resourceId,
      resourceTitle: body.resource_title ?? body.resourceTitle,
      sourceUrl,
      license: body.license,
      author: body.author,
    });

    return NextResponse.json(serializeAttribution(row), { status: 201 });
  } catch (error) {
    console.error('Create attribution failed:', error);
    return NextResponse.json(
      { error: '保存来源信息失败', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
