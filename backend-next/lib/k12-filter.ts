/**
 * K12 学科类课程过滤工具
 *
 * 本项目定位 STEM 非学科教育（编程、机器人、电子、AI、物联网、3D打印、创客等），
 * 严格避开 K12 标准学科课程。此模块提供统一的过滤判断逻辑。
 *
 * 过滤规则：
 * 1. 硬黑名单学科（如 数学、语文、英语、政治、历史、地理）→ 始终过滤
 * 2. 可凝学科（物理/化学/生物）：Khan Academy 来源 → 过滤（标准K12课程）
 *                               OpenSciEd 来源 → 保留（现象驱动探究）
 * 3. 经济学：非大学级别 → 过滤
 * 4. 其他内容 → 保留为 STEM 非学科教育
 */

/** 硬黑名单：K12标准学科课程 */
const ACADEMIC_SUBJECT_BLACKLIST = [
  '语文', '数学', '英语', '外语', '政治',
  '历史', '地理', '思想品德', '道德与法治',
];

/** 可凝学科：需结合来源判断 */
const AMBIGUOUS_SUBJECTS = ['物理', '化学', '生物', '科学'];

/** K12课程来源（标准学科教学型） */
const K12_SOURCES = ['khan_academy'];

/** K12级别关键词 */
const K12_LEVEL_KEYWORDS = ['elementary', 'middle'];

/**
 * 判断内容是否为 K12 学科类课程（需要被过滤）
 */
export function isK12Academic(item: {
  subject?: string;
  title?: string;
  description?: string;
  source?: string;
  grade_level?: string;
  type?: string;
}): boolean {
  const subject = (item.subject || '').trim();
  const title = (item.title || '').trim();
  const source = (item.source || '').toLowerCase().trim();
  const gradeLevel = (item.grade_level || '').toLowerCase().trim();

  // ===== 规则1: 硬黑名单学科 =====
  if (ACADEMIC_SUBJECT_BLACKLIST.includes(subject)) {
    return true;
  }

  // ===== 规则2: 经济学（非大学级别 = K12学科） =====
  if (subject === '经济' || subject === '经济学') {
    if (!gradeLevel.includes('university')) {
      return true;
    }
  }

  // ===== 规则3: 可凝学科（物理/化学/生物）需看来源 =====
  if (AMBIGUOUS_SUBJECTS.includes(subject)) {
    // Khan Academy → K12标准课程
    if (K12_SOURCES.some(s => source.includes(s))) {
      return true;
    }
    // 其他来源（OpenSciEd/大学等）→ 保留
    return false;
  }

  // ===== 规则4: K12级别学科关键词辅助判断 =====
  if (K12_LEVEL_KEYWORDS.some(level => gradeLevel.includes(level))) {
    // 如果 title 包含明显的 K12 学科教学关键词，则过滤
    const academicTitleKeywords = ['作业', '考试', '复习', '练习册', '课本', '教材'];
    if (academicTitleKeywords.some(kw => title.includes(kw))) {
      return true;
    }
  }

  // 默认：保留（STEM非学科）
  return false;
}

/**
 * 从数组中过滤掉 K12 学科类内容
 */
export function filterOutK12Academic<T extends {
  subject?: string;
  title?: string;
  description?: string;
  source?: string;
  grade_level?: string;
}>(items: T[]): T[] {
  return items.filter(item => !isK12Academic(item));
}

/**
 * 检查内容是否为 STEM 非学科教育（与 isK12Academic 相反）
 */
export function isSTEMNonAcademic(item: {
  subject?: string;
  title?: string;
  description?: string;
  source?: string;
  grade_level?: string;
}): boolean {
  return !isK12Academic(item);
}
