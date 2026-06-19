import { NextResponse } from 'next/server';

/**
 * 热门搜索词列表
 * 基于项目已有的STEM非学科教育主题和内容定位
 */
const HOT_SEARCHES = [
  { keyword: 'Arduino', icon: '🔧', category: '硬件', description: '开源电子原型平台项目' },
  { keyword: '机器人', icon: '🤖', category: '硬件', description: '机器人制作与控制' },
  { keyword: 'Python', icon: '🐍', category: '编程', description: 'Python编程入门与进阶' },
  { keyword: '人工智能', icon: '🧠', category: '技术', description: 'AI与机器学习基础' },
  { keyword: '物联网', icon: '🌐', category: '技术', description: 'IoT智能硬件互联' },
  { keyword: '电路设计', icon: '⚡', category: '工程', description: '电子电路原理与实践' },
  { keyword: '3D打印', icon: '🖨️', category: '工程', description: '3D建模与打印技术' },
  { keyword: '编程入门', icon: '💻', category: '编程', description: '零基础编程学习路径' },
  { keyword: '创客项目', icon: '🛠️', category: '综合', description: '跨学科创意实践项目' },
  { keyword: '无人机', icon: '🚁', category: '硬件', description: '无人机组装与编程' },
  { keyword: '智能小车', icon: '🚗', category: '硬件', description: '智能避障与自动驾驶' },
  { keyword: '传感器', icon: '📡', category: '硬件', description: '各类传感器应用实践' },
  { keyword: '数据结构', icon: '📊', category: '编程', description: '算法与数据结构基础' },
  { keyword: 'Web开发', icon: '🌍', category: '编程', description: '网站与应用开发入门' },
  { keyword: '科学实验', icon: '🔬', category: '科学', description: 'STEM现象探究实验' },
  { keyword: '编程测验', icon: '💻', category: '试题', description: '编程知识与技能测验' },
  { keyword: 'STEM试题', icon: '📝', category: '试题', description: 'STEM综合练习与测试' },
  { keyword: 'Arduino试题', icon: '📝', category: '试题', description: 'Arduino知识测验' }
];

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: HOT_SEARCHES,
      total: HOT_SEARCHES.length
    });
  } catch (error: unknown) {
    console.error('Hot searches error:', error);
    return NextResponse.json(
      { success: false, error: '获取热门搜索失败' },
      { status: 500 }
    );
  }
}
