import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, limit = 10, subjects } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing required field: user_id' },
        { status: 400 }
      );
    }

    // 基于 Concept 表推荐知识点（按学科过滤）
    const where: Record<string, unknown> = {};
    if (subjects && Array.isArray(subjects) && subjects.length > 0) {
      where.name = { in: subjects, mode: 'insensitive' };
    }

    const concepts = await prisma.concept.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit.toString()),
    });

    if (concepts.length === 0) {
      return NextResponse.json({
        user_id,
        recommendations: [],
        strategy: 'no_data',
        message: 'No recommendations available',
      });
    }

    const recommendations = concepts.map((c) => ({
      id: c.id,
      title: c.name,
      description: c.description || '',
      subject: subjects?.[0] || 'all',
      difficulty_level: 'intermediate',
      type: 'concept',
      recommendation_reason: 'Based on subject match',
      score: 1,
    }));

    return NextResponse.json({
      user_id,
      recommendations,
      strategy: 'concept_closure_table',
      message: 'Recommendations based on knowledge graph',
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 获取推荐的课件资源
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');
  const subject = searchParams.get('subject');
  const limit = Math.max(1, parseInt(searchParams.get('limit') || '10'));

  if (!userId) {
    return NextResponse.json(
      { error: 'Missing user_id parameter' },
      { status: 400 }
    );
  }

  try {
    const where: Record<string, unknown> = {};
    if (subject) where.subject = subject;

    const coursewares = await prisma.courseware.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const items = coursewares.map((c) => ({
      id: c.id,
      title: c.title,
      type: c.type,
      subject: c.subject,
      grade_level: c.gradeLevel,
      file_url: c.fileUrl,
      thumbnail_url: c.thumbnailUrl,
      relevance_score: 1,
    }));

    return NextResponse.json({
      user_id: userId,
      coursewares: items,
      count: items.length,
    });
  } catch (error) {
    console.error('Error fetching courseware recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courseware recommendations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
