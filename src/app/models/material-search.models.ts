/**
 * 课件全文搜索相关数据模型
 */

/** 搜索类型 */
export enum SearchType {
  FULLTEXT = 'fulltext',
  FIELDS = 'fields',
  FUZZY = 'fuzzy',
  PHRASE = 'phrase'
}

/** 搜索结果排序方式 */
export enum SearchSortType {
  RELEVANCE = 'relevance',
  DATE_DESC = 'date_desc',
  DATE_ASC = 'date_asc',
  TITLE_ASC = 'title_asc',
  TITLE_DESC = 'title_desc',
  RATING_DESC = 'rating_desc'
}

/** 搜索过滤器 */
export interface SearchFilter {
  /** 学科过滤 */
  subjects?: string[];
  /** 年级过滤 */
  grades?: string[];
  /** 内容类型过滤 */
  contentTypes?: string[];
  /** 难度级别过滤 */
  difficultyLevels?: string[];
  /** 标签过滤 */
  tags?: string[];
  /** 创建者过滤 */
  creators?: string[];
  /** 创建日期范围 */
  createdDateRange?: {
    start: Date;
    end: Date;
  };
  /** 更新日期范围 */
  updatedDateRange?: {
    start: Date;
    end: Date;
  };
  /** 评分范围 */
  ratingRange?: {
    min: number;
    max: number;
  };
  /** 是否包含附件 */
  hasAttachments?: boolean;
  /** 是否已发布 */
  isPublished?: boolean;
}

/** 搜索查询参数 */
export interface SearchQuery {
  /** 搜索关键词 */
  query: string;
  /** 搜索类型 */
  searchType: SearchType;
  /** 分页参数 */
  page: number;
  /** 每页数量 */
  pageSize: number;
  /** 排序方式 */
  sortType: SearchSortType;
  /** 搜索过滤器 */
  filters?: SearchFilter;
  /** 搜索高亮 */
  highlight?: boolean;
  /** 高亮标签 */
  highlightTags?: {
    pre: string;
    post: string;
  };
  /** 是否搜索附件内容 */
  searchAttachments?: boolean;
  /** 是否搜索版本历史 */
  searchVersionHistory?: boolean;
}

/** 搜索结果项 */
export interface SearchResultItem {
  /** 课件ID */
  materialId: number;
  /** 课件标题 */
  title: string;
  /** 标题高亮 */
  titleHighlight?: string;
  /** 课件描述 */
  description?: string;
  /** 描述高亮 */
  descriptionHighlight?: string;
  /** 学科 */
  subject: string;
  /** 年级 */
  grade: string;
  /** 内容类型 */
  contentType: string;
  /** 难度级别 */
  difficultyLevel: string;
  /** 标签 */
  tags: string[];
  /** 创建者 */
  creator: string;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
  /** 评分 */
  rating: number;
  /** 评分次数 */
  ratingCount: number;
  /** 查看次数 */
  viewCount: number;
  /** 下载次数 */
  downloadCount: number;
  /** 相关性分数 */
  relevanceScore: number;
  /** 匹配字段 */
  matchedFields: string[];
  /** 匹配片段 */
  snippets?: string[];
  /** 附件列表 */
  attachments?: AttachmentSnippet[];
}

/** 附件片段 */
export interface AttachmentSnippet {
  /** 附件ID */
  attachmentId: number;
  /** 文件名 */
  filename: string;
  /** 文件类型 */
  fileType: string;
  /** 匹配片段 */
  snippets?: string[];
}

/** 搜索结果 */
export interface SearchResult {
  /** 搜索结果项列表 */
  items: SearchResultItem[];
  /** 总数量 */
  total: number;
  /** 当前页 */
  currentPage: number;
  /** 每页数量 */
  pageSize: number;
  /** 总页数 */
  totalPages: number;
  /** 耗时（毫秒） */
  took: number;
  /** 搜索查询 */
  query: SearchQuery;
  /** 聚合结果 */
  aggregations?: SearchAggregations;
}

/** 搜索聚合结果 */
export interface SearchAggregations {
  /** 学科聚合 */
  subjects: AggregationBucket[];
  /** 年级聚合 */
  grades: AggregationBucket[];
  /** 内容类型聚合 */
  contentTypes: AggregationBucket[];
  /** 难度级别聚合 */
  difficultyLevels: AggregationBucket[];
  /** 标签聚合 */
  tags: AggregationBucket[];
  /** 创建者聚合 */
  creators: AggregationBucket[];
  /** 创建日期聚合 */
  createdDates: DateHistogramBucket[];
}

/** 聚合桶 */
export interface AggregationBucket {
  /** 键 */
  key: string;
  /** 文档数量 */
  docCount: number;
}

/** 日期直方图桶 */
export interface DateHistogramBucket {
  /** 时间范围 */
  key: {
    start: Date;
    end: Date;
  };
  /** 文档数量 */
  docCount: number;
}

/** 搜索建议 */
export interface SearchSuggestion {
  /** 建议文本 */
  text: string;
  /** 建议类型 */
  type: 'query' | 'field' | 'tag' | 'subject';
  /** 出现次数 */
  count: number;
  /** 高亮 */
  highlight?: string;
}

/** 搜索统计 */
export interface SearchStatistics {
  /** 总搜索次数 */
  totalSearches: number;
  /** 今日搜索次数 */
  todaySearches: number;
  /** 热门搜索词 */
  popularQueries: PopularQuery[];
  /** 无结果搜索词 */
  noResultQueries: string[];
}

/** 热门查询 */
export interface PopularQuery {
  /** 查询文本 */
  query: string;
  /** 搜索次数 */
  count: number;
  /** 平均结果数 */
  avgResultCount: number;
}

/** 搜索历史记录 */
export interface SearchHistory {
  /** 记录ID */
  id: string;
  /** 搜索关键词 */
  query: string;
  /** 搜索时间 */
  searchTime: Date;
  /** 结果数量 */
  resultCount: number;
  /** 是否点击了结果 */
  clickedResult: boolean;
}

/** 类型守卫：搜索类型 */
export function isValidSearchType(value: string): value is SearchType {
  return Object.values(SearchType).includes(value as SearchType);
}

/** 类型守卫：搜索排序类型 */
export function isValidSearchSortType(value: string): value is SearchSortType {
  return Object.values(SearchSortType).includes(value as SearchSortType);
}
