/**
 * 课件批量导入导出相关数据模型
 */

/** 批量操作类型 */
export enum BatchOperationType {
  IMPORT = 'import',
  EXPORT = 'export',
  DELETE = 'delete',
  UPDATE = 'update',
  MOVE = 'move',
  PUBLISH = 'publish',
  UNPUBLISH = 'unpublish'
}

/** 导入/导出格式 */
export enum BatchOperationFormat {
  JSON = 'json',
  XML = 'xml',
  CSV = 'csv',
  ZIP = 'zip',
  EXCEL = 'excel'
}

/** 批量操作状态 */
export enum BatchOperationStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  PARTIALLY_COMPLETED = 'partially_completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/** 批量操作错误类型 */
export enum BatchOperationErrorType {
  INVALID_FORMAT = 'invalid_format',
  DUPLICATE_MATERIAL = 'duplicate_material',
  MISSING_REQUIRED_FIELD = 'missing_required_field',
  FILE_TOO_LARGE = 'file_too_large',
  VALIDATION_ERROR = 'validation_error',
  PERMISSION_DENIED = 'permission_denied',
  UNKNOWN_ERROR = 'unknown_error'
}

/** 批量导入项目 */
export interface BatchImportItem {
  /** 原始数据（导入前） */
  rawData: Record<string, unknown>;
  /** 解析后的数据 */
  parsedData?: Partial<MaterialData>;
  /** 验证结果 */
  validationResult?: ValidationResult;
  /** 导入状态 */
  status: BatchOperationStatus;
  /** 错误信息 */
  error?: BatchOperationErrorType;
  /** 错误详情 */
  errorDetails?: string;
  /** 创建的课件ID（导入成功后） */
  createdMaterialId?: number;
  /** 是否跳过此项 */
  skipped: boolean;
  /** 处理进度（0-100） */
  progress: number;
}

/** 验证结果 */
export interface ValidationResult {
  /** 是否通过验证 */
  valid: boolean;
  /** 错误列表 */
  errors: ValidationError[];
  /** 警告列表 */
  warnings: ValidationWarning[];
}

/** 验证错误 */
export interface ValidationError {
  /** 字段名 */
  field: string;
  /** 错误代码 */
  code: string;
  /** 错误消息 */
  message: string;
  /** 错误值 */
  value?: unknown;
}

/** 验证警告 */
export interface ValidationWarning {
  /** 字段名 */
  field: string;
  /** 警告消息 */
  message: string;
  /** 警告值 */
  value?: unknown;
}

/** 批量导出项目 */
export interface BatchExportItem {
  /** 课件ID */
  materialId: number;
  /** 课件标题 */
  title: string;
  /** 导出状态 */
  status: BatchOperationStatus;
  /** 错误信息 */
  error?: string;
  /** 导出的文件路径 */
  exportedFilePath?: string;
  /** 文件大小（字节） */
  fileSize?: number;
  /** 是否选中 */
  selected: boolean;
}

/** 批量操作配置 */
export interface BatchOperationConfig {
  /** 操作类型 */
  operationType: BatchOperationType;
  /** 文件格式 */
  format: BatchOperationFormat;
  /** 是否覆盖已存在的内容 */
  overwriteExisting: boolean;
  /** 是否验证数据 */
  validateData: boolean;
  /** 批量大小（每批处理数量） */
  batchSize: number;
  /** 最大并发数 */
  maxConcurrency: number;
  /** 是否包含附件 */
  includeAttachments: boolean;
  /** 是否包含版本历史 */
  includeVersionHistory: boolean;
  /** 是否包含评论 */
  includeComments: boolean;
  /** 导出选项（仅导出） */
  exportOptions?: ExportOptions;
}

/** 导出选项 */
export interface ExportOptions {
  /** 是否压缩文件 */
  compress: boolean;
  /** 是否加密 */
  encrypt: boolean;
  /** 压缩级别（0-9） */
  compressionLevel: number;
  /** 自定义文件名模板 */
  filenameTemplate?: string;
  /** 导出字段列表（null表示全部） */
  exportFields?: string[];
}

/** 批量操作进度 */
export interface BatchOperationProgress {
  /** 操作ID */
  operationId: string;
  /** 总项目数 */
  totalItems: number;
  /** 已完成项目数 */
  completedItems: number;
  /** 失败项目数 */
  failedItems: number;
  /** 跳过项目数 */
  skippedItems: number;
  /** 总进度（0-100） */
  overallProgress: number;
  /** 当前处理的项目 */
  currentItem?: BatchImportItem | BatchExportItem;
  /** 预计剩余时间（秒） */
  estimatedTimeRemaining: number;
  /** 开始时间 */
  startTime: Date;
  /** 结束时间 */
  endTime?: Date;
}

/** 批量操作结果 */
export interface BatchOperationResult {
  /** 操作ID */
  operationId: string;
  /** 操作类型 */
  operationType: BatchOperationType;
  /** 操作状态 */
  status: BatchOperationStatus;
  /** 总项目数 */
  totalItems: number;
  /** 成功项目数 */
  successCount: number;
  /** 失败项目数 */
  failureCount: number;
  /** 跳过项目数 */
  skippedCount: number;
  /** 进度信息 */
  progress: BatchOperationProgress;
  /** 导入项目列表（导入操作） */
  importItems?: BatchImportItem[];
  /** 导出项目列表（导出操作） */
  exportItems?: BatchExportItem[];
  /** 生成的文件路径（导出操作） */
  outputFile?: string;
  /** 错误汇总 */
  errorSummary?: BatchOperationErrorSummary;
  /** 操作日志 */
  logs: BatchOperationLog[];
}

/** 批量操作错误汇总 */
export interface BatchOperationErrorSummary {
  /** 按错误类型统计 */
  errorTypeCounts: Record<BatchOperationErrorType, number>;
  /** 按字段统计错误 */
  fieldErrorCounts: Record<string, number>;
  /** 最常见的错误 */
  mostCommonErrors: {
    error: BatchOperationErrorType;
    count: number;
    message: string;
  }[];
}

/** 批量操作日志 */
export interface BatchOperationLog {
  /** 时间戳 */
  timestamp: Date;
  /** 日志级别 */
  level: 'info' | 'warn' | 'error';
  /** 消息 */
  message: string;
  /** 关联的项目索引 */
  itemIndex?: number;
  /** 附加数据 */
  data?: Record<string, unknown>;
}

/** 批量导入模板 */
export interface BatchImportTemplate {
  /** 模板ID */
  templateId: string;
  /** 模板名称 */
  name: string;
  /** 模板描述 */
  description: string;
  /** 模板版本 */
  version: string;
  /** 支持的格式 */
  supportedFormats: BatchOperationFormat[];
  /** 必填字段 */
  requiredFields: string[];
  /** 可选字段 */
  optionalFields: string[];
  /** 字段定义 */
  fieldDefinitions: FieldDefinition[];
  /** 示例数据 */
  exampleData: Record<string, unknown>;
  /** 模板文件URL */
  templateFileUrl: string;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
}

/** 字段定义 */
export interface FieldDefinition {
  /** 字段名 */
  name: string;
  /** 字段标签 */
  label: string;
  /** 字段类型 */
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object' | 'enum';
  /** 是否必填 */
  required: boolean;
  /** 默认值 */
  defaultValue?: unknown;
  /** 枚举值（当type为enum时） */
  enumValues?: string[];
  /** 验证规则 */
  validationRules?: ValidationRule[];
  /** 字段描述 */
  description?: string;
}

/** 验证规则 */
export interface ValidationRule {
  /** 规则名称 */
  name: string;
  /** 规则参数 */
  params?: Record<string, unknown>;
  /** 错误消息 */
  errorMessage: string;
}

/** 课件数据（导入导出使用） */
export interface MaterialData {
  /** 课件ID */
  id?: number;
  /** 课件标题 */
  title: string;
  /** 课件描述 */
  description?: string;
  /** 学科 */
  subject: string;
  /** 年级 */
  grade: string;
  /** 内容类型 */
  contentType: string;
  /** 难度级别 */
  difficultyLevel: string;
  /** 学习目标 */
  learningGoals?: string[];
  /** 标签 */
  tags?: string[];
  /** 课件内容 */
  content?: string;
  /** 附件列表 */
  attachments?: AttachmentData[];
  /** 创建者 */
  creator?: string;
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
  /** 版本信息 */
  version?: {
    versionNumber: number;
    versionNote: string;
  };
}

/** 附件数据 */
export interface AttachmentData {
  /** 文件名 */
  filename: string;
  /** 文件类型 */
  fileType: string;
  /** 文件大小（字节） */
  fileSize: number;
  /** 文件内容（Base64编码或URL） */
  content: string;
  /** 文件URL */
  url?: string;
}

/** 批量操作历史 */
export interface BatchOperationHistory {
  /** 操作ID */
  operationId: string;
  /** 操作类型 */
  operationType: BatchOperationType;
  /** 操作者 */
  operator: string;
  /** 操作时间 */
  operationTime: Date;
  /** 操作状态 */
  status: BatchOperationStatus;
  /** 总项目数 */
  totalItems: number;
  /** 成功项目数 */
  successCount: number;
  /** 失败项目数 */
  failureCount: number;
  /** 操作结果摘要 */
  summary: string;
}

/** 类型守卫：批量操作类型 */
export function isValidBatchOperationType(value: string): value is BatchOperationType {
  return Object.values(BatchOperationType).includes(value as BatchOperationType);
}

/** 类型守卫：批量操作格式 */
export function isValidBatchOperationFormat(value: string): value is BatchOperationFormat {
  return Object.values(BatchOperationFormat).includes(value as BatchOperationFormat);
}

/** 类型守卫：批量操作状态 */
export function isValidBatchOperationStatus(value: string): value is BatchOperationStatus {
  return Object.values(BatchOperationStatus).includes(value as BatchOperationStatus);
}

/** 类型守卫：批量操作错误类型 */
export function isValidBatchOperationErrorType(value: string): value is BatchOperationErrorType {
  return Object.values(BatchOperationErrorType).includes(value as BatchOperationErrorType);
}
