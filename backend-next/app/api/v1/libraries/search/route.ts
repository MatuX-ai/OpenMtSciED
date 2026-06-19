import { NextResponse } from 'next/server';
import path from 'path';
import prisma from '@/lib/db';
import { isK12Academic } from '@/lib/k12-filter';
import {
  loadJsonFiles,
  loadJsonArray,
  COURSE_LIBRARY_DIR,
  TEXTBOOK_LIBRARY_DIR,
  DATA_DIR,
} from '@/lib/library-data';

const HARDWARE_FILE = path.join(DATA_DIR, 'hardware_projects.json');

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'tutorial' | 'material' | 'hardware' | 'question';
  source: string;
  subject: string;
  grade_level: string;
  url: string;
  score: number;
}

// 排除合并数据文件（避免与原始数据重复）
const EXCLUDED_FILES = [
  'complete_stem_library.json',
  'validated_stem_library.json',
  'stem_complete_with_robotics.json',
  'stem_comprehensive_courses.json',
];

/**
 * 计算相关性评分
 */
function calculateScore(item: any, query: string, fields: string[]): number {
  const q = query.toLowerCase();
  let score = 0;

  for (const field of fields) {
    const value = String(item[field] || '').toLowerCase();
    if (value === q) {
      score += 100; // 完全匹配
    } else if (value.startsWith(q)) {
      score += 50;  // 前缀匹配
    } else if (value.includes(q)) {
      score += 20;  // 子串匹配
    }
    // 词级别匹配
    const words = q.split(/[\s,，、]+/).filter(w => w.length > 0);
    for (const word of words) {
      if (value.includes(word)) {
        score += 10;
      }
    }
  }
  return score;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!q.trim()) {
      return NextResponse.json({
        success: true,
        data: [],
        total: 0
      });
    }

    const results: SearchResult[] = [];

    // 搜索教程
    if (type === 'all' || type === 'tutorial') {
      const tutorials: any[] = loadJsonFiles(COURSE_LIBRARY_DIR, [], EXCLUDED_FILES);
      for (const t of tutorials) {
        const score = calculateScore(t, q, ['title', 'description', 'subject', 'category']);
        if (score > 0 && (t.tutorial_id || t.unit_id || t.course_id)) {
          results.push({
            id: t.tutorial_id || t.unit_id || t.course_id || t.id || '',
            title: t.title || '',
            description: (t.description || '').substring(0, 200),
            type: 'tutorial',
            source: t.source || t._source_file?.replace('.json', '') || '未知',
            subject: t.subject || t.category || '未分类',
            grade_level: t.grade_level || t.level || 'unknown',
            url: t.url || '',
            score
          });
        }
      }
    }

    // 搜索课件
    if (type === 'all' || type === 'material') {
      const materials: any[] = loadJsonFiles(TEXTBOOK_LIBRARY_DIR);
      for (const m of materials) {
        const score = calculateScore(m, q, ['title', 'textbook', 'subject', 'category', 'knowledge_summary']);
        if (score > 0) {
          results.push({
            id: m.id || m.chapter_id || '',
            title: m.title || '',
            description: m.knowledge_summary || m.textbook || (m.description || '').substring(0, 200),
            type: 'material',
            source: m.source || m._source_file?.replace('.json', '') || '未知',
            subject: m.subject || m.category || '未分类',
            grade_level: m.grade_level || 'unknown',
            url: m.chapter_url || m.pdf_download_url || m.download_url || '',
            score
          });
        }
      }
    }

    // 搜索硬件项目
    if (type === 'all' || type === 'hardware') {
      const hardware = loadJsonArray<any>(HARDWARE_FILE);
      for (const h of hardware) {
        const score = calculateScore(h, q, ['title', 'description', 'subject', 'category', 'learning_objectives']);
        if (score > 0) {
          results.push({
            id: h.project_id || h.id || '',
            title: h.title || '',
            description: (h.description || '').substring(0, 200),
            type: 'hardware',
            source: '硬件项目',
            subject: h.subject || h.category || '未分类',
            grade_level: String(h.difficulty || 'beginner'),
            url: '',
            score
          });
        }
      }
    }

    // 搜索试题（从 PostgreSQL 数据库读取，已过滤学科内容）
    if (type === 'all' || type === 'question') {
      try {
        const dbQuestions = await prisma.question.findMany({
          where: {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { content: { contains: q, mode: 'insensitive' } },
              { subject: { contains: q, mode: 'insensitive' } },
              { explanation: { contains: q, mode: 'insensitive' } },
            ]
          },
          take: limit * 2, // 取较多结果，后续与其他类型一起排序截断
        });

        for (const dbq of dbQuestions) {
          // 计算相关性评分
          const score = calculateScore(
            { title: dbq.title, content: dbq.content, subject: dbq.subject, explanation: dbq.explanation },
            q,
            ['title', 'content', 'subject', 'explanation']
          );
          if (score > 0) {
            results.push({
              id: String(dbq.id),
              title: dbq.title.substring(0, 150),
              description: (dbq.explanation || dbq.answer || '').substring(0, 200),
              type: 'question',
              source: 'STEM题库',
              subject: dbq.subject || '未分类',
              grade_level: dbq.difficulty || 'medium',
              url: '',
              score
            });
          }
        }
      } catch (dbError) {
        console.warn('Database question search failed, skipping:', dbError);
        // 数据库不可用时静默跳过，不影响其他类型搜索
      }
    }

    // 过滤 K12 学科类课程
    const filteredResults = results.filter(r => !isK12Academic(r));

    // 按评分降序排列
    filteredResults.sort((a, b) => b.score - a.score);
    const paginated = filteredResults.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: paginated,
      total: filteredResults.length,
      totalBeforeFilter: results.length,
      query: q,
      type
    });
  } catch (error: unknown) {
    console.error('Search error:', error);
    return NextResponse.json(
      { success: false, error: '搜索服务错误', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
