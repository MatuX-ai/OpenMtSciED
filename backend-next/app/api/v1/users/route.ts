import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/v1/users
 * 获取用户列表（分页、筛选）
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // 构建查询条件
    const where: Record<string, unknown> = {};

    // 搜索过滤
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // 角色过滤
    if (role && role !== 'all') {
      where.role = role;
    }

    // 状态过滤
    if (status && status !== 'all') {
      where.isActive = status === 'active';
    }

    // 计算总数
    const total = await prisma.user.count({ where });

    // 分页查询
    const skip = (page - 1) * limit;
    const users = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // 格式化响应
    const formattedUsers = users.map(user => ({
      ...user,
      is_superuser: user.role === 'admin'
    }));

    return NextResponse.json({
      success: true,
      data: formattedUsers,
      total,
      page,
      limit
    });
  } catch (error: unknown) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '服务器错误', 
        message: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/users
 * 创建新用户
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password, role = 'user' } = body;

    // 验证必填字段
    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // 检查用户名是否已存在
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: '用户名或邮箱已存在' },
        { status: 409 }
      );
    }

    // 密码加密（实际项目中应该使用 bcrypt）
    const hashedPassword = password; // TODO: 使用 bcrypt.hash(password, 10)

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
        isActive: true
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      message: '用户创建成功',
      data: {
        ...user,
        is_superuser: user.role === 'admin'
      }
    });
  } catch (error: unknown) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '服务器错误', 
        message: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
