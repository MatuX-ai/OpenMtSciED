import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { processScheduledPayouts } from '@/lib/publish-package';

export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const results = await processScheduledPayouts();
    return NextResponse.json({ processed: results.length, results });
  } catch (error) {
    console.error('Process payouts failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '结算失败' },
      { status: 500 }
    );
  }
}
