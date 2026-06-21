import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireUser } from '@/lib/user-auth';
import { serializeTopicDraft } from '@/lib/topic-studio';

export async function GET(request: Request) {
  const auth = requireUser(request);
  if (!auth.ok) return auth.response;

  try {
    const items = await prisma.topicDraft.findMany({
      where: { userId: auth.userId },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      items: items.map(serializeTopicDraft),
      total: items.length,
    });
  } catch (error) {
    console.error('List topic drafts failed:', error);
    return NextResponse.json(
      { error: '获取课题草稿失败', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = requireUser(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const title = (body.title as string)?.trim();

    if (!title) {
      return NextResponse.json({ error: '课题标题不能为空' }, { status: 400 });
    }

    const draft = await prisma.topicDraft.create({
      data: {
        userId: auth.userId,
        title,
        subject: body.subject || null,
        gradeLevel: body.grade_level || body.gradeLevel || null,
        goals: body.goals || null,
        durationHours:
          body.duration_hours != null ? Number(body.duration_hours) : body.durationHours ?? null,
        maxBudget: body.max_budget != null ? Number(body.max_budget) : body.maxBudget ?? null,
        needsHardware: Boolean(body.needs_hardware ?? body.needsHardware),
        currentStep: Number(body.current_step ?? body.currentStep ?? 0),
        status: 'draft',
      },
    });

    return NextResponse.json(serializeTopicDraft(draft), { status: 201 });
  } catch (error) {
    console.error('Create topic draft failed:', error);
    return NextResponse.json(
      { error: '创建课题草稿失败', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
