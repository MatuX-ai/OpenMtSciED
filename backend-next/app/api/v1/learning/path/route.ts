import { NextResponse } from 'next/server';
import { runCypher } from '@/lib/neo4j';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

/**
 * GET /api/v1/learning/path
 * 获取个性化学习路径（基于 Neo4j 知识图谱）
 */
export async function GET(request: Request) {
  try {
    // 验证用户身份
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

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject') || '';
    const grade = searchParams.get('grade') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    // 构建 Cypher 查询 - 基于用户学习历史和知识图谱生成路径
    let cypher = `
      MATCH (user:User {id: $userId})
      OPTIONAL MATCH (user)-[r:HAS_LEARNED]->(completed:Course)
      WITH user, collect(DISTINCT completed.id) as completedCourses
      
      MATCH (course:Course)
      WHERE NOT course.id IN completedCourses
    `;

    if (subject) {
      cypher += ` AND course.subject = $subject`;
    }

    if (grade) {
      cypher += ` AND course.grade = $grade`;
    }

    cypher += `
      OPTIONAL MATCH (course)-[:REQUIRES]->(prerequisite:Course)
      WITH course, prerequisite, completedCourses
      WHERE prerequisite IS NULL OR prerequisite.id IN completedCourses
      
      RETURN course.id as id,
             course.title as title,
             course.description as description,
             course.subject as subject,
             course.grade as grade,
             course.difficulty as difficulty,
             course.url as url,
             course.platform as platform,
             CASE 
               WHEN prerequisite IS NOT NULL THEN true 
               ELSE false 
             END as hasPrerequisites
      ORDER BY course.difficulty ASC, course.createdAt DESC
      LIMIT $limit
    `;

    const params: any = {
      userId,
      limit,
    };

    if (subject) params.subject = subject;
    if (grade) params.grade = grade;

    const results = await runCypher(cypher, params);

    return NextResponse.json({
      learning_path: results,
      total: results.length,
      filters: {
        subject: subject || 'all',
        grade: grade || 'all',
      },
    });
  } catch (error: any) {
    console.error('Get learning path error:', error);
    return NextResponse.json(
      { error: '服务器错误', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/learning/path/generate
 * 重新生成学习路径（高级算法）
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
    const { targetSubject, targetGrade, maxSteps = 5 } = body;

    // 使用图算法找到最短学习路径
    const cypher = `
      MATCH (start:Course {subject: $targetSubject, grade: $targetGrade})
      MATCH (end:Course)
      WHERE NOT end.id IN (
        MATCH (u:User {id: $userId})-[:HAS_LEARNED]->(c:Course)
        RETURN c.id
      )
      
      MATCH path = shortestPath((start)-[:RELATED_TO*..$maxSteps]-(end))
      RETURN [node IN nodes(path) | {
        id: node.id,
        title: node.title,
        subject: node.subject,
        difficulty: node.difficulty
      }] as path_nodes,
      length(path) as steps
      ORDER BY steps ASC
      LIMIT 1
    `;

    const results = await runCypher(cypher, {
      userId,
      targetSubject,
      targetGrade,
      maxSteps,
    });

    return NextResponse.json({
      generated_path: results[0]?.path_nodes || [],
      steps: results[0]?.steps || 0,
    });
  } catch (error: any) {
    console.error('Generate path error:', error);
    return NextResponse.json(
      { error: '服务器错误', message: error.message },
      { status: 500 }
    );
  }
}
