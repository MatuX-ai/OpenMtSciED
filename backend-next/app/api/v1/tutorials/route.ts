import { NextResponse } from 'next/server';
import { getDriver } from '@/lib/neo4j';
import neo4j from 'neo4j-driver';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.floor(parseInt(searchParams.get('page') || '1'));
  const size = Math.floor(parseInt(searchParams.get('size') || '20'));
  const subject = searchParams.get('subject');
  const gradeLevel = searchParams.get('grade_level');

  const driver = getDriver();
  const session = driver.session();

  try {
    let whereClause = '';
    const params: any = { 
      skip: neo4j.int(Math.floor((page - 1) * size)), 
      limit: neo4j.int(Math.floor(size))
    };

    if (subject) {
      whereClause += whereClause ? ' AND t.subject = $subject' : ' WHERE t.subject = $subject';
      params.subject = subject;
    }

    if (gradeLevel) {
      whereClause += whereClause ? ' AND t.grade_level = $gradeLevel' : ' WHERE t.grade_level = $gradeLevel';
      params.gradeLevel = gradeLevel;
    }

    // 获取总数
    const countQuery = `
      MATCH (t:Tutorial)
      ${whereClause}
      RETURN count(t) as total
    `;

    console.log('Params:', params);
    console.log('Param types:', { skip: typeof params.skip, limit: typeof params.limit });
    console.log('Param values:', { skip: params.skip, limit: params.limit });

    const countResult = await session.run(countQuery, params);
    const total = countResult.records[0].get('total').toNumber();

    // 获取教程列表
    const query = `
      MATCH (t:Tutorial)
      ${whereClause}
      RETURN t
      ORDER BY t.created_at DESC
      SKIP $skip LIMIT $limit
    `;

    const result = await session.run(query, params);
    const tutorials = result.records.map(record => {
      const node = record.get('t');
      return {
        id: node.properties.id,
        title: node.properties.title,
        description: node.properties.description,
        grade_level: node.properties.grade_level,
        subject: node.properties.subject,
        duration_minutes: node.properties.duration_minutes,
        difficulty_level: node.properties.difficulty_level,
        created_at: node.properties.created_at,
      };
    });

    return NextResponse.json({
      items: tutorials,
      total,
      page,
      size,
      total_pages: Math.ceil(total / size)
    });
  } catch (error) {
    console.error('Error fetching tutorials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tutorials', details: error instanceof Error ? error.message : 'Unknown error' },
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
      grade_level,
      subject,
      duration_minutes,
      difficulty_level,
      content
    } = body;

    if (!id || !title || !grade_level || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields: id, title, grade_level, subject' },
        { status: 400 }
      );
    }

    const driver = getDriver();
    const session = driver.session();

    try {
      const query = `
        CREATE (t:Tutorial {
          id: $id,
          title: $title,
          description: $description,
          grade_level: $grade_level,
          subject: $subject,
          duration_minutes: $duration_minutes,
          difficulty_level: $difficulty_level,
          content: $content,
          created_at: datetime(),
          updated_at: datetime()
        })
        RETURN t
      `;

      const result = await session.run(query, {
        id,
        title,
        description: description || '',
        grade_level,
        subject,
        duration_minutes: duration_minutes || 60,
        difficulty_level: difficulty_level || 'beginner',
        content: content || ''
      });

      const tutorial = result.records[0].get('t');
      
      return NextResponse.json({
        id: tutorial.properties.id,
        title: tutorial.properties.title,
        message: 'Tutorial created successfully'
      }, { status: 201 });
    } finally {
      await session.close();
    }
  } catch (error) {
    console.error('Error creating tutorial:', error);
    return NextResponse.json(
      { error: 'Failed to create tutorial', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
