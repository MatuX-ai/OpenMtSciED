/**
 * 硬件项目数据模型
 *
 * 定义低成本STEM硬件项目的数据结构
 * 所有项目预算 ≤50元,适合普惠STEM教育
 */

/**
 * 硬件项目接口（与后端API响应格式匹配）
 */
export interface HardwareProject {
  /** 数据库主键ID */
  id: number;

  /** 项目唯一标识（如 HW-Sensor-001） */
  project_id: string;

  /** 项目名称 */
  title: string;

  /** 项目分类 */
  category: HardwareCategory;

  /** 难度等级 (1-5) */
  difficulty: number;

  /** 学科（物理/化学/生物/工程） */
  subject: string;

  /** 项目描述 */
  description: string;

  /** 学习目标列表 */
  learning_objectives?: string[];

  /** 预计完成时间（小时） */
  estimated_time_hours?: number;

  /** 总成本（元） */
  total_cost: number;

  /** 微控制器类型 */
  mcu_type?: string;

  /** 接线说明 */
  wiring_instructions?: string;

  /** 电路图文件路径 */
  circuit_diagram_path?: string;

  /** 安全注意事项列表 */
  safety_notes?: string[];

  /** 常见问题列表 */
  common_issues?: string[];

  /** 教学指南 */
  teaching_guide?: string;

  /** 是否支持 WebUSB 烧录 */
  webusb_support?: boolean;

  /** 支持的開發板列表 */
  supported_boards?: string[];

  /** 关联的知识点ID列表 */
  knowledge_point_ids?: string[];

  /** 缩略图路径 */
  thumbnail_path?: string;

  /** 演示视频URL */
  demo_video_url?: string;

  /** 是否启用 */
  is_active?: boolean;

  /** 是否推荐项目 */
  is_featured?: boolean;

  /** 使用次数 */
  usage_count?: number;

  /** 平均评分 */
  average_rating?: number;

  /** 评价数量 */
  review_count?: number;

  /** 材料清单 */
  materials?: MaterialItem[];

  /** 代码模板列表 */
  code_templates?: CodeTemplate[];

  /** 创建时间 */
  created_at?: string;

  /** 更新时间 */
  updated_at?: string;

  /** 创建者ID */
  created_by?: number;
}

/**
 * 硬件项目分类
 */
export type HardwareCategory =
  | 'electronics'      // 电子电路
  | 'robotics'         // 机器人
  | 'iot'              // 物联网
  | 'mechanical'       // 机械结构
  | 'smart-home'       // 智能家居
  | 'sensor'           // 传感器应用
  | 'communication';   // 通信技术

/**
 * 材料清单项
 */
export interface MaterialItem {
  /** 材料名称 */
  name: string;

  /** 数量 */
  quantity: number;

  /** 单位 */
  unit: string;

  /** 单价 (元) */
  unitPrice: number;

  /** 小计 (自动计算: quantity * unitPrice) */
  subtotal?: number;

  /** 购买链接 (可选) */
  purchaseLink?: string;

  /** 替代方案说明 (可选) */
  alternative?: string;
}

/**
 * 代码模板
 */
export interface CodeTemplate {
  /** 编程语言 */
  language: CodeLanguage;

  /** 代码内容 */
  code: string;

  /** 代码说明 */
  description?: string;

  /** 依赖库列表 */
  dependencies?: string[];

  /** 引脚配置说明 */
  pinConfig?: PinConfiguration[];
}

/**
 * 编程语言类型
 */
export type CodeLanguage =
  | 'arduino'      // Arduino C++
  | 'python'       // MicroPython
  | 'blockly'      // Blockly 可视化编程
  | 'scratch';     // Scratch

/**
 * 引脚配置
 */
export interface PinConfiguration {
  /** 引脚名称 */
  pinName: string;

  /** 引脚编号 */
  pinNumber: number;

  /** 引脚功能 */
  function: string;

  /** 连接的设备/模块 */
  connectedTo: string;
}

/**
 * 硬件项目筛选条件
 */
export interface HardwareProjectFilter {
  /** 分类筛选 */
  category?: HardwareCategory;

  /** 难度范围 [min, max] */
  difficultyRange?: [number, number];

  /** 最大预算 (元) */
  maxBudget?: number;

  /** 预计时间范围 (分钟) */
  timeRange?: [number, number];

  /** 是否包含代码 */
  hasCode?: boolean;

  /** 编程语言筛选 */
  codeLanguage?: CodeLanguage;

  /** 关键词搜索 */
  keyword?: string;
}

/**
 * 硬件项目统计信息
 */
export interface HardwareProjectStats {
  /** 项目总数 */
  totalCount: number;

  /** 按分类统计 */
  byCategory: Record<HardwareCategory, number>;

  /** 平均预算 */
  averageBudget: number;

  /** 平均难度 */
  averageDifficulty: number;

  /** 支持 WebUSB 的项目数 */
  webUsbSupportedCount: number;
}

/**
 * 辅助函数: 计算材料总成本
 */
export function calculateTotalCost(materials: MaterialItem[]): number {
  return materials.reduce((total, material) => {
    const subtotal = material.quantity * material.unitPrice;
    material.subtotal = subtotal;
    return total + subtotal;
  }, 0);
}

/**
 * 辅助函数: 验证项目预算是否符合要求 (≤50元)
 */
export function validateBudget(project: HardwareProject): boolean {
  if (!project.materials) {
    return project.total_cost <= 50;
  }
  const calculatedCost = calculateTotalCost(project.materials);
  return calculatedCost <= 50 && Math.abs(calculatedCost - project.total_cost) < 0.01;
}

/**
 * 辅助函数: 获取难度星级显示
 */
export function getDifficultyStars(difficulty: number): string {
  if (difficulty < 1 || difficulty > 5) {
    return '⭐';
  }
  return '⭐'.repeat(difficulty);
}

/**
 * 辅助函数: 获取分类中文名称
 */
export function getCategoryName(category: HardwareCategory): string {
  const names: Record<HardwareCategory, string> = {
    electronics: '电子电路',
    robotics: '机器人',
    iot: '物联网',
    mechanical: '机械结构',
    'smart-home': '智能家居',
    sensor: '传感器应用',
    communication: '通信技术'
  };
  return names[category] || category;
}

/**
 * 辅助函数: 获取编程语言显示名称
 */
export function getCodeLanguageName(language: CodeLanguage): string {
  const names: Record<CodeLanguage, string> = {
    arduino: 'Arduino C++',
    python: 'MicroPython',
    blockly: '可视化编程',
    scratch: 'Scratch'
  };
  return names[language] || language;
}
