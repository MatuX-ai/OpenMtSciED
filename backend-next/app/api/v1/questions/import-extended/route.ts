import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import neo4j from 'neo4j-driver';

const DATA_DIR = path.join(process.cwd(), '..', 'data', 'question_library');
const EXTENDED_FILE = path.join(DATA_DIR, 'stem_education_extended.json');

const NEO4J_URI = process.env.NEO4J_URI || 'neo4j+s://4abd5ef9.databases.neo4j.io';
const NEO4J_USER = process.env.NEO4J_USERNAME || '4abd5ef9';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'bXebDaB8hSalBxvvB5GhHmcvudO03ilZB7qItmI0Xbs';

/**
 * POST /api/v1/questions/import-extended
 * 批量导入扩展STEM题库（1000题）到Neo4j
 */
export async function POST() {
  try {
    // 读取JSON文件
    if (!fs.existsSync(EXTENDED_FILE)) {
      return NextResponse.json(
        { 
          success: false,
          error: '文件不存在',
          message: '请先运行 generate_1000_stem_questions.py 生成数据'
        },
        { status: 404 }
      );
    }
    
    const content = fs.readFileSync(EXTENDED_FILE, 'utf-8');
    const questions = JSON.parse(content);
    
    console.log(`\n🚀 开始导入 ${questions.length} 道扩展STEM题目...`);
    
    const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
    const session = driver.session();
    
    let imported = 0;
    const batchSize = 50;
    
    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, i + batchSize);
      
      for (const q of batch) {
        const questionId = `stem-ext-${q.category}-${imported + 1}`.substring(0, 50);
        
        const query = `
          MERGE (q:Question {id: $id})
          SET q.content = $content,
              q.answer = $answer,
              q.difficulty = $difficulty,
              q.knowledge_points = $knowledge_points,
              q.category = $category,
              q.source = $source,
              q.created_at = datetime()
          RETURN q.id as id
        `;
        
        const result = await session.run(query, {
          id: questionId,
          content: q.content,
          answer: q.answer,
          difficulty: q.difficulty,
          knowledge_points: JSON.stringify(q.knowledge_points),
          category: q.category,
          source: q.source || 'stem_education_extended'
        });
        
        if (result.records.length > 0) {
          imported++;
        }
      }
      
      if ((imported % 100 === 0) || (imported === questions.length)) {
        console.log(`✅ 已导入 ${imported}/${questions.length} 题`);
      }
    }
    
    // 统计信息
    const statsResult = await session.run(`
      MATCH (q:Question {source: 'stem_education_extended'})
      RETURN count(q) as total,
             count(DISTINCT q.category) as categories
    `);
    
    const stats = statsResult.records[0];
    
    await session.close();
    await driver.close();
    
    console.log(`\n✅ 导入完成！共导入 ${imported} 道扩展STEM题目`);
    
    return NextResponse.json({
      success: true,
      message: `成功导入 ${imported} 道扩展STEM题目`,
      data: {
        totalImported: imported,
        totalInDatabase: stats.get('total').toNumber(),
        categories: stats.get('categories').toNumber()
      }
    });
  } catch (error: any) {
    console.error('Import extended questions error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '导入失败', 
        message: error.message 
      },
      { status: 500 }
    );
  }
}
