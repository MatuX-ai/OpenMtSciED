import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/user-auth';
import { awardCredits, CreditAction, CREDIT_RULES } from '@/lib/creator-credits';

export async function POST(request: Request) {
  const auth = requireUser(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const action = body.action as CreditAction;

    if (!action || !(action in CREDIT_RULES)) {
      return NextResponse.json({ error: '无效的 action' }, { status: 400 });
    }

    const result = await awardCredits(auth.userId, action, {
      refType: body.ref_type || body.refType,
      refId: body.ref_id != null ? String(body.ref_id) : body.refId != null ? String(body.refId) : undefined,
      note: body.note,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Award credits failed:', error);
    return NextResponse.json(
      { error: '计分失败', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
