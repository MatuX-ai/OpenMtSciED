import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const size = Math.max(1, parseInt(searchParams.get('size') || '20'));
  const subject = searchParams.get('subject');
  const gradeLevel = searchParams.get('grade_level');
  const type = searchParams.get('type');

  try {
    const where: Record<string, unknown> = {};
    if (subject) where.subject = subject;
    if (gradeLevel) where.gradeLevel = gradeLevel;
    if (type) where.type = type;

    const [items, total] = await Promise.all([
      prisma.courseware.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * size,
        take: size,
      }),
      prisma.courseware.count({ where }),
    ]);

    const coursewares = items.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      type: c.type,
      grade_level: c.gradeLevel,
      subject: c.subject,
      difficulty_level: c.difficultyLevel,
      file_url: c.fileUrl,
      thumbnail_url: c.thumbnailUrl,
      duration_minutes: c.durationMinutes,
      knowledge_points: [],
      created_at: c.createdAt.toISOString(),
    }));

    return NextResponse.json({
      items: coursewares,
      total,
      page,
      size,
      total_pages: Math.ceil(total / size),
    });
  } catch (error) {
    console.error('Error fetching coursewares:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coursewares', details: error instanceof Error ? error.message : 'Unknown error' },
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
      type,
      grade_level,
      subject,
      difficulty_level,
      file_url,
      thumbnail_url,
      duration_minutes,
    } = body;

    if (!title || !type || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields: title, type, subject' },
        { status: 400 }
      );
    }

    const courseware = await prisma.courseware.create({
      data: {
        ...(id ? { id } : {}),
        title,
        description: description || '',
        type,
        gradeLevel: grade_level,
        subject,
        difficultyLevel: difficulty_level || 'beginner',
        fileUrl: file_url || '',
        thumbnailUrl: thumbnail_url || '',
        durationMinutes: duration_minutes || 30,
      },
    });

    return NextResponse.json({
      id: courseware.id,
      title: courseware.title,
      message: 'Courseware created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating courseware:', error);
    return NextResponse.json(
      { error: 'Failed to create courseware', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
