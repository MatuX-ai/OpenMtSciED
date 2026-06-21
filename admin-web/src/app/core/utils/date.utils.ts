/**
 * 共享日期工具函数
 */

/**
 * 格式化日期为本地化字符串（仅日期）
 * @param dateString ISO 日期字符串
 * @returns 格式化的日期字符串 (YYYY/MM/DD)
 */
export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * 格式化日期时间为本地化字符串（日期+时间）
 * @param dateString ISO 日期字符串
 * @returns 格式化的日期时间字符串
 */
export function formatDateTime(dateString: string | undefined | null): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 格式化为相对时间（如：刚刚、3小时前、2天前）
 * @param dateString ISO 日期字符串
 * @returns 相对时间字符串
 */
export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return '从未';
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 1) return '刚刚';
  if (hours < 24) return `${hours}小时前`;
  return `${Math.floor(hours / 24)}天前`;
}

/**
 * 格式化持续时间（秒 → 人类可读）
 * @param seconds 秒数
 * @returns 格式化的持续时间字符串
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}秒`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}小时${remainingMinutes}分钟` : `${hours}小时`;
}
