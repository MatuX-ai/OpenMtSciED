import { NextResponse } from 'next/server';
import { runCypher } from '@/lib/neo4j';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

/**
 * GET /api/v1/admin/graph/query
 * 执行自定义 Cypher 查询（管理员）
 */
export async function POST(request: Request) {
  try {
    // 验证管理员权限
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
    }

    const body = await request.json();
    const { cypher, params = {} } = body;

    if (!cypher) {
      return NextResponse.json({ error: '缺少 Cypher 查询语句' }, { status: 400 });
    }

    // 安全限制：只允许查询操作
    const lowerCypher = cypher.trim().toLowerCase();
    if (!lowerCypher.startsWith('match') && !lowerCypher.startsWith('with')) {
      return NextResponse.json(
        { error: '仅支持 MATCH/WITH 查询，不允许修改操作' },
        { status: 403 }
      );
    }

    const results = await runCypher(cypher, params);

    return NextResponse.json({
      results,
      count: results.length,
    });
  } catch (error: unknown) {
    console.error('Graph query error:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: '查询失败', message: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/admin/graph/stats
 * 获取知识图谱统计信息
 */
export async function GET(request: Request) {
  try {
    // 验证管理员权限
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
    }

    // 统计各类节点数量
    const stats = await Promise.all([
      runCypher('MATCH (n:Course) RETURN count(n) as count'),
      runCypher('MATCH (n:Question) RETURN count(n) as count'),
      runCypher('MATCH (n:User) RETURN count(n) as count'),
      runCypher('MATCH ()-[r]->() RETURN count(r) as count'),
    ]);

    return NextResponse.json({
      statistics: {
        courses: stats[0][0]?.count || 0,
        questions: stats[1][0]?.count || 0,
        users: stats[2][0]?.count || 0,
        relationships: stats[3][0]?.count || 0,
      },
    });
  } catch (error: unknown) {
    console.error('Graph stats error:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: '服务器错误', message: errorMessage },
      { status: 500 }
    );
  }
}


