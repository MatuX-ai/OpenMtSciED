/**
 * 硬件项目数据模型
 *
 * 定义低成本STEM硬件项目的数据结构
 * 所有项目预算 ≤50元,适合普惠STEM教育
 */

/**
 * 硬件项目接口
 */
export interface HardwareProject {
  /** 项目唯一标识 */
  id: string;

  /** 关联的教程ID */
  tutorialId?: string;

  /** 项目名称 */
  name: string;

  /** 项目描述 */
  description: string;

  /** 项目分类 */
  category: HardwareCategory;

  /** 难度等级 (1-5) */
  difficulty: number;

  /** 预计完成时间 (例如: "2小时") */
  estimatedTime: string;

  /** 总预算 (元, ≤50) */
  totalCost: number;

  /** 材料清单 */
  materials: MaterialItem[];

  /** 电路图路径 */
  circuitDiagram?: string;

  /** 代码模板 */
  codeTemplate?: CodeTemplate;

  /** 是否支持 WebUSB 烧录 */
  webUsbSupport: boolean;

  /** 项目缩略图 */
  thumbnail?: string;

  /** 关联知识点 */
  knowledgePoints?: string[];

  /** 安全注意事项 */
  safetyNotes?: string[];

  /** 创建时间 */
  createdAt?: Date;

  /** 更新时间 */
  updatedAt?: Date;
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
  const calculatedCost = calculateTotalCost(project.materials);
  return calculatedCost <= 50 && Math.abs(calculatedCost - project.totalCost) < 0.01;
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
