import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/user-auth';
import { linkTutorialToGraph } from '@/lib/knowledge-graph-link';

export async function POST(request: Request) {
  const auth = requireUser(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const localTutorialId = Number(body.local_tutorial_id ?? body.localTutorialId);
    const tutorialTitle = (body.tutorial_title ?? body.tutorialTitle ?? body.title)?.trim();

    if (!localTutorialId || Number.isNaN(localTutorialId)) {
      return NextResponse.json({ error: 'local_tutorial_id 无效' }, { status: 400 });
    }
    if (!tutorialTitle) {
      return NextResponse.json({ error: 'tutorial_title 不能为空' }, { status: 400 });
    }

    const result = await linkTutorialToGraph({
      userId: auth.userId,
      localTutorialId,
      tutorialTitle,
      subject: body.subject || undefined,
      description: body.description || undefined,
      conceptId: body.concept_id != null ? Number(body.concept_id) : undefined,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('link-tutorial failed:', error);
    return NextResponse.json(
      { error: '挂接图谱失败', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
