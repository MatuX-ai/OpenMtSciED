import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import neo4j from 'neo4j-driver';

const DATA_DIR = path.join(process.cwd(), '..', 'data', 'question_library');

const NEO4J_URI = process.env.NEO4J_URI || 'neo4j+s://4abd5ef9.databases.neo4j.io';
const NEO4J_USER = process.env.NEO4J_USERNAME || '4abd5ef9';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'bXebDaB8hSalBxvvB5GhHmcvudO03ilZB7qItmI0Xbs';

/**
 * 从题目文件生成题库信息
 * 注意：本项目针对学科外STEM教育，排除传统学科内容
 */
function generateBanks() {
  const banks: any[] = [];
  
  // STEM教育主题分类（学科外）
  const stemCategories = {
    'robotics': '机器人',
    'arduino': 'Arduino',
    'raspberry': '树莓派',
    'programming': '编程',
    'electronics': '电子电路',
    '3d_printing': '3D打印',
    'ai_ml': '人工智能',
    'iot': '物联网',
    'maker': '创客教育',
    'stem_pbl': 'STEM项目式学习',
    'engineering': '工程设计',
    'space': '航天航空',
    'renewable_energy': '可再生能源',
    'biotech': '生物技术',
    'materials': '材料科学'
  };
  
  // 需要排除的传统学科关键词
  const excludeKeywords = [
    'biology',      // 生物学
    'physics',      // 物理学
    'chemistry',    // 化学
    'math',         // 数学
    'algebra',      // 代数
    'calculus',     // 微积分
    'geometry',     // 几何
    'literature',   // 文学
    'history',      // 历史
    'geography'     // 地理
  ];
  
  try {
    if (!fs.existsSync(DATA_DIR)) {
      return banks;
    }
    
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
    
    files.forEach((file, index) => {
      const filePath = path.join(DATA_DIR, file);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const questions = JSON.parse(content);
        
        if (Array.isArray(questions) && questions.length > 0) {
          const fileName = file.replace('.json', '').toLowerCase();
          
          // 检查是否包含需要排除的传统学科关键词
          const shouldExclude = excludeKeywords.some(keyword => 
            fileName.includes(keyword)
          );
          
          if (shouldExclude) {
            console.log(`[题库过滤] 排除传统学科题库: ${file}`);
            return; // 跳过此文件
          }
          
          // 推断STEM主题和来源
          let subject = 'STEM综合';
          let source = 'unknown';
          const level = undefined;
          
          // 匹配STEM主题
          for (const [key, value] of Object.entries(stemCategories)) {
            if (fileName.includes(key)) {
              subject = value;
              break;
            }
          }
          
          // 识别数据来源
          if (fileName.includes('openstax')) {
            source = 'OpenStax';
          } else if (fileName.includes('test')) {
            source = '测试数据';
          } else if (fileName.includes('khan')) {
            source = 'Khan Academy';
          } else if (fileName.includes('coursera')) {
            source = 'Coursera';
          } else if (fileName.includes('edx')) {
            source = 'edX';
          } else {
            source = '自定义';
          }
          
          banks.push({
            id: index + 1,
            name: fileName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            source: source,
            subject: subject,
            level: level,
            total_questions: questions.length,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error(`Error reading file ${file}:`, error);
      }
    });
  } catch (error) {
    console.error('Error generating banks:', error);
  }
  
  console.log(`[题库统计] 共加载 ${banks.length} 个STEM教育题库`);
  return banks;
}

/**
 * 从Neo4j读取STEM题库统计
 */
async function getStemBanksFromNeo4j() {
  const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
  
  try {
    const session = driver.session();
    
    // 按分类统计题目数量
    const result = await session.run(`
      MATCH (q:Question {source: 'stem_education'})
      RETURN q.category as category,
             count(q) as count
      ORDER BY count DESC
    `);
    
    const banks = result.records.map((record, index) => {
      const category = record.get('category');
      const count = record.get('count').toNumber();
      
      // 分类名称映射
      const categoryNames: Record<string, string> = {
        'arduino': 'Arduino编程基础',
        'robotics': '机器人技术',
        'programming': '编程与计算思维',
        'electronics': '电子电路基础',
        '3d_printing': '3D打印与制造',
        'iot': '物联网（IoT）',
        'ai_ml': '人工智能基础',
        'engineering': '工程设计与创客'
      };
      
      return {
        id: 100 + index, // 使用100+ID区分Neo4j题库
        name: categoryNames[category] || category,
        source: 'STEM教育题库',
        subject: 'STEM综合',
        total_questions: count,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    });
    
    await session.close();
    await driver.close();
    
    console.log(`[Neo4j题库] 加载 ${banks.length} 个STEM题库`);
    return banks;
  } catch (error) {
    console.error('Error loading from Neo4j:', error);
    await driver.close();
    return [];
  }
}

/**
 * GET /api/v1/questions/banks
 * 获取题库列表
 */
export async function GET() {
  try {
    // 从JSON文件加载题库
    const fileBanks = generateBanks();
    
    // 从Neo4j加载STEM题库
    const neo4jBanks = await getStemBanksFromNeo4j();
    
    // 合并两个来源的题库
    const allBanks = [...fileBanks, ...neo4jBanks];
    
    console.log(`[题库统计] 共加载 ${allBanks.length} 个STEM教育题库（JSON: ${fileBanks.length}, Neo4j: ${neo4jBanks.length}）`);
    
    return NextResponse.json({
      success: true,
      data: allBanks
    });
  } catch (error: any) {
    console.error('Get question banks error:', error);
    return NextResponse.json(
      { error: '服务器错误', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/questions/banks
 * 创建新题库
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 在实际实现中，这里应该保存到数据库或文件
    // 现在只是返回成功响应
    const newBank = {
      id: Date.now(),
      ...body,
      total_questions: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      data: newBank
    });
  } catch (error: any) {
    console.error('Create question bank error:', error);
    return NextResponse.json(
      { error: '服务器错误', message: error.message },
      { status: 500 }
    );
  }
}
