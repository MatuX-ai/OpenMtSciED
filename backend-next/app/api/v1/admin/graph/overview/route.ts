import { NextResponse } from 'next/server';
import { runCypher } from '@/lib/neo4j';

/**
 * GET /api/v1/admin/graph/overview
 * 获取知识图谱概览（用于可视化）
 */
export async function GET() {
  try {
    // 第一步：查询所有节点（必须有id属性）
    const nodesQuery = `
      MATCH (n)
      WHERE n.id IS NOT NULL
      RETURN n.id AS id, n.name AS name, n.title AS title, labels(n)[0] AS category, n.subject AS subject
      LIMIT 1000
    `;
    
    const nodesResult = await runCypher(nodesQuery);
    
    // 处理节点数据
    const nodes = nodesResult.map((record: Record<string, unknown>) => ({
      id: record.id,
      name: record.name || record.title || record.id,
      category: record.category || 'Unknown',
      subject: record.subject || '',
      value: 10,
      symbolSize: 30
    }));
    
    // 第二步：查询关系（两端节点都必须有id）
    const relationshipsQuery = `
      MATCH (a)-[r]->(b)
      WHERE a.id IS NOT NULL AND b.id IS NOT NULL
      RETURN a.id AS source, b.id AS target, type(r) AS name
      LIMIT 2000
    `;
    
    const relationshipsResult = await runCypher(relationshipsQuery);
    
    // 处理关系数据
    const relationships = relationshipsResult.map((record: Record<string, unknown>) => ({
      source: record.source,
      target: record.target,
      name: record.name || ''
    }));
    
    // 调试：检查关系分布
    const sourceCount: Record<string, number> = {};
    relationships.forEach((r: Record<string, unknown>) => {
      const source = r.source as string;
      sourceCount[source] = (sourceCount[source] || 0) + 1;
    });
    const topSources = Object.entries(sourceCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    console.log(`[Graph Overview v2] Top 5 源节点（关系最多的节点）:`, topSources);
    console.log(`[Graph Overview v2] 查询到 ${nodes.length} 个节点，${relationships.length} 个关系`);
    console.log(`[Graph Overview v2] 关系数据示例（前3个）:`, relationships.slice(0, 3));
    
    return NextResponse.json({
      success: true,
      nodes,
      relationships,
      totalNodes: nodes.length,
      totalRelationships: relationships.length
    });
  } catch (error: unknown) {
    console.error('Get graph overview error:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { 
        success: false,
        error: '服务器错误', 
        message: errorMessage,
        nodes: [],
        relationships: []
      },
      { status: 500 }
    );
  }
}
