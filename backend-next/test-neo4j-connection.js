// Neo4j 连接测试脚本
// 使用方法: node test-neo4j-connection.js

const neo4j = require('neo4j-driver');

// 从环境变量读取配置
const NEO4J_URI = process.env.NEO4J_URI || 'neo4j+s://4abd5ef9.databases.neo4j.io';
const NEO4J_USER = process.env.NEO4J_USERNAME || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD;

if (!NEO4J_PASSWORD) {
  console.error('❌ 错误: 未设置 NEO4J_PASSWORD 环境变量');
  console.log('请在 .env.local 文件中设置正确的密码,或运行:');
  console.log('set NEO4J_PASSWORD=your_password && node test-neo4j-connection.js');
  process.exit(1);
}

console.log('🔍 正在测试 Neo4j 连接...');
console.log(`   URI: ${NEO4J_URI}`);
console.log(`   User: ${NEO4J_USER}`);
console.log('');

async function testConnection() {
  let driver;
  
  try {
    // 创建驱动
    driver = neo4j.driver(
      NEO4J_URI,
      neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD),
      {
        maxConnectionPoolSize: 10,
        connectionTimeout: 30000,
      }
    );

    console.log('⏳ 正在验证连接...');
    
    // 验证连接
    await driver.verifyConnectivity();
    console.log('✅ Neo4j 连接成功!');
    console.log('');

    // 创建会话并执行测试查询
    const session = driver.session();
    
    try {
      console.log('⏳ 正在执行测试查询...');
      
      // 查询数据库中存在的节点类型和数量
      const result = await session.run(`
        MATCH (n)
        RETURN labels(n)[0] as label, count(n) as count
        ORDER BY count DESC
        LIMIT 10
      `);

      if (result.records.length > 0) {
        console.log('📊 数据库中的节点统计:');
        result.records.forEach(record => {
          const label = record.get('label');
          const count = record.get('count').toNumber();
          console.log(`   - ${label}: ${count} 个`);
        });
      } else {
        console.log('⚠️  数据库中没有数据');
      }

      console.log('');
      
      // 查询关系统计
      const relResult = await session.run(`
        MATCH ()-[r]->()
        RETURN type(r) as relType, count(r) as count
        ORDER BY count DESC
        LIMIT 10
      `);

      if (relResult.records.length > 0) {
        console.log('🔗 数据库中的关系统计:');
        relResult.records.forEach(record => {
          const relType = record.get('relType');
          const count = record.get('count').toNumber();
          console.log(`   - ${relType}: ${count} 条`);
        });
      }

      console.log('');
      console.log('✅ 所有测试通过! Neo4j 已就绪');
      
    } finally {
      await session.close();
    }

  } catch (error) {
    console.error('❌ Neo4j 连接失败:');
    console.error(`   错误信息: ${error.message}`);
    console.error('');
    console.error('可能的原因:');
    console.error('   1. 密码不正确');
    console.error('   2. 网络连接问题');
    console.error('   3. Neo4j 实例未启动');
    console.error('');
    console.error('请检查 .env.local 文件中的配置是否正确');
    process.exit(1);
  } finally {
    if (driver) {
      await driver.close();
      console.log('');
      console.log('🔒 连接已关闭');
    }
  }
}

testConnection();
