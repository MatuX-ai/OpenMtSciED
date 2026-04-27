import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '..', 'data');
const ASSOCIATIONS_FILE = path.join(DATA_DIR, 'resource_associations.json');

/**
 * 读取资源关联数据
 */
function loadAssociations() {
  try {
    if (!fs.existsSync(ASSOCIATIONS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(ASSOCIATIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading associations:', error);
    return [];
  }
}

/**
 * GET /api/v1/resources/associations/stats
 * 获取资源关联统计信息
 */
export async function GET() {
  try {
    const associations = loadAssociations();
    
    // 计算统计数据
    const totalAssociations = associations.length;
    
    // 教程-课件关联
    const tutorialMaterialLinks = associations.filter((a: { source_type: string; target_type: string }) => 
      (a.source_type === 'tutorial' && a.target_type === 'material') ||
      (a.source_type === 'material' && a.target_type === 'tutorial')
    ).length;
    
    // 课件-硬件关联
    const materialHardwareLinks = associations.filter((a: { source_type: string; target_type: string }) => 
      (a.source_type === 'material' && a.target_type === 'hardware') ||
      (a.source_type === 'hardware' && a.target_type === 'material')
    ).length;
    
    // 教程-硬件关联
    const tutorialHardwareLinks = associations.filter((a: { source_type: string; target_type: string }) => 
      (a.source_type === 'tutorial' && a.target_type === 'hardware') ||
      (a.source_type === 'hardware' && a.target_type === 'tutorial')
    ).length;
    
    // 平均关联度
    const avgRelevance = totalAssociations > 0 
      ? associations.reduce((sum: number, a: { relevance_score?: number }) => sum + (a.relevance_score || 0), 0) / totalAssociations
      : 0;
    
    // 按类型统计
    const bySourceType: Record<string, number> = {};
    const byTargetType: Record<string, number> = {};
    
    associations.forEach((a: { source_type: string; target_type: string }) => {
      bySourceType[a.source_type] = (bySourceType[a.source_type] || 0) + 1;
      byTargetType[a.target_type] = (byTargetType[a.target_type] || 0) + 1;
    });
    
    return NextResponse.json({
      success: true,
      data: {
        totalAssociations,
        tutorialMaterialLinks,
        materialHardwareLinks,
        tutorialHardwareLinks,
        avgRelevance: avgRelevance * 100, // 转换为百分比
        bySourceType,
        byTargetType
      }
    });
  } catch (error: unknown) {
    console.error('Get associations stats error:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: '服务器错误', message: errorMessage },
      { status: 500 }
    );
  }
}
