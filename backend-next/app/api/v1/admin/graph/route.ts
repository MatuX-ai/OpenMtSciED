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
  } catch (error: any) {
    console.error('Graph query error:', error);
    return NextResponse.json(
      { error: '查询失败', message: error.message },
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
  } catch (error: any) {
    console.error('Graph stats error:', error);
    return NextResponse.json(
      { error: '服务器错误', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/admin/graph/explore
 * 探索知识图谱结构
 */
export async function GET_EXPLORE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nodeId = searchParams.get('nodeId');
    const depth = parseInt(searchParams.get('depth') || '2');

    let cypher: string;
    let params: any = { depth };

    if (nodeId) {
      // 从指定节点开始探索
      cypher = `
        MATCH path = (start)-[*1..$depth]-(neighbor)
        WHERE start.id = $nodeId
        RETURN nodes(path) as nodes, relationships(path) as relationships
        LIMIT 50
      `;
      params.nodeId = nodeId;
    } else {
      // 随机探索
      cypher = `
        MATCH (start)
        WITH start
        ORDER BY rand()
        LIMIT 1
        MATCH path = (start)-[*1..$depth]-(neighbor)
        RETURN nodes(path) as nodes, relationships(path) as relationships
        LIMIT 50
      `;
    }

    const results = await runCypher(cypher, params);

    return NextResponse.json({
      exploration: results,
      total_paths: results.length,
    });
  } catch (error: any) {
    console.error('Graph explore error:', error);
    return NextResponse.json(
      { error: '服务器错误', message: error.message },
      { status: 500 }
    );
  }
}
