import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireUser } from '@/lib/user-auth';
import { submitPublishRequest } from '@/lib/publish-package';
import type { CopyrightType, PublishScope } from '@/lib/publish-review';

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const auth = requireUser(request);
  if (!auth.ok) return auth.response;

  const { id: idParam } = await params;
  const draftId = parseInt(idParam, 10);
  if (Number.isNaN(draftId)) {
    return NextResponse.json({ error: '无效的草稿 ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const scope = (body.scope || 'private') as PublishScope;
    const copyrightConfirmed = Boolean(body.copyright_confirmed ?? body.copyrightConfirmed);
    const copyrightType = (body.copyright_type ?? body.copyrightType) as CopyrightType | undefined;

    if (!copyrightConfirmed) {
      return NextResponse.json({ error: '请先确认版权声明' }, { status: 400 });
    }

    if (!['private', 'school', 'public'].includes(scope)) {
      return NextResponse.json({ error: '无效的发布范围' }, { status: 400 });
    }

    const draft = await prisma.topicDraft.findFirst({
      where: { id: draftId, userId: auth.userId },
    });
    if (!draft) {
      return NextResponse.json({ error: '草稿不存在' }, { status: 404 });
    }

    const packageJson =
      body.package_json ??
      body.packageJson ?? {
        topic: {
          title: draft.title,
          subject: draft.subject,
          grade_level: draft.gradeLevel,
          goals: draft.goals,
          outline: draft.outlineJson,
        },
        tutorial_id: draft.localTutorialId,
        matched_resources: draft.matchedResourcesJson,
      };

    const result = await submitPublishRequest({
      userId: auth.userId,
      topicDraftId: draftId,
      localTutorialId: draft.localTutorialId ?? undefined,
      title: draft.title,
      subject: draft.subject ?? undefined,
      gradeLevel: draft.gradeLevel ?? undefined,
      packageJson,
      scope,
      copyrightConfirmed,
      copyrightType,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Submit publish failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '提交发布失败' },
      { status: 500 }
    );
  }
}
