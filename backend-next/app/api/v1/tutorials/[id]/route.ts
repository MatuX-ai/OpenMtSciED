import { NextResponse } from 'next/server';
import { getDriver } from '@/lib/neo4j';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const driver = getDriver();
  const session = driver.session();

  try {
    const query = `
      MATCH (t:Tutorial {id: $id})
      OPTIONAL MATCH (t)-[:CONTAINS]->(c:Content)
      RETURN t, collect(c) as contents
    `;

    const result = await session.run(query, { id });

    if (result.records.length === 0) {
      return NextResponse.json(
        { error: 'Tutorial not found' },
        { status: 404 }
      );
    }

    const record = result.records[0];
    const tutorial = record.get('t');
    const contents = record.get('contents');

    return NextResponse.json({
      id: tutorial.properties.id,
      title: tutorial.properties.title,
      description: tutorial.properties.description,
      grade_level: tutorial.properties.grade_level,
      subject: tutorial.properties.subject,
      duration_minutes: tutorial.properties.duration_minutes,
      difficulty_level: tutorial.properties.difficulty_level,
      content: tutorial.properties.content,
      created_at: tutorial.properties.created_at,
      updated_at: tutorial.properties.updated_at,
      contents: contents.map((c: any) => ({
        id: c.properties.id,
        type: c.properties.type,
        title: c.properties.title,
        url: c.properties.url,
      })),
    });
  } catch (error) {
    console.error('Error fetching tutorial:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tutorial', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const body = await request.json();
    const {
      title,
      description,
      grade_level,
      subject,
      duration_minutes,
      difficulty_level,
      content
    } = body;

    const driver = getDriver();
    const session = driver.session();

    try {
      const query = `
        MATCH (t:Tutorial {id: $id})
        SET t.title = COALESCE($title, t.title),
            t.description = COALESCE($description, t.description),
            t.grade_level = COALESCE($grade_level, t.grade_level),
            t.subject = COALESCE($subject, t.subject),
            t.duration_minutes = COALESCE($duration_minutes, t.duration_minutes),
            t.difficulty_level = COALESCE($difficulty_level, t.difficulty_level),
            t.content = COALESCE($content, t.content),
            t.updated_at = datetime()
        RETURN t
      `;

      const result = await session.run(query, {
        id,
        title,
        description,
        grade_level,
        subject,
        duration_minutes,
        difficulty_level,
        content
      });

      if (result.records.length === 0) {
        return NextResponse.json(
          { error: 'Tutorial not found' },
          { status: 404 }
        );
      }

      const tutorial = result.records[0].get('t');
      
      return NextResponse.json({
        id: tutorial.properties.id,
        title: tutorial.properties.title,
        message: 'Tutorial updated successfully'
      });
    } finally {
      await session.close();
    }
  } catch (error) {
    console.error('Error updating tutorial:', error);
    return NextResponse.json(
      { error: 'Failed to update tutorial', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const driver = getDriver();
  const session = driver.session();

  try {
    const query = `
      MATCH (t:Tutorial {id: $id})
      DETACH DELETE t
      RETURN count(t) as deleted
    `;

    const result = await session.run(query, { id });
    const deleted = result.records[0].get('deleted').toNumber();

    if (deleted === 0) {
      return NextResponse.json(
        { error: 'Tutorial not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Tutorial deleted successfully',
      id
    });
  } catch (error) {
    console.error('Error deleting tutorial:', error);
    return NextResponse.json(
      { error: 'Failed to delete tutorial', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}
