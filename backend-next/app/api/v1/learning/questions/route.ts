import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

/**
 * GET /api/v1/learning/questions
 * 获取题目列表
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const difficulty = searchParams.get('difficulty');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: Record<string, string> = {};
    if (subject) where.subject = subject;
    if (difficulty) where.difficulty = difficulty;
    if (type) where.type = type;

    // 查询题目
    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.question.count({ where }),
    ]);

    return NextResponse.json({
      questions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error('Get questions error:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: '服务器错误', message: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/learning/submit
 * 提交答案
 */
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || undefined;
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token 无效' }, { status: 401 });
    }
    const userId = decoded.userId;

    const body = await request.json();
    const { questionId, userAnswer } = body;

    if (!questionId || !userAnswer) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 获取题目正确答案
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json({ error: '题目不存在' }, { status: 404 });
    }

    // 判断是否正确
    const isCorrect = userAnswer.trim().toLowerCase() === question.answer.trim().toLowerCase();

    // 创建答题记录
    const assignment = await prisma.assignment.create({
      data: {
        userId,
        questionId,
        userAnswer,
        isCorrect,
        score: isCorrect ? 100 : 0,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: '提交成功',
      result: {
        isCorrect,
        score: isCorrect ? 100 : 0,
        correctAnswer: question.answer,
        explanation: question.explanation,
      },
      assignment,
    });
  } catch (error: unknown) {
    console.error('Submit answer error:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: '服务器错误', message: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/learning/progress
 * 获取学习进度统计
 */
export async function GET_PROGRESS(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || undefined;
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token 无效' }, { status: 401 });
    }
    const userId = decoded.userId;

    // 统计数据
    const [totalQuestions, correctAnswers, assignments] = await Promise.all([
      prisma.assignment.count({ where: { userId } }),
      prisma.assignment.count({ where: { userId, isCorrect: true } }),
      prisma.assignment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          question: {
            select: {
              title: true,
              subject: true,
              difficulty: true,
            },
          },
        },
      }),
    ]);

    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    return NextResponse.json({
      statistics: {
        totalQuestions,
        correctAnswers,
        accuracy: Math.round(accuracy * 100) / 100,
      },
      recentAssignments: assignments,
    });
  } catch (error: unknown) {
    console.error('Get progress error:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: '服务器错误', message: errorMessage },
      { status: 500 }
    );
  }
}
