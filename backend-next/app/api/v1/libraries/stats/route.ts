import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import {
  loadJsonFiles,
  loadJsonArray,
  COURSE_LIBRARY_DIR,
  TEXTBOOK_LIBRARY_DIR,
  DATA_DIR,
} from '@/lib/library-data';
import path from 'path';

const HARDWARE_FILE = path.join(DATA_DIR, 'hardware_projects.json');

// 排除合并数据文件
const EXCLUDED_FILES = [
  'complete_stem_library.json',
  'validated_stem_library.json',
  'stem_complete_with_robotics.json',
  'stem_comprehensive_courses.json',
];

/**
 * GET /api/v1/libraries/stats
 * 返回各资源库的实时数量统计（用于营销展示）
 */
export async function GET() {
  try {
    // 统计教程数量（从 JSON 文件，有 ID 的才算有效）
    const tutorials = loadJsonFiles<{
      tutorial_id?: string;
      unit_id?: string;
      course_id?: string;
      id?: string;
    }>(COURSE_LIBRARY_DIR, [], EXCLUDED_FILES);
    const tutorialCount = tutorials.filter(
      t => t.tutorial_id || t.unit_id || t.course_id || t.id
    ).length;

    // 统计课件数量
    const materials = loadJsonFiles(TEXTBOOK_LIBRARY_DIR);
    const materialCount = materials.length;

    // 统计硬件项目数量
    const hardware = loadJsonArray(HARDWARE_FILE);
    const hardwareCount = hardware.length;

    // 统计试题数量（从数据库）
    let questionCount = 0;
    try {
      questionCount = await prisma.question.count();
    } catch {
      // 数据库不可用时返回 0
    }

    const total = tutorialCount + materialCount + hardwareCount + questionCount;

    return NextResponse.json({
      success: true,
      data: {
        tutorials: tutorialCount,
        materials: materialCount,
        hardware: hardwareCount,
        questions: questionCount,
        total,
      },
    });
  } catch (error: unknown) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { success: false, error: '获取统计数据失败' },
      { status: 500 }
    );
  }
}
