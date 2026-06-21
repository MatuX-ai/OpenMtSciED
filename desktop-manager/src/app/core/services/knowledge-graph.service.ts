import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * 知识图谱服务
 * 调用后端 /api/v1/learning/path 获取学习路径，转为图谱格式 {categories, nodes, links}
 */
export interface GraphNode {
  id: string;
  name: string;
  category: number;
  subject?: string;
  level?: string;
  description?: string;
  difficulty?: number;
  hasHardware?: boolean;
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface GraphData {
  categories: Array<{ name: string }>;
  nodes: GraphNode[];
  links: GraphLink[];
}

@Injectable({
  providedIn: 'root',
})
export class KnowledgeGraphService {
  private readonly API_BASE = '/api/v1';

  constructor(private http: HttpClient) {}

  /**
   * 获取学习路径并转为图谱格式
   * 后端端点：GET /api/v1/learning/path?limit=N
   */
  getGraph(limit: number = 20): Observable<GraphData> {
    return this.http
      .get<any>(`${this.API_BASE}/learning/path`, { params: { limit: limit.toString() } })
      .pipe(
        map((resp) => this.transformToGraph(resp)),
        catchError((err) => {
          console.warn('获取学习路径失败:', err);
          return of({ categories: [], nodes: [], links: [] });
        })
      );
  }

  /**
   * 将后端 learning_path 数组转为 ECharts graph 数据格式
   * 后端返回结构: {learning_path: [{id, title, description, subject, grade, difficulty, depth, hasPrerequisites}]}
   */
  private transformToGraph(resp: any): GraphData {
    const items = resp?.learning_path || resp?.data?.learning_path || resp?.data || [];
    if (!Array.isArray(items)) {
      return { categories: [], nodes: [], links: [] };
    }

    const nodes: GraphNode[] = items.map((item: any, index: number) => ({
      id: String(item.id || `node-${index}`),
      name: item.title || item.name || `节点 ${index + 1}`,
      category: this.mapCategory(item.subject || item.grade),
      subject: item.subject,
      level: item.grade || item.level,
      description: item.description,
      difficulty: item.difficulty ?? item.depth,
      hasHardware: item.hasPrerequisites,
    }));

    // 构建链接：相邻节点之间创建链
    const links: GraphLink[] = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      links.push({ source: nodes[i].id, target: nodes[i + 1].id });
    }

    const categories = [
      { name: '教程' },
      { name: '课件' },
      { name: '知识点' },
      { name: '硬件' },
    ];

    return { categories, nodes, links };
  }

  /**
   * 根据学科映射 category 索引
   */
  private mapCategory(subject: string | undefined): number {
    if (!subject) return 0;
    const s = String(subject).toLowerCase();
    if (s.includes('硬件') || s.includes('hardware') || s.includes('iot')) return 3;
    if (s.includes('物理') || s.includes('化学') || s.includes('生物') || s.includes('math') || s.includes('数')) return 2;
    if (s.includes('课件') || s.includes('material') || s.includes('document')) return 1;
    return 0; // 教程
  }
}
