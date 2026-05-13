import { NextResponse } from 'next/server';
import { getDriver } from '@/lib/neo4j';
import neo4j from 'neo4j-driver';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const size = parseInt(searchParams.get('size') || '20');
  const difficulty = searchParams.get('difficulty'); // beginner, intermediate, advanced
  const category = searchParams.get('category'); // electronics, robotics, programming, etc.
  const subject = searchParams.get('subject');

  const driver = getDriver();
  const session = driver.session();

  try {
    let whereClause = '';
    const params: any = { 
      skip: neo4j.int(Math.floor((page - 1) * size)), 
      limit: neo4j.int(Math.floor(size))
    };

    if (difficulty) {
      whereClause += whereClause ? ' AND p.difficulty_level = $difficulty' : ' WHERE p.difficulty_level = $difficulty';
      params.difficulty = difficulty;
    }

    if (category) {
      whereClause += whereClause ? ' AND p.category = $category' : ' WHERE p.category = $category';
      params.category = category;
    }

    if (subject) {
      whereClause += whereClause ? ' AND p.subject = $subject' : ' WHERE p.subject = $subject';
      params.subject = subject;
    }

    // 获取总数
    const countQuery = `
      MATCH (p:HardwareProject)
      ${whereClause}
      RETURN count(p) as total
    `;

    const countResult = await session.run(countQuery, params);
    const total = countResult.records[0].get('total').toNumber();

    // 获取硬件项目列表
    const query = `
      MATCH (p:HardwareProject)
      ${whereClause}
      OPTIONAL MATCH (p)-[:REQUIRES]->(h:Hardware)
      OPTIONAL MATCH (p)-[:TEACHES]->(k:KnowledgePoint)
      RETURN p, collect(DISTINCT h) as hardware_list, collect(DISTINCT k) as knowledge_points
      ORDER BY p.created_at DESC
      SKIP $skip LIMIT $limit
    `;

    const result = await session.run(query, params);
    const projects = result.records.map(record => {
      const node = record.get('p');
      const hardwareList = record.get('hardware_list');
      const knowledgePoints = record.get('knowledge_points');

      return {
        id: node.properties.id,
        title: node.properties.title,
        description: node.properties.description,
        difficulty_level: node.properties.difficulty_level,
        category: node.properties.category,
        subject: node.properties.subject,
        estimated_time_hours: node.properties.estimated_time_hours,
        thumbnail_url: node.properties.thumbnail_url,
        hardware_required: hardwareList.map((h: any) => ({
          id: h.properties.id,
          name: h.properties.name,
          quantity: h.properties.quantity || 1,
        })),
        knowledge_points: knowledgePoints.map((k: any) => ({
          id: k.properties.id,
          name: k.properties.name,
        })),
        created_at: node.properties.created_at,
      };
    });

    return NextResponse.json({
      items: projects,
      total,
      page,
      size,
      total_pages: Math.ceil(total / size)
    });
  } catch (error) {
    console.error('Error fetching hardware projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hardware projects', details: error instanceof Error ? error.message : 'Unknown error' },
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
      difficulty_level,
      category,
      subject,
      estimated_time_hours,
      thumbnail_url,
      hardware_list,
      knowledge_point_ids
    } = body;

    if (!id || !title || !difficulty_level || !category || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields: id, title, difficulty_level, category, subject' },
        { status: 400 }
      );
    }

    const driver = getDriver();
    const session = driver.session();

    try {
      // 创建硬件项目节点
      const createQuery = `
        CREATE (p:HardwareProject {
          id: $id,
          title: $title,
          description: $description,
          difficulty_level: $difficulty_level,
          category: $category,
          subject: $subject,
          estimated_time_hours: $estimated_time_hours,
          thumbnail_url: $thumbnail_url,
          created_at: datetime(),
          updated_at: datetime()
        })
        RETURN p
      `;

      const createResult = await session.run(createQuery, {
        id,
        title,
        description: description || '',
        difficulty_level,
        category,
        subject,
        estimated_time_hours: estimated_time_hours || 2,
        thumbnail_url: thumbnail_url || ''
      });

      const project = createResult.records[0].get('p');

      // 关联所需硬件
      if (hardware_list && Array.isArray(hardware_list) && hardware_list.length > 0) {
        for (const hardware of hardware_list) {
          const hardwareQuery = `
            MERGE (h:Hardware {id: $hardwareId})
            ON CREATE SET h.name = $name, h.quantity = $quantity
            WITH h
            MATCH (p:HardwareProject {id: $projectId})
            CREATE (p)-[:REQUIRES]->(h)
          `;

          await session.run(hardwareQuery, {
            hardwareId: hardware.id || `hw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: hardware.name,
            quantity: hardware.quantity || 1,
            projectId: id
          });
        }
      }

      // 关联知识点
      if (knowledge_point_ids && Array.isArray(knowledge_point_ids) && knowledge_point_ids.length > 0) {
        const relateQuery = `
          MATCH (p:HardwareProject {id: $projectId})
          UNWIND $knowledgePointIds AS kpId
          MATCH (k:KnowledgePoint {id: kpId})
          CREATE (p)-[:TEACHES]->(k)
        `;

        await session.run(relateQuery, {
          projectId: id,
          knowledgePointIds: knowledge_point_ids
        });
      }

      return NextResponse.json({
        id: project.properties.id,
        title: project.properties.title,
        message: 'Hardware project created successfully'
      }, { status: 201 });
    } finally {
      await session.close();
    }
  } catch (error) {
    console.error('Error creating hardware project:', error);
    return NextResponse.json(
      { error: 'Failed to create hardware project', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
