import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/db';

const DATA_DIR = path.join(process.cwd(), '..', 'data', 'question_library');

/**
 * 从题目文件生成题库信息
 * 注意：本项目针对学科外STEM教育，排除传统学科内容
 */
function generateBanksFromFile() {
  const banks: Array<{
    id: number;
    name: string;
    source: string;
    subject: string;
    level?: string;
    total_questions: number;
    created_at: string;
    updated_at: string;
  }> = [];

  const stemCategories: Record<string, string> = {
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
    'materials': '材料科学',
  };

  const excludeKeywords = [
    'biology', 'physics', 'chemistry', 'math', 'algebra',
    'calculus', 'geometry', 'literature', 'history', 'geography',
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

          const shouldExclude = excludeKeywords.some(keyword =>
            fileName.includes(keyword)
          );

          if (shouldExclude) {
            console.log(`[题库过滤] 排除传统学科题库: ${file}`);
            return;
          }

          let subject = 'STEM综合';
          let source = 'unknown';

          for (const [key, value] of Object.entries(stemCategories)) {
            if (fileName.includes(key)) {
              subject = value;
              break;
            }
          }

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
            source,
            subject,
            total_questions: questions.length,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error(`Error reading file ${file}:`, error);
      }
    });
  } catch (error) {
    console.error('Error generating banks:', error);
  }

  return banks;
}

/**
 * 从PostgreSQL读取STEM题库统计
 */
async function getStemBanksFromDb() {
  try {
    // 按 subject 分组统计
    const stats = await prisma.$queryRaw<Array<{ subject: string; count: bigint }>>`
      SELECT subject, COUNT(*) as count
      FROM "Question"
      GROUP BY subject
      ORDER BY count DESC
    `;

    const categoryNames: Record<string, string> = {
      'arduino': 'Arduino编程基础',
      'robotics': '机器人技术',
      'programming': '编程与计算思维',
      'electronics': '电子电路基础',
      '3d_printing': '3D打印与制造',
      'iot': '物联网（IoT）',
      'ai_ml': '人工智能基础',
      'engineering': '工程设计与创客',
    };

    return stats.map((row, index) => ({
      id: 100 + index,
      name: categoryNames[row.subject] || row.subject,
      source: 'STEM教育题库',
      subject: 'STEM综合',
      total_questions: Number(row.count),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error loading from PostgreSQL:', error);
    return [];
  }
}

/**
 * GET /api/v1/questions/banks
 * 获取题库列表
 */
export async function GET() {
  try {
    const fileBanks = generateBanksFromFile();
    const dbBanks = await getStemBanksFromDb();

    const allBanks = [...fileBanks, ...dbBanks];

    console.log(`[题库统计] 共加载 ${allBanks.length} 个STEM教育题库（JSON: ${fileBanks.length}, DB: ${dbBanks.length}）`);

    return NextResponse.json({
      success: true,
      data: allBanks,
    });
  } catch (error: unknown) {
    console.error('Get question banks error:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: '服务器错误', message: errorMessage },
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

    const newBank = {
      id: Date.now(),
      ...body,
      total_questions: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: newBank,
    });
  } catch (error: unknown) {
    console.error('Create question bank error:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: '服务器错误', message: errorMessage },
      { status: 500 }
    );
  }
}
