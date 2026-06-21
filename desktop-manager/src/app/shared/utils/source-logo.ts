/**
 * 开源资源 / 课件 source 字段 → 品牌 logo 内联 SVG 映射工具
 *
 * 使用方法：
 * ```typescript
 * import { getSourceLogo, getSourceDisplayName } from '../../shared/utils/source-logo';
 *
 * // 在模板中
 * <img [src]="getSourceLogo(material.source)" />
 * <span>{{ getSourceDisplayName(material.source) }}</span>
 * ```
 *
 * 备注：使用内联 SVG（data URL）而非 import 文件，避免 esbuild/TypeScript
 *       对 .svg 文件的 loader 配置问题。
 */

const opensciedSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40"><rect width="120" height="40" rx="6" fill="#1565c0"/><text x="60" y="26" font-family="Arial, sans-serif" font-size="15" font-weight="700" fill="white" text-anchor="middle">OpenSciEd</text></svg>`;
const gewustanSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40"><rect width="120" height="40" rx="6" fill="#ef6c00"/><text x="60" y="27" font-family="Microsoft YaHei, sans-serif" font-size="17" font-weight="700" fill="white" text-anchor="middle">格物斯坦</text></svg>`;
const stemcloudSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 40"><rect width="140" height="40" rx="6" fill="#2e7d32"/><text x="70" y="26" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="white" text-anchor="middle">stemcloud.cn</text></svg>`;
const openstaxSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40"><rect width="120" height="40" rx="6" fill="#1565c0"/><circle cx="22" cy="20" r="9" fill="white"/><circle cx="22" cy="20" r="4" fill="#1565c0"/><text x="78" y="26" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="white" text-anchor="middle">OpenStax</text></svg>`;
const tededSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40"><rect width="120" height="40" rx="6" fill="#c2185b"/><text x="60" y="26" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="white" text-anchor="middle">TED-Ed</text></svg>`;
const phetSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40"><rect width="100" height="40" rx="6" fill="#2e7d32"/><text x="50" y="26" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="white" text-anchor="middle">PhET</text></svg>`;

function toDataUrl(svg: string): string {
  // base64 编码避免特殊字符问题
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}

/**
 * 开源资源 / 课件来源 → Logo (data URL) 映射表
 * 资源类型：教程库 source = openscied/gewustan/stemcloud
 *           课件库 source = openstax/ted-ed/phetsim
 */
export const SOURCE_LOGO_MAP: Record<string, string> = {
  // 开源课程源
  openscied: toDataUrl(opensciedSvg),
  gewustan: toDataUrl(gewustanSvg),
  stemcloud: toDataUrl(stemcloudSvg),
  // 开源课件源
  openstax: toDataUrl(openstaxSvg),
  'ted-ed': toDataUrl(tededSvg),
  phetsim: toDataUrl(phetSvg),
};

/**
 * 开源资源 / 课件来源 → 显示名称映射
 */
export const SOURCE_NAME_MAP: Record<string, string> = {
  openscied: 'OpenSciEd',
  gewustan: '格物斯坦',
  stemcloud: 'stemcloud.cn',
  openstax: 'OpenStax',
  'ted-ed': 'TED-Ed',
  phetsim: 'PhET',
};

/**
 * 获取指定 source 的 logo URL，未匹配返回 null
 */
export function getSourceLogo(source: string): string | null {
  return SOURCE_LOGO_MAP[source] ?? null;
}

/**
 * 获取指定 source 的中文/英文显示名称
 */
export function getSourceDisplayName(source: string): string {
  return SOURCE_NAME_MAP[source] ?? source;
}
