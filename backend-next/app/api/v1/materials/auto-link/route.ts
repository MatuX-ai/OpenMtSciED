import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { optionalUser } from '@/lib/user-auth';

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,，、/\\|]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);
}

function scoreItem(
  item: { title: string; subject: string; description?: string | null },
  query: string,
  subject?: string
) {
  const queryTokens = tokenize(query);
  const haystack = [item.title, item.description || '', item.subject].join(' ');
  const hayTokens = new Set(tokenize(haystack));

  let score = 0;
  const reasons: string[] = [];

  for (const token of queryTokens) {
    if (hayTokens.has(token)) {
      score += 2;
      reasons.push(`关键词「${token}」`);
    }
  }

  if (subject && item.subject.toLowerCase().includes(subject.toLowerCase())) {
    score += 3;
    reasons.push('学科一致');
  }

  if (item.title.toLowerCase().includes(query.toLowerCase())) {
    score += 4;
    reasons.push('标题相似');
  }

  return { score, reason: reasons.slice(0, 2).join('、') || '相关推荐' };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = (body.title as string)?.trim();
    const subject = (body.subject as string) || undefined;
    const limit = Math.min(Number(body.limit || 5), 20);

    if (!title) {
      return NextResponse.json({ error: 'title 不能为空' }, { status: 400 });
    }

    optionalUser(request);

    const [tutorials, coursewares] = await Promise.all([
      prisma.tutorial.findMany({ take: 100, orderBy: { updatedAt: 'desc' } }),
      prisma.courseware.findMany({ take: 100, orderBy: { updatedAt: 'desc' } }),
    ]);

    const tutorialSuggestions = tutorials
      .map((t) => ({
        type: 'tutorial' as const,
        id: t.id,
        title: t.title,
        subject: t.subject,
        score: scoreItem(
          { title: t.title, subject: t.subject, description: t.description },
          title,
          subject
        ).score,
        reason: scoreItem(
          { title: t.title, subject: t.subject, description: t.description },
          title,
          subject
        ).reason,
      }))
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    const materialSuggestions = coursewares
      .map((c) => ({
        type: 'material' as const,
        id: c.id,
        title: c.title,
        subject: c.subject,
        file_url: c.fileUrl,
        score: scoreItem(
          { title: c.title, subject: c.subject, description: c.description },
          title,
          subject
        ).score,
        reason: scoreItem(
          { title: c.title, subject: c.subject, description: c.description },
          title,
          subject
        ).reason,
      }))
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return NextResponse.json({
      query: title,
      tutorials: tutorialSuggestions,
      materials: materialSuggestions,
      source: 'rule_match',
    });
  } catch (error) {
    console.error('auto-link failed:', error);
    return NextResponse.json(
      { error: '自动关联建议失败', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
