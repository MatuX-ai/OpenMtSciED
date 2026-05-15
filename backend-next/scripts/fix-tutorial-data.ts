/**
 * 修复Neo4j数据库中的教程数据
 * 删除课内学科内容，导入真正的STEM课外教育资源
 */
import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env.local') });

const NEO4J_URI = process.env.NEO4J_URI || 'bolt://localhost:7687';
const NEO4J_USER = process.env.NEO4J_USERNAME || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'password';

// STEM课外教育示例数据
const tutorialData = [
  {
    id: 'stem_robot_001',
    title: 'Arduino智能小车制作',
    description: '学习使用Arduino控制超声波传感器和电机，制作避障智能小车，培养工程思维',
    grade_level: '9-12',
    subject: 'robotics',
    duration_minutes: 120,
    difficulty_level: 'intermediate'
  },
  {
    id: 'stem_iot_001',
    title: '树莓派气象站项目',
    description: '使用树莓派和传感器搭建气象站，实时采集温湿度、气压数据并可视化',
    grade_level: '9-12',
    subject: 'iot',
    duration_minutes: 150,
    difficulty_level: 'advanced'
  },
  {
    id: 'stem_3d_001',
    title: 'Tinkercad 3D建模入门',
    description: '学习使用Tinkercad进行3D建模，设计并打印自己的创意作品',
    grade_level: '6-8',
    subject: 'engineering',
    duration_minutes: 90,
    difficulty_level: 'beginner'
  },
  {
    id: 'stem_python_001',
    title: 'Python数据分析与可视化',
    description: '使用Python和Matplotlib分析真实数据，制作交互式图表，培养数据思维',
    grade_level: '9-12',
    subject: 'data_science',
    duration_minutes: 100,
    difficulty_level: 'intermediate'
  },
  {
    id: 'stem_ai_001',
    title: 'Scratch AI图像识别项目',
    description: '使用Scratch和机器学习扩展，训练AI识别手势并控制角色',
    grade_level: '6-8',
    subject: 'ai',
    duration_minutes: 80,
    difficulty_level: 'beginner'
  },
  {
    id: 'stem_elec_001',
    title: '电路基础与LED灯设计',
    description: '学习串联并联电路，使用面包板搭建LED调光电路，理解欧姆定律',
    grade_level: '6-8',
    subject: 'electronics',
    duration_minutes: 75,
    difficulty_level: 'beginner'
  },
  {
    id: 'stem_drone_001',
    title: '无人机编程与飞行控制',
    description: '学习使用Python编程控制无人机，完成自主飞行和图像采集任务',
    grade_level: '9-12',
    subject: 'robotics',
    duration_minutes: 135,
    difficulty_level: 'advanced'
  },
  {
    id: 'stem_game_001',
    title: 'Unity 2D游戏开发',
    description: '使用Unity引擎开发2D平台游戏，学习物理引擎和角色控制',
    grade_level: '9-12',
    subject: 'game_dev',
    duration_minutes: 180,
    difficulty_level: 'intermediate'
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
      // 1. 删除所有现有教程数据
      console.log('\n🗑️  删除现有教程数据...');
      const deleteResult = await session.run('MATCH (t:Tutorial) DELETE t');
      console.log(`✅ 已删除 ${deleteResult.summary.counters.updates().nodesDeleted} 条数据`);

      // 2. 插入新的STEM课外教育资源
      console.log('\n📚 插入STEM课外教育资源...');
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
      console.log(`✅ 数据库中共有 ${total} 条STEM课外教程`);

      const sampleResult = await session.run(`
        MATCH (t:Tutorial) 
        RETURN t.title as title, t.subject as subject 
        ORDER BY t.created_at DESC
        LIMIT 5
      `);
      console.log('\n📋 最新5条教程:');
      sampleResult.records.forEach(record => {
        console.log(`  - ${record.get('title')} [${record.get('subject')}]`);
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
    console.log('\n✅ STEM课外教育资源导入完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 导入失败:', error);
    process.exit(1);
  });
