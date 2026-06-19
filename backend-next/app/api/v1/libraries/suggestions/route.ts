import { NextResponse } from 'next/server';
import { isK12Academic } from '@/lib/k12-filter';
import { loadAllTitles, COURSE_LIBRARY_DIR, TEXTBOOK_LIBRARY_DIR, QUESTION_LIBRARY_DIR } from '@/lib/library-data';

// 排除合并数据文件（避免与原始数据重复）
const EXCLUDED_FILES = [
  'complete_stem_library.json',
  'validated_stem_library.json',
  'stem_complete_with_robotics.json',
  'stem_comprehensive_courses.json',
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').toLowerCase().trim();
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!q || q.length < 1) {
      return NextResponse.json({
        success: true,
        data: [],
        total: 0
      });
    }

    // 加载教程、课件和试题标题
    const tutorialTitles = loadAllTitles(COURSE_LIBRARY_DIR, [], EXCLUDED_FILES);
    const materialTitles = loadAllTitles(TEXTBOOK_LIBRARY_DIR);
    const questionTitles = loadAllTitles(QUESTION_LIBRARY_DIR, [], ['test_openstax_questions.json']);

    const suggestions: { title: string; type: string }[] = [];
    const seen = new Set<string>();

    // 添加匹配的教程标题
    for (const title of tutorialTitles) {
      if (title.toLowerCase().includes(q) && !seen.has(title)) {
        // 跳过 K12 学科类
        if (isK12Academic({ title })) { continue; }
        seen.add(title);
        suggestions.push({ title, type: 'tutorial' });
      }
    }

    // 添加匹配的课件标题
    for (const title of materialTitles) {
      if (title.toLowerCase().includes(q) && !seen.has(title)) {
        // 跳过 K12 学科类
        if (isK12Academic({ title })) { continue; }
        seen.add(title);
        suggestions.push({ title, type: 'material' });
      }
    }

    // 添加匹配的试题内容
    for (const title of questionTitles) {
      // 跳过明显的学科教育标题（含"复习""考试""课本"等关键词）
      if (/复习|考试|课本|教材|习题/.test(title) && /生物|物理|化学|数学/.test(title)) continue;
      if (title.toLowerCase().includes(q) && !seen.has(title)) {
        seen.add(title);
        suggestions.push({ title: title.substring(0, 100), type: 'question' });
      }
    }

    // 按匹配度排序：前缀匹配优先
    suggestions.sort((a, b) => {
      const aStarts = a.title.toLowerCase().startsWith(q) ? 1 : 0;
      const bStarts = b.title.toLowerCase().startsWith(q) ? 1 : 0;
      return bStarts - aStarts || a.title.length - b.title.length;
    });

    return NextResponse.json({
      success: true,
      data: suggestions.slice(0, limit),
      total: suggestions.length
    });
  } catch (error: unknown) {
    console.error('Suggestions error:', error);
    return NextResponse.json(
      { success: false, error: '获取建议失败' },
      { status: 500 }
    );
  }
}
