/**
 * 课件使用统计相关数据模型
 */

/** 统计时间范围 */
export enum StatisticsTimeRange {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  LAST_7_DAYS = 'last_7_days',
  LAST_30_DAYS = 'last_30_days',
  LAST_90_DAYS = 'last_90_days',
  THIS_MONTH = 'this_month',
  LAST_MONTH = 'last_month',
  THIS_YEAR = 'this_year',
  CUSTOM = 'custom'
}

/** 统计指标类型 */
export enum StatisticsMetricType {
  VIEWS = 'views',
  DOWNLOADS = 'downloads',
  SHARES = 'shares',
  COMMENTS = 'comments',
  LIKES = 'likes',
  RATING = 'rating',
  USAGE_TIME = 'usage_time',
  COMPLETION_RATE = 'completion_rate'
}

/** 统计数据点 */
export interface StatisticsDataPoint {
  /** 时间标签 */
  label: string;
  /** 时间戳 */
  timestamp: Date;
  /** 指标值 */
  value: number;
  /** 指标类型 */
  metricType: StatisticsMetricType;
}

/** 统计汇总 */
export interface StatisticsSummary {
  /** 总查看次数 */
  totalViews: number;
  /** 总下载次数 */
  totalDownloads: number;
  /** 总分享次数 */
  totalShares: number;
  /** 总评论数 */
  totalComments: number;
  /** 总点赞数 */
  totalLikes: number;
  /** 平均评分 */
  averageRating: number;
  /** 评分次数 */
  ratingCount: number;
  /** 平均使用时长（分钟） */
  averageUsageTime: number;
  /** 平均完成率 */
  averageCompletionRate: number;
}

/** 趋势数据 */
export interface TrendData {
  /** 趋势类型（上升/下降/持平） */
  trend: 'up' | 'down' | 'flat';
  /** 变化百分比 */
  changePercentage: number;
  /** 变化绝对值 */
  changeValue: number;
  /** 上期值 */
  previousValue: number;
  /** 当前值 */
  currentValue: number;
}

/** 课件使用统计 */
export interface MaterialUsageStatistics {
  /** 课件ID */
  materialId: number;
  /** 课件标题 */
  materialTitle: string;
  /** 统计时间范围 */
  timeRange: StatisticsTimeRange;
  /** 统计开始时间 */
  startDate: Date;
  /** 统计结束时间 */
  endDate: Date;
  /** 统计汇总 */
  summary: StatisticsSummary;
  /** 趋势数据 */
  trends: Record<StatisticsMetricType, TrendData>;
  /** 时间序列数据 */
  timeSeriesData: StatisticsDataPoint[];
  /** 用户分布 */
  userDistribution: UserDistribution;
  /** 设备分布 */
  deviceDistribution: DeviceDistribution;
  /** 地区分布 */
  regionDistribution: RegionDistribution;
}

/** 用户分布 */
export interface UserDistribution {
  /** 学生用户数 */
  students: number;
  /** 教师用户数 */
  teachers: number;
  /** 机构管理员数 */
  orgAdmins: number;
  /** 学校管理员数 */
  schoolAdmins: number;
  /** 教育局用户数 */
  bureauUsers: number;
}

/** 设备分布 */
export interface DeviceDistribution {
  /** 桌面设备数 */
  desktop: number;
  /** 移动设备数 */
  mobile: number;
  /** 平板设备数 */
  tablet: number;
  /** 其他设备数 */
  other: number;
}

/** 地区分布 */
export interface RegionDistribution {
  /** 地区名称 */
  regionName: string;
  /** 用户数 */
  userCount: number;
  /** 占比 */
  percentage: number;
}

/** 总体统计 */
export interface OverallStatistics {
  /** 总课件数 */
  totalMaterials: number;
  /** 总用户数 */
  totalUsers: number;
  /** 活跃用户数 */
  activeUsers: number;
  /** 总查看次数 */
  totalViews: number;
  /** 总下载次数 */
  totalDownloads: number;
  /** 新增课件数 */
  newMaterials: number;
  /** 时间范围 */
  timeRange: StatisticsTimeRange;
  /** 开始时间 */
  startDate: Date;
  /** 结束时间 */
  endDate: Date;
  /** 指标趋势 */
  metricTrends: Record<string, TrendData>;
}

/** 热门课件 */
export interface PopularMaterial {
  /** 课件ID */
  materialId: number;
  /** 课件标题 */
  title: string;
  /** 学科 */
  subject: string;
  /** 年级 */
  grade: string;
  /** 查看次数 */
  views: number;
  /** 下载次数 */
  downloads: number;
  /** 评分 */
  rating: number;
  /** 排名 */
  rank: number;
}

/** 活跃用户 */
export interface ActiveUser {
  /** 用户ID */
  userId: number;
  /** 用户名 */
  username: string;
  /** 用户类型 */
  userType: string;
  /** 查看次数 */
  views: number;
  /** 下载次数 */
  downloads: number;
  /** 评论次数 */
  comments: number;
  /** 最后活跃时间 */
  lastActiveTime: Date;
}

/** 统计报告 */
export interface StatisticsReport {
  /** 报告ID */
  reportId: string;
  /** 报告名称 */
  reportName: string;
  /** 报告类型 */
  reportType: 'material' | 'overall' | 'user' | 'custom';
  /** 报告时间范围 */
  timeRange: StatisticsTimeRange;
  /** 开始时间 */
  startDate: Date;
  /** 结束时间 */
  endDate: Date;
  /** 报告内容 */
  content: ReportContent;
  /** 生成时间 */
  generatedAt: Date;
  /** 生成者 */
  generatedBy: string;
}

/** 报告内容 */
export interface ReportContent {
  /** 汇总数据 */
  summary: StatisticsSummary;
  /** 图表数据 */
  charts: ChartData[];
  /** 数据表格 */
  tables: DataTable[];
  /** 分析结论 */
  analysis: string[];
  /** 建议 */
  recommendations: string[];
}

/** 图表数据 */
export interface ChartData {
  /** 图表类型 */
  chartType: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  /** 图表标题 */
  title: string;
  /** X轴标签 */
  xAxisLabel?: string;
  /** Y轴标签 */
  yAxisLabel?: string;
  /** 数据系列 */
  series: ChartSeries[];
}

/** 图表系列 */
export interface ChartSeries {
  /** 系列名称 */
  name: string;
  /** 数据点 */
  data: { x: string; y: number }[];
  /** 颜色 */
  color?: string;
}

/** 数据表格 */
export interface DataTable {
  /** 表格标题 */
  title: string;
  /** 列定义 */
  columns: string[];
  /** 行数据 */
  rows: Record<string, unknown>[];
}

/** 统计查询参数 */
export interface StatisticsQuery {
  /** 时间范围 */
  timeRange: StatisticsTimeRange;
  /** 开始时间（自定义时间范围时使用） */
  startDate?: Date;
  /** 结束时间（自定义时间范围时使用） */
  endDate?: Date;
  /** 课件ID（查询单个课件统计时使用） */
  materialId?: number;
  /** 统计指标类型 */
  metricTypes?: StatisticsMetricType[];
  /** 分组方式 */
  groupBy?: 'day' | 'week' | 'month' | 'year';
}

/** 类型守卫：统计时间范围 */
export function isValidStatisticsTimeRange(value: string): value is StatisticsTimeRange {
  return Object.values(StatisticsTimeRange).includes(value as StatisticsTimeRange);
}

/** 类型守卫：统计指标类型 */
export function isValidStatisticsMetricType(value: string): value is StatisticsMetricType {
  return Object.values(StatisticsMetricType).includes(value as StatisticsMetricType);
}
