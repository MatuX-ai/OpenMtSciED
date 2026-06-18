import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Math.floor(parseInt(searchParams.get('page') || '1')));
  const size = Math.max(1, Math.floor(parseInt(searchParams.get('size') || '20')));
  const subject = searchParams.get('subject');
  const gradeLevel = searchParams.get('grade_level');

  try {
    const where: Record<string, unknown> = {};
    if (subject) where.subject = subject;
    if (gradeLevel) where.gradeLevel = gradeLevel;

    const [items, total] = await Promise.all([
      prisma.tutorial.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * size,
        take: size,
      }),
      prisma.tutorial.count({ where }),
    ]);

    const tutorials = items.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      grade_level: t.gradeLevel,
      subject: t.subject,
      duration_minutes: t.durationMinutes,
      difficulty_level: t.difficultyLevel,
      created_at: t.createdAt.toISOString(),
    }));

    return NextResponse.json({
      items: tutorials,
      total,
      page,
      size,
      total_pages: Math.ceil(total / size),
    }, {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  } catch (error) {
    console.error('Error fetching tutorials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tutorials', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      title,
      description,
      grade_level,
      subject,
      duration_minutes,
      difficulty_level,
      content,
    } = body;

    if (!title || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields: title, subject' },
        { status: 400 }
      );
    }

    const tutorial = await prisma.tutorial.create({
      data: {
        ...(id ? { id } : {}),
        title,
        description: description || '',
        gradeLevel: grade_level,
        subject,
        durationMinutes: duration_minutes || 60,
        difficultyLevel: difficulty_level || 'beginner',
        content: content || '',
      },
    });

    return NextResponse.json({
      id: tutorial.id,
      title: tutorial.title,
      message: 'Tutorial created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating tutorial:', error);
    return NextResponse.json(
      { error: 'Failed to create tutorial', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
