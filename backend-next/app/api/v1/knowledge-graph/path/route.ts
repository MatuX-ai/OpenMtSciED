import { NextResponse } from 'next/server';
import { getDriver } from '@/lib/neo4j';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, current_grade, subjects, learning_goals } = body;
    
    if (!user_id || !current_grade || !subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, current_grade, subjects (array)' },
        { status: 400 }
      );
    }

    const driver = getDriver();
    const session = driver.session();
    
    try {
      // 构建Cypher查询来生成学习路径
      // 这里我们查找指定科目和年级的教程，并考虑先修关系
      const query = `
        MATCH (start:Tutorial)
        WHERE start.grade_level = $grade 
          AND start.subject IN $subjects
          AND NOT (start)<-[:PROGRESSES_TO]-() // 确保是路径起点，没有前置依赖
        OPTIONAL MATCH path = (start)-[:PROGRESSES_TO*1..8]->(end)
        WHERE ALL(node IN nodes(path) WHERE node.difficulty_level <= $maxDifficulty)
        WITH path, length(path) as pathLength
        ORDER BY pathLength ASC
        LIMIT 1
        UNWIND nodes(path) as node
        RETURN node ORDER BY node.order_index
      `;
      
      // 设置最大难度级别为高级
      const maxDifficulty = 'advanced';
      
      const result = await session.run(query, { 
        grade: current_grade, 
        subjects,
        maxDifficulty 
      });
      
      if (result.records.length === 0) {
        // 如果没有找到路径，则返回从基础开始的路径
        const fallbackQuery = `
          MATCH (t:Tutorial)
          WHERE t.grade_level = $grade AND t.subject IN $subjects
          RETURN t ORDER BY t.difficulty_level, t.created_at
          LIMIT 10
        `;
        
        const fallbackResult = await session.run(fallbackQuery, { grade: current_grade, subjects });
        
        const tutorials = fallbackResult.records.map((record, index) => ({
          id: `node_${index}`,
          type: 'tutorial',
          resource_id: record.get('t').properties.id,
          title: record.get('t').properties.title,
          prerequisites: index > 0 ? [`node_${index - 1}`] : [],
          next_steps: index < fallbackResult.records.length - 1 ? [`node_${index + 1}`] : [],
          estimated_time_minutes: record.get('t').properties.duration_minutes || 45
        }));
        
        return NextResponse.json({
          path_id: `path_${user_id}_${Date.now()}`,
          nodes: tutorials,
          estimated_duration_hours: tutorials.reduce((sum, node) => sum + (node.estimated_time_minutes / 60), 0),
          difficulty_progression: 'linear',
          message: 'Generated basic learning path as no prerequisite-based path was found'
        });
      }
      
      // 处理找到的路径
      const nodes = result.records.map((record, index) => ({
        id: `node_${index}`,
        type: 'tutorial',
        resource_id: record.get('node').properties.id,
        title: record.get('node').properties.title,
        prerequisites: index > 0 ? [`node_${index - 1}`] : [],
        next_steps: index < result.records.length - 1 ? [`node_${index + 1}`] : [],
        estimated_time_minutes: record.get('node').properties.duration_minutes || 45,
        difficulty_level: record.get('node').properties.difficulty_level
      }));

      return NextResponse.json({
        path_id: `path_${user_id}_${Date.now()}`,
        nodes,
        estimated_duration_hours: nodes.reduce((sum, node) => sum + (node.estimated_time_minutes / 60), 0),
        difficulty_progression: 'adaptive',
        message: 'Learning path generated successfully based on prerequisite relationships'
      });
    } finally {
      await session.close();
    }
  } catch (error) {
    console.error('Error generating learning path:', error);
    return NextResponse.json(
      { error: 'Failed to generate learning path', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 添加一个辅助端点用于获取用户的学习进度
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');
  
  if (!userId) {
    return NextResponse.json(
      { error: 'Missing user_id parameter' },
      { status: 400 }
    );
  }
  
  const driver = getDriver();
  const session = driver.session();
  
  try {
    // 查询用户已完成的教程
    const query = `
      MATCH (u:User {id: $userId})-[r:COMPLETED]->(t:Tutorial)
      RETURN t, r.completion_date as completionDate
      ORDER BY r.completion_date DESC
    `;
    
    const result = await session.run(query, { userId });
    
    const completedTutorials = result.records.map(record => ({
      tutorial_id: record.get('t').properties.id,
      title: record.get('t').properties.title,
      completion_date: record.get('completionDate')
    }));
    
    return NextResponse.json({
      user_id: userId,
      completed_tutorials: completedTutorials,
      count: completedTutorials.length
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user progress', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}
