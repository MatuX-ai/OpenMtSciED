import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireUser } from '@/lib/user-auth';
import { serializeTopicDraft } from '@/lib/topic-studio';

type RouteParams = { params: Promise<{ id: string }> };

async function getOwnedDraft(id: number, userId: number) {
  return prisma.topicDraft.findFirst({
    where: { id, userId },
  });
}

export async function GET(_request: Request, { params }: RouteParams) {
  const auth = requireUser(_request);
  if (!auth.ok) return auth.response;

  const { id: idParam } = await params;
  const id = parseInt(idParam, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: '无效的草稿 ID' }, { status: 400 });
  }

  try {
    const draft = await getOwnedDraft(id, auth.userId);
    if (!draft) {
      return NextResponse.json({ error: '草稿不存在' }, { status: 404 });
    }
    return NextResponse.json(serializeTopicDraft(draft));
  } catch (error) {
    console.error('Get topic draft failed:', error);
    return NextResponse.json({ error: '获取草稿失败' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  const auth = requireUser(request);
  if (!auth.ok) return auth.response;

  const { id: idParam } = await params;
  const id = parseInt(idParam, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: '无效的草稿 ID' }, { status: 400 });
  }

  try {
    const existing = await getOwnedDraft(id, auth.userId);
    if (!existing) {
      return NextResponse.json({ error: '草稿不存在' }, { status: 404 });
    }

    const body = await request.json();
    const draft = await prisma.topicDraft.update({
      where: { id },
      data: {
        ...(body.title != null ? { title: String(body.title).trim() || existing.title } : {}),
        ...(body.subject !== undefined ? { subject: body.subject } : {}),
        ...(body.grade_level !== undefined || body.gradeLevel !== undefined
          ? { gradeLevel: body.grade_level ?? body.gradeLevel }
          : {}),
        ...(body.goals !== undefined ? { goals: body.goals } : {}),
        ...(body.duration_hours !== undefined || body.durationHours !== undefined
          ? { durationHours: Number(body.duration_hours ?? body.durationHours) }
          : {}),
        ...(body.max_budget !== undefined || body.maxBudget !== undefined
          ? { maxBudget: Number(body.max_budget ?? body.maxBudget) }
          : {}),
        ...(body.needs_hardware !== undefined || body.needsHardware !== undefined
          ? { needsHardware: Boolean(body.needs_hardware ?? body.needsHardware) }
          : {}),
        ...(body.outline !== undefined ? { outlineJson: body.outline } : {}),
        ...(body.matched_resources !== undefined
          ? { matchedResourcesJson: body.matched_resources }
          : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.current_step !== undefined || body.currentStep !== undefined
          ? { currentStep: Number(body.current_step ?? body.currentStep) }
          : {}),
        ...(body.local_tutorial_id !== undefined || body.localTutorialId !== undefined
          ? { localTutorialId: Number(body.local_tutorial_id ?? body.localTutorialId) }
          : {}),
      },
    });

    return NextResponse.json(serializeTopicDraft(draft));
  } catch (error) {
    console.error('Update topic draft failed:', error);
    return NextResponse.json({ error: '更新草稿失败' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const auth = requireUser(_request);
  if (!auth.ok) return auth.response;

  const { id: idParam } = await params;
  const id = parseInt(idParam, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: '无效的草稿 ID' }, { status: 400 });
  }

  try {
    const existing = await getOwnedDraft(id, auth.userId);
    if (!existing) {
      return NextResponse.json({ error: '草稿不存在' }, { status: 404 });
    }

    await prisma.topicDraft.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete topic draft failed:', error);
    return NextResponse.json({ error: '删除草稿失败' }, { status: 500 });
  }
}
