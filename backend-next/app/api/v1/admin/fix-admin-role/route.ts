import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * POST /api/v1/admin/fix-admin-role
 * 临时API：修复admin用户角色
 */
export async function POST() {
  try {
    const updatedUser = await prisma.user.update({
      where: { username: 'admin' },
      data: { role: 'admin' }
    });
    
    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        role: updatedUser.role
      }
    });
  } catch (error: any) {
    console.error('Update admin role error:', error);
    return NextResponse.json(
      { error: 'Failed to update', message: error.message },
      { status: 500 }
    );
  }
}