import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/db';
import { requireUser } from '@/lib/user-auth';
import { buildStubOutline, serializeTopicDraft } from '@/lib/topic-studio';

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
  const auth = requireUser(_request);
  if (!auth.ok) return auth.response;

  const { id: idParam } = await params;
  const id = parseInt(idParam, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: '无效的草稿 ID' }, { status: 400 });
  }

  try {
    const draft = await prisma.topicDraft.findFirst({
      where: { id, userId: auth.userId },
    });

    if (!draft) {
      return NextResponse.json({ error: '草稿不存在' }, { status: 404 });
    }

    // M1：规则模板大纲；后续可接 LLM proxy
    const outline = buildStubOutline(draft);

    const updated = await prisma.topicDraft.update({
      where: { id },
      data: {
        outlineJson: outline as unknown as Prisma.InputJsonValue,
        status: 'outline_ready',
        currentStep: Math.max(draft.currentStep, 1),
      },
    });

    return NextResponse.json({
      draft: serializeTopicDraft(updated),
      outline,
    });
  } catch (error) {
    console.error('Generate outline failed:', error);
    return NextResponse.json({ error: '生成大纲失败' }, { status: 500 });
  }
}
