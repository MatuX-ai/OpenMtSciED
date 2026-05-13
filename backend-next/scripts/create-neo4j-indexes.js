// 创建Neo4j索引脚本
// 使用方法: node scripts/create-neo4j-indexes.js

require('dotenv').config({ path: '.env.local' });
const neo4j = require('neo4j-driver');

const NEO4J_URI = process.env.NEO4J_URI;
const NEO4J_USER = process.env.NEO4J_USERNAME;
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD;

if (!NEO4J_URI || !NEO4J_USER || !NEO4J_PASSWORD) {
  console.error('❌ 错误: 请在 .env.local 中配置 Neo4j 连接信息');
  process.exit(1);
}

const indexes = [
  'CREATE INDEX course_unit_subject IF NOT EXISTS FOR (cu:CourseUnit) ON (cu.subject)',
  'CREATE INDEX course_unit_grade IF NOT EXISTS FOR (cu:CourseUnit) ON (cu.grade_level)',
  'CREATE INDEX tutorial_id IF NOT EXISTS FOR (t:Tutorial) ON (t.id)',
  'CREATE INDEX hardware_project_difficulty IF NOT EXISTS FOR (p:HardwareProject) ON (p.difficulty_level)',
  'CREATE INDEX knowledge_point_id IF NOT EXISTS FOR (kp:KnowledgePoint) ON (kp.id)',
  'CREATE INDEX course_unit_created IF NOT EXISTS FOR (cu:CourseUnit) ON (cu.created_at)'
];

async function createIndexes() {
  const driver = neo4j.driver(
    NEO4J_URI,
    neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)
  );

  console.log('🔍 连接到 Neo4j...');
  
  try {
    await driver.verifyConnectivity();
    console.log('✅ 连接成功\n');

    const session = driver.session();

    for (const indexQuery of indexes) {
      try {
        console.log(`⏳ 创建索引: ${indexQuery.substring(0, 60)}...`);
        await session.run(indexQuery);
        console.log('   ✅ 成功\n');
      } catch (error) {
        console.log(`   ⚠️  跳过或失败: ${error.message}\n`);
      }
    }

    await session.close();
    
    console.log('🎉 所有索引创建完成!');
    console.log('\n💡 提示: 索引可能需要几分钟时间构建完成');
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await driver.close();
  }
}

createIndexes();
