import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/db';

const DATA_DIR = path.join(process.cwd(), '..', 'data', 'question_library');
const EXTENDED_FILE = path.join(DATA_DIR, 'stem_education_extended.json');

/**
 * POST /api/v1/questions/import-extended
 * 批量导入扩展STEM题库（1000题）到PostgreSQL
 */
export async function POST() {
  try {
    if (!fs.existsSync(EXTENDED_FILE)) {
      return NextResponse.json(
        {
          success: false,
          error: '文件不存在',
          message: '请先运行 generate_1000_stem_questions.py 生成数据',
        },
        { status: 404 }
      );
    }

    const content = fs.readFileSync(EXTENDED_FILE, 'utf-8');
    const questions = JSON.parse(content);

    console.log(`\n开始导入 ${questions.length} 道扩展STEM题目...`);

    let imported = 0;

    for (const q of questions) {
      const title = (q.content || '').substring(0, 200);
      try {
        const existing = await prisma.question.findFirst({ where: { title } });
        if (existing) {
          await prisma.question.update({
            where: { id: existing.id },
            data: {
              content: q.content,
              answer: q.answer,
              difficulty: q.difficulty > 0.6 ? 'hard' : q.difficulty > 0.3 ? 'medium' : 'easy',
              subject: q.category || 'stem',
              explanation: Array.isArray(q.knowledge_points) ? q.knowledge_points.join(', ') : '',
            },
          });
        } else {
          await prisma.question.create({
            data: {
              title,
              content: q.content,
              type: 'fill_blank',
              difficulty: q.difficulty > 0.6 ? 'hard' : q.difficulty > 0.3 ? 'medium' : 'easy',
              subject: q.category || 'stem',
              answer: q.answer,
              explanation: Array.isArray(q.knowledge_points) ? q.knowledge_points.join(', ') : '',
            },
          });
        }
        imported++;
      } catch {
        // skip duplicates or errors
      }

      if (imported % 100 === 0 && imported > 0) {
        console.log(`已导入 ${imported}/${questions.length} 题`);
      }
    }

    const totalInDb = await prisma.question.count();

    console.log(`\n导入完成！共导入 ${imported} 道扩展STEM题目`);

    return NextResponse.json({
      success: true,
      message: `成功导入 ${imported} 道扩展STEM题目`,
      data: {
        totalImported: imported,
        totalInDatabase: totalInDb,
      },
    });
  } catch (error: unknown) {
    console.error('Import extended questions error:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { success: false, error: '导入失败', message: errorMessage },
      { status: 500 }
    );
  }
}
