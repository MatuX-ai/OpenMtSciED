import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * GET /api/v1/admin/graph/overview
 * 获取知识图谱概览（用于可视化）
 * 从 PostgreSQL concept/concept_dependency 表获取节点和关系数据
 */
export async function GET() {
  try {
    // 查询所有知识点作为节点
    const concepts = await prisma.concept.findMany({
      take: 1000,
      select: { id: true, name: true, description: true },
    });

    const nodes = concepts.map((c) => ({
      id: String(c.id),
      name: c.name,
      category: 'Concept',
      subject: '',
      value: 10,
      symbolSize: 30,
    }));

    // 查询所有依赖关系
    const dependencies = await prisma.conceptDependency.findMany({
      take: 2000,
      select: { prerequisiteId: true, dependentId: true, pathType: true },
    });

    const relationships = dependencies.map((d) => ({
      source: String(d.prerequisiteId),
      target: String(d.dependentId),
      name: d.pathType,
    }));

    // 调试日志
    const sourceCount: Record<string, number> = {};
    relationships.forEach((r) => {
      sourceCount[r.source] = (sourceCount[r.source] || 0) + 1;
    });
    const topSources = Object.entries(sourceCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    console.log(`[Graph Overview] Top 5 源节点:`, topSources);
    console.log(`[Graph Overview] 查询到 ${nodes.length} 个节点，${relationships.length} 个关系`);

    return NextResponse.json({
      success: true,
      nodes,
      relationships,
      totalNodes: nodes.length,
      totalRelationships: relationships.length,
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
        relationships: [],
      },
      { status: 500 }
    );
  }
}
