import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireUser } from '@/lib/user-auth';
import { getLinkedResourcesForConcept } from '@/lib/knowledge-graph-link';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ conceptId: string }> }
) {
  const auth = requireUser(request);
  if (!auth.ok) return auth.response;

  try {
    const { conceptId: conceptIdParam } = await params;
    const conceptId = Number(conceptIdParam);
    if (!conceptId || Number.isNaN(conceptId)) {
      return NextResponse.json({ error: 'conceptId 无效' }, { status: 400 });
    }

    const concept = await prisma.concept.findUnique({ where: { id: conceptId } });
    if (!concept) {
      return NextResponse.json({ error: '知识点不存在' }, { status: 404 });
    }

    const tutorials = await getLinkedResourcesForConcept(conceptId, auth.userId);

    return NextResponse.json({
      concept_id: conceptId,
      concept_name: concept.name,
      tutorials,
    });
  } catch (error) {
    console.error('Get concept resources failed:', error);
    return NextResponse.json(
      { error: '获取关联资源失败', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
