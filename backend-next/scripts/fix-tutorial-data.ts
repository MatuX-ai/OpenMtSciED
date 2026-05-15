/**
 * 修复Neo4j数据库中的教程数据
 * 解决中文乱码问题并补充示例数据
 */
import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env.local') });

const NEO4J_URI = process.env.NEO4J_URI || 'bolt://localhost:7687';
const NEO4J_USER = process.env.NEO4J_USERNAME || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'password';

// 教程示例数据
const tutorialData = [
  {
    id: 'tutorial_physics_001',
    title: '牛顿第二定律实验探究',
    description: '通过实验验证F=ma，学习力的测量和加速度计算方法',
    grade_level: '9-12',
    subject: 'physics',
    duration_minutes: 60,
    difficulty_level: 'intermediate'
  },
  {
    id: 'tutorial_math_001',
    title: '二次函数图像与性质',
    description: '学习二次函数的图像特征、顶点坐标、对称轴等性质',
    grade_level: '9-12',
    subject: 'mathematics',
    duration_minutes: 45,
    difficulty_level: 'intermediate'
  },
  {
    id: 'tutorial_chemistry_001',
    title: '酸碱中和滴定实验',
    description: '学习酸碱中和反应原理，掌握滴定操作技能',
    grade_level: '9-12',
    subject: 'chemistry',
    duration_minutes: 90,
    difficulty_level: 'advanced'
  },
  {
    id: 'tutorial_biology_001',
    title: '显微镜的使用与细胞观察',
    description: '学习显微镜的正确使用方法，观察细胞结构',
    grade_level: '6-8',
    subject: 'biology',
    duration_minutes: 60,
    difficulty_level: 'beginner'
  },
  {
    id: 'tutorial_cs_001',
    title: 'Python编程基础：变量与数据类型',
    description: '学习Python中的变量、数据类型和基本运算',
    grade_level: '9-12',
    subject: 'computer_science',
    duration_minutes: 45,
    difficulty_level: 'beginner'
  }
];

async function fixTutorialData() {
  const driver = neo4j.driver(
    NEO4J_URI,
    neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)
  );

  try {
    await driver.verifyConnectivity();
    console.log('✅ Neo4j连接成功');

    const session = driver.session();

    try {
      // 1. 删除旧的测试数据
      console.log('\n🗑️  删除旧的测试数据...');
      await session.run('MATCH (t:Tutorial {id: "test_tutorial_001"}) DELETE t');
      console.log('✅ 已删除 test_tutorial_001');

      // 2. 插入新的示例数据
      console.log('\n 插入新的教程数据...');
      for (const tutorial of tutorialData) {
        const query = `
          CREATE (t:Tutorial {
            id: $id,
            title: $title,
            description: $description,
            grade_level: $grade_level,
            subject: $subject,
            duration_minutes: $duration_minutes,
            difficulty_level: $difficulty_level,
            created_at: datetime(),
            updated_at: datetime()
          })
        `;
        
        await session.run(query, tutorial);
        console.log(`  ✅ ${tutorial.title}`);
      }

      // 3. 验证数据
      console.log('\n🔍 验证数据...');
      const result = await session.run('MATCH (t:Tutorial) RETURN count(t) as total');
      const total = result.records[0].get('total').toNumber();
      console.log(`✅ 数据库中共有 ${total} 条教程`);

      const sampleResult = await session.run(`
        MATCH (t:Tutorial) 
        RETURN t.title as title, t.subject as subject 
        LIMIT 3
      `);
      console.log('\n📋 示例数据:');
      sampleResult.records.forEach(record => {
        console.log(`  - ${record.get('title')} (${record.get('subject')})`);
      });

    } finally {
      await session.close();
    }
  } catch (error) {
    console.error('❌ 执行失败:', error);
    throw error;
  } finally {
    await driver.close();
  }
}

fixTutorialData()
  .then(() => {
    console.log('\n✅ 数据修复完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 修复失败:', error);
    process.exit(1);
  });
