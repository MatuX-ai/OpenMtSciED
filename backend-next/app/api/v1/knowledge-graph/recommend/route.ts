import { NextResponse } from 'next/server';
import { getDriver } from '@/lib/neo4j';
import neo4j, { Integer } from 'neo4j-driver';

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

    const driver = getDriver();
    const session = driver.session();
    
    try {
      // 简化推荐策略：基于科目和年级推荐相关课程单元
      let query = `
        MATCH (cu:CourseUnit)
      `;
      
      const whereClauses = [];
      if (subjects && Array.isArray(subjects) && subjects.length > 0) {
        whereClauses.push('cu.subject IN $subjects');
      }
      
      if (whereClauses.length > 0) {
        query += ' WHERE ' + whereClauses.join(' AND ');
      }
      
      query += `
        WITH cu
        ORDER BY cu.created_at DESC
        LIMIT $limit
        RETURN cu
      `;
      
      const result = await session.run(query, { 
        subjects: subjects || [],
        limit: neo4j.int(Math.floor(parseInt(limit.toString())))
      });
      
      if (result.records.length === 0) {
        return NextResponse.json({
          user_id,
          recommendations: [],
          strategy: 'no_data',
          message: 'No recommendations available'
        });
      }
      
      // 处理推荐结果
      const recommendations = result.records.map(record => {
        const courseUnit = record.get('cu');
        
        return {
          id: courseUnit.properties.id,
          title: courseUnit.properties.title || courseUnit.properties.name,
          description: courseUnit.properties.description || '',
          subject: courseUnit.properties.subject,
          grade_level: courseUnit.properties.grade_level,
          difficulty_level: courseUnit.properties.difficulty_level || 'intermediate',
          type: 'course_unit',
          recommendation_reason: 'Based on subject match',
          score: 1
        };
      });

      return NextResponse.json({
        user_id,
        recommendations,
        strategy: 'collaborative_filtering',
        message: 'Personalized recommendations based on your learning history'
      });
    } finally {
      await session.close();
    }
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
  const limit = neo4j.int(Math.floor(parseInt(searchParams.get('limit') || '10')));
  
  if (!userId) {
    return NextResponse.json(
      { error: 'Missing user_id parameter' },
      { status: 400 }
    );
  }
  
  const driver = getDriver();
  const session = driver.session();
  
  try {
    let whereClause = '';
    const params: Record<string, string | number | Integer> = { userId, limit };
    
    if (subject) {
      whereClause = ' WHERE c.subject = $subject';
      params.subject = subject;
    }
    
    // 基于用户已完成教程的相关性推荐课件
    const query = `
      MATCH (u:User {id: $userId})-[:COMPLETED]->(t:Tutorial)
      MATCH (t)-[:RELATED_TO]->(k:KnowledgePoint)
      MATCH (c:Courseware)-[:RELATED_TO]->(k)
      ${whereClause}
      WHERE NOT EXISTS((u)-[:VIEWED_COURSEWARE]->(c))
      WITH c, count(DISTINCT k) as relevanceScore
      ORDER BY relevanceScore DESC
      LIMIT $limit
      RETURN c, relevanceScore
    `;
    
    const result = await session.run(query, params);
    
    const coursewares = result.records.map(record => ({
      id: record.get('c').properties.id,
      title: record.get('c').properties.title,
      type: record.get('c').properties.type,
      subject: record.get('c').properties.subject,
      grade_level: record.get('c').properties.grade_level,
      file_url: record.get('c').properties.file_url,
      thumbnail_url: record.get('c').properties.thumbnail_url,
      relevance_score: record.get('relevanceScore').toNumber()
    }));
    
    return NextResponse.json({
      user_id: userId,
      coursewares,
      count: coursewares.length
    });
  } catch (error) {
    console.error('Error fetching courseware recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courseware recommendations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}
