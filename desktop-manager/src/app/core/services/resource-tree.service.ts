import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { TauriService } from './tauri.service';
import { UnifiedCourseService } from './unified-course.service';
import { UnifiedMaterialService } from './unified-material.service';
import { ResourceAssociationService } from '../../services/resource-association.service';
import {
  ResourceTreeNode,
  createRootNode,
  MATERIAL_SUB_SOURCES,
  TREE_SOURCE_GROUPS,
} from '../../models/resource-tree.models';

export interface OpenResourceItem {
  id: string;
  title: string;
  description?: string;
  source?: string;
  subject?: string;
  level?: string;
  difficulty?: number;
  [key: string]: unknown;
}

export interface OpenMaterialItem {
  id: string;
  title: string;
  description?: string;
  source?: string;
  type?: string;
  subject?: string;
  level?: string;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class ResourceTreeService {
  // 用于将原始数据映射到节点时的ID前缀
  private static readonly ID_PREFIX = {
    tutorial: 'tutorial:',
    material: 'material:',
  };

  constructor(
    private tauriService: TauriService,
    private http: HttpClient,
    private unifiedCourseService: UnifiedCourseService,
    private unifiedMaterialService: UnifiedMaterialService,
    private associationService: ResourceAssociationService
  ) {}

  /** 构建整棵树的根节点 */
  async buildTree(): Promise<ResourceTreeNode> {
    return createRootNode();
  }

  /** 展开来源组：获取该来源下的教程或子来源 */
  async expandSourceGroup(groupId: string): Promise<ResourceTreeNode[]> {
    switch (groupId) {
      case 'local':
        return this.buildLocalTutorialNodes();
      case 'openscied':
      case 'gewustan':
      case 'stemcloud':
        return this.buildOpenTutorialNodes(groupId);
      case 'open_materials':
        return this.buildMaterialSubSourceNodes();
      default:
        // 尝试作为开源课件的子来源处理
        if (MATERIAL_SUB_SOURCES.some((s) => s.id === groupId)) {
          return this.buildOpenMaterialNodes(groupId);
        }
        return [];
    }
  }

  /** 展开教程节点：获取该教程关联的课件 */
  async expandTutorial(node: ResourceTreeNode): Promise<ResourceTreeNode[]> {
    if (!node.data || node.data.type !== 'course') return [];

    const courseId = node.data.id;
    const source = node.source || 'local';

    let materials: Record<string, unknown>[] = [];

    if (source === 'local') {
      // 本地教程：优先通过 Tauri IPC 获取
      try {
        materials = (await this.tauriService.getMaterials(courseId as number)) as Record<string, unknown>[];
      } catch {
        // 回退：通过 HTTP API 获取关联
        try {
          const resp = await firstValueFrom(
            this.associationService.getRelatedMaterials(String(courseId))
          );
          materials = (resp as any)?.data || [];
        } catch {
          materials = [];
        }
      }
    } else {
      // 开源教程：通过关联服务获取
      try {
        const resp = await firstValueFrom(
          this.associationService.getRelatedMaterials(node.id)
        );
        materials = (resp as any)?.data || [];
      } catch {
        materials = [];
      }
    }

    return materials.map((m, idx) => ({
      id: `material:${m['id'] || m['chapter_id'] || `${courseId}-${idx}`}`,
      type: 'material' as const,
      label: (m['title'] || m['name'] || '未知课件') as string,
      icon: this.getMaterialFileIcon(m),
      source,
      data: { type: 'material' as const, id: (m['id'] || idx) as number | string, raw: m },
    }));
  }

  /** 搜索树节点（按关键词过滤教程和课件） */
  async searchTree(
    root: ResourceTreeNode,
    keyword: string
  ): Promise<ResourceTreeNode | null> {
    if (!keyword.trim()) return root;

    const kw = keyword.toLowerCase();
    const matched = await this.filterNode(root, kw);
    return matched;
  }

  /** 在已加载的树中按 ID 查找节点 */
  findNodeById(root: ResourceTreeNode, nodeId: string): ResourceTreeNode | null {
    if (root.id === nodeId) return root;
    if (!root.children) return null;
    for (const child of root.children) {
      const found = this.findNodeById(child, nodeId);
      if (found) return found;
    }
    return null;
  }

  /** 展开树路径并定位目标节点（惰性加载） */
  async expandPathToNode(
    root: ResourceTreeNode,
    nodeId: string
  ): Promise<{ tree: ResourceTreeNode; node: ResourceTreeNode | null }> {
    const tree = this.cloneNode(root);
    tree.isExpanded = true;

    const location = this.parseNodeIdLocation(nodeId);
    const groupsToSearch =
      location.sourceGroup === '*'
        ? TREE_SOURCE_GROUPS.map((g) => g.id)
        : [location.sourceGroup];

    for (const groupId of groupsToSearch) {
      const node = await this.expandAndFindInGroup(tree, groupId, nodeId, location);
      if (node) {
        return { tree, node };
      }
    }

    return { tree, node: null };
  }

  /** 按资源类型展开默认来源组（用于 type=tutorial|material 深链） */
  async expandDefaultGroup(
    root: ResourceTreeNode,
    type: 'tutorial' | 'material'
  ): Promise<ResourceTreeNode> {
    const tree = this.cloneNode(root);
    tree.isExpanded = true;
    const groupId = type === 'material' ? 'open_materials' : 'local';
    const groupNode = tree.children?.find((c) => c.source === groupId);
    if (groupNode) {
      await this.ensureNodeExpanded(groupNode);
    }
    return tree;
  }

  // ─── 私有方法 ───

  private cloneNode(node: ResourceTreeNode): ResourceTreeNode {
    return {
      ...node,
      children: node.children?.map((c) => this.cloneNode(c)),
    };
  }

  private parseNodeIdLocation(nodeId: string): {
    sourceGroup: string;
    subSource?: string;
    isMaterial: boolean;
  } {
    if (nodeId.startsWith('material:')) {
      const parts = nodeId.split(':');
      if (parts.length >= 3 && MATERIAL_SUB_SOURCES.some((s) => s.id === parts[1])) {
        return { sourceGroup: 'open_materials', subSource: parts[1], isMaterial: true };
      }
      return { sourceGroup: '*', isMaterial: true };
    }

    if (nodeId.startsWith('tutorial:')) {
      const parts = nodeId.split(':');
      if (parts.length >= 3) {
        return { sourceGroup: parts[1], isMaterial: false };
      }
      return { sourceGroup: 'local', isMaterial: false };
    }

    return { sourceGroup: '*', isMaterial: false };
  }

  private async expandAndFindInGroup(
    tree: ResourceTreeNode,
    groupId: string,
    nodeId: string,
    location: { sourceGroup: string; subSource?: string; isMaterial: boolean }
  ): Promise<ResourceTreeNode | null> {
    const groupNode = tree.children?.find((c) => c.source === groupId);
    if (!groupNode) return null;

    await this.ensureNodeExpanded(groupNode);
    let found = this.findNodeById(groupNode, nodeId);
    if (found) return found;

    if (groupId === 'open_materials' && location.subSource) {
      const subNode = groupNode.children?.find((c) => c.source === location.subSource);
      if (subNode) {
        await this.ensureNodeExpanded(subNode);
        found = this.findNodeById(subNode, nodeId);
        if (found) return found;
      }
    }

    if (location.isMaterial && groupId !== 'open_materials') {
      for (const child of groupNode.children || []) {
        if (child.type !== 'tutorial') continue;
        await this.ensureNodeExpanded(child);
        found = this.findNodeById(child, nodeId);
        if (found) return found;
      }
    }

    if (location.sourceGroup === '*') {
      for (const child of groupNode.children || []) {
        if (child.type === 'tutorial') {
          await this.ensureNodeExpanded(child);
          found = this.findNodeById(child, nodeId);
          if (found) return found;
        }
        if (child.type === 'source_subgroup') {
          await this.ensureNodeExpanded(child);
          found = this.findNodeById(child, nodeId);
          if (found) return found;
        }
      }
    }

    return null;
  }

  private async ensureNodeExpanded(node: ResourceTreeNode): Promise<void> {
    node.isExpanded = true;
    if (node.children && node.children.length > 0) return;

    if (node.type === 'tutorial') {
      node.children = await this.expandTutorial(node);
    } else if (node.type === 'source_group' || node.type === 'source_subgroup') {
      node.children = await this.expandSourceGroup(
        node.source || node.id.replace('source:', '')
      );
    }
  }

  /** 构建本地教程节点列表 */
  private async buildLocalTutorialNodes(): Promise<ResourceTreeNode[]> {
    let tutorials: Record<string, unknown>[] = [];
    try {
      tutorials = (await this.tauriService.getCourses()) as Record<string, unknown>[];
    } catch {
      // 回退到 HTTP API
      try {
        const resp = await firstValueFrom(
          this.unifiedCourseService.getCourses({ page_size: 100 })
        );
        tutorials = ((resp as any)?.items || []) as Record<string, unknown>[];
      } catch {
        tutorials = [];
      }
    }

    return tutorials.map((t) => ({
      id: `tutorial:${t['id']}`,
      type: 'tutorial' as const,
      label: (t['name'] || t['title'] || '未命名教程') as string,
      icon: 'ri-book-open-line',
      source: 'local',
      badge: (t['materialCount'] as number) || undefined,
      data: { type: 'course' as const, id: t['id'] as number, raw: t },
    }));
  }

  /** 构建开源教程节点列表 */
  private async buildOpenTutorialNodes(source: string): Promise<ResourceTreeNode[]> {
    let items: OpenResourceItem[] = [];
    try {
      const result = await this.tauriService.browseOpenResources({
        source,
        page: 1,
        page_size: 100,
      });
      const data = result as { items?: OpenResourceItem[]; total?: number };
      items = data.items || [];
    } catch {
      items = [];
    }

    return items.map((item) => ({
      id: `tutorial:${source}:${item.id}`,
      type: 'tutorial' as const,
      label: item.title || '未命名',
      icon: 'ri-book-open-line',
      source,
      badge: item.difficulty ? `难度${item.difficulty}` : undefined,
      data: { type: 'course' as const, id: item.id, raw: item as unknown as Record<string, unknown> },
    }));
  }

  /** 构建"开源课件"的子来源节点 */
  private buildMaterialSubSourceNodes(): ResourceTreeNode[] {
    return MATERIAL_SUB_SOURCES.map((s) => ({
      id: `source:${s.id}`,
      type: 'source_subgroup' as const,
      label: s.label,
      icon: s.icon,
      source: s.id,
    }));
  }

  /** 构建开源课件节点列表 */
  private async buildOpenMaterialNodes(source: string): Promise<ResourceTreeNode[]> {
    let items: OpenMaterialItem[] = [];
    try {
      const result = await this.tauriService.browseOpenMaterials({
        source,
        page: 1,
        page_size: 100,
      });
      const data = result as { items?: OpenMaterialItem[]; total?: number };
      items = data.items || [];
    } catch {
      items = [];
    }

    return items.map((item) => ({
      id: `material:${source}:${item.id}`,
      type: 'material' as const,
      label: item.title || '未命名',
      icon: this.getOpenMaterialIcon(item),
      source,
      data: { type: 'material' as const, id: item.id, raw: item as unknown as Record<string, unknown> },
    }));
  }

  /** 根据文件扩展名获取图标 */
  private getMaterialFileIcon(material: Record<string, unknown>): string {
    const filePath = (material['filePath'] || material['file_url'] || material['fileUrl'] || '') as string;
    const ext = filePath.split('.').pop()?.toLowerCase() || '';
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
      zip: 'ri-file-zip-line',
      rar: 'ri-file-zip-line',
    };
    return iconMap[ext] || 'ri-file-line';
  }

  /** 获取开源课件类型图标 */
  private getOpenMaterialIcon(item: OpenMaterialItem): string {
    const type = item.type || '';
    const typeIconMap: Record<string, string> = {
      pdf: 'ri-file-pdf-2-line',
      ppt: 'ri-slideshow-3-line',
      video: 'ri-video-line',
      interactive: 'ri-flask-line',
    };
    return typeIconMap[type] || 'ri-file-line';
  }

  /** 递归过滤匹配关键词的节点 */
  private async filterNode(node: ResourceTreeNode, keyword: string): Promise<ResourceTreeNode | null> {
    const labelMatch = node.label.toLowerCase().includes(keyword);

    // 如果是叶子节点，只根据自身标签匹配
    if (node.type === 'material') {
      return labelMatch ? { ...node } : null;
    }

    // 非叶子节点：先尝试展开加载子节点（如果还没有）
    let effectiveChildren = node.children;
    if (!effectiveChildren || effectiveChildren.length === 0) {
      if (node.type === 'source_group' || node.type === 'source_subgroup') {
        const loaded = await this.expandSourceGroup(node.source || node.id.replace('source:', ''));
        if (loaded.length > 0) {
          effectiveChildren = loaded;
        }
      } else if (node.type === 'tutorial') {
        const loaded = await this.expandTutorial(node);
        if (loaded.length > 0) {
          effectiveChildren = loaded;
        }
      }
    }

    // 递归过滤子节点
    if (effectiveChildren && effectiveChildren.length > 0) {
      const matchedChildren: ResourceTreeNode[] = [];
      for (const child of effectiveChildren) {
        const filtered = await this.filterNode(child, keyword);
        if (filtered) {
          matchedChildren.push(filtered);
        }
      }
      if (matchedChildren.length > 0) {
        return {
          ...node,
          isExpanded: true,
          children: matchedChildren,
        };
      }
    }

    // 自身标签匹配 或 有匹配的子节点
    if (labelMatch) {
      return { ...node, isExpanded: true, children: effectiveChildren };
    }

    return null;
  }
}
