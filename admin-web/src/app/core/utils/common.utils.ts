/**
 * 共享通用工具函数
 */

const SUBJECT_NAME_MAP: Record<string, string> = {
  physics: '物理',
  chemistry: '化学',
  biology: '生物',
  earth: '地球科学',
  engineering: '工程',
  programming: '编程',
  robotics: '机器人',
  electronics: '电子',
  mathematics: '数学',
  'data-science': '数据科学',
  ai: '人工智能',
};

const GRADE_LEVEL_NAME_MAP: Record<string, string> = {
  elementary: '小学',
  middle: '初中',
  high: '高中',
  university: '大学',
};

/**
 * 获取学科中文名称
 * @param subject 学科 key
 * @returns 学科中文名称
 */
export function getSubjectName(subject: string): string {
  return SUBJECT_NAME_MAP[subject] || subject;
}

/**
 * 获取教育阶段中文名称
 * @param level 阶段 key
 * @returns 阶段中文名称
 */
export function getGradeLevelName(level: string): string {
  return GRADE_LEVEL_NAME_MAP[level] || level;
}

/**
 * 格式化文件大小（字节 → 人类可读）
 * @param bytes 字节数
 * @returns 格式化的文件大小字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 格式化数字（大于10000显示为“万”）
 * @param num 数字
 * @returns 格式化后的数字字符串
 */
export function formatLargeNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toString();
}

/**
 * 生成“功能开发中”的统一提示消息
 * @param feature 功能名称
 * @returns 格式化的提示消息
 */
export function devPlaceholderMessage(feature: string): string {
  return `🚧 ${feature} — 功能开发中，即将上线`;
}
