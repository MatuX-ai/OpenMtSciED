import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const tutorial = await prisma.tutorial.findUnique({ where: { id } });

    if (!tutorial) {
      return NextResponse.json({ error: 'Tutorial not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: tutorial.id,
      title: tutorial.title,
      description: tutorial.description,
      grade_level: tutorial.gradeLevel,
      subject: tutorial.subject,
      duration_minutes: tutorial.durationMinutes,
      difficulty_level: tutorial.difficultyLevel,
      content: tutorial.content,
      created_at: tutorial.createdAt.toISOString(),
      updated_at: tutorial.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching tutorial:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tutorial', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const {
      title,
      description,
      grade_level,
      subject,
      duration_minutes,
      difficulty_level,
      content,
    } = body;

    const existing = await prisma.tutorial.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Tutorial not found' }, { status: 404 });
    }

    const updated = await prisma.tutorial.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(grade_level !== undefined ? { gradeLevel: grade_level } : {}),
        ...(subject !== undefined ? { subject } : {}),
        ...(duration_minutes !== undefined ? { durationMinutes: duration_minutes } : {}),
        ...(difficulty_level !== undefined ? { difficultyLevel: difficulty_level } : {}),
        ...(content !== undefined ? { content } : {}),
      },
    });

    return NextResponse.json({
      id: updated.id,
      title: updated.title,
      message: 'Tutorial updated successfully',
    });
  } catch (error) {
    console.error('Error updating tutorial:', error);
    return NextResponse.json(
      { error: 'Failed to update tutorial', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const existing = await prisma.tutorial.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Tutorial not found' }, { status: 404 });
    }

    await prisma.tutorial.delete({ where: { id } });

    return NextResponse.json({
      message: 'Tutorial deleted successfully',
      id,
    });
  } catch (error) {
    console.error('Error deleting tutorial:', error);
    return NextResponse.json(
      { error: 'Failed to delete tutorial', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
