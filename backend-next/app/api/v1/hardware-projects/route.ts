import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const size = Math.max(1, parseInt(searchParams.get('size') || '20'));
  const difficulty = searchParams.get('difficulty');
  const category = searchParams.get('category');
  const subject = searchParams.get('subject');

  try {
    const where: Record<string, unknown> = {};
    if (difficulty) where.difficultyLevel = difficulty;
    if (category) where.category = category;
    if (subject) where.subject = subject;

    const [items, total] = await Promise.all([
      prisma.hardwareProject.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * size,
        take: size,
      }),
      prisma.hardwareProject.count({ where }),
    ]);

    const projects = items.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      difficulty_level: p.difficultyLevel,
      category: p.category,
      subject: p.subject,
      estimated_time_hours: p.estimatedTimeHours,
      thumbnail_url: p.thumbnailUrl,
      hardware_required: (p.hardwareRequired as unknown[]) || [],
      knowledge_points: (p.knowledgePoints as unknown[]) || [],
      created_at: p.createdAt.toISOString(),
    }));

    return NextResponse.json({
      items: projects,
      total,
      page,
      size,
      total_pages: Math.ceil(total / size),
    });
  } catch (error) {
    console.error('Error fetching hardware projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hardware projects', details: error instanceof Error ? error.message : 'Unknown error' },
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
      difficulty_level,
      category,
      subject,
      estimated_time_hours,
      thumbnail_url,
      hardware_list,
      knowledge_point_ids,
    } = body;

    if (!title || !difficulty_level || !category || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields: title, difficulty_level, category, subject' },
        { status: 400 }
      );
    }

    const project = await prisma.hardwareProject.create({
      data: {
        ...(id ? { id } : {}),
        title,
        description: description || '',
        difficultyLevel: difficulty_level,
        category,
        subject,
        estimatedTimeHours: estimated_time_hours || 2,
        thumbnailUrl: thumbnail_url || '',
        hardwareRequired: hardware_list || [],
        knowledgePoints: knowledge_point_ids || [],
      },
    });

    return NextResponse.json({
      id: project.id,
      title: project.title,
      message: 'Hardware project created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating hardware project:', error);
    return NextResponse.json(
      { error: 'Failed to create hardware project', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
