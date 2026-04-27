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
 * GET /api/v1/resources/associations
 * 获取资源关联列表
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filterType = searchParams.get('filter_type') || 'all';
    const sourceType = searchParams.get('source_type');
    const targetType = searchParams.get('target_type');
    
    let associations = loadAssociations();
    
    // 根据过滤条件筛选
    if (filterType && filterType !== 'all') {
      associations = associations.filter((a: any) => 
        a.source_type === filterType || a.target_type === filterType
      );
    }
    
    if (sourceType) {
      associations = associations.filter((a: any) => a.source_type === sourceType);
    }
    
    if (targetType) {
      associations = associations.filter((a: any) => a.target_type === targetType);
    }
    
    return NextResponse.json({
      success: true,
      data: associations,
      total: associations.length
    });
  } catch (error: any) {
    console.error('Get associations error:', error);
    return NextResponse.json(
      { error: '服务器错误', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/resources/associations
 * 创建资源关联
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 读取现有数据
    let associations = loadAssociations();
    
    // 生成新ID
    const newId = `assoc-${String(associations.length + 1).padStart(3, '0')}`;
    
    // 添加新关联
    const newAssociation = {
      id: newId,
      ...body,
      created_at: new Date().toISOString()
    };
    
    associations.push(newAssociation);
    
    // 保存到文件
    fs.writeFileSync(ASSOCIATIONS_FILE, JSON.stringify(associations, null, 2), 'utf-8');
    
    return NextResponse.json({
      success: true,
      data: newAssociation
    });
  } catch (error: any) {
    console.error('Create association error:', error);
    return NextResponse.json(
      { error: '服务器错误', message: error.message },
      { status: 500 }
    );
  }
}
