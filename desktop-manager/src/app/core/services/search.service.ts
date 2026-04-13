import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface SearchFilters {
  keyword?: string;
  subject?: string;
  level?: string;
  difficulty?: number;
  source?: string;
  hasHardware?: boolean;
  maxBudget?: number;
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'tutorial' | 'material';
  source: string;
  subject: string;
  level: string;
  difficulty?: number;
  matchScore: number; // 匹配度分数 0-100
  highlightedText?: string; // 高亮文本
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private filtersSubject = new BehaviorSubject<SearchFilters>({});
  private searchResultsSubject = new BehaviorSubject<SearchResult[]>([]);

  public filters$: Observable<SearchFilters> = this.filtersSubject.asObservable();
  public searchResults$: Observable<SearchResult[]> = this.searchResultsSubject.asObservable();

  constructor() {}

  /**
   * 更新搜索过滤器
   */
  updateFilters(filters: SearchFilters): void {
    this.filtersSubject.next({ ...this.filtersSubject.getValue(), ...filters });
  }

  /**
   * 重置过滤器
   */
  resetFilters(): void {
    this.filtersSubject.next({});
  }

  /**
   * 执行搜索(前端模拟)
   */
  search(items: Array<any>, itemType: 'tutorial' | 'material'): SearchResult[] {
    const filters = this.filtersSubject.getValue();
    const results: SearchResult[] = [];

    items.forEach(item => {
      // 应用过滤器
      if (this.matchesFilters(item, filters)) {
        // 计算匹配度
        const matchScore = this.calculateMatchScore(item, filters);

        // 生成高亮文本
        const highlightedText = filters.keyword
          ? this.highlightKeyword(item.title + ' ' + item.description, filters.keyword)
          : undefined;

        results.push({
          id: item.id,
          title: item.title || item.name,
          description: item.description || '',
          type: itemType,
          source: item.source || 'local',
          subject: item.subject || item.category || '',
          level: item.level || '',
          difficulty: item.difficulty,
          matchScore,
          highlightedText
        });
      }
    });

    // 按匹配度排序
    results.sort((a, b) => b.matchScore - a.matchScore);

    this.searchResultsSubject.next(results);
    return results;
  }

  /**
   * 检查项目是否匹配过滤器
   */
  private matchesFilters(item: any, filters: SearchFilters): boolean {
    // 关键词搜索
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      const searchText = `${item.title || item.name} ${item.description}`.toLowerCase();
      if (!searchText.includes(keyword)) {
        return false;
      }
    }

    // 学科筛选
    if (filters.subject && filters.subject !== 'all') {
      if (item.subject !== filters.subject && item.category !== filters.subject) {
        return false;
      }
    }

    // 学段筛选
    if (filters.level && filters.level !== 'all') {
      if (item.level !== filters.level) {
        return false;
      }
    }

    // 难度筛选
    if (filters.difficulty) {
      if (!item.difficulty || item.difficulty > filters.difficulty) {
        return false;
      }
    }

    // 来源筛选
    if (filters.source && filters.source !== 'all') {
      if (item.source !== filters.source) {
        return false;
      }
    }

    // 硬件要求筛选
    if (filters.hasHardware !== undefined) {
      if (item.hasHardware !== filters.hasHardware) {
        return false;
      }
    }

    // 预算筛选
    if (filters.maxBudget) {
      if (!item.hardwareBudget || item.hardwareBudget > filters.maxBudget) {
        return false;
      }
    }

    return true;
  }

  /**
   * 计算匹配度分数
   */
  private calculateMatchScore(item: any, filters: SearchFilters): number {
    let score = 50; // 基础分数

    // 关键词匹配度
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      const title = (item.title || item.name || '').toLowerCase();
      const description = (item.description || '').toLowerCase();

      if (title.includes(keyword)) {
        score += 30; // 标题匹配加分
      }
      if (description.includes(keyword)) {
        score += 10; // 描述匹配加分
      }
    }

    // 精确匹配加分
    if (filters.subject && filters.subject !== 'all' && item.subject === filters.subject) {
      score += 5;
    }
    if (filters.level && filters.level !== 'all' && item.level === filters.level) {
      score += 5;
    }

    return Math.min(score, 100);
  }

  /**
   * 高亮关键词
   */
  private highlightKeyword(text: string, keyword: string): string {
    if (!keyword) return text;

    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  /**
   * 获取热门搜索建议
   */
  getPopularSearches(): string[] {
    return [
      '力学',
      '化学反应',
      '生态系统',
      '编程入门',
      '电路设计',
      'DNA结构',
      '能量守恒',
      'Arduino'
    ];
  }

  /**
   * 保存搜索历史到本地存储
   */
  saveSearchHistory(keyword: string): void {
    if (!keyword) return;

    try {
      const history = JSON.parse(localStorage.getItem('search_history') || '[]');

      // 移除重复项
      const filtered = history.filter((k: string) => k !== keyword);

      // 添加到开头
      filtered.unshift(keyword);

      // 只保留最近10条
      const limited = filtered.slice(0, 10);

      localStorage.setItem('search_history', JSON.stringify(limited));
    } catch (error) {
      console.error('保存搜索历史失败:', error);
    }
  }

  /**
   * 获取搜索历史
   */
  getSearchHistory(): string[] {
    try {
      return JSON.parse(localStorage.getItem('search_history') || '[]');
    } catch (error) {
      console.error('获取搜索历史失败:', error);
      return [];
    }
  }

  /**
   * 清除搜索历史
   */
  clearSearchHistory(): void {
    localStorage.removeItem('search_history');
  }
}
