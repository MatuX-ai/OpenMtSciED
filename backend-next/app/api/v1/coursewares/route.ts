import { NextResponse } from 'next/server';
import { getDriver } from '@/lib/neo4j';
import neo4j from 'neo4j-driver';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const size = parseInt(searchParams.get('size') || '20');
  const subject = searchParams.get('subject');
  const gradeLevel = searchParams.get('grade_level');
  const type = searchParams.get('type'); // pdf, video, interactive, etc.

  const driver = getDriver();
  const session = driver.session();

  try {
    let whereClause = '';
    const params: any = { 
      skip: neo4j.int(Math.floor((page - 1) * size)), 
      limit: neo4j.int(Math.floor(size))
    };

    if (subject) {
      whereClause += whereClause ? ' AND c.subject = $subject' : ' WHERE c.subject = $subject';
      params.subject = subject;
    }

    if (gradeLevel) {
      whereClause += whereClause ? ' AND c.grade_level = $gradeLevel' : ' WHERE c.grade_level = $gradeLevel';
      params.gradeLevel = gradeLevel;
    }

    if (type) {
      whereClause += whereClause ? ' AND c.type = $type' : ' WHERE c.type = $type';
      params.type = type;
    }

    // 获取总数
    const countQuery = `
      MATCH (c:Courseware)
      ${whereClause}
      RETURN count(c) as total
    `;

    const countResult = await session.run(countQuery, params);
    const total = countResult.records[0].get('total').toNumber();

    // 获取课件列表
    const query = `
      MATCH (c:Courseware)
      ${whereClause}
      OPTIONAL MATCH (c)-[:RELATED_TO]->(k:KnowledgePoint)
      RETURN c, collect(k) as knowledge_points
      ORDER BY c.created_at DESC
      SKIP $skip LIMIT $limit
    `;

    const result = await session.run(query, params);
    const coursewares = result.records.map(record => {
      const node = record.get('c');
      const knowledgePoints = record.get('knowledge_points');

      return {
        id: node.properties.id,
        title: node.properties.title,
        description: node.properties.description,
        type: node.properties.type,
        grade_level: node.properties.grade_level,
        subject: node.properties.subject,
        difficulty_level: node.properties.difficulty_level,
        file_url: node.properties.file_url,
        thumbnail_url: node.properties.thumbnail_url,
        duration_minutes: node.properties.duration_minutes,
        knowledge_points: knowledgePoints.map((k: any) => ({
          id: k.properties.id,
          name: k.properties.name,
        })),
        created_at: node.properties.created_at,
      };
    });

    return NextResponse.json({
      items: coursewares,
      total,
      page,
      size,
      total_pages: Math.ceil(total / size)
    });
  } catch (error) {
    console.error('Error fetching coursewares:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coursewares', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      title,
      description,
      type,
      grade_level,
      subject,
      difficulty_level,
      file_url,
      thumbnail_url,
      duration_minutes,
      knowledge_point_ids
    } = body;

    if (!id || !title || !type || !grade_level || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields: id, title, type, grade_level, subject' },
        { status: 400 }
      );
    }

    const driver = getDriver();
    const session = driver.session();

    try {
      // 创建课件节点
      const createQuery = `
        CREATE (c:Courseware {
          id: $id,
          title: $title,
          description: $description,
          type: $type,
          grade_level: $grade_level,
          subject: $subject,
          difficulty_level: $difficulty_level,
          file_url: $file_url,
          thumbnail_url: $thumbnail_url,
          duration_minutes: $duration_minutes,
          created_at: datetime(),
          updated_at: datetime()
        })
        RETURN c
      `;

      const createResult = await session.run(createQuery, {
        id,
        title,
        description: description || '',
        type,
        grade_level,
        subject,
        difficulty_level: difficulty_level || 'beginner',
        file_url: file_url || '',
        thumbnail_url: thumbnail_url || '',
        duration_minutes: duration_minutes || 30
      });

      const courseware = createResult.records[0].get('c');

      // 关联知识点
      if (knowledge_point_ids && knowledge_point_ids.length > 0) {
        const relateQuery = `
          MATCH (c:Courseware {id: $coursewareId})
          UNWIND $knowledgePointIds AS kpId
          MATCH (k:KnowledgePoint {id: kpId})
          CREATE (c)-[:RELATED_TO]->(k)
        `;

        await session.run(relateQuery, {
          coursewareId: id,
          knowledgePointIds: knowledge_point_ids
        });
      }

      return NextResponse.json({
        id: courseware.properties.id,
        title: courseware.properties.title,
        message: 'Courseware created successfully'
      }, { status: 201 });
    } finally {
      await session.close();
    }
  } catch (error) {
    console.error('Error creating courseware:', error);
    return NextResponse.json(
      { error: 'Failed to create courseware', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
