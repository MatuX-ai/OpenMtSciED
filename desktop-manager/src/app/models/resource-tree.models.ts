/** 树节点类型 */
export type ResourceTreeNodeType =
  | 'root'            // 根节点: "全部资源"
  | 'source_group'    // 来源组: "本地教程", "OpenSciEd", "开源课件"
  | 'source_subgroup' // 来源子组: "OpenStax", "TED-Ed", "PhET"
  | 'tutorial'        // 教程
  | 'material';       // 课件（叶子节点）

/** 树节点数据 */
export interface ResourceTreeNode {
  id: string;
  type: ResourceTreeNodeType;
  label: string;
  icon?: string;
  source?: string;
  children?: ResourceTreeNode[];
  isExpanded?: boolean;
  isLoading?: boolean;
  badge?: string | number;
  data?: {
    type: 'course' | 'material';
    id: number | string;
    raw?: Record<string, unknown>;
  };
}

/** 来源组配置 */
export interface SourceGroupConfig {
  id: string;
  label: string;
  icon: string;
  sourceType: 'tutorial' | 'material';
}

/** 树结构来源分组（第一层） */
export const TREE_SOURCE_GROUPS: SourceGroupConfig[] = [
  { id: 'local', label: '本地教程', icon: 'ri-folder-2-line', sourceType: 'tutorial' },
  { id: 'openscied', label: 'OpenSciEd', icon: 'ri-global-line', sourceType: 'tutorial' },
  { id: 'gewustan', label: '格物斯坦', icon: 'ri-global-line', sourceType: 'tutorial' },
  { id: 'stemcloud', label: 'stemcloud.cn', icon: 'ri-global-line', sourceType: 'tutorial' },
  { id: 'open_materials', label: '开源课件', icon: 'ri-book-shelf-line', sourceType: 'material' },
];

/** 开源课件子来源（第二层，仅在"开源课件"下） */
export const MATERIAL_SUB_SOURCES: SourceGroupConfig[] = [
  { id: 'openstax', label: 'OpenStax 教材', icon: 'ri-file-pdf-line', sourceType: 'material' },
  { id: 'ted-ed', label: 'TED-Ed 视频', icon: 'ri-video-line', sourceType: 'material' },
  { id: 'phetsim', label: 'PhET 仿真实验', icon: 'ri-flask-line', sourceType: 'material' },
];

/** 构建根节点 */
export function createRootNode(): ResourceTreeNode {
  return {
    id: 'root',
    type: 'root',
    label: '全部资源',
    icon: 'ri-archive-line',
    isExpanded: true,
    children: TREE_SOURCE_GROUPS.map((g) => ({
      id: `source:${g.id}`,
      type: 'source_group',
      label: g.label,
      icon: g.icon,
      source: g.id,
    })),
  };
}

/** 获取课件文件类型图标 */
export function getMaterialIcon(material?: Record<string, unknown>): string {
  const ext = (material?.['filePath'] as string)?.split('.').pop()?.toLowerCase() || '';
  const iconMap: Record<string, string> = {
    pdf: 'ri-file-pdf-2-line',
    ppt: 'ri-slideshow-3-line',
    pptx: 'ri-slideshow-3-line',
    doc: 'ri-file-word-line',
    docx: 'ri-file-word-line',
    xls: 'ri-file-excel-line',
    xlsx: 'ri-file-excel-line',
    mp4: 'ri-video-line',
    webm: 'ri-video-line',
    ogg: 'ri-video-line',
    jpg: 'ri-image-line',
    jpeg: 'ri-image-line',
    png: 'ri-image-line',
    gif: 'ri-image-line',
    mp3: 'ri-music-line',
    zip: 'ri-file-zip-line',
    rar: 'ri-file-zip-line',
  };
  return iconMap[ext] || 'ri-file-line';
}
